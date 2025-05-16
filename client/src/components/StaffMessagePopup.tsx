import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
}

interface StaffMessagePopupProps {
  messages: Message[];
  onSend: (msg: string) => void;
  onClose: () => void;
  loading?: boolean;
}

const StaffMessagePopup: React.FC<StaffMessagePopupProps> = ({ messages, onSend, onClose, loading }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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
    setTimeout(() => firstEl?.focus(), 0);
    return () => modal.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSend = () => {
    if (!input.trim()) return;
    setError(null);
    try {
      onSend(input);
      setInput('');
    } catch (err) {
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl p-5 w-full max-w-md relative flex flex-col transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-400"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        tabIndex={-1}
      >
        <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 transition-all duration-200 focus:ring-2 focus:ring-blue-400" onClick={onClose} aria-label="Đóng popup">&times;</button>
        <h3 id="popup-title" className="text-lg font-bold text-blue-900 mb-3">Nhắn tin tới Guest</h3>
        <div className="flex-1 overflow-y-auto mb-3 max-h-60 border rounded p-2 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-gray-400 text-sm text-center">Chưa có tin nhắn</div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`mb-2 ${msg.sender === 'staff' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-3 py-1 rounded-lg ${msg.sender === 'staff' ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-800'}`}>
                  <span className="font-semibold">{msg.sender === 'staff' ? 'Staff' : 'Guest'}:</span> {msg.content}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{msg.time}</div>
              </div>
            ))
          )}
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-2 text-sm" role="alert">
            <strong className="font-bold">Lỗi: </strong>
            <span>{error}</span>
          </div>
        )}
        <div className="flex gap-2 mt-2 items-center">
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            disabled={loading}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded font-semibold flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg focus:ring-2 focus:ring-blue-400"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Gửi'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffMessagePopup; 