import React from 'react';
import { Link } from 'wouter';
import { CallSummary } from '@/types';

interface CallHistoryTableProps {
  filteredSummaries: CallSummary[];
  formatDate: (dateObj: Date | string) => string;
  formatDuration: (duration: string | undefined) => string;
}

const CallHistoryTable: React.FC<CallHistoryTableProps> = ({
  filteredSummaries,
  formatDate,
  formatDuration,
}) => (
  <div className="bg-white p-4 rounded-lg shadow overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 text-left text-sm font-medium text-gray-500">Time</th>
            <th className="p-3 text-left text-sm font-medium text-gray-500">Room</th>
            <th className="p-3 text-left text-sm font-medium text-gray-500">Duration</th>
            <th className="p-3 text-left text-sm font-medium text-gray-500">Summary</th>
            <th className="p-3 text-center text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSummaries.map((summary: CallSummary) => (
            <tr key={summary.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="p-3 text-sm text-gray-700">{formatDate(summary.timestamp)}</td>
              <td className="p-3 text-sm text-gray-700">{summary.roomNumber || 'Unknown'}</td>
              <td className="p-3 text-sm text-gray-700">{formatDuration(summary.duration)}</td>
              <td className="p-3 text-sm text-gray-700 max-w-md">
                <div className="truncate">{summary.content}</div>
              </td>
              <td className="p-3 text-center">
                <Link to={`/call-details/${summary.callId}`}>
                  <button className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-xs">
                    <span className="material-icons text-sm mr-1">visibility</span>
                    View Details
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default CallHistoryTable; 