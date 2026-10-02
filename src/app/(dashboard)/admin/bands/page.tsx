import { Users, Shield, PlusCircle, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function approveBandRequest(formData: FormData) {
  "use server";
  const id = formData.get("requestId") as string;
  if (!id) return;

  const request = await prisma.bandRequest.findUnique({ where: { id } });
  if (!request) return;

  // Create band and update request
  await prisma.$transaction([
    prisma.band.create({
      data: {
        name: request.bandName,
        ownerId: request.userId,
      }
    }),
    prisma.bandRequest.update({
      where: { id },
      data: { status: "APPROVED" }
    })
  ]);
  revalidatePath("/admin/bands");
}

async function rejectBandRequest(formData: FormData) {
  "use server";
  const id = formData.get("requestId") as string;
  if (!id) return;

  await prisma.bandRequest.update({
    where: { id },
    data: { status: "REJECTED" }
  });
  revalidatePath("/admin/bands");
}

export default async function AdminBandsPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const bands = await prisma.band.findMany({
    include: {
      owner: {
        include: {
          reports: { where: { status: 'APPROVED' } }
        }
      },
      members: {
        select: {
          id: true,
          role: true,
          balance: true,
          reports: { where: { status: 'APPROVED' } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const soloPartners = await prisma.user.findMany({
    where: { role: 'PARTNER', ownedBand: null, bandId: null },
    include: {
      reports: { where: { status: 'APPROVED' } },
      invitees: {
        select: {
          id: true,
          role: true,
          reports: { where: { status: 'APPROVED' } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const pendingRequests = await prisma.bandRequest.findMany({
    where: { status: 'PENDING' },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate total platform profit
  let totalPlatformProfit = 0;
  
  const bandStats = bands.map(band => {
    let bandProfit = 0;
    // Owner's reports (if any, though usually chatters submit reports)
    band.owner?.reports.forEach(r => bandProfit += (r.profitAmount || 0));
    // Members' reports
    band.members.forEach(m => {
      m.reports.forEach(r => bandProfit += (r.profitAmount || 0));
    });
    totalPlatformProfit += bandProfit;
    return { ...band, bandProfit };
  });

  const soloStats = soloPartners.map(partner => {
    let soloProfit = 0;
    partner.reports.forEach(r => soloProfit += (r.profitAmount || 0));
    partner.invitees.forEach(m => {
      m.reports.forEach(r => soloProfit += (r.profitAmount || 0));
    });
    totalPlatformProfit += soloProfit;
    return { ...partner, soloProfit };
  });


  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Команды и Одиночки</h1>
          <p className="text-slate-400 mt-1">Управление составами и запросами на создание банд.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Всего банд</p>
            <p className="text-2xl font-bold text-white">{bands.length}</p>
          </div>
        </Card>
        
        <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <Users className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Одиночек</p>
            <p className="text-2xl font-bold text-white">{soloPartners.length}</p>
          </div>
        </Card>

        <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-xl">
            <PlusCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Запросы</p>
            <p className="text-2xl font-bold text-white">{pendingRequests.length}</p>
          </div>
        </Card>

        <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Общий Профит</p>
            <p className="text-2xl font-bold text-emerald-400">${totalPlatformProfit.toFixed(2)}</p>
          </div>
        </Card>
      </div>

      {pendingRequests.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Новые заявки на создание команд</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingRequests.map(req => (
              <Card key={req.id} className="bg-[#1C1C1E] border-zinc-800 p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-[#B9FF66]">{req.bandName}</h3>
                    <p className="text-sm text-slate-400">От: {req.user.name} ({req.user.email})</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={approveBandRequest}>
                      <input type="hidden" name="requestId" value={req.id} />
                      <button type="submit" title="Одобрить и создать" className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors">
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    </form>
                    <form action={rejectBandRequest}>
                      <input type="hidden" name="requestId" value={req.id} />
                      <button type="submit" title="Отклонить" className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg text-sm text-slate-300 border border-zinc-800">
                  {req.description}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1E] overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-black/20 text-slate-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Название / Имя</th>
                <th className="px-6 py-4 font-semibold">Владелец</th>
                <th className="px-6 py-4 font-semibold text-center">Участников</th>
                <th className="px-6 py-4 font-semibold text-right">Текущие балансы</th>
                <th className="px-6 py-4 font-semibold text-right">Заработано (Профит)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {bandStats.length === 0 && soloStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Пока нет банд и одиночек
                  </td>
                </tr>
              )}
              {/* Команды */}
              {bandStats.map((band) => {
                const total = band.members.length;
                const totalBalance = band.members.reduce((acc, curr) => acc + (curr.balance || 0), 0) + (band.owner?.balance || 0);

                return (
                  <tr key={band.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      <span className="inline-flex items-center px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-[10px] uppercase font-bold mr-2">
                        BAND
                      </span>
                      {band.name}
                    </td>
                    <td className="px-6 py-4">
                      {band.owner?.name || 'Без имени'}
                      <div className="text-xs text-slate-500">{band.owner?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-blue-400">
                      {total}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-amber-400">
                      ${totalBalance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-400">
                      ${band.bandProfit.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              
              {/* Одиночные рекрутеры */}
              {soloStats.map((partner) => {
                const total = partner.invitees.length;
                const totalBalance = partner.balance || 0; // Solo balance

                return (
                  <tr key={partner.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-300">
                      <span className="inline-flex items-center px-2 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-md text-[10px] uppercase font-bold mr-2">
                        SOLO
                      </span>
                      {partner.name || 'Одиночный админ'}
                    </td>
                    <td className="px-6 py-4">
                      {partner.name || 'Без имени'}
                      <div className="text-xs text-slate-500">{partner.email}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-500">{total}</td>
                    <td className="px-6 py-4 text-right font-medium text-amber-400">
                      ${totalBalance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-400">
                      ${partner.soloProfit.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Статистика по пользователям (Заработано)</h2>
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
                {(() => {
                  const allUsersStats = [];
                  bands.forEach(b => {
                    if (b.owner) {
                      const profit = b.owner.reports.reduce((sum, r) => sum + (r.profitAmount || 0), 0);
                      allUsersStats.push({ id: b.owner.id, name: b.owner.name, email: b.owner.email, role: b.owner.role, profit });
                    }
                    b.members.forEach(m => {
                      const profit = m.reports.reduce((sum, r) => sum + (r.profitAmount || 0), 0);
                      allUsersStats.push({ id: m.id, name: m.role, email: '-', role: m.role, profit }); // Assuming we don't fetch name/email in members query currently
                    });
                  });
                  soloPartners.forEach(p => {
                    const profit = p.reports.reduce((sum, r) => sum + (r.profitAmount || 0), 0);
                    allUsersStats.push({ id: p.id, name: p.name, email: p.email, role: p.role, profit });
                    p.invitees.forEach(i => {
                      const profit = i.reports.reduce((sum, r) => sum + (r.profitAmount || 0), 0);
                      allUsersStats.push({ id: i.id, name: i.role, email: '-', role: i.role, profit }); // Assuming we don't fetch name/email
                    });
                  });

                  // Sort by profit descending
                  allUsersStats.sort((a, b) => b.profit - a.profit);

                  return allUsersStats.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{u.name || 'Без имени'}</td>
                      <td className="px-6 py-4 text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-500/10 text-slate-400 border-slate-500/20 uppercase">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400">
                        ${u.profit.toFixed(2)}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
