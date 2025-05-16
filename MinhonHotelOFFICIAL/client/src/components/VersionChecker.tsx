import React, { useEffect, useState } from 'react';

const CHECK_INTERVAL = 60000; // 60s

const VersionChecker: React.FC = () => {
  const [show, setShow] = useState(false);
  const [latest, setLatest] = useState<string | null>(null);

  useEffect(() => {
    let currentVersion: string | null = null;
    const fetchVersion = async () => {
      try {
        const res = await fetch('/version.txt', { cache: 'no-store' });
        const text = await res.text();
        if (!currentVersion) {
          currentVersion = text.trim();
        } else if (text.trim() !== currentVersion) {
          setLatest(text.trim());
          setShow(true);
        }
      } catch {}
    };
    fetchVersion();
    const interval = setInterval(fetchVersion, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xs text-center">
        <div className="text-lg font-semibold mb-2 text-[#559A9A]">A new update is available!</div>
        <div className="mb-4 text-gray-600">Please refresh the page to get the latest version.</div>
        <button
          className="px-4 py-2 rounded-lg bg-[#79DBDC] text-white font-bold shadow"
          onClick={() => window.location.reload()}
        >
          Refresh Now
        </button>
      </div>
    </div>
  );
};

export default VersionChecker; 