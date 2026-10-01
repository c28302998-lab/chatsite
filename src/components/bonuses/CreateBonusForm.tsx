"use client";

import { useState } from "react";
import { createBonusRate } from "@/app/actions/bonusRates";

interface CreateBonusFormProps {
  users: { id: string, name: string | null, email: string | null }[];
}

export function CreateBonusForm({ users }: CreateBonusFormProps) {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [conditions, setConditions] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !amount || !conditions) return;
    
    setLoading(true);
    const res = await createBonusRate(userId, parseFloat(amount), conditions);
    setLoading(false);
    
    if (res.success) {
      setUserId("");
      setAmount("");
      setConditions("");
      alert("Ставка успешно назначена!");
    } else {
      alert("Ошибка: " + res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Пользователь</label>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          className="w-full bg-black/20 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50"
        >
          <option value="">Выберите пользователя</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name || "Без имени"} ({u.email})
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Сумма бонуса / ставки ($)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="Например, 50.00"
          className="w-full bg-black/20 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Условия получения (за что?)</label>
        <textarea
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
          required
          placeholder="Сделать 100 профита за 3 дня..."
          className="w-full bg-black/20 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 min-h-[100px]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? "Назначение..." : "Назначить ставку"}
      </button>
    </form>
  );
}
