import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from 'ws';
import { insertTranscriptSchema, insertOrderSchema, insertCallSummarySchema } from "@shared/schema";
import { z } from "zod";
import { generateCallSummary, generateBasicSummary, extractServiceRequests, translateToVietnamese } from "./openai";
import OpenAI from "openai";
// import { sendServiceConfirmation, sendCallSummary } from "./email";
import { sendServiceConfirmation, sendCallSummary } from "./gmail";
import { sendMobileEmail, sendMobileCallSummary } from "./mobileMail";
import axios from "axios";
import { Reference, IReference } from './models/Reference';
import express, { type Request, Response } from 'express';
import { verifyJWT } from './middleware/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Staff } from './models/Staff';
import { Request as StaffRequest } from './models/Request';
import { Message as StaffMessage } from './models/Message';
import { db } from '../src/db';
import { request as requestTable } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { deleteAllRequests } from '../src/api/staff';

// Initialize OpenAI client 
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

// Define WebSocket client interface
interface WebSocketClient extends WebSocket {
  callId?: string;
  isAlive?: boolean;
}

// Dummy staff data (thay bằng DB thực tế)
const staffList: Staff[] = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date(),
  },
  {
    id: 2,
    username: 'staff1',
    passwordHash: bcrypt.hashSync('staffpass', 10),
    role: 'staff',
    createdAt: new Date(),
  },
];

function parseStaffAccounts(envStr: string | undefined): { username: string, password: string }[] {
  if (!envStr) return [];
  return envStr.split(',').map((pair: string) => {
    const [username, password] = pair.split(':');
    return { username, password };
  });
}

const STAFF_ACCOUNTS = parseStaffAccounts(process.env.STAFF_ACCOUNTS);
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Dummy request data
let requestList: StaffRequest[] = [
  { id: 1, room_number: '101', guestName: 'Tony', request_content: 'Beef burger x 2', created_at: new Date(), status: 'Đã ghi nhận', notes: '' },
  { id: 2, room_number: '202', guestName: 'Anna', request_content: 'Spa booking at 10:00', created_at: new Date(), status: 'Đang thực hiện', notes: '' },
];

// Dummy message data
let messageList: StaffMessage[] = [
  { id: 1, requestId: 1, sender: 'guest', content: 'Can I get my order soon?', created_at: new Date(), updatedAt: new Date() },
  { id: 2, requestId: 1, sender: 'staff', content: 'We are preparing your order.', created_at: new Date(), updatedAt: new Date() },
];

