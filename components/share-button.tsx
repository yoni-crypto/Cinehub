'use client';

import { Share2, Facebook, Twitter, MessageCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function ShareButton({ title, url = '' }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const text = `${title} - Free on CineHub`;

  const links = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${currentUrl}`)}`
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute top-full mt-2 right-0 bg-gray-900 border border-gray-700 rounded shadow-xl z-50 w-48">
            <div className="p-2">
              <p className="text-xs text-gray-400 px-2 py-1 mb-1">Share this with friends</p>
              
              <a href={links.facebook} target="_blank" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded text-white text-sm">
                <Facebook className="w-4 h-4 text-blue-500" />
                Facebook
              </a>
              
              <a href={links.twitter} target="_blank" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded text-white text-sm">
                <Twitter className="w-4 h-4 text-blue-400" />
                Twitter
              </a>
              
              <a href={links.whatsapp} target="_blank" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded text-white text-sm">
                <MessageCircle className="w-4 h-4 text-green-500" />
                WhatsApp
              </a>
              
              <button onClick={copy} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded text-white text-sm w-full text-left">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}