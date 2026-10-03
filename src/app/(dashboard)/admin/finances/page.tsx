import { Search, Wallet, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EditBalanceBtn } from '@/components/admin/EditBalanceBtn';

export default async function AdminFinancesPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  // Get all users who have non-zero balance or have wallet configured
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { balance: { gt: 0 } },
        { walletAddress: { not: null } }
      ]
    },
    orderBy: { balance: 'desc' }
  });

  const totalBalances = users.reduce((acc, user) => acc + user.balance, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Финансы (Админ)</h1>
        <p className="text-slate-400 mt-1">Управление балансами и выплатами пользователей.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <DollarSign className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Суммарный баланс пользователей</p>
            <p className="text-2xl font-bold text-white">${totalBalances.toFixed(2)}</p>
          </div>
        </Card>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1E] overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-black/20 text-slate-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Пользователь</th>
                <th className="px-6 py-4 font-semibold">Роль</th>
                <th className="px-6 py-4 font-semibold">Кошелек (TRC20)</th>
                <th className="px-6 py-4 font-semibold">Биржа</th>
                <th className="px-6 py-4 font-semibold text-right">Баланс</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Нет пользователей с балансом или кошельком
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{u.name || 'Без имени'}</div>
                    <div className="text-xs text-zinc-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-white/5 border-white/10">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300 font-mono text-xs">
                    {u.walletAddress ? (
                      <span className="break-all">{u.walletAddress}</span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {u.cryptoExchange || '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <EditBalanceBtn userId={u.id} currentBalance={u.balance} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
