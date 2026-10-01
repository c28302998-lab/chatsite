"use client";

import { useState, useEffect } from "react";
import { Link2, Check } from "lucide-react";

interface ReferralLinkProps {
  userId: string;
  bandId: string;
  role?: string;
  text?: string;
}

export function ReferralLink({ userId, bandId, role = "CHATTER", text = "Скопировать ссылку для чатеров" }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");

  useEffect(() => {
    // Формируем ссылку только на клиенте, чтобы был доступен window.location.origin
    setLink(`${window.location.origin}/register?inviteBy=${userId}&bandId=${bandId}&role=${role}`);
  }, [userId, bandId, role]);

  const copyToClipboard = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={copyToClipboard}
      className={`flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors w-full sm:w-auto ${
        role === 'PARTNER' ? 'bg-[#B9FF66] text-black hover:bg-[#a5e65b]' : 'bg-pink-500 hover:bg-pink-600'
      }`}
    >
      {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      {copied ? "Ссылка скопирована" : text}
    </button>
  );
}
