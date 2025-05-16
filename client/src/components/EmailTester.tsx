import React, { useState } from 'react';

const EmailTester: React.FC = () => {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('tuans2@gmail.com');

  const sendTestEmail = async () => {
    try {
      setSending(true);
      setResult(null);
      setError(null);

      // Get device info
      const isMobile = /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry/i.test(navigator.userAgent);
      
      // First try the regular endpoint
      try {
        const response = await fetch('/api/test-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            toEmail: email,
            isMobile: isMobile
          }),
          cache: 'no-cache',
        });
        
        if (!response.ok) {
          throw new Error(`Standard endpoint failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setResult(`Email sent successfully using standard method! Provider: ${data.provider || 'unknown'}`);
          setSending(false);
          return;
        } else {
          console.warn('Standard method failed, trying mobile-specific endpoint');
        }
      } catch (err) {
        console.error('Error with standard endpoint:', err);
      }
      
      // Try mobile-specific endpoint
      try {
        const timestamp = new Date().getTime();
        const mobileResponse = await fetch(`/api/mobile-test-email?_=${timestamp}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Type': isMobile ? 'mobile' : 'desktop',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          body: JSON.stringify({
            toEmail: email,
            timestamp: timestamp,
            deviceInfo: navigator.userAgent
          }),
          cache: 'no-cache',
          credentials: 'same-origin',
          keepalive: true
        });
        
        if (!mobileResponse.ok) {
          throw new Error(`Mobile endpoint failed: ${mobileResponse.statusText}`);
        }
        
        const mobileData = await mobileResponse.json();
        
        if (mobileData.success) {
          setResult(`Email đang được xử lý qua endpoint tối ưu hóa cho ${isMobile ? 'di động' : 'desktop'}! Vui lòng kiểm tra hộp thư sau vài giây.`);
        } else {
          throw new Error(mobileData.error || 'Lỗi không xác định với endpoint di động');
        }
      } catch (mobileErr: any) {
        console.error('Chi tiết lỗi mobile endpoint:', mobileErr);
        throw new Error(`Không thể gửi email: ${mobileErr?.message || 'Lỗi không xác định'}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Email Tester</h2>
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Test Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sending}
        />
      </div>

      <button
        onClick={sendTestEmail}
        disabled={sending}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          sending 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {sending ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Sending...
          </div>
        ) : (
          'Send Test Email'
        )}
      </button>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success: </strong>
          <span className="block sm:inline">{result}</span>
        </div>
      )}
    </div>
  );
};

export default EmailTester;