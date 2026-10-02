import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import ReportForm from '@/components/ReportForm';
import { ChatterBonusesWidget } from '@/components/bonuses/ChatterBonusesWidget';

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  let totalProfit = 0;
  let activeChatters = 0;
  let shiftsToday = 0;
  let conversionRate = 0;
  let recentReports: any[] = [];
  let userBonuses: any[] = [];
  let isChatter = false;
  let currentUser: any = null;

  if (session?.user?.id) {
    currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });

    let bandId = null;
    isChatter = currentUser?.role === 'CHATTER';
    
    if (currentUser?.role === 'ADMIN' && currentUser.ownedBand) {
      bandId = currentUser.ownedBand.id;
    } else if (currentUser?.role === 'PARTNER') {
      bandId = currentUser.ownedBand?.id || currentUser.bandId;
    } else if (currentUser?.role === 'WORKER') {
      bandId = currentUser.bandId;
    } else if (isChatter) {
      bandId = currentUser.bandId;
    }

    if (bandId) {
      // Chatters
      activeChatters = await prisma.user.count({
        where: { bandId, role: 'CHATTER' }
      });

      // Reports/Profit
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const bandReportsQuery = isChatter ? { chatterId: session.user.id } : { chatter: { bandId } };

      const allReports = await prisma.report.findMany({
        where: {
          ...bandReportsQuery,
          status: 'APPROVED',
          createdAt: { gte: startOfMonth }
        }
      });
      totalProfit = allReports.reduce((acc, curr) => acc + curr.profitAmount, 0);

      shiftsToday = await prisma.report.count({
        where: {
          ...bandReportsQuery,
          createdAt: { gte: startOfDay }
        }
      });

      // Conversion
      const allApps = await prisma.application.count({
        where: { recruiter: { bandId } }
      });
      const hiredApps = await prisma.application.count({
        where: { recruiter: { bandId }, status: 'HIRED' }
      });
      conversionRate = allApps > 0 ? (hiredApps / allApps) * 100 : 0;

      // Recent reports
      recentReports = await prisma.report.findMany({
        where: bandReportsQuery,
        include: { chatter: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
    }

    userBonuses = await prisma.bonusRate.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  if (isChatter) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Панель Чатера</h1>
            <p className="text-slate-400 mt-1">Отправляйте отчеты по сменам и следите за вашим балансом.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#B9FF66]/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#B9FF66]" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Ваш текущий баланс</p>
                <p className="text-4xl font-bold text-white mt-1">
                  ${currentUser?.balance?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-sm text-slate-400 leading-relaxed">
                Заработанные средства после одобрения отчетов начисляются сюда.
              </p>
            </div>
          </Card>
          
          <ChatterBonusesWidget bonuses={userBonuses} />
        </div>

        <ReportForm />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Дашборд</h1>
          <p className="text-slate-400 mt-1">Добро пожаловать в Lunery Recruitment. Обзор за сегодня.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Заработано (за месяц)"
          value={`$${totalProfit.toFixed(2)}`}
          icon={DollarSign}
          trend=""
          trendColor="text-emerald-400"
        />
        <StatsCard
          title="Активные Чатеры"
          value={activeChatters.toString()}
          icon={Users}
          trend=""
          trendColor="text-indigo-400"
        />
        <StatsCard
          title="Смен сегодня"
          value={shiftsToday.toString()}
          icon={Activity}
          trend=""
          trendColor="text-slate-400"
        />
        <StatsCard
          title="Конверсия (Заявки)"
          value={`${conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          trend=""
          trendColor="text-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className={`lg:col-span-${userBonuses.length > 0 ? '2' : '3'} rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden`}>
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Последние отчеты чатеров</h2>
            <Link href="/reports" className="text-sm px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-colors">
              Смотреть все
            </Link>
          </div>
          <div className="p-0">
            {recentReports.length > 0 ? (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-black/20 text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Чатер</th>
                    <th className="px-6 py-4 font-semibold">Дата</th>
                    <th className="px-6 py-4 font-semibold text-right">Профит</th>
                    <th className="px-6 py-4 font-semibold text-right">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentReports.map(report => (
                    <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-medium text-white">{report.chatter?.name}</td>
                      <td className="px-6 py-4 text-slate-300">{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium text-emerald-400 text-right">${report.profitAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold border ${report.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : report.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 flex items-center justify-center text-slate-500 h-64">
                Таблица отчетов появится здесь после настройки базы данных.
              </div>
            )}
          </div>
        </div>
        
        {userBonuses.length > 0 && (
          <div className="lg:col-span-1">
            <ChatterBonusesWidget bonuses={userBonuses} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, trendColor }: any) {
  return (
    <Card className="bg-white/5 border-white/10 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
          <Icon className="w-4 h-4 text-indigo-400" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold text-white">{value}</div>
        <p className={`text-xs mt-1 ${trendColor}`}>
          {trend} с прошлой недели
        </p>
      </CardContent>
    </Card>
  );
}
