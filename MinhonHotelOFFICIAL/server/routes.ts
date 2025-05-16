import { Express } from 'express';
import { Server } from 'http';
import { createServer } from 'http';
import { storage } from './storage';
import { WebSocketServer, WebSocket } from 'ws';
import { insertTranscriptSchema, insertOrderSchema, insertCallSummarySchema } from "@shared/schema";
import { z } from "zod";
import { generateCallSummary, generateBasicSummary, extractServiceRequests } from "./openai";
import OpenAI from "openai";
// import { sendServiceConfirmation, sendCallSummary } from "./email";
import { sendServiceConfirmation, sendCallSummary } from "./gmail";
import { sendMobileEmail, sendMobileCallSummary } from "./mobileMail";
import axios from "axios";
import { Reference, IReference } from './models/Reference';
import express, { type Request, Response, NextFunction } from 'express';
import { verifyJWT, authenticateJWT } from './middleware/auth';
import { cache } from './utils/cache';
import { apiLimiter, authLimiter, emailLimiter } from './middleware/rateLimit';
import { corsOptions } from './middleware/cors';
import { requestLogger, errorLogger } from './middleware/logger';
import { healthCheck, detailedHealthCheck } from './middleware/health';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Staff } from './models/Staff';
import { Request as StaffRequest } from './models/Request';
import { Message as StaffMessage } from './models/Message';
import { db } from './db';
import { request as requestTable } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { deleteAllRequests } from '../src/api/staff';
import { handleApiError } from './utils/errorHandler';
import { translateToVietnamese } from './utils/translator';
import Bull from 'bull';
// import Redis from 'ioredis';

// Initialize OpenAI client 
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

// Define email job data types
interface EmailJobData {
  type: 'service-confirmation' | 'call-summary' | 'mobile-email' | 'mobile-call-summary';
  data: {
    toEmail: string;
    serviceDetails?: any;
    callDetails?: any;
    subject?: string;
    content?: string;
  };
}

// Initialize email queue
const emailQueue = new Bull('email-queue', {
  redis: {
    port: parseInt(process.env.REDIS_PORT || '6379'),
    host: process.env.REDIS_HOST || 'localhost',
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
  },
});

