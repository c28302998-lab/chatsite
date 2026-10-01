"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { submitReport } from "@/app/actions/report";

export default function ReportForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const res = await submitReport(formData);

    if (res.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(res.error || "Ошибка при отправке отчета");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#1C1C1E] border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-2">Сдать отчет за смену</h2>
      <p className="text-zinc-400 mb-8 text-sm">
        Заполните данные о прошедшей смене. Ваш отчет будет отправлен на проверку рекрутеру.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 text-sm">
          Отчет успешно отправлен и ожидает проверки!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Начало смены</label>
            <input
              type="datetime-local"
              name="shiftStart"
              required
              className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#B9FF66]/50 focus:ring-1 focus:ring-[#B9FF66]/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Конец смены</label>
            <input
              type="datetime-local"
              name="shiftEnd"
              required
              className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#B9FF66]/50 focus:ring-1 focus:ring-[#B9FF66]/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Профит за смену (в $)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-zinc-500">$</span>
            </div>
            <input
              type="number"
              name="profitAmount"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="w-full bg-black/20 border border-zinc-800 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#B9FF66]/50 focus:ring-1 focus:ring-[#B9FF66]/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Ссылка на скриншот (доказательство)</label>
          <input
            type="url"
            name="screenshot"
            required
            placeholder="https://prnt.sc/... или https://imgur.com/..."
            className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#B9FF66]/50 focus:ring-1 focus:ring-[#B9FF66]/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Доступ к аккаунту (Логин и Пароль)</label>
          <textarea
            name="accountAccess"
            required
            rows={3}
            placeholder="Логин: user@example.com&#10;Пароль: 123456"
            className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#B9FF66]/50 focus:ring-1 focus:ring-[#B9FF66]/50 transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl bg-[#B9FF66] text-black font-semibold hover:bg-[#a6e65c] focus:outline-none focus:ring-2 focus:ring-[#B9FF66]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Отправка...
            </>
          ) : (
            "Отправить отчет на проверку"
          )}
        </button>
      </form>
    </div>
  );
}
