"use client";

import { useState } from "react";
import { deleteBonus } from "@/app/actions/bonusRates";
import { Loader2, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteBonusModalProps {
  bonusId: string;
  status: string;
  amount: number;
  userName: string;
  onClose: () => void;
}

export function DeleteBonusModal({
  bonusId,
  status,
  amount,
  userName,
  onClose
}: DeleteBonusModalProps) {
  const [loading, setLoading] = useState(false);
  const [deductAmount, setDeductAmount] = useState(status === "APPROVED");
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteBonus(bonusId, deductAmount);
    if (res.success) {
      router.refresh();
      onClose();
    } else {
      alert(res.error || "Произошла ошибка");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1C1C1E] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Удаление бонуса
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm text-slate-300">
          <p>
            Вы уверены, что хотите удалить бонус для <strong>{userName}</strong> на сумму <strong>${amount.toFixed(2)}</strong>?
          </p>

          {status === "APPROVED" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-4">
              <h3 className="font-bold text-red-400 mb-2">Списание средств</h3>
              <p className="text-red-400/80 mb-4 text-xs">
                Этот бонус уже был выплачен (добавлен на баланс пользователя). Выберите, нужно ли списать эти деньги с его баланса при удалении истории.
              </p>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center pt-0.5">
                  <input
                    type="checkbox"
                    checked={deductAmount}
                    onChange={(e) => setDeductAmount(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-black/20 text-red-500 focus:ring-red-500/50 focus:ring-offset-0"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white group-hover:text-red-400 transition-colors">Списать ${amount.toFixed(2)} с баланса</p>
                  <p className="text-xs text-slate-500">
                    У пользователя {userName}
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
