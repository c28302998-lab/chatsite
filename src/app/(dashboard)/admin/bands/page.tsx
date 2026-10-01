import { Users, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminBandsPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const bands = await prisma.band.findMany({
    include: {
      owner: true,
      members: {
        select: {
          id: true,
          role: true,
          balance: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const soloPartners = await prisma.user.findMany({
    where: { role: 'PARTNER', ownedBand: null, bandId: null },
    include: {
      invitees: {
        select: {
          id: true,
          role: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Составы</h1>
        <p className="text-slate-400 mt-1">Глобальная статистика по всем командам и одиночным рекрутерам.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <p className="text-sm font-medium text-slate-400">Одиночных рекрутеров</p>
            <p className="text-2xl font-bold text-white">{soloPartners.length}</p>
          </div>
        </Card>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1E] overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-black/20 text-slate-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Название / Имя</th>
                <th className="px-6 py-4 font-semibold">Владелец</th>
                <th className="px-6 py-4 font-semibold text-center">Рекрутеров</th>
                <th className="px-6 py-4 font-semibold text-center">Чатеров</th>
                <th className="px-6 py-4 font-semibold text-center">Всего участников</th>
                <th className="px-6 py-4 font-semibold text-right">Баланс</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {bands.length === 0 && soloPartners.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Пока нет созданных банд
                  </td>
                </tr>
              )}
              {bands.map((band) => {
                const recruiters = band.members.filter(m => m.role === 'WORKER').length;
                const chatters = band.members.filter(m => m.role === 'CHATTER').length;
                const total = band.members.length;
                const totalBalance = band.members.reduce((acc, curr) => acc + (curr.balance || 0), 0) + (band.owner?.balance || 0);

                return (
                  <tr key={band.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {band.name}
                    </td>
                    <td className="px-6 py-4">
                      {band.owner?.name || 'Без имени'}
                      <div className="text-xs text-slate-500">{band.owner?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-blue-400">
                      {recruiters}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-emerald-400">
                      {chatters}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-purple-400">
                      {total}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-400">
                      ${totalBalance.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              
              {/* Одиночные рекрутеры */}
              {soloPartners.map((partner) => {
                const chatters = partner.invitees.filter(m => m.role === 'CHATTER').length;
                const total = 1 + chatters;

                return (
                  <tr key={partner.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-300">
                      Одиночный рекрутер
                    </td>
                    <td className="px-6 py-4">
                      {partner.name || 'Без имени'}
                      <div className="text-xs text-slate-500">{partner.email}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-500">—</td>
                    <td className="px-6 py-4 text-center font-medium text-emerald-400">{chatters}</td>
                    <td className="px-6 py-4 text-center font-medium text-purple-400">{total}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-400">
                      ${(partner.balance || 0).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
