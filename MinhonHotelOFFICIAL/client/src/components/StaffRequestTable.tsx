import React from 'react';

interface StaffRequestTableProps {
  filteredRequests: any[];
  pendingStatus: Record<string, string>;
  setPendingStatus: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  statusOptions: string[];
  handleStatusChange: (status: string, reqId: number) => Promise<void>;
  setSelectedRequest: (req: any) => void;
  handleOpenMessage: () => void;
  statusColor: (status: string) => string;
}

const StaffRequestTable: React.FC<StaffRequestTableProps> = ({
  filteredRequests,
  pendingStatus,
  setPendingStatus,
  statusOptions,
  handleStatusChange,
  setSelectedRequest,
  handleOpenMessage,
  statusColor,
}) => (
  <div className="hidden sm:block overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="bg-blue-100 text-blue-900">
          <th className="py-2 px-3 text-left">Room</th>
          <th className="py-2 px-3 text-left">Order ID</th>
          <th className="py-2 px-6 text-left w-3/5">Content</th>
          <th className="py-2 px-3 text-left">Time</th>
          <th className="py-2 px-2 text-left w-1/12">Status</th>
          <th className="py-2 px-3 text-left">Action</th>
        </tr>
      </thead>
      <tbody>
        {(Array.isArray(filteredRequests) ? [...filteredRequests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []).map(req => (
          <tr key={req.id} className="border-b hover:bg-blue-50">
            <td className="py-2 px-3 font-semibold">{req.room_number}</td>
            <td className="py-2 px-3">{req.orderId || req.id}</td>
            <td className="py-2 px-6 whitespace-pre-line break-words max-w-4xl">{req.request_content}</td>
            <td className="py-2 px-3">
              {req.created_at && (
                <span className="block whitespace-nowrap">{new Date(req.created_at).toLocaleDateString()}</span>
              )}
              {req.created_at && (
                <span className="block whitespace-nowrap text-xs text-gray-500">{new Date(req.created_at).toLocaleTimeString()}</span>
              )}
            </td>
            <td className="py-2 px-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(req.status)} break-words whitespace-normal block text-center`}>{req.status}</span>
            </td>
            <td className="py-2 px-3 space-x-2">
              <select
                className="border rounded px-2 py-1 text-xs"
                value={pendingStatus[req.id] ?? req.status}
                onChange={e => setPendingStatus(s => ({ ...s, [req.id]: e.target.value }))}
              >
                {statusOptions.filter(opt => opt !== 'Tất cả').map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold"
                onClick={async () => {
                  const newStatus = pendingStatus[req.id];
                  if (newStatus && newStatus !== req.status) {
                    await handleStatusChange(newStatus, req.id);
                    setPendingStatus(s => {
                      const { [req.id]: _, ...rest } = s;
                      return rest;
                    });
                  }
                }}
              >Cập Nhật</button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold" onClick={() => { setSelectedRequest(req); handleOpenMessage(); }}>Nhắn khách</button>
            </td>
          </tr>
        ))}
        {filteredRequests.length === 0 && (
          <tr>
            <td colSpan={6} className="py-8 text-center text-gray-500">Không có yêu cầu nào</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default StaffRequestTable; 