// Hàm làm sạch nội dung summary trước khi lưu vào DB
function cleanSummaryContent(content: string): string {
  if (!content) return '';
  return content
    .split('\n')
    .filter((line: string) => !/^Bước tiếp theo:/i.test(line) && !/^Next Step:/i.test(line) && !/Vui lòng nhấn/i.test(line) && !/Please Press Send To Reception/i.test(line))
    .map((line: string) => line.replace(/\(dùng cho khách[^\)]*\)/i, '').replace(/\(used for Guest[^\)]*\)/i, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

// Hàm xử lý lỗi dùng chung cho API
function handleApiError(res: Response, error: any, defaultMessage: string) {
  if (process.env.NODE_ENV === 'development') {
    console.error(defaultMessage, error);
    return res.status(500).json({ error: defaultMessage, message: error.message, stack: error.stack });
  } else {
    // Ở production, không trả về stack trace
    console.error(defaultMessage, error.message);
    return res.status(500).json({ error: defaultMessage });
  }
}

// Đảm bảo globalThis.wss có type đúng
declare global {
  // eslint-disable-next-line no-var
  var wss: import('ws').WebSocketServer | undefined;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server for express app
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  globalThis.wss = wss;
  
  // Store active connections
  const clients = new Set<WebSocketClient>();
  
  // Handle WebSocket connections
  wss.on('connection', (ws: WebSocketClient) => {
    console.log('WebSocket client connected');
    
    // Add client to set
    clients.add(ws);
    ws.isAlive = true;
    
    // Handle incoming messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle initialization message
        if (data.type === 'init' && data.callId) {
          ws.callId = data.callId;
          console.log(`Client associated with call ID: ${data.callId}`);
        }
        
        // Handle transcript from Vapi
        if (data.type === 'transcript' && data.callId && data.role && data.content) {
          try {
            const validatedData = insertTranscriptSchema.parse({
              callId: data.callId,
              role: data.role,
              content: data.content
            });
            
            // Store transcript in database
            await storage.addTranscript(validatedData);
            
            // Broadcast transcript to all clients with matching callId
            const message = JSON.stringify({
              type: 'transcript',
              callId: data.callId,
              role: data.role,
              content: data.content,
              timestamp: new Date()
            });
            
            clients.forEach((client) => {
              if (client.callId === data.callId && client.readyState === WebSocket.OPEN) {
                client.send(message);
              }
            });
          } catch (error) {
            console.error('Invalid transcript data:', error);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
    
    // Send initial welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Mi Nhon Hotel Voice Assistant'
    }));
  });
  
  // Set up ping interval to keep connections alive
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocketClient) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  wss.on('close', () => {
    clearInterval(interval);
  });
  
  // API routes
  
  // Test OpenAI API endpoint
  app.post('/api/test-openai', async (req, res) => {
    try {
      const { message } = req.body;
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message || "Hello, give me a quick test response." }],
        max_tokens: 30
      });
      
      res.json({ 
        success: true, 
        message: response.choices[0].message.content,
        model: response.model,
        usage: response.usage
      });
    } catch (error: any) {
      handleApiError(res, error, "OpenAI API test error:");
    }
  });
  
  // API endpoints for call summaries will be defined below
  
  // Get transcripts by call ID
  app.get('/api/transcripts/:callId', async (req, res) => {
    try {
      const callId = req.params.callId;
      const transcripts = await storage.getTranscriptsByCallId(callId);
      res.json(transcripts);
    } catch (error) {
      handleApiError(res, error, 'Failed to retrieve transcripts');
    }
  });
  
  // Create new order
  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid order data', details: error.errors });
      } else {
        handleApiError(res, error, 'Failed to create order');
      }
    }
  });
  
  // Get order by ID
  app.get('/api/orders/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      handleApiError(res, error, 'Failed to retrieve order');
    }
  });
  
  // Get orders by room number
  app.get('/api/orders/room/:roomNumber', async (req, res) => {
    try {
      const roomNumber = req.params.roomNumber;
      const orders = await storage.getOrdersByRoomNumber(roomNumber);
      res.json(orders);
    } catch (error) {
      handleApiError(res, error, 'Failed to retrieve orders');
    }
  });
  
  // Update order status
  app.patch('/api/orders/:id/status', verifyJWT, async (req: Request, res: Response) => {
    // Parse order ID to number
    const idNum = parseInt(req.params.id, 10);
    const { status } = req.body;
    
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const updatedOrder = await storage.updateOrderStatus(idNum, status);
    
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Emit WebSocket notification cho tất cả client
    if (globalThis.wss) {
      if (updatedOrder.specialInstructions) {
        let sentCount = 0;
        globalThis.wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            console.log('[WebSocket][PATCH /api/orders/:id/status] Sending order_status_update:', {
              reference: updatedOrder.specialInstructions,
              status: updatedOrder.status
            });
            client.send(JSON.stringify({
              type: 'order_status_update',
              reference: updatedOrder.specialInstructions,
              status: updatedOrder.status
            }));
            sentCount++;
          }
        });
        console.log(`[WebSocket][PATCH /api/orders/:id/status] Sent to ${sentCount} clients`);
      }
    }
    
    res.json(updatedOrder);
  });
  
  // Staff: get all orders, optionally filter by status, room, time
  app.get('/api/staff/orders', verifyJWT, async (req: Request, res: Response) => {
    try {
      const { status, roomNumber } = req.query;
      const orders = await storage.getAllOrders({
        status: status as string,
        roomNumber: roomNumber as string
      });
      res.json(orders);
    } catch (err) {
      handleApiError(res, err, 'Failed to retrieve staff orders');
    }
  });
  
  // Endpoint to update status via POST
  app.post('/api/orders/:id/update-status', verifyJWT, async (req: Request, res: Response) => {
    // Parse order ID to number
    const idNum = parseInt(req.params.id, 10);
    const { status } = req.body;
    try {
      const updatedOrder = await storage.updateOrderStatus(idNum, status);
      // Emit WebSocket notification
      const io = req.app.get('io');
      io.to(String(idNum)).emit('order_status_update', { orderId: String(idNum), status });
      res.json(updatedOrder);
    } catch (err) {
      handleApiError(res, err, 'Failed to update order status');
    }
  });
  
  // Store call summary from Vapi or generate with OpenAI
  app.post('/api/store-summary', async (req, res) => {
    try {
      const { summary: summaryText, transcripts, timestamp, callId, callDuration: reqCallDuration, forceBasicSummary, orderReference, language } = req.body;
      
      // Determine if we need to generate a summary with OpenAI or use fallback
      let finalSummary = summaryText;
      let isAiGenerated = false;
      
      // If transcripts are provided and no summary is provided, try AI first then fallback
      if (transcripts && (!summaryText || summaryText === '')) {
        // Check if we should try using OpenAI or go straight to fallback
        // Allow forcing basic summary from client or if no API key available
        const useOpenAi = !req.query.skipAi && !forceBasicSummary && process.env.VITE_OPENAI_API_KEY;
        
        if (useOpenAi) {
          console.log('Generating summary with OpenAI from provided transcripts');
          try {
            finalSummary = await generateCallSummary(transcripts, language);
            isAiGenerated = true;
          } catch (aiError) {
            console.error('Error generating summary with OpenAI:', aiError);
            console.log('Falling back to basic summary generation');
            // Fall back to a basic summary if OpenAI fails
            finalSummary = generateBasicSummary(transcripts);
            isAiGenerated = false;
          }
        } else {
          console.log('Generating basic summary from transcripts (OpenAI skipped)');
          finalSummary = generateBasicSummary(transcripts);
          isAiGenerated = false;
        }
      } 
      // If no transcripts and no summary, try to fetch transcripts from database
      else if (!summaryText || summaryText === '') {
        console.log('Fetching transcripts from database for callId:', callId);
        try {
          const storedTranscripts = await storage.getTranscriptsByCallId(callId);
          
          if (storedTranscripts && storedTranscripts.length > 0) {
            // Convert database transcripts to format expected by OpenAI function
            const formattedTranscripts = storedTranscripts.map(t => ({
              role: t.role,
              content: t.content
            }));
            
            // Generate summary using OpenAI
            try {
              finalSummary = await generateCallSummary(formattedTranscripts, language);
              isAiGenerated = true; 
            } catch (openaiError) {
              console.error('Error using OpenAI for stored transcripts:', openaiError);
              // Fallback to basic summary
              finalSummary = generateBasicSummary(formattedTranscripts);
              isAiGenerated = false;
            }
          } else {
            finalSummary = "No conversation transcripts were found for this call.";
          }
        } catch (dbError) {
          console.error('Error fetching transcripts from database:', dbError);
          // Try to create a basic summary if the database operation fails
          if (transcripts && transcripts.length > 0) {
            finalSummary = generateBasicSummary(transcripts);
          } else {
            finalSummary = "Unable to generate summary due to missing conversation data.";
          }
        }
      }
      
      if (!finalSummary || typeof finalSummary !== 'string') {
        return res.status(400).json({ error: 'Summary content is required' });
      }
      
      // Create a valid call summary object
      // Extract room number for storage
      const roomNumberMatch = finalSummary.match(/room (\d+)/i) || finalSummary.match(/phòng (\d+)/i);
      const roomNumber = roomNumberMatch ? roomNumberMatch[1] : 'unknown';
      
      // Extract call duration or use default
      let durationStr = '0:00';
      if (reqCallDuration) {
        durationStr = typeof reqCallDuration === 'number'
          ? `${Math.floor(reqCallDuration / 60)}:${(reqCallDuration % 60).toString().padStart(2, '0')}`
          : reqCallDuration;
      }
      
      const summaryData = insertCallSummarySchema.parse({
        callId,
        content: finalSummary,
        timestamp: new Date(timestamp || Date.now()),
        roomNumber,
        duration: durationStr,
        orderReference
      });
      
      // Store in database
      const result = await storage.addCallSummary(summaryData);

      // Analyze the summary to extract structured service requests
      let serviceRequests: any[] = [];
      if (isAiGenerated && finalSummary) {
        try {
          console.log('Extracting service requests from AI-generated summary');
          serviceRequests = await extractServiceRequests(finalSummary);
          console.log(`Successfully extracted ${serviceRequests.length} service requests`);
        } catch (extractError) {
          console.error('Error extracting service requests:', extractError);
        }
      }
      
      // Ghi log thông tin để chuẩn bị cho việc gửi email sau khi xác nhận
      try {
        // Map service requests to string array
        const serviceRequestStrings = serviceRequests.map(req => 
          `${req.serviceType}: ${req.requestText || 'Không có thông tin chi tiết'}`
        );
        
        console.log(`Phát hiện thông tin phòng: ${roomNumber}`);
        console.log(`Số lượng yêu cầu dịch vụ: ${serviceRequestStrings.length}`);
        console.log(`Thời lượng cuộc gọi: ${durationStr}`);
        console.log(`Email sẽ được gửi sau khi người dùng nhấn nút xác nhận`);
      } catch (extractError: any) {
        console.error('Error preparing service information:', extractError?.message || extractError);
        // Continue even if preparation fails - don't block the API response
      }
      
      // Return success with the summary, AI-generated flag, and extracted service requests
      res.status(201).json({
        success: true,
        summary: result,
        isAiGenerated: isAiGenerated,
        serviceRequests: serviceRequests
      });
    } catch (error: any) {
      handleApiError(res, error, 'Error storing call summary:');
    }
  });
  
  // Get call summary by call ID
  app.get('/api/summaries/:callId', async (req, res) => {
    try {
      const callId = req.params.callId;
      
      // Don't process if the parameter looks like a number (hours)
      if (/^\d+$/.test(callId)) {
        return res.status(404).json({ error: 'Call summary not found' });
      }
      
      const summary = await storage.getCallSummaryByCallId(callId);
      
      if (!summary) {
        return res.status(404).json({ error: 'Call summary not found' });
      }
      
      res.json(summary);
    } catch (error) {
      handleApiError(res, error, 'Failed to retrieve call summary');
    }
  });
  
  // Get recent call summaries (within the last X hours)
  app.get('/api/summaries/recent/:hours', async (req, res) => {
    try {
      const hours = parseInt(req.params.hours) || 24; // Default to 24 hours if not specified
      
      // Ensure hours is a reasonable value
      const validHours = Math.min(Math.max(1, hours), 72); // Between 1 and 72 hours
      
      const summaries = await storage.getRecentCallSummaries(validHours);
      
      // Pass through orderReference for each summary
      const mapped = summaries.map(s => ({
        id: s.id,
        callId: s.callId,
        roomNumber: s.roomNumber,
        content: s.content,
        timestamp: s.timestamp,
        duration: s.duration
      }));
      res.json({
        success: true,
        count: summaries.length,
        timeframe: `${validHours} hours`,
        summaries: mapped
      });
    } catch (error) {
      handleApiError(res, error, 'Error retrieving recent call summaries:');
    }
  });

  // Translate text to Vietnamese
  app.post('/api/translate-to-vietnamese', async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text content is required' });
      }
      
      const translatedText = await translateToVietnamese(text);
      
      res.json({
        success: true,
        translatedText
      });
    } catch (error) {
      handleApiError(res, error, 'Error translating text to Vietnamese:');
    }
  });

  // Send service confirmation email
  app.post('/api/send-service-email', async (req, res) => {
    try {
      const { toEmail, serviceDetails } = req.body;
      
      if (!toEmail || !serviceDetails || !serviceDetails.serviceType || !serviceDetails.roomNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Tạo mã tham chiếu nếu chưa có
      const orderReference = serviceDetails.orderReference || 
                           `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Kiểm tra và dịch details sang tiếng Việt nếu cần
      let vietnameseDetails = serviceDetails.details || '';
      
      if (vietnameseDetails && !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(vietnameseDetails)) {
        try {
          console.log('Dịch chi tiết dịch vụ sang tiếng Việt trước khi gửi email');
          vietnameseDetails = await translateToVietnamese(vietnameseDetails);
        } catch (translateError) {
          console.error('Lỗi khi dịch chi tiết dịch vụ sang tiếng Việt:', translateError);
          // Tiếp tục sử dụng bản chi tiết gốc nếu không dịch được
        }
      }
      
      const result = await sendServiceConfirmation(toEmail, {
        serviceType: serviceDetails.serviceType,
        roomNumber: serviceDetails.roomNumber,
        timestamp: new Date(serviceDetails.timestamp || Date.now()),
        details: vietnameseDetails,
        orderReference: orderReference // Thêm mã tham chiếu
      });
      
      if (result.success) {
        res.json({
          success: true,
          messageId: result.messageId,
          orderReference: orderReference // Trả về mã tham chiếu để hiển thị cho người dùng
        });
      } else {
        throw new Error(result.error?.toString() || 'Unknown error');
      }
    } catch (error) {
      handleApiError(res, error, 'Error sending service confirmation email:');
    }
  });
  
  // Send call summary email
  app.post('/api/send-call-summary-email', async (req, res) => {
    try {
      const { callDetails } = req.body;
      // Read recipients list from env (comma-separated), fallback to req.body.toEmail
      const recipientsEnv = process.env.SUMMARY_EMAILS || '';
      const toEmails = recipientsEnv
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      if (toEmails.length === 0 && req.body.toEmail) {
        toEmails.push(req.body.toEmail);
      }

      if (!callDetails || !callDetails.roomNumber || !callDetails.summary) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Tạo mã tham chiếu nếu chưa có
      const orderReference = callDetails.orderReference || 
                             `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Nếu summary không phải tiếng Việt, thì dịch sang tiếng Việt
      let vietnameseSummary = callDetails.summary;
      
      if (!/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(callDetails.summary)) {
        try {
          console.log('Dịch tóm tắt sang tiếng Việt trước khi gửi email');
          vietnameseSummary = await translateToVietnamese(callDetails.summary);
        } catch (translateError) {
          console.error('Lỗi khi dịch tóm tắt sang tiếng Việt:', translateError);
          // Tiếp tục sử dụng bản tóm tắt gốc nếu không dịch được
        }
      }
      
      // Dịch cả danh sách dịch vụ nếu có
      const vietnameseServiceRequests = [];
      if (callDetails.serviceRequests && callDetails.serviceRequests.length > 0) {
        for (const request of callDetails.serviceRequests) {
          if (!/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(request)) {
            try {
              const translatedRequest = await translateToVietnamese(request);
              vietnameseServiceRequests.push(translatedRequest);
            } catch (error) {
              console.error('Lỗi khi dịch yêu cầu dịch vụ:', error);
              vietnameseServiceRequests.push(request); // Sử dụng bản gốc nếu không dịch được
            }
          } else {
            vietnameseServiceRequests.push(request); // Đã là tiếng Việt
          }
        }
      }
      
      // Send call summary to each recipient
      const results = [];
      for (const toEmail of toEmails) {
        const result = await sendCallSummary(toEmail, {
          callId: callDetails.callId || 'unknown',
          roomNumber: callDetails.roomNumber,
          timestamp: new Date(callDetails.timestamp || Date.now()),
          duration: callDetails.duration || '0:00',
          summary: vietnameseSummary, // Sử dụng bản tóm tắt tiếng Việt
          serviceRequests: vietnameseServiceRequests.length > 0 ? vietnameseServiceRequests : callDetails.serviceRequests || [],
          orderReference: orderReference // Thêm mã tham chiếu
        });
        results.push(result);
      }
      
      // Respond based on overall success
      if (results.every((r) => r.success)) {
        // Lưu request vào DB cho staff UI
        try {
          const cleanedSummary = cleanSummaryContent(vietnameseSummary);
          await db.insert(requestTable).values({
            room_number: callDetails.roomNumber,
            orderId: callDetails.orderReference || orderReference,
            guestName: callDetails.guestName || 'Guest',
            request_content: cleanedSummary,
            created_at: new Date(),
            status: 'Đã ghi nhận',
            updatedAt: new Date()
          });
        } catch (dbError) {
          console.error('Lỗi khi lưu request vào DB:', dbError);
        }
        res.json({ success: true, recipients: toEmails, orderReference });
      } else {
        throw new Error('Failed to send call summary to all recipients');
      }
    } catch (error) {
      handleApiError(res, error, 'Error sending call summary email:');
    }
  });
  
  // Test email configuration
  app.post('/api/test-email', async (req, res) => {
    try {
      // Check Gmail credentials first (preferred method)
      if (process.env.GMAIL_APP_PASSWORD) {
        console.log('Using Gmail for test email');
      } else if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) {
        console.log('Using Mailjet for test email');
      } else {
        return res.status(400).json({ 
          success: false, 
          error: 'Email credentials not configured',
          missingEnv: true
        });
      }
      
      const { toEmail, isMobile } = req.body;
      
      if (!toEmail) {
        return res.status(400).json({ error: 'Recipient email is required' });
      }
      
      console.log(`Sending test email to ${toEmail} (${isMobile ? 'mobile device' : 'desktop'})`);
      
      // Send a simple test email
      const result = await sendServiceConfirmation(toEmail, {
        serviceType: 'Mobile Test Email',
        roomNumber: isMobile ? 'MOBILE-TEST' : 'DESKTOP-TEST',
        timestamp: new Date(),
        details: `Đây là email kiểm tra từ Mi Nhon Hotel Voice Assistant. Sent from ${isMobile ? 'MOBILE' : 'DESKTOP'} at ${new Date().toISOString()}`,
      });
      
      console.log('Email test result:', result);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Test email sent successfully',
          messageId: result.messageId,
          provider: process.env.GMAIL_APP_PASSWORD ? 'gmail' : 'mailjet'
        });
      } else {
        throw new Error(result.error?.toString() || 'Unknown error');
      }
    } catch (error: any) {
      handleApiError(res, error, 'Error sending test email:');
    }
  });
  
  // Mobile-friendly test endpoint with simplified response
  app.post('/api/mobile-test-email', async (req, res) => {
    try {
      console.log('Mobile test email requested');
      
      // Default email if not provided
      const toEmail = req.body.toEmail || 'tuans2@gmail.com';
      
      // Xác định loại thiết bị gửi request
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry/i.test(userAgent);
      
      // Ghi log chi tiết
      console.log('=================== MOBILE EMAIL TEST ===================');
      console.log('Time:', new Date().toISOString());
      console.log('Device info:', userAgent);
      console.log('Device type:', isMobile ? 'MOBILE' : 'DESKTOP');
      console.log('Recipient:', toEmail);
      console.log('=========================================================');
      
      // Send with timeout to ensure request completes and return response immediately
      setTimeout(async () => {
        try {
          // Sử dụng phương thức đặc biệt cho thiết bị di động
          if (isMobile) {
            console.log('Gửi email qua phương thức chuyên biệt cho thiết bị di động...');
            
            const result = await sendMobileEmail(
              toEmail,
              'Mi Nhon Hotel - Test từ thiết bị di động',
              `Đây là email kiểm tra được gửi từ thiết bị di động lúc ${new Date().toLocaleTimeString()}.
              
Thiết bị: ${userAgent}
              
Thông báo này xác nhận rằng hệ thống gửi email trên thiết bị di động đang hoạt động bình thường.
              
Trân trọng,
Mi Nhon Hotel Mui Ne`
            );
            
            console.log('Kết quả gửi email qua mobile mail:', result);
          } 
          // Cho thiết bị desktop sử dụng phương thức thông thường
          else {
            console.log('Gửi email với phương thức thông thường...');
            const result = await sendServiceConfirmation(toEmail, {
              serviceType: 'Mobile Test',
              roomNumber: 'DEVICE-TEST',
              timestamp: new Date(),
              details: `Email kiểm tra gửi từ thiết bị ${isMobile ? 'di động' : 'desktop'} lúc ${new Date().toLocaleTimeString()}. UA: ${userAgent}`,
            });
            
            console.log('Kết quả gửi email thông thường:', result);
          }
        } catch (innerError) {
          console.error('Lỗi trong timeout callback:', innerError);
          console.error('Chi tiết lỗi:', JSON.stringify(innerError));
        }
      }, 50); // Giảm thời gian chờ xuống để di động xử lý nhanh hơn
      
      // Return success immediately to avoid mobile browser timeout
      res.status(200).json({
        success: true,
        message: 'Email đang được xử lý, vui lòng kiểm tra hộp thư sau giây lát',
        deviceType: isMobile ? 'mobile' : 'desktop',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      handleApiError(res, error, 'Error in mobile test email endpoint:');
    }
  });
  
  // Endpoint gửi email tóm tắt cuộc gọi từ thiết bị di động
  app.post('/api/mobile-call-summary-email', async (req, res) => {
    try {
      const { toEmail, callDetails } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!toEmail || !callDetails || !callDetails.roomNumber || !callDetails.summary) {
        return res.status(400).json({ 
          success: false, 
          error: 'Thiếu thông tin cần thiết để gửi email',
          missingFields: true
        });
      }
      
      // Xác định thiết bị
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry/i.test(userAgent);
      
      console.log('=================== MOBILE CALL SUMMARY EMAIL ===================');
      console.log('Time:', new Date().toISOString());
      console.log('Device:', isMobile ? 'MOBILE' : 'DESKTOP');
      console.log('Room:', callDetails.roomNumber);
      console.log('Recipient:', toEmail);
      console.log('==============================================================');
      
      // Tạo mã tham chiếu
      const orderReference = callDetails.orderReference || 
                           `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Gửi email ngay lập tức và trả về kết quả thành công trước
      res.status(200).json({
        success: true,
        message: 'Email đang được xử lý, vui lòng kiểm tra hộp thư sau giây lát',
        orderReference: orderReference,
        timestamp: new Date().toISOString()
      });
      
      // Phần xử lý bất đồng bộ gửi email
      try {
        console.log('Đang xử lý gửi email tóm tắt cuộc gọi từ thiết bị di động...');
        
        // Thực hiện gửi email
        const result = await sendMobileCallSummary(toEmail, {
          callId: callDetails.callId || 'unknown',
          roomNumber: callDetails.roomNumber,
          timestamp: new Date(callDetails.timestamp || Date.now()),
          duration: callDetails.duration || '0:00',
          summary: callDetails.summary,
          serviceRequests: callDetails.serviceRequests || [],
          orderReference: orderReference
        });
        console.log('Kết quả gửi email tóm tắt cuộc gọi từ thiết bị di động:', result);
        // Thêm mới: Lưu request vào database để hiển thị trong staff UI
        try {
          console.log('Lưu request từ thiết bị di động vào database...');
          const cleanedSummary = cleanSummaryContent(callDetails.summary);
          await db.insert(requestTable).values({
            room_number: callDetails.roomNumber,
            orderId: callDetails.orderReference || orderReference,
            guestName: callDetails.guestName || 'Guest',
            request_content: cleanedSummary,
            created_at: new Date(),
            status: 'Đã ghi nhận',
            updatedAt: new Date()
          });
          console.log('Đã lưu request thành công vào database với ID:', orderReference);
          // Bổ sung: Lưu order vào bảng orders
          await storage.createOrder({
            callId: callDetails.callId || 'unknown',
            roomNumber: callDetails.roomNumber,
            orderType: 'Room Service',
            deliveryTime: new Date(callDetails.timestamp || Date.now()).toISOString(),
            specialInstructions: callDetails.orderReference || orderReference,
            items: [],
            totalAmount: 0
          });
          console.log('Đã lưu order vào bảng orders');
        } catch (dbError) {
          console.error('Lỗi khi lưu request hoặc order từ thiết bị di động vào DB:', dbError);
        }
      } catch (sendError) {
        console.error('Lỗi khi gửi email tóm tắt từ thiết bị di động:', sendError);
        // Không cần trả về lỗi cho client vì đã trả về success trước đó
      }
    } catch (error: any) {
      handleApiError(res, error, 'Lỗi trong endpoint mobile-call-summary-email:');
    }
  });
  
  // Kiểm tra API key và trạng thái của Mailjet
  app.get('/api/mailjet-status', async (req, res) => {
    try {
      // Kiểm tra xem API key của Mailjet có được thiết lập hay không
      if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
        return res.status(400).json({ 
          success: false, 
          error: 'Mailjet credentials not configured',
          missingEnv: true
        });
      }
      
      // Gửi request kiểm tra đến Mailjet API
      try {
        const response = await axios.get('https://api.mailjet.com/v3/REST/sender', {
          auth: {
            username: process.env.MAILJET_API_KEY,
            password: process.env.MAILJET_SECRET_KEY
          }
        });
        
        // Nếu API trả về thành công, trả về thông tin sender (công ty gửi email)
        res.json({
          success: true,
          mailjetConnected: true,
          apiKey: `${process.env.MAILJET_API_KEY.substring(0, 4)}...`,
          totalSenders: response.data.Count,
          senders: response.data.Data.map((sender: any) => ({
            email: sender.Email,
            name: sender.Name,
            status: sender.Status
          }))
        });
      } catch (apiError: any) {
        console.error('Lỗi khi kết nối đến Mailjet API:', apiError.message);
        // Nếu kết nối thất bại, trả về thông tin lỗi
        res.status(500).json({
          success: false,
          mailjetConnected: false,
          error: 'Không thể kết nối đến Mailjet API',
          details: apiError.response?.data || apiError.message
        });
      }
    } catch (error: any) {
      handleApiError(res, error, 'Lỗi khi kiểm tra trạng thái Mailjet:');
    }
  });
  
  // Kiểm tra tất cả các email đã gửi gần đây
  app.get('/api/recent-emails', async (req, res) => {
    try {
      if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
        return res.status(400).json({ 
          success: false, 
          error: 'Mailjet credentials not configured',
          missingEnv: true
        });
      }
      
      console.log('Lấy danh sách email gần đây từ Mailjet');
      
      // Gửi request trực tiếp đến Mailjet API
      try {
        const result = await axios.get('https://api.mailjet.com/v3/REST/message?Limit=20', {
          auth: {
            username: process.env.MAILJET_API_KEY as string,
            password: process.env.MAILJET_SECRET_KEY as string
          }
        });
        
        // Kiểm tra và xử lý kết quả
        if (result && result.data && Array.isArray(result.data.Data)) {
          console.log(`Tìm thấy ${result.data.Count} email gần đây`);
          
          // Chuyển đổi kết quả thành định dạng dễ đọc
          const emails = result.data.Data.map((message: any) => ({
            messageId: message.ID,
            status: message.Status || 'Unknown',
            to: message.Recipients && message.Recipients[0] ? message.Recipients[0].Email : 'Unknown',
            from: message.Sender ? message.Sender.Email : 'Unknown',
            subject: message.Subject || 'No subject',
            sentAt: message.ArrivedAt || 'Unknown',
          }));
          
          res.json({
            success: true,
            count: emails.length,
            emails: emails
          });
        } else {
          throw new Error('Định dạng dữ liệu không hợp lệ từ Mailjet API');
        }
      } catch (apiError: any) {
        console.error('Lỗi khi lấy dữ liệu email từ Mailjet:', apiError.message);
        res.status(500).json({
          success: false,
          error: 'Không thể lấy dữ liệu email từ Mailjet',
          details: apiError.response?.data || apiError.message
        });
      }
    } catch (error: any) {
      handleApiError(res, error, 'Lỗi khi lấy danh sách email gần đây:');
    }
  });

  // Simple endpoint to test database connectivity
  app.get('/api/db-test', async (req, res) => {
    try {
      // Try a simple read operation
      const recent = await storage.getRecentCallSummaries(1);
      return res.json({ success: true, count: recent.length });
    } catch (dbError: any) {
      handleApiError(res, dbError, 'DB test error:');
    }
  });

  // Get references for a specific call
  app.get('/api/references/:callId', async (req, res) => {
    try {
      const { callId } = req.params;
      const references = await Reference.find({ callId }).sort({ createdAt: -1 });
      res.json(references);
    } catch (error) {
      handleApiError(res, error, 'Error fetching references:');
    }
  });

  // Add a new reference
  app.post('/api/references', async (req, res) => {
    try {
      const referenceData: IReference = req.body;
      const reference = new Reference(referenceData);
      await reference.save();
      res.status(201).json(reference);
    } catch (error) {
      handleApiError(res, error, 'Error creating reference:');
    }
  });

  // Delete a reference
  app.delete('/api/references/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await Reference.findByIdAndDelete(id);
      res.status(204).send();
    } catch (error) {
      handleApiError(res, error, 'Error deleting reference:');
    }
  });

  // Serve reference map from environment variable
  app.get('/api/reference-map', (_req, res) => {
    try {
      const raw = process.env.REFERENCE_MAP || '{}';
      const map = JSON.parse(raw);
      res.json(map);
    } catch (error) {
      handleApiError(res, error, 'Invalid REFERENCE_MAP env var:');
    }
  });

  // Staff login route
  app.post('/api/staff/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Staff login attempt: ${username}`);
    
    // Hard-coded fallback accounts for when database is unavailable
    const FALLBACK_ACCOUNTS = [
      { username: 'staff1', password: 'password1' },
      { username: 'admin', password: 'admin123' }
    ];
    
    // Try from environment variable first
    const found = STAFF_ACCOUNTS.find(acc => acc.username === username && acc.password === password);
    
    // If not found, try from fallback accounts
    const fallbackFound = !found && FALLBACK_ACCOUNTS.find(acc => acc.username === username && acc.password === password);
    
    if (!found && !fallbackFound) {
      console.log('Login failed: Invalid credentials');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
    console.log('Login successful, token generated');
    res.json({ token });
  });

  // Lấy danh sách request
  app.get('/api/staff/requests', verifyJWT, async (req, res) => {
    console.log('API /api/staff/requests called');
    console.log('Authorization header:', req.headers.authorization);
    try {
      // Kiểm tra kết nối DB trước
      console.log('Checking database connection before querying requests...');
      const dbTest = await db.execute(sql`SELECT 1`);
      console.log('Database connection test:', dbTest);
      
      console.log('Fetching requests from database...');
      const dbRequests = await db.select().from(requestTable);
      console.log(`Found ${dbRequests.length} requests in database:`, dbRequests);
      
      // Thêm kiểm tra nếu không có requests từ DB
      if (!Array.isArray(dbRequests) || dbRequests.length === 0) {
        console.log('No requests found in database, returning dummy test data');
        // Trả về dữ liệu mẫu nếu không có dữ liệu trong DB
        return res.json([]); // Trả về mảng rỗng thay vì dữ liệu mẫu
      }
      
      res.json(Array.isArray(dbRequests) ? dbRequests : []);
    } catch (err) {
      // Nếu có lỗi, trả về mảng rỗng thay vì object lỗi
      console.error('Error in /api/staff/requests:', err);
      return res.json([]);
    }
  });

  // Cập nhật trạng thái request
  app.patch('/api/staff/requests/:id/status', verifyJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      // Cập nhật trong cơ sở dữ liệu thay vì mảng trong bộ nhớ
      const result = await db.update(requestTable)
        .set({ 
          status,
          updatedAt: new Date() 
        })
        .where(eq(requestTable.id, id))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
      // Đồng bộ status sang order nếu có orderId
      const orderId = result[0].orderId;
      if (orderId) {
        // Tìm order theo specialInstructions (orderReference)
        const orders = await storage.getAllOrders({});
        const order = orders.find(o => o.specialInstructions === orderId);
        if (!order) {
          console.warn(`[WebSocket][PATCH /api/staff/requests/:id/status] Không tìm thấy order có specialInstructions =`, orderId, '. Các specialInstructions hiện có:', orders.map(o => o.specialInstructions));
        }
        if (order) {
          const updatedOrder = await storage.updateOrderStatus(order.id, status);
          // Emit WebSocket cho Guest UI nếu updatedOrder tồn tại
          if (updatedOrder && globalThis.wss) {
            if (updatedOrder.specialInstructions) {
              let sentCount = 0;
              globalThis.wss.clients.forEach((client) => {
                if (client.readyState === 1) {
                  console.log('[WebSocket][PATCH /api/staff/requests/:id/status] Sending order_status_update:', {
                    reference: updatedOrder.specialInstructions,
                    status: updatedOrder.status
                  });
                  client.send(JSON.stringify({
                    type: 'order_status_update',
                    reference: updatedOrder.specialInstructions,
                    status: updatedOrder.status
                  }));
                  sentCount++;
                }
              });
              console.log(`[WebSocket][PATCH /api/staff/requests/:id/status] Sent to ${sentCount} clients`);
            }
          }
        }
      }
      res.json(result[0]);
    } catch (error) {
      handleApiError(res, error, 'Error updating request status:');
    }
  });

  // Lấy lịch sử tin nhắn của request
  app.get('/api/staff/requests/:id/messages', verifyJWT, (req, res) => {
    const id = parseInt(req.params.id);
    const msgs = messageList.filter(m => m.requestId === id);
    res.json(msgs);
  });

  // Gửi tin nhắn tới guest
  app.post('/api/staff/requests/:id/message', verifyJWT, (req, res) => {
    const id = parseInt(req.params.id);
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Missing content' });
    const msg: StaffMessage = {
      id: messageList.length + 1,
      requestId: id,
      sender: 'staff',
      content,
      created_at: new Date(),
      updatedAt: new Date()
    };
    messageList.push(msg);
    res.status(201).json(msg);
  });

  // Xóa tất cả requests
  app.delete('/api/staff/requests/all', verifyJWT, async (req, res) => {
    try {
      console.log('Attempting to delete all requests');
      // Xóa tất cả dữ liệu từ bảng request sử dụng API function
      const result = await deleteAllRequests();
      console.log(`Deleted ${result.length} requests from database`);
      
      res.json({ 
        success: true, 
        message: `Đã xóa ${result.length} requests`, 
        deletedCount: result.length 
      });
    } catch (error) {
      handleApiError(res, error, 'Error deleting all requests:');
    }
  });

  // Get all orders (public, no auth)
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await storage.getAllOrders({});
      res.json(Array.isArray(orders) ? orders : []);
    } catch (error) {
      // Nếu có lỗi, trả về mảng rỗng thay vì object lỗi
      console.error('Failed to retrieve all orders:', error);
      res.json([]);
    }
  });

  // Xóa tất cả orders (public, không cần xác thực)
  app.delete('/api/orders/all', async (req, res) => {
    try {
      const deleted = await storage.deleteAllOrders();
      res.json({ success: true, deletedCount: deleted });
    } catch (error) {
      handleApiError(res, error, 'Error deleting all orders');
    }
  });

  return httpServer;
}
