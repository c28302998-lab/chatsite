"use client";

import { useState } from "react";
import { deleteReport } from "@/app/actions/reports";
import { X, Trash } from "lucide-react";

interface Props {
  reportId: string;
  status: string;
  chatterAmount: number | null;
  recruiterAmount: number | null;
  ownerAmount: number | null;
  adminAmount: number | null;
  chatterName: string;
  recruiterName?: string | null;
  ownerName?: string | null;
  onClose: () => void;
}

export function DeleteReportModal({ 
  reportId, status, chatterAmount, recruiterAmount, ownerAmount, adminAmount, 
  chatterName, recruiterName, ownerName, onClose 
}: Props) {
  const [loading, setLoading] = useState(false);
  
  // Pre-fill inputs with the exact amounts that were added to their balances
  const [deductChatter, setDeductChatter] = useState(chatterAmount || 0);
  const [deductRecruiter, setDeductRecruiter] = useState(recruiterAmount || 0);
  const [deductOwner, setDeductOwner] = useState(ownerAmount || 0);
  const [deductAdmin, setDeductAdmin] = useState(adminAmount || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payoutsToDeduct = status === 'APPROVED' ? {
        chatterAmount: deductChatter,
        recruiterAmount: deductRecruiter,
        ownerAmount: deductOwner,
        adminAmount: deductAdmin
      } : undefined;

      const res = await deleteReport(reportId, payoutsToDeduct);
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
            <h2 className="text-xl font-semibold text-white">Удаление отчета</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-300">
            Вы уверены, что хотите удалить этот отчет навсегда?
          </p>

          {status === 'APPROVED' && (
            <div className="mt-4 p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl space-y-3">
              <p className="text-sm font-medium text-rose-400">
                Списать деньги с пользователей?
              </p>
              <p className="text-xs text-slate-400">
                Эти суммы были зачислены при оплате. Если нужно, отредактируйте их, чтобы списать меньше или 0.
              </p>

              {(chatterAmount !== null) && (
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Чатер ({chatterName})</label>
                  <input type="number" step="0.01" value={deductChatter} onChange={e => setDeductChatter(Number(e.target.value))} className="w-full bg-black/20 border border-zinc-800 rounded text-white text-sm px-3 py-1" />
                </div>
              )}
              {(recruiterAmount !== null) && recruiterName && (
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Рекрутер ({recruiterName})</label>
                  <input type="number" step="0.01" value={deductRecruiter} onChange={e => setDeductRecruiter(Number(e.target.value))} className="w-full bg-black/20 border border-zinc-800 rounded text-white text-sm px-3 py-1" />
                </div>
              )}
              {(ownerAmount !== null) && ownerName && (
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Владелец ({ownerName})</label>
                  <input type="number" step="0.01" value={deductOwner} onChange={e => setDeductOwner(Number(e.target.value))} className="w-full bg-black/20 border border-zinc-800 rounded text-white text-sm px-3 py-1" />
                </div>
              )}
              {(adminAmount !== null) && (
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Платформа</label>
                  <input type="number" step="0.01" value={deductAdmin} onChange={e => setDeductAdmin(Number(e.target.value))} className="w-full bg-black/20 border border-zinc-800 rounded text-white text-sm px-3 py-1" />
                </div>
              )}
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              <Trash className="w-4 h-4" />
              {loading ? "Удаление..." : "Удалить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
