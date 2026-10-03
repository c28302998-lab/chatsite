"use client";

import { useState } from "react";
import { Check, X, Copy, CheckCircle2, Trash } from "lucide-react";
import { acceptApplication, rejectApplication } from "@/app/actions/application";

interface Props {
  applicationId: string;
  status: string;
  inviteToken: string | null;
  generatedEmail?: string | null;
  generatedPassword?: string | null;
  role: string;
}

export function ApplicationActions({ applicationId, status, inviteToken, generatedEmail, generatedPassword, role }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (role !== "ADMIN" && status !== "HIRED") return null;

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await acceptApplication(applicationId);
      if (!res.success) {
        alert("Ошибка: " + res.error);
      } else {
        alert(`Успешно! Аккаунт чатера создан.\n\nЛогин: ${res.email}\nПароль: ${res.password}\n\nОбязательно скопируйте и передайте эти данные кандидату!`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Точно отклонить заявку?")) return;
    setLoading(true);
    try {
      const res = await rejectApplication(applicationId);
      if (!res.success) {
        alert("Ошибка: " + res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const showCredentials = () => {
    if (generatedEmail && generatedPassword) {
      alert(`Данные для входа чатера:\n\nЛогин: ${generatedEmail}\nПароль: ${generatedPassword}`);
    } else {
      alert("Данные не найдены.");
    }
  };

  if (status === "HIRED") {
    return (
      <div className="flex justify-end gap-2">
        <button 
          onClick={showCredentials}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg text-xs font-medium transition-colors border border-amber-500/20"
        >
          <Copy className="w-3.5 h-3.5" />
          Доступы
        </button>
        {role === "ADMIN" && (
          <button
            onClick={async () => {
              if (confirm("Точно удалить заявку навсегда?")) {
                setLoading(true);
                const { deleteApplication } = await import("@/app/actions/application");
                await deleteApplication(applicationId);
                setLoading(false);
              }
            }}
            disabled={loading}
            className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
            title="Удалить заявку"
          >
            <Trash className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {status !== "HIRED" && status !== "REJECTED" && (
        <>
          <button 
            onClick={handleAccept}
            disabled={loading}
            className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors"
            title="Принять (Нанять)"
          >
            <Check className="w-4 h-4" />
          </button>
          <button 
            onClick={handleReject}
            disabled={loading}
            className="p-1.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-lg transition-colors"
            title="Отклонить"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}
      {role === "ADMIN" && (
        <button
          onClick={async () => {
            if (confirm("Точно удалить заявку навсегда?")) {
              setLoading(true);
              const { deleteApplication } = await import("@/app/actions/application");
              await deleteApplication(applicationId);
              setLoading(false);
            }
          }}
          disabled={loading}
          className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
          title="Удалить заявку"
        >
          <Trash className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
