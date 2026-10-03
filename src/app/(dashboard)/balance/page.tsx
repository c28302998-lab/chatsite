import { Wallet, Settings, Copy, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WalletForm } from '@/components/forms/WalletForm';
import { BonusActionBtn } from '@/components/forms/BonusActionBtn';

export default async function BalancePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bonusRates: {
        orderBy: { createdAt: 'desc' }
      },
      ownedBand: {
        include: {
          members: {
            where: { role: 'CHATTER' }
          }
        }
      }
    }
  });

  if (!user) {
    return null;
  }

  let usersWithWallets: any[] = [];
  if (user.role === 'ADMIN') {
    usersWithWallets = await prisma.user.findMany({
      where: {
        walletAddress: { not: null }
      },
      select: {
        id: true,
        name: true,
        email: true,
        walletAddress: true,
        cryptoExchange: true,
        balance: true,
        role: true
      },
      orderBy: { balance: 'desc' }
    });
    usersWithWallets = usersWithWallets.filter(u => u.walletAddress && u.walletAddress.trim() !== "");
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Баланс</h1>
        <p className="text-slate-400 mt-1">Управление вашими финансами и реквизитами для выплат.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#B9FF66]/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[#B9FF66]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Ваш текущий баланс</p>
              <p className="text-4xl font-bold text-white mt-1">
                ${user.balance.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-sm text-slate-400 leading-relaxed">
              Выплаты осуществляются на указанный вами крипто-кошелек (только сеть TRC20).
            </p>
          </div>
        </Card>

        <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Реквизиты для выплат</h2>
          <WalletForm 
            initialWallet={user.walletAddress || ''} 
            initialExchange={user.cryptoExchange || ''} 
          />
        </Card>
      </div>

      <div className="mt-8">
        {user.role === 'ADMIN' ? (
          <>
            <h2 className="text-xl font-bold text-white mb-4">Реквизиты и балансы пользователей</h2>
            <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1E] overflow-hidden">
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
                    {usersWithWallets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          Пока никто не добавил реквизиты
                        </td>
                      </tr>
                    ) : (
                      usersWithWallets.map((u: any) => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-white">{u.name || 'Без имени'}</p>
                            <p className="text-xs text-zinc-500">{u.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                              {u.role === 'PARTNER' ? 'Партнер' : u.role === 'CHATTER' ? 'Чатер' : u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-zinc-300 bg-white/5">{u.walletAddress}</td>
                          <td className="px-6 py-4 text-zinc-400">{u.cryptoExchange || '—'}</td>
                          <td className="px-6 py-4 text-right font-bold text-[#B9FF66]">${u.balance.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white mb-4">Мои Ставки / Бонусы</h2>
            <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1E] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-black/20 text-slate-400 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Дата</th>
                      <th className="px-6 py-4 font-semibold">Сумма</th>
                      <th className="px-6 py-4 font-semibold">Условия</th>
                      <th className="px-6 py-4 font-semibold text-right">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {(!user.bonusRates || user.bonusRates.length === 0) ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          У вас пока нет назначенных ставок или бонусов
                        </td>
                      </tr>
                    ) : (
                      user.bonusRates.map((bonus: any) => (
                        <tr key={bonus.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-medium text-white">{new Date(bonus.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-bold text-[#B9FF66]">${bonus.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-zinc-400 max-w-xs truncate" title={bonus.conditions}>{bonus.conditions}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end">
                              {bonus.status === 'ACTIVE' ? (
                                <BonusActionBtn bonusId={bonus.id} />
                              ) : (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  bonus.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  bonus.status === 'PENDING_REVIEW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                }`}>
                                  {bonus.status === 'APPROVED' ? 'Выплачено' : bonus.status === 'PENDING_REVIEW' ? 'На проверке' : 'Отклонено'}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {user.role === 'PARTNER' && user.ownedBand && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Балансы вашей команды (Чатеры)</h2>
          <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1E] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-black/20 text-slate-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Чатер</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold text-right">Баланс</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {user.ownedBand.members.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                        В вашей команде пока нет чатеров
                      </td>
                    </tr>
                  ) : (
                    user.ownedBand.members.map((chatter) => (
                      <tr key={chatter.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{chatter.name || 'Без имени'}</td>
                        <td className="px-6 py-4 text-zinc-400">{chatter.email}</td>
                        <td className="px-6 py-4 text-right font-bold text-[#B9FF66]">${chatter.balance.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
