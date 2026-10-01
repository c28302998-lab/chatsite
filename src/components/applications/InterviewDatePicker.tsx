"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { updateInterviewDate } from "@/app/actions/application";

export function InterviewDatePicker({ applicationId, date, role }: { applicationId: string, date: Date | null, role: string }) {
  const [loading, setLoading] = useState(false);

  if (role !== "ADMIN") {
    return date ? (
      <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
        <Calendar className="w-3 h-3" />
        {new Date(date).toLocaleDateString()}
      </div>
    ) : null;
  }

  const handleSetDate = async () => {
    const input = prompt("Введите дату собеседования (YYYY-MM-DD):", date ? new Date(date).toISOString().split('T')[0] : "");
    if (input === null) return;
    
    setLoading(true);
    try {
      const parsedDate = new Date(input);
      if (isNaN(parsedDate.getTime())) {
        alert("Неверный формат даты");
        return;
      }
      const res = await updateInterviewDate(applicationId, parsedDate);
      if (!res.success) alert("Ошибка: " + res.error);
    } catch (e) {
      alert("Ошибка при сохранении даты");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-1 flex items-center gap-1">
      {date && (
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(date).toLocaleDateString()}
        </span>
      )}
      <button 
        onClick={handleSetDate}
        disabled={loading}
        className="text-xs text-amber-500 hover:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded transition-colors"
      >
        {date ? "Изменить" : "Назначить"}
      </button>
    </div>
  );
}
