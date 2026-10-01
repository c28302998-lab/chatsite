"use client";

import { useState } from "react";
import { updateProfile, updateBandName, changePassword } from "@/app/actions/settings";
import { Card } from "@/components/ui/card";
import { User, Settings, ShieldAlert, Building2, KeyRound } from "lucide-react";

interface SettingsFormProps {
  user: any;
  hasTeam: boolean;
}

export function SettingsForm({ user, hasTeam }: SettingsFormProps) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [bandName, setBandName] = useState(user.ownedBand?.name || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [bandLoading, setBandLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setMessage(null);
    const res = await updateProfile({ name, email });
    if (res.success) {
      setMessage({ type: 'success', text: 'Профиль успешно обновлен' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Ошибка обновления' });
    }
    setProfileLoading(false);
  };

  const handleBandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBandLoading(true);
    setMessage(null);
    const res = await updateBandName(bandName);
    if (res.success) {
      setMessage({ type: 'success', text: 'Название команды обновлено' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Ошибка обновления' });
    }
    setBandLoading(false);
  };

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setMessage(null);
    const res = await changePassword(oldPassword, newPassword);
    if (res.success) {
      setMessage({ type: 'success', text: 'Пароль успешно изменен' });
      setOldPassword("");
      setNewPassword("");
    } else {
      setMessage({ type: 'error', text: res.error || 'Ошибка обновления пароля' });
    }
    setPassLoading(false);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.text}
        </div>
      )}

      {/* Настройки профиля */}
      <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <User className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Профиль пользователя</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {profileLoading ? 'Сохранение...' : 'Сохранить профиль'}
          </button>
        </form>
      </Card>

      {/* Настройки Команды */}
      {hasTeam && (
        <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#B9FF66]/10 rounded-lg">
              <Building2 className="w-5 h-5 text-[#B9FF66]" />
            </div>
            <h2 className="text-xl font-bold text-white">Настройки команды</h2>
          </div>

          <form onSubmit={handleBandSubmit} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Название Команды</label>
              <input
                type="text"
                value={bandName}
                onChange={(e) => setBandName(e.target.value)}
                className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B9FF66]/50 focus:ring-1 focus:ring-[#B9FF66]/50 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={bandLoading}
              className="bg-[#B9FF66] hover:bg-[#B9FF66]/90 text-black px-6 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
            >
              {bandLoading ? 'Сохранение...' : 'Сохранить команду'}
            </button>
          </form>
        </Card>
      )}

      {/* Безопасность */}
      <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-500/10 rounded-lg">
            <KeyRound className="w-5 h-5 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Безопасность</h2>
        </div>

        <form onSubmit={handlePassSubmit} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Старый пароль</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={passLoading}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {passLoading ? 'Сохранение...' : 'Изменить пароль'}
          </button>
        </form>
      </Card>
    </div>
  );
}
