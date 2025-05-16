import React, { Suspense } from "react";
import ErrorBoundary from '@/components/ErrorBoundary';
import { Switch, Route, Link } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import VoiceAssistant from "@/components/VoiceAssistant";
import { AssistantProvider } from "@/context/AssistantContext";
import NotFound from "@/pages/not-found";
import EmailTester from "@/components/EmailTester";
import { useWebSocket } from '@/hooks/useWebSocket';
import StaffPage from '@/pages/staff';
import { BrowserRouter } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Lazy-loaded components
const CallHistory = React.lazy(() => import('@/pages/CallHistory'));
const CallDetails = React.lazy(() => import('@/pages/CallDetails'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-500">Đang tải...</p>
    </div>
  </div>
);

// Email tester page
const EmailTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Kiểm tra Tính năng Email</h1>
          <Link href="/" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            Quay lại Trang Chính
          </Link>
        </div>
        <EmailTester />
      </div>
    </div>
  );
};

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/call-history" component={() => (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <CallHistory />
          </motion.div>
        )} />
        <Route path="/call-details/:callId" component={() => (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <CallDetails />
          </motion.div>
        )} />
        <Route path="/email-test" component={() => (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3 }}
          >
            <EmailTestPage />
          </motion.div>
        )} />
        <Route path="/staff" component={() => (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3 }}
          >
            <StaffPage />
          </motion.div>
        )} />
        <Route path="/" component={() => (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <VoiceAssistant />
          </motion.div>
        )} />
        <Route component={() => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <NotFound />
          </motion.div>
        )} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  // Initialize WebSocket globally to keep connection across routes
  useWebSocket();
  return (
    <BrowserRouter>
      <AssistantProvider>
        <ErrorBoundary>
          <Router />
          <Toaster />
        </ErrorBoundary>
      </AssistantProvider>
    </BrowserRouter>
  );
}

export default App;
