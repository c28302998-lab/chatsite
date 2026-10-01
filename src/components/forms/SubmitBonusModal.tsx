"use client";

import { useState } from "react";
import { submitBonusReport } from "@/app/actions/bonusRates";
import { X } from "lucide-react";

export function SubmitBonusModal({ bonusId, onClose }: { bonusId: string, onClose: () => void }) {
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) {
      setError("Введите текст отчета");
      return;
    }

    setLoading(true);
    setError("");

    const res = await submitBonusReport(bonusId, reportText);
    
    if (res.success) {
      onClose();
    } else {
      setError(res.error || "Произошла ошибка");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1C1C1E] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">Отчет по ставке</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Комментарий / Отчет
            </label>
            <textarea
              required
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#B9FF66]/50 focus:ring-1 focus:ring-[#B9FF66]/50 min-h-[100px]"
              placeholder="Опишите выполненные условия..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-black bg-[#B9FF66] hover:bg-[#a5e65a] transition-colors disabled:opacity-50"
            >
              {loading ? "Отправка..." : "Отправить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
