"use client";

import { useState } from "react";
import { approveReport, rejectReport, sendToCalculation } from "@/app/actions/reports";
import { X, CheckCircle, Clock, Trash } from "lucide-react";
import { ApproveReportModal } from "./ApproveReportModal";

interface ReportActionsProps {
  reportId: string;
  status: string;
  userRole: string;
  profitAmount: number;
  chatterName?: string;
  recruiterName?: string;
  ownerName?: string;
  accountAccess?: string | null;
  screenshot?: string | null;
}

export function ReportActions({ 
  reportId, 
  status, 
  userRole, 
  profitAmount,
  chatterName = "Чатер",
  recruiterName,
  ownerName,
  accountAccess,
  screenshot
}: ReportActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [chatterCut, setChatterCut] = useState((profitAmount * 0.5).toFixed(2));

  if (userRole === "CHATTER") {
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
          status === "APPROVED"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : status === "REJECTED"
            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
            : status === "PENDING_CALCULATION"
            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
        }`}
      >
        {status === "APPROVED" ? "Оплачено" : status === "REJECTED" ? "Отклонено" : status === "PENDING_CALCULATION" ? "Ожидает выплаты" : "На проверке"}
      </span>
    );
  }

  // Already processed statuses
  if (status === "APPROVED" || status === "REJECTED") {
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
          status === "APPROVED"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
        }`}
      >
        {status === "APPROVED" ? "Оплачено" : "Отклонено"}
      </span>
    );
  }

  const handleSendToCalculation = async () => {
    setLoading(true);
    await sendToCalculation(reportId);
    setLoading(false);
  };

  const handleApproveSuccess = () => {
    setShowModal(false);
  };

  const handleReject = async () => {
    if (!confirm("Отклонить смену?")) return;
    setLoading(true);
    await rejectReport(reportId);
    setLoading(false);
  };

  return (
    <>
      <div className="flex gap-2 items-center justify-end">
        {status === "PENDING_REVIEW" && (
          <>
            <button
              onClick={handleSendToCalculation}
              disabled={loading}
              className="px-3 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              На расчет
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-3 py-1 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full hover:bg-rose-500/20 transition-colors disabled:opacity-50"
            >
              Отклонить
            </button>
          </>
        )}

        {status === "PENDING_CALCULATION" && userRole === "ADMIN" && (
          <>
            <button
              onClick={() => setShowModal(true)}
              disabled={loading}
              className="px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full hover:bg-emerald-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Оплатить
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-3 py-1 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full hover:bg-rose-500/20 transition-colors disabled:opacity-50"
            >
              Отклонить
            </button>
          </>
        )}

        {status === "PENDING_CALCULATION" && userRole !== "ADMIN" && (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase border bg-blue-500/10 text-blue-400 border-blue-500/20">
            Ожидает выплаты
          </span>
        )}
      </div>

      {showModal && (
        <ApproveReportModal
          reportId={reportId}
          profitAmount={profitAmount}
          chatterName={chatterName}
          recruiterName={recruiterName}
          ownerName={ownerName}
          accountAccess={accountAccess}
          screenshot={screenshot}
          onClose={handleApproveSuccess}
        />
      )}
      
      {userRole === "ADMIN" && (
        <button
          onClick={async () => {
            if (confirm("Точно удалить этот отчет навсегда?")) {
              setLoading(true);
              const { deleteReport } = await import("@/app/actions/reports");
              await deleteReport(reportId);
              setLoading(false);
            }
          }}
          disabled={loading}
          title="Удалить отчет"
          className="ml-2 p-1.5 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
        >
          <Trash className="w-4 h-4" />
        </button>
      )}
    </>
  );
}
