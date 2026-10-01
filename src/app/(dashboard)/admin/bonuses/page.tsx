import { Gift, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CreateBonusForm } from '@/components/bonuses/CreateBonusForm';
import { approveBonus } from '@/app/actions/bonusRates';

// Helper component for admin action
function AdminBonusActions({ bonusId }: { bonusId: string }) {
  return (
    <form action={async () => {
      'use server';
      await approveBonus(bonusId);
    }}>
      <button 
        type="submit"
        className="px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full hover:bg-emerald-500/20 transition-colors"
      >
        Оплатить
      </button>
    </form>
  );
}

export default async function AdminBonusesPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' }
  });

  const bonuses = await prisma.bonusRate.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Ставки и Бонусы</h1>
        <p className="text-slate-400 mt-1">Управление персональными ставками и бонусами для пользователей.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-indigo-400" />
            Назначить новую ставку
          </h2>
          <CreateBonusForm users={users} />
        </Card>

        <Card className="bg-[#1C1C1E] border-zinc-800 p-0 col-span-1 md:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-400" />
              История ставок
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-black/20 text-slate-400 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Пользователь</th>
                  <th className="px-6 py-4 font-semibold">Сумма</th>
                  <th className="px-6 py-4 font-semibold">Условия</th>
                  <th className="px-6 py-4 font-semibold">Статус</th>
                  <th className="px-6 py-4 font-semibold">Отчет</th>
                  <th className="px-6 py-4 font-semibold text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {bonuses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Ставки еще не назначались
                    </td>
                  </tr>
                )}
                {bonuses.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {b.user.name || 'Без имени'}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#B9FF66]">
                      ${b.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs max-w-[200px] truncate" title={b.conditions}>
                      {b.conditions}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        b.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        b.status === 'PENDING_REVIEW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {b.status === 'APPROVED' ? 'Выплачено' : b.status === 'PENDING_REVIEW' ? 'Проверка' : 'В процессе'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs max-w-[150px] truncate" title={b.reportText || ''}>
                      {b.reportText || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {b.status === 'PENDING_REVIEW' && (
                        <AdminBonusActions bonusId={b.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
