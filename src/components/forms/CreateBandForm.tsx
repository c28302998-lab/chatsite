"use client";

import { useState } from "react";
import { createBand } from "@/app/actions/band";
import { Users } from "lucide-react";

export function CreateBandForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await createBand(formData);
    
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Произошла ошибка");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 bg-[#B9FF66]/20 rounded-full flex items-center justify-center mb-6">
        <Users className="w-8 h-8 text-[#B9FF66]" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">У вас еще нет команды</h2>
      <p className="text-slate-400 mb-8 max-w-md text-center">
        Чтобы начать добавлять работников и чатеров, создайте свою команду (Банду).
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <input
            name="name"
            type="text"
            required
            className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B9FF66]/50 focus:ring-1 focus:ring-[#B9FF66]/50 transition-all"
            placeholder="Название команды"
          />
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#B9FF66] text-black font-semibold py-3 px-4 rounded-xl hover:bg-[#9DE54E] transition-colors disabled:opacity-50"
        >
          {loading ? "Создание..." : "Создать команду"}
        </button>
      </form>
    </div>
  );
}
