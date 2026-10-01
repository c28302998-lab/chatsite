"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock } from "lucide-react";
import { registerViaInvite } from "@/app/actions/auth";

function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-red-500 font-medium text-center">Недействительная ссылка-приглашение</div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("token", token!);

    const res = await registerViaInvite(formData);

    if (res.success) {
      router.push("/login?registered=true");
    } else {
      setError(res.error || "Ошибка регистрации");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-[#1C1C1E] p-8 rounded-2xl border border-zinc-800">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Имя</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              name="name"
              type="text"
              required
              className="w-full bg-black/20 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              placeholder="Иван Иванов"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              name="email"
              type="email"
              required
              className="w-full bg-black/20 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              placeholder="ivan@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Пароль</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              name="password"
              type="password"
              required
              className="w-full bg-black/20 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 text-black font-semibold py-3 px-4 rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 flex justify-center"
      >
        {loading ? "Регистрация..." : "Зарегистрироваться"}
      </button>
    </form>
  );
}

export default function InviteRegisterPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Добро пожаловать в команду</h2>
          <p className="mt-2 text-sm text-slate-400">
            Заполните данные для создания аккаунта Чатера
          </p>
        </div>
        <Suspense fallback={<div className="text-white text-center mt-8">Загрузка...</div>}>
          <InviteForm />
        </Suspense>
      </div>
    </div>
  );
}
