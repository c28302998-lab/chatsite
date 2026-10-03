"use client";

import { useState } from "react";
import { approveBonus } from "@/app/actions/bonusRates";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteBonusModal } from "./DeleteBonusModal";

interface AdminBonusActionsProps {
  bonusId: string;
  status: string;
  amount: number;
  userName: string;
}

export function AdminBonusActions({ bonusId, status, amount, userName }: AdminBonusActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    setLoading(true);
    const res = await approveBonus(bonusId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Произошла ошибка");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {status === 'PENDING_REVIEW' && (
          <button 
            onClick={handleApprove}
            disabled={loading}
            className="px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
            Оплатить
          </button>
        )}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Удалить бонус"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {showDeleteModal && (
        <DeleteBonusModal
          bonusId={bonusId}
          status={status}
          amount={amount}
          userName={userName}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}
