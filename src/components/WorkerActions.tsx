"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteWorker } from "@/app/actions/worker";

export function WorkerActions({ workerId }: { workerId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Удалить рекрутера?")) return;
    setLoading(true);
    const res = await deleteWorker(workerId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Произошла ошибка");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Удалить рекрутера"
      className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
    </button>
  );
}
