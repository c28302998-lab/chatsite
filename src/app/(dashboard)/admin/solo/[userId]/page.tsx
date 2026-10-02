import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Users, DollarSign, Wallet } from 'lucide-react';
import Link from 'next/link';

export default async function AdminSoloDetailPage({ params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const partner = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      reports: { where: { status: 'APPROVED' } },
      applications: true,
      invitees: {
        include: {
          reports: { where: { status: 'APPROVED' } }
        }
      }
    }
  });

  if (!partner) {
    redirect('/admin/bands');
  }

  // Calculate totals
  let partnerProfit = 0;
  partner.reports.forEach(r => partnerProfit += (r.profitAmount || 0));

  let totalInviteesProfit = 0;
  const inviteesWithProfit = partner.invitees.map(inv => {
    const profit = inv.reports.reduce((acc, curr) => acc + (curr.profitAmount || 0), 0);
    totalInviteesProfit += profit;
    return { ...inv, profit };
  }).sort((a, b) => b.profit - a.profit);

  const totalSoloProfit = partnerProfit + totalInviteesProfit;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/bands" className="p-2 bg-[#1C1C1E] border border-zinc-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{partner.name || 'Одиночный Рекрутер'}</h1>
          <p className="text-slate-400 mt-1">{partner.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Приглашенные</p>
            <p className="text-2xl font-bold text-white">{partner.invitees.length}</p>
          </div>
        </Card>

        <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-xl">
            <Wallet className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Баланс Рекрутера</p>
            <p className="text-2xl font-bold text-amber-400">${partner.balance.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Заработано (Профит)</p>
            <p className="text-2xl font-bold text-emerald-400">${totalSoloProfit.toFixed(2)}</p>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Партнер</h2>
        <div className="rounded-xl border border-zinc-800 bg-[#1C1C1E] overflow-hidden p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-lg text-white">{partner.name || 'Без имени'}</p>
              <p className="text-slate-400 text-sm">{partner.email}</p>
              <span className="inline-flex mt-2 items-center px-2 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-md text-[10px] uppercase font-bold">
                {partner.role}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Собственный профит</p>
              <p className="text-xl font-bold text-emerald-400">${partnerProfit.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Приглашенные пользователи ({inviteesWithProfit.length})</h2>
        <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1E] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-black/20 text-slate-400 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Имя</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Роль</th>
                  <th className="px-6 py-4 font-semibold text-right">Заработано (Профит)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {inviteesWithProfit.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Пока нет приглашенных</td>
                  </tr>
                ) : (
                  inviteesWithProfit.map(inv => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{inv.name || 'Без имени'}</td>
                      <td className="px-6 py-4 text-slate-400">{inv.email || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-500/10 text-slate-400 border-slate-500/20 uppercase">
                          {inv.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400">
                        ${inv.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {partner.applications.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Заявки рекрутера ({partner.applications.length})</h2>
          <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1E] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-black/20 text-slate-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Кандидат</th>
                    <th className="px-6 py-4 font-semibold">Статус</th>
                    <th className="px-6 py-4 font-semibold text-right">Дата создания</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {partner.applications.map(app => (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        {app.name}
                        <div className="text-xs text-slate-500">{app.telegram || app.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400">
                        {app.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
