"use client";

import { useState } from "react";
import { SubmitBonusModal } from "./SubmitBonusModal";
import { FileText } from "lucide-react";

export function BonusActionBtn({ bonusId }: { bonusId: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1 text-xs font-medium bg-[#B9FF66]/10 text-[#B9FF66] border border-[#B9FF66]/20 rounded-full hover:bg-[#B9FF66]/20 transition-colors flex items-center gap-1"
      >
        <FileText className="w-3 h-3" />
        Сдать отчет
      </button>

      {showModal && (
        <SubmitBonusModal bonusId={bonusId} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
