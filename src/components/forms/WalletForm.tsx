"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

export function WalletForm({ initialWallet, initialExchange }: { initialWallet: string, initialExchange: string }) {
  const [wallet, setWallet] = useState(initialWallet);
  const [exchange, setExchange] = useState(initialExchange);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: wallet, cryptoExchange: exchange }),
      });

      if (res.ok) {
        setMessage("Реквизиты успешно сохранены");
        router.refresh();
      } else {
        setMessage("Произошла ошибка при сохранении");
      }
    } catch (error) {
      setMessage("Ошибка соединения");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">
          Кошелек USDT (сеть TRC20)
        </label>
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="T..."
          className="w-full bg-black/20 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B9FF66]/50 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">
          Биржа (Binance, Bybit и т.д.)
        </label>
        <input
          type="text"
          value={exchange}
          onChange={(e) => setExchange(e.target.value)}
          placeholder="Например: Binance"
          className="w-full bg-black/20 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B9FF66]/50 transition-all"
        />
      </div>

      {message && (
        <p className={`text-sm ${message.includes("ошибка") ? "text-red-400" : "text-[#B9FF66]"}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#B9FF66] text-black font-semibold rounded-lg hover:bg-[#a3e655] transition-colors disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {isLoading ? "Сохранение..." : "Сохранить"}
      </button>
    </form>
  );
}
