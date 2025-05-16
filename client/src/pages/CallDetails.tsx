import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Transcript } from '@/types';

interface CallSummary {
  timestamp: string;
  roomNumber: string;
  duration: string;
  content: string;
}

const CallDetails: React.FC = () => {
  const { callId } = useParams();
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch call summary
  const { data: summary, isLoading: summaryLoading, isError: summaryError } = useQuery<CallSummary>({
    queryKey: ['summary', callId],
    queryFn: async () => {
      const response = await fetch(`/api/summaries/${callId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch call summary: ${response.statusText}`);
      }
      return response.json();
    }
  });
  
  // Fetch call transcripts
  const { data: transcripts, isLoading: transcriptsLoading, isError: transcriptsError } = useQuery<Transcript[]>({
    queryKey: ['transcripts', callId],
    queryFn: async () => {
      const response = await fetch(`/api/transcripts/${callId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch call transcripts: ${response.statusText}`);
      }
      return response.json();
    }
  });

  // Handle errors
  React.useEffect(() => {
    if (summaryError) {
      setError('Failed to load call summary. Please try again later.');
    } else if (transcriptsError) {
      setError('Failed to load call transcripts. Please try again later.');
    }
  }, [summaryError, transcriptsError]);
  
  // Format date for display
  const formatDate = (dateObj: Date | string | undefined) => {
    if (!dateObj) return 'Unknown';
    
    const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // Format duration for display
  const formatDuration = (duration: string | undefined) => {
    if (!duration) return '00:00';
    return duration;
  };
  
  // Handle copy to clipboard
  const handleCopyTranscript = async () => {
    if (!transcripts?.length) return;
    
    try {
      setCopying(true);
      const transcriptText = transcripts.map((t: Transcript) => 
        `${t.role === 'assistant' ? 'Assistant' : 'Guest'}: ${t.content}`
      ).join('\n\n');
      
      await navigator.clipboard.writeText(transcriptText);
      
      // Show success animation
      setTimeout(() => {
        setCopying(false);
      }, 1500);
    } catch (error) {
      console.error('Could not copy text: ', error);
      setCopying(false);
    }
  };
  
  const isLoading = summaryLoading || transcriptsLoading;
  const isError = summaryError || transcriptsError;
  
  return (
    <div className="container mx-auto p-5">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-primary">Call Details</h1>
          <div className="flex space-x-3">
            <Link to="/call-history">
              <button className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center">
                <span className="material-icons align-middle mr-1 text-sm">history</span>
                Call History
              </button>
            </Link>
            <Link to="/">
              <button className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center">
                <span className="material-icons align-middle mr-1 text-sm">home</span>
                Home
              </button>
            </Link>
          </div>
        </div>
      </header>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {(summaryLoading || transcriptsLoading) && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading call details...</span>
        </div>
      )}

      {!summaryLoading && !transcriptsLoading && !error && (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Call Summary Section */}
          <div className="col-span-1 lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">Call Information</h2>
                <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-700 text-xs font-medium">
                  ID: {callId}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Time</p>
                  <p className="text-sm font-medium">{formatDate(summary?.timestamp)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Room</p>
                  <p className="text-sm font-medium">{summary?.roomNumber || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="text-sm font-medium">{formatDuration(summary?.duration)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Messages</p>
                  <p className="text-sm font-medium">{transcripts?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transcript Section */}
          <div className="col-span-1 lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Conversation History</h2>
                <button 
                  onClick={handleCopyTranscript}
                  disabled={copying || !transcripts?.length}
                  className={`px-3 py-1 rounded-md text-sm flex items-center ${
                    copying 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="material-icons text-sm mr-1">
                    {copying ? 'check' : 'content_copy'}
                  </span>
                  {copying ? 'Copied' : 'Copy'}
                </button>
              </div>
              
              {transcripts?.length ? (
                <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                  {transcripts.map((transcript: Transcript) => (
                    <div 
                      key={transcript.id} 
                      className={`flex ${transcript.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-[75%] p-3 rounded-lg relative ${
                          transcript.role === 'assistant' 
                            ? 'bg-blue-50 text-blue-900' 
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          {transcript.role === 'assistant' ? 'Assistant' : 'Guest'} • {
                            formatDate(transcript.timestamp)
                          }
                        </div>
                        <p className="text-sm">{transcript.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <span className="material-icons text-gray-300 text-4xl mb-2">chat</span>
                  <p className="text-gray-500">No conversation data</p>
                  <p className="text-gray-400 text-sm">Conversation details may have been deleted or not recorded.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Summary Section */}
          <div className="col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Call Summary</h2>
              
              {summary?.content ? (
                <div className="p-4 bg-blue-50 rounded-lg overflow-y-auto" style={{ maxHeight: '500px' }}>
                  <div className="text-sm text-blue-900 whitespace-pre-line">
                    {summary.content}
                  </div>
                  <div className="mt-3 text-right">
                    <span className="text-xs text-gray-500">
                      Generated at {formatDate(summary.timestamp)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <span className="material-icons text-gray-300 text-4xl mb-2">summarize</span>
                  <p className="text-gray-500">No summary available</p>
                  <p className="text-gray-400 text-sm">Call summary could not be generated.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      )}
      
      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>Call history is stored for the last 24 hours</p>
      </div>
    </div>
  );
};

export default CallDetails;