// Process email queue
emailQueue.process(async (job: Bull.Job<EmailJobData>) => {
  const { type, data } = job.data;
  try {
    switch (type) {
      case 'service-confirmation':
        return await sendServiceConfirmation(data.toEmail, data.serviceDetails);
      case 'call-summary':
        return await sendCallSummary(data.toEmail, data.callDetails);
      case 'mobile-email':
        return await sendMobileEmail(data.toEmail, data.subject!, data.content!);
      case 'mobile-call-summary':
        return await sendMobileCallSummary(data.toEmail, data.callDetails);
      default:
        throw new Error(`Unknown email type: ${type}`);
    }
  } catch (error) {
    console.error(`Error processing email job ${job.id}:`, error);
    throw error;
  }
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

// WebSocket connection management
const wsClients = new Map<string, Set<WebSocketClient>>();
const HEARTBEAT_INTERVAL = 30000;
const RECONNECT_TIMEOUT = 5000;

function setupWebSocketServer(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocketClient) => {
    console.log('WebSocket client connected');
    
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'init' && data.callId) {
          ws.callId = data.callId;
          if (!wsClients.has(data.callId)) {
            wsClients.set(data.callId, new Set());
          }
          wsClients.get(data.callId)!.add(ws);
          console.log(`Client associated with call ID: ${data.callId}`);
        }
        
        if (data.type === 'transcript' && data.callId && data.role && data.content) {
          try {
            const validatedData = insertTranscriptSchema.parse({
              callId: data.callId,
              role: data.role,
              content: data.content
            });
            
            await storage.addTranscript(validatedData);
            
            const message = JSON.stringify({
              type: 'transcript',
              callId: data.callId,
              role: data.role,
              content: data.content,
              timestamp: new Date()
            });
            
            const clients = wsClients.get(data.callId);
            if (clients) {
              clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(message);
                }
              });
            }
          } catch (error) {
            console.error('Invalid transcript data:', error);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      if (ws.callId) {
        const clients = wsClients.get(ws.callId);
        if (clients) {
          clients.delete(ws);
          if (clients.size === 0) {
            wsClients.delete(ws.callId);
          }
        }
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (ws.callId) {
        const clients = wsClients.get(ws.callId);
        if (clients) {
          clients.delete(ws);
          if (clients.size === 0) {
            wsClients.delete(ws.callId);
          }
        }
      }
    });
    
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Mi Nhon Hotel Voice Assistant'
    }));
  });
  
  // Heartbeat interval
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocketClient) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, HEARTBEAT_INTERVAL);
  
  wss.on('close', () => {
    clearInterval(interval);
  });
  
  return wss;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply global middleware
  app.use(cors(corsOptions));
  app.use(apiLimiter);
  app.use(requestLogger);

  // Health check endpoints
  app.get('/health', healthCheck);
  app.get('/health/detailed', detailedHealthCheck);

  // Create HTTP server for express app
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = setupWebSocketServer(httpServer);
  
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
      console.error("OpenAI API test error:", error);
      res.status(500).json({ 
        error: "Error testing OpenAI API", 
        details: error.message,
        code: error.code
      });
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
      res.status(500).json({ error: 'Failed to retrieve transcripts' });
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
        res.status(500).json({ error: 'Failed to create order' });
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
      res.status(500).json({ error: 'Failed to retrieve order' });
    }
  });
  
  // Get orders by room number
  app.get('/api/orders/room/:roomNumber', async (req, res) => {
    try {
      const roomNumber = req.params.roomNumber;
      const orders = await storage.getOrdersByRoomNumber(roomNumber);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve orders' });
    }
  });
  
  // Update order status
  app.patch('/api/orders/:id/status', authenticateJWT, async (req: Request, res: Response) => {
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
    
    res.json(updatedOrder);
  });
  
  // Staff: get all orders, optionally filter by status, room, time
  app.get('/api/staff/orders', authenticateJWT, async (req: Request, res: Response) => {
    try {
      const { status, roomNumber, limit, offset } = req.query;
      const parsedLimit = limit ? parseInt(limit as string, 10) : 20;
      const parsedOffset = offset ? parseInt(offset as string, 10) : 0;
      const orders = await storage.getAllOrders({
        status: status as string,
        roomNumber: roomNumber as string,
        limit: parsedLimit,
        offset: parsedOffset
      });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve staff orders' });
    }
  });
  
  // Endpoint to update status via POST
  app.post('/api/orders/:id/update-status', authenticateJWT, async (req: Request, res: Response) => {
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
      res.status(500).json({ error: 'Failed to update order status' });
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
      console.error('Error storing call summary:', error, error.stack);
      // Return detailed error info for debugging
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid summary data', details: error.errors });
      }
      return res.status(500).json({
        error: 'Failed to save call summary',
        message: error.message,
        stack: error.stack
      });
    }
  });
  
  // Get call summary by call ID with cache
  app.get('/api/summaries/:callId', cache({ ttl: 300000 }), async (req, res) => {
    try {
      const callId = req.params.callId;
      if (/^\d+$/.test(callId)) {
        return res.status(404).json({ error: 'Call summary not found' });
      }
      const summary = await storage.getCallSummaryByCallId(callId);
      if (!summary) {
        return res.status(404).json({ error: 'Call summary not found' });
      }
      res.json(summary);
    } catch (error) {
      handleApiError(res, error, 'Error retrieving call summary:');
    }
  });
  
  // Get recent call summaries with cache
  app.get('/api/summaries/recent/:hours', cache({ ttl: 300 }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hours = parseInt(req.params.hours) || 24;
      const validHours = Math.min(Math.max(1, hours), 72);
      const summaries = await storage.getRecentCallSummaries(validHours);
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
      console.error('Error getting recent summaries:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Translate text to Vietnamese
  app.post('/api/translate-to-vietnamese', cache({ ttl: 3600 }), async (req: Request, res: Response, next: NextFunction) => {
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
      console.error('Error translating text:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Send service confirmation email
  app.post('/api/send-service-email', emailLimiter, async (req, res) => {
    try {
      const { toEmail, serviceDetails } = req.body;
      
      if (!toEmail || !serviceDetails || !serviceDetails.serviceType || !serviceDetails.roomNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const orderReference = serviceDetails.orderReference || 
                           `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      
      let vietnameseDetails = serviceDetails.details || '';
      
      if (vietnameseDetails && !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(vietnameseDetails)) {
        try {
          vietnameseDetails = await translateToVietnamese(vietnameseDetails);
        } catch (translateError) {
          console.error('Translation error:', translateError);
        }
      }
      
      // Add to queue instead of sending directly
      const job = await emailQueue.add('service-confirmation', {
        toEmail,
        serviceDetails: {
          ...serviceDetails,
          details: vietnameseDetails,
          orderReference
        }
      });
      
      res.json({
        success: true,
        jobId: job.id,
        orderReference
      });
    } catch (error) {
      console.error('Error queueing service confirmation email:', error);
      res.status(500).json({ error: 'Failed to queue service confirmation email' });
    }
  });
  
  // Send call summary email
  app.post('/api/send-call-summary-email', emailLimiter, async (req, res) => {
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
          await db.insert(requestTable).values({
            room_number: callDetails.roomNumber,
            orderId: callDetails.orderReference || orderReference,
            guestName: callDetails.guestName || 'Guest',
            request_content: cleanSummaryContent(vietnameseSummary),
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
      console.error('Error sending call summary email:', error);
      res.status(500).json({ error: 'Failed to send call summary email' });
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
      console.error('Error sending test email:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to send test email',
        details: error?.message || String(error)
      });
    }
  });
  
  // Mobile-friendly test endpoint with simplified response
  app.post('/api/mobile-test-email', emailLimiter, async (req, res) => {
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
      console.error('Error in mobile test email endpoint:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  
  // Endpoint gửi email tóm tắt cuộc gọi từ thiết bị di động
  app.post('/api/mobile-call-summary-email', emailLimiter, async (req, res) => {
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
        } catch (dbError) {
          console.error('Lỗi khi lưu request từ thiết bị di động vào DB:', dbError);
        }
      } catch (sendError) {
        console.error('Lỗi khi gửi email tóm tắt từ thiết bị di động:', sendError);
        // Không cần trả về lỗi cho client vì đã trả về success trước đó
      }
    } catch (error: any) {
      console.error('Lỗi trong endpoint mobile-call-summary-email:', error);
      // Trường hợp lỗi ngay từ đầu, trả về lỗi cho client
      res.status(500).json({ 
        success: false, 
        error: 'Lỗi server khi xử lý yêu cầu gửi email từ thiết bị di động' 
      });
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
      console.error('Lỗi khi kiểm tra trạng thái Mailjet:', error);
      res.status(500).json({ 
        success: false,
        error: 'Lỗi khi kiểm tra trạng thái Mailjet',
        details: error.message || String(error)
      });
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
      console.error('Lỗi khi lấy danh sách email gần đây:', error);
      res.status(500).json({ 
        success: false,
        error: 'Lỗi khi lấy danh sách email gần đây',
        details: error.message || String(error)
      });
    }
  });

  // Simple endpoint to test database connectivity
  app.get('/api/db-test', async (req, res) => {
    try {
      // Try a simple read operation
      const recent = await storage.getRecentCallSummaries(1);
      return res.json({ success: true, count: recent.length });
    } catch (dbError: any) {
      console.error('DB test error:', dbError);
      return res.status(500).json({ success: false, error: dbError.message });
    }
  });

  // Get references for a specific call
  app.get('/api/references/:callId', async (req, res) => {
    try {
      const { callId } = req.params;
      const references = await Reference.find({ callId }).sort({ createdAt: -1 });
      res.json(references);
    } catch (error) {
      console.error('Error fetching references:', error);
      res.status(500).json({ error: 'Failed to fetch references' });
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
      console.error('Error creating reference:', error);
      res.status(500).json({ error: 'Failed to create reference' });
    }
  });

  // Delete a reference
  app.delete('/api/references/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await Reference.findByIdAndDelete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting reference:', error);
      res.status(500).json({ error: 'Failed to delete reference' });
    }
  });

  // Serve reference map from environment variable
  app.get('/api/reference-map', (_req, res) => {
    try {
      const raw = process.env.REFERENCE_MAP || '{}';
      const map = JSON.parse(raw);
      res.json(map);
    } catch (error) {
      console.error('Invalid REFERENCE_MAP env var:', error);
      res.status(500).json({ error: 'Invalid REFERENCE_MAP JSON' });
    }
  });

  // Staff login route
  app.post('/api/staff/login', authLimiter, async (req, res) => {
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

  // Get staff requests with cache
  app.get('/api/staff/requests', authenticateJWT, cache({ ttl: 30000 }), async (req, res) => {
    try {
      const dbRequests = await db.select().from(requestTable);
      if (dbRequests.length === 0) {
        return res.json([
          { id: 1, room_number: '101', guestName: 'Tony', request_content: 'Beef burger x 2', created_at: new Date(), status: 'Đã ghi nhận', notes: '', orderId: 'ORD-10001', updatedAt: new Date() },
          { id: 2, room_number: '202', guestName: 'Anna', request_content: 'Spa booking at 10:00', created_at: new Date(), status: 'Đang thực hiện', notes: '', orderId: 'ORD-10002', updatedAt: new Date() },
        ]);
      }
      res.json(dbRequests);
    } catch (error) {
      handleApiError(res, error, 'Error retrieving staff requests:');
    }
  });

  // Cập nhật trạng thái request
  app.patch('/api/staff/requests/:id/status', authenticateJWT, async (req, res) => {
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
      
      res.json(result[0]);
    } catch (error) {
      console.error('Error updating request status:', error);
      res.status(500).json({ error: 'Failed to update request status' });
    }
  });

  // Lấy lịch sử tin nhắn của request
  app.get('/api/staff/requests/:id/messages', authenticateJWT, (req, res) => {
    const id = parseInt(req.params.id);
    const msgs = messageList.filter(m => m.requestId === id);
    res.json(msgs);
  });

  // Gửi tin nhắn tới guest
  app.post('/api/staff/requests/:id/message', authenticateJWT, (req, res) => {
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
  app.delete('/api/staff/requests/all', authenticateJWT, async (req, res) => {
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
      console.error('Error deleting all requests:', error);
      res.status(500).json({ 
        error: 'Failed to delete requests',
        details: (error as any)?.message
      });
    }
  });

  return httpServer;
}
