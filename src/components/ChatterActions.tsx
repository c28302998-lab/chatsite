"use client";

import { useState } from "react";
import { approveChatter, deleteChatter } from "@/app/actions/chatter";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ChatterActions({ 
  chatterId, 
  status,
  generatedEmail,
  generatedPassword
}: { 
  chatterId: string, 
  status: string,
  generatedEmail?: string | null,
  generatedPassword?: string | null
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    setLoading(true);
    const res = await approveChatter(chatterId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Произошла ошибка");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Удалить чатера?")) return;
    setLoading(true);
    const res = await deleteChatter(chatterId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Произошла ошибка");
    }
    setLoading(false);
  };

  const showCredentials = () => {
    if (generatedEmail && generatedPassword) {
      alert(`Данные для входа чатера:\n\nЛогин: ${generatedEmail}\nПароль: ${generatedPassword}`);
    } else if (generatedEmail) {
      alert(`Логин: ${generatedEmail}\n\nПароль не был сгенерирован автоматически, пользователь зарегистрировался сам.`);
    } else {
      alert("Данные не найдены. Вероятно, пользователь зарегистрировался самостоятельно.");
    }
  };

  if (status === 'PENDING') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 text-sm font-medium transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Одобрить
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center justify-center p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-pink-500/10 text-pink-400 border-pink-500/20">
        Активен
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={showCredentials}
          title="Показать данные для входа"
          className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs font-medium transition-colors"
        >
          Доступы
        </button>
        <button
            onClick={handleDelete}
            disabled={loading}
            title="Удалить чатера"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-medium transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            Удалить
        </button>
      </div>
    </div>
  );
}
