import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Users, DollarSign, Wallet } from 'lucide-react';
import Link from 'next/link';

export default async function AdminBandDetailPage({ params }: { params: Promise<{ bandId: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const { bandId } = await params;

  const band = await prisma.band.findUnique({
    where: { id: bandId },
    include: {
      owner: {
        include: {
          reports: { where: { status: 'APPROVED' } },
          applications: true
        }
      },
      members: {
        include: {
          reports: { where: { status: 'APPROVED' } }
        }
      }
    }
  });

  if (!band) {
    redirect('/admin/bands');
  }

  // Calculate totals
  let ownerProfit = 0;
  band.owner?.reports?.forEach(r => ownerProfit += (r.profitAmount || 0));

  let totalMembersProfit = 0;
  const membersWithProfit = band.members.map(m => {
    const profit = m.reports.reduce((acc, curr) => acc + (curr.profitAmount || 0), 0);
    totalMembersProfit += profit;
    return { ...m, profit };
  }).sort((a, b) => b.profit - a.profit);

  const totalBandProfit = ownerProfit + totalMembersProfit;
  const totalBalance = band.members.reduce((acc, m) => acc + (m.balance || 0), 0) + (band.owner?.balance || 0);

  // Get applications handled by this band's owner or members
  const allUserIds = [band.ownerId, ...band.members.map(m => m.id)];
  const applications = await prisma.application.findMany({
    where: { recruiterId: { in: allUserIds } },
    orderBy: { createdAt: 'desc' },
    include: { recruiter: true }
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/bands" className="p-2 bg-[#1C1C1E] border border-zinc-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{band.name}</h1>
          <p className="text-slate-400 mt-1">Владелец: {band.owner?.name || 'Без имени'} ({band.owner?.email})</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Участников (Чатеров)</p>
            <p className="text-2xl font-bold text-white">{band.members.length}</p>
          </div>
        </Card>

        <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-xl">
            <Wallet className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Общий Баланс Команды</p>
            <p className="text-2xl font-bold text-amber-400">${totalBalance.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Заработано (Профит)</p>
            <p className="text-2xl font-bold text-emerald-400">${totalBandProfit.toFixed(2)}</p>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Владелец</h2>
        <div className="rounded-xl border border-zinc-800 bg-[#1C1C1E] overflow-hidden p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-lg text-white">{band.owner?.name || 'Без имени'}</p>
              <p className="text-slate-400 text-sm">{band.owner?.email}</p>
              <span className="inline-flex mt-2 items-center px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-[10px] uppercase font-bold">
                Владелец / {band.owner?.role}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Профит владельца</p>
              <p className="text-xl font-bold text-emerald-400">${ownerProfit.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Чатеры команды ({membersWithProfit.length})</h2>
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
                {membersWithProfit.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">В команде пока нет чатеров</td>
                  </tr>
                ) : (
                  membersWithProfit.map(m => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{m.name || 'Без имени'}</td>
                      <td className="px-6 py-4 text-slate-400">{m.email || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-500/10 text-slate-400 border-slate-500/20 uppercase">
                          {m.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400">
                        ${m.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {applications.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Заявки кандидатов команды ({applications.length})</h2>
          <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1E] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-black/20 text-slate-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Кандидат</th>
                    <th className="px-6 py-4 font-semibold">Рекрутер</th>
                    <th className="px-6 py-4 font-semibold">Статус</th>
                    <th className="px-6 py-4 font-semibold text-right">Дата создания</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        {app.name}
                        <div className="text-xs text-slate-500">{app.telegram || app.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{app.recruiter?.name || 'Рекрутер'}</td>
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
