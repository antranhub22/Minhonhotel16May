import React, { useState, useRef, useEffect } from 'react';

interface StaffRequestDetailModalProps {
  request: any;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onOpenMessage: () => void;
}

const statusOptions = [
  'Đã ghi nhận',
  'Đang thực hiện',
  'Đã thực hiện và đang bàn giao cho khách',
  'Hoàn thiện',
  'Lưu ý khác',
];

const StaffRequestDetailModal: React.FC<StaffRequestDetailModalProps> = ({ request, onClose, onStatusChange, onOpenMessage }) => {
  const [pendingStatus, setPendingStatus] = useState<string>(request.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  if (!request) return null;

  // Trap focus and handle ESC
  useEffect(() => {
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = modalRef.current;
    if (!modal) return;
    const focusableEls = modal.querySelectorAll<HTMLElement>(focusableSelectors);
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        if (focusableEls.length === 0) return;
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };
    modal.addEventListener('keydown', handleKeyDown);
    // Focus first element
    setTimeout(() => firstEl?.focus(), 0);
    return () => modal.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleUpdateStatus = async () => {
    if (pendingStatus === request.status) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await Promise.resolve(onStatusChange(pendingStatus));
      setSuccess('Cập nhật trạng thái thành công!');
    } catch (err) {
      setError('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-700" onClick={onClose} aria-label="Đóng modal">&times;</button>
        <h3 id="modal-title" className="text-xl font-bold text-blue-900 mb-4">Request Details</h3>
        <div className="space-y-2 mb-4">
          <div><b>Room:</b> {request.room}</div>
          <div><b>Order ID:</b> {request.id}</div>
          <div><b>Guest Name:</b> {request.guestName}</div>
          <div><b>Content:</b> {request.content}</div>
          <div><b>Time:</b> {request.time}</div>
          <div className="flex items-center gap-2">
            <b>Status:</b>
            <select className="border rounded px-2 py-1 text-xs" value={pendingStatus} onChange={e => setPendingStatus(e.target.value)} disabled={loading}>
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div><b>Notes:</b> {request.notes || '-'}</div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-2 text-sm" role="alert">
            <strong className="font-bold">Lỗi: </strong>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded mb-2 text-sm" role="alert">
            <strong className="font-bold">Thành công: </strong>
            <span>{success}</span>
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold flex items-center justify-center" onClick={handleUpdateStatus} disabled={loading || pendingStatus === request.status}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : null}
            Cập Nhật
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold" onClick={onOpenMessage} disabled={loading}>Nhắn khách</button>
          <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-semibold" onClick={onClose} disabled={loading}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default StaffRequestDetailModal; 