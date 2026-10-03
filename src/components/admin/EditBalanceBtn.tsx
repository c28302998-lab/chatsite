"use client";

import { useState } from "react";
import { Edit2, Check, X, Trash } from "lucide-react";
import { updateUserBalance } from "@/app/actions/user";

export function EditBalanceBtn({ userId, currentBalance }: { userId: string, currentBalance: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(currentBalance.toString());
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const num = parseFloat(val);
    if (isNaN(num)) return alert("Неверное число");
    
    setLoading(true);
    const res = await updateUserBalance(userId, num);
    if (!res.success) {
      alert(res.error);
    } else {
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!confirm("Точно обнулить баланс этого пользователя?")) return;
    setLoading(true);
    const res = await updateUserBalance(userId, 0);
    if (!res.success) alert(res.error);
    setLoading(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-end gap-2">
        <input 
          type="number"
          value={val}
          onChange={e => setVal(e.target.value)}
          className="w-20 bg-black/40 border border-zinc-700 rounded px-2 py-1 text-xs text-white text-right"
        />
        <button onClick={handleSave} disabled={loading} className="text-emerald-500 hover:text-emerald-400">
          <Check className="w-4 h-4" />
        </button>
        <button onClick={() => setIsEditing(false)} disabled={loading} className="text-slate-500 hover:text-slate-400">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-3 group">
      <span className="font-bold text-[#B9FF66]">${currentBalance.toFixed(2)}</span>
      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
        <button onClick={() => setIsEditing(true)} className="p-1 text-slate-500 hover:text-white rounded hover:bg-white/10" title="Изменить баланс">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleReset} className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10" title="Обнулить баланс">
          <Trash className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
