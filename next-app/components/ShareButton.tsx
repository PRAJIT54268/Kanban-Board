'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function ShareButton({ boardId }: { boardId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(boardId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 shadow-sm transition-all border border-emerald-200 dark:border-emerald-800"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Copied ID!' : 'Share Board'}
    </button>
  );
}
