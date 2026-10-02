"use client";

import { useState } from "react";
import { Calendar, MessageCircle, X } from "lucide-react";
import { updateInterviewDate } from "@/app/actions/application";

export function InterviewDatePicker({ applicationId, date, interviewText, role }: { applicationId: string, date: Date | null, interviewText: string | null, role: string }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inputDate, setInputDate] = useState(date ? new Date(date).toISOString().split('T')[0] : "");
  const [inputText, setInputText] = useState(interviewText || "");

  if (role !== "ADMIN") {
    return (
      <div className="flex flex-col gap-2 mt-2">
        {date && (
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(date).toLocaleDateString()}
          </div>
        )}
        {interviewText && (
          <div className="text-xs text-slate-300 bg-white/5 p-2 rounded border border-zinc-800">
            <div className="text-slate-500 mb-1 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Текст для кандидата:</div>
            <div className="whitespace-pre-wrap">{interviewText}</div>
          </div>
        )}
      </div>
    );
  }

  const handleSetDateAndText = async () => {
    setLoading(true);
    try {
      const parsedDate = inputDate ? new Date(inputDate) : null;
      if (inputDate && isNaN(parsedDate!.getTime())) {
        alert("Неверный формат даты");
        return;
      }
      const res = await updateInterviewDate(applicationId, parsedDate, inputText);
      if (!res.success) alert("Ошибка: " + res.error);
      else setShowModal(false);
    } catch (e) {
      alert("Ошибка при сохранении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        {date && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(date).toLocaleDateString()}
          </span>
        )}
        <button 
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="text-xs text-amber-500 hover:text-amber-400 bg-amber-500/10 px-2 py-1 rounded transition-colors whitespace-nowrap"
        >
          {date ? "Изменить данные собеса" : "Назначить собес"}
        </button>
      </div>
      
      {interviewText && (
        <div className="text-xs text-slate-300 bg-white/5 p-2 rounded border border-zinc-800 mt-1 max-w-sm">
          <div className="text-slate-500 mb-1 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Текст для кандидата:</div>
          <div className="whitespace-pre-wrap">{interviewText}</div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1C1C1E] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-black/20">
              <h2 className="text-lg font-semibold text-white">Данные собеседования</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Дата (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Текст для кандидата
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                  placeholder="Например: Собеседование пройдет в Telegram..."
                  className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSetDateAndText}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
