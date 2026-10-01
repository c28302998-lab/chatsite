"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const inviteBy = searchParams?.get("inviteBy");
  const bandId = searchParams?.get("bandId");
  const role = searchParams?.get("role");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          inviteBy,
          bandId,
          role
        }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Ошибка при регистрации");
      }
    } catch (error) {
      setError("Ошибка соединения");
    }
  };

  return (
    <Card className="w-full max-w-md p-8 bg-white/5 border-white/10 backdrop-blur-xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white tracking-wider">
          {role === 'CHATTER' ? 'РЕГИСТРАЦИЯ ЧАТЕРА' : 'РЕГИСТРАЦИЯ'}
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          {role === 'CHATTER' ? 'Присоединяйтесь к команде в HUNTME CRM' : 'Стать партнером HUNTME CRM'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            placeholder="Иван Иванов"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            placeholder="user@huntme.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/25 mt-6"
        >
          Зарегистрироваться
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Войти
        </Link>
      </div>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Suspense fallback={<div className="text-white">Загрузка...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
