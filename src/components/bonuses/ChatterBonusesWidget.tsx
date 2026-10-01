"use client";

import { useState } from "react";
import { Gift, CheckCircle } from "lucide-react";
import { submitBonusReport } from "@/app/actions/bonusRates";

interface BonusRate {
  id: string;
  amount: number;
  conditions: string;
  status: string;
}

export function ChatterBonusesWidget({ bonuses }: { bonuses: BonusRate[] }) {
  const [reportTexts, setReportTexts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleSubmit = async (bonusId: string) => {
    const text = reportTexts[bonusId];
    if (!text) return;

    setLoading((prev) => ({ ...prev, [bonusId]: true }));
    const res = await submitBonusReport(bonusId, text);
    setLoading((prev) => ({ ...prev, [bonusId]: false }));

    if (!res.success) {
      alert("Ошибка: " + res.error);
    }
  };

  if (bonuses.length === 0) {
    return (
      <div className="bg-[#1C1C1E] border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-indigo-400" />
          Мои Ставки и Бонусы
        </h2>
        <p className="text-slate-500 text-sm">У вас пока нет активных ставок.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1C1E] border border-zinc-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Gift className="w-5 h-5 text-indigo-400" />
        Мои Ставки и Бонусы
      </h2>
      
      <div className="space-y-4">
        {bonuses.map((bonus) => (
          <div key={bonus.id} className="p-4 bg-black/20 border border-zinc-800/50 rounded-xl space-y-3">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-sm text-slate-400">Условие:</p>
                <p className="text-white font-medium mt-0.5">{bonus.conditions}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Сумма:</p>
                <p className="text-xl font-bold text-[#B9FF66]">${bonus.amount.toFixed(2)}</p>
              </div>
            </div>

            {bonus.status === 'PENDING' && (
              <div className="pt-2">
                <textarea
                  value={reportTexts[bonus.id] || ""}
                  onChange={(e) => setReportTexts({ ...reportTexts, [bonus.id]: e.target.value })}
                  placeholder="Прикрепите ссылку на скриншот или напишите отчет..."
                  className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 min-h-[80px]"
                />
                <button
                  onClick={() => handleSubmit(bonus.id)}
                  disabled={loading[bonus.id] || !reportTexts[bonus.id]}
                  className="mt-2 w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading[bonus.id] ? "Отправка..." : "Отправить отчет по ставке"}
                </button>
              </div>
            )}
            
            {bonus.status === 'PENDING_REVIEW' && (
              <div className="mt-2 py-2 px-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-sm flex items-center justify-center font-medium">
                Отчет отправлен, ожидается проверка
              </div>
            )}
            
            {bonus.status === 'APPROVED' && (
              <div className="mt-2 py-2 px-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm flex items-center justify-center font-medium gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Выплачено на баланс
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
