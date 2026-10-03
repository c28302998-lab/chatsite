"use client";

import { useState } from "react";
import { approveReport } from "@/app/actions/reports";
import { Check, X } from "lucide-react";

interface Props {
  reportId: string;
  profitAmount: number;
  chatterName: string;
  recruiterName?: string | null;
  ownerName?: string | null;
  onClose: () => void;
}

export function ApproveReportModal({ reportId, profitAmount, chatterName, recruiterName, ownerName, onClose }: Props) {
  const [chatterAmount, setChatterAmount] = useState<number>(0);
  const [recruiterAmount, setRecruiterAmount] = useState<number>(0);
  const [ownerAmount, setOwnerAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const adminAmount = profitAmount - chatterAmount - recruiterAmount - ownerAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await approveReport(reportId, { chatterAmount, recruiterAmount, ownerAmount, adminAmount });
      if (!res.success) {
        alert("Ошибка: " + res.error);
      } else {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1C1C1E] border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Выплата по отчету</h2>
            <p className="text-sm text-slate-400 mt-1">
              Указанный профит: <span className="text-amber-500 font-medium">${profitAmount}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 block">
              Доля Чатера ({chatterName}) $
            </label>
            <input 
              type="number" 
              min="0" step="0.01"
              required
              value={chatterAmount}
              onChange={(e) => setChatterAmount(Number(e.target.value))}
              className="w-full bg-black/20 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
          </div>

          {recruiterName && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 block">
                Доля Рекрутера ({recruiterName}) $
              </label>
              <input 
                type="number" 
                min="0" step="0.01"
                required
                value={recruiterAmount}
                onChange={(e) => setRecruiterAmount(Number(e.target.value))}
                className="w-full bg-black/20 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />
            </div>
          )}

          {ownerName && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 block">
                Доля Владельца Команды ({ownerName}) $
              </label>
              <input 
                type="number" 
                min="0" step="0.01"
                required
                value={ownerAmount}
                onChange={(e) => setOwnerAmount(Number(e.target.value))}
                className="w-full bg-black/20 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />
            </div>
          )}

          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg mt-4">
            <p className="text-sm font-medium text-purple-400 flex justify-between items-center">
              <span>Доля Платформы (Ваша прибыль):</span>
              <span className="text-lg font-bold">${adminAmount.toFixed(2)}</span>
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Обработка..." : "Подтвердить Выплату"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
