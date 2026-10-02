import { Search, Filter, Activity, TrendingUp, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AddReportDialog } from '@/components/forms/AddReportDialog';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReportActions } from '@/components/reports/ReportActions';

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  let reports: any[] = [];
  let chatters: { id: string, name: string | null }[] = [];
  let currentUser = null;
  
  if (session?.user?.id) {
    currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });
    
    if (!currentUser) return null;

    let bandId = null;
    let isChatter = currentUser?.role === 'CHATTER';

    if (currentUser?.role === 'PARTNER' && currentUser.ownedBand) {
      bandId = currentUser.ownedBand.id;
    } else if (currentUser?.role === 'WORKER') {
      bandId = currentUser.bandId;
    } else if (isChatter) {
      bandId = currentUser.bandId;
    }

    if (currentUser?.role === 'ADMIN') {
      reports = await prisma.report.findMany({
        include: { chatter: { include: { invitedBy: true, band: { include: { owner: true } } } } },
        orderBy: { createdAt: 'desc' }
      });
    } else if (bandId) {
      if (isChatter) {
        // Chatters only see their own reports
        reports = await prisma.report.findMany({
          where: { chatterId: session.user.id },
          include: { chatter: { include: { invitedBy: true, band: { include: { owner: true } } } } },
          orderBy: { createdAt: 'desc' }
        });
      } else {
        // Partners/Workers see all reports in their band
        reports = await prisma.report.findMany({
          where: { chatter: { bandId } },
          include: { chatter: { include: { invitedBy: true, band: { include: { owner: true } } } } },
          orderBy: { createdAt: 'desc' }
        });
      }
    }

    // Only fetch chatters for dropdown if user is a Chatter (to select themselves) or if we want to filter
    if (currentUser?.role === 'ADMIN') {
      chatters = await prisma.user.findMany({
        where: { role: 'CHATTER' },
        select: { id: true, name: true }
      });
    } else if (bandId) {
      if (isChatter) {
        chatters = [{ id: currentUser.id, name: currentUser.name }];
      } else {
        chatters = await prisma.user.findMany({
          where: { bandId, role: 'CHATTER' },
          select: { id: true, name: true }
        });
      }
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Отчеты по сменам</h1>
          <p className="text-slate-400 mt-1">Трекинг рабочих смен и профита чатеров.</p>
        </div>
        {currentUser?.role === 'CHATTER' && <AddReportDialog chatters={chatters} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Общий профит (за все время)</p>
              <p className="text-2xl font-bold text-white">
                ${reports.reduce((acc, curr) => acc + curr.profitAmount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-[#1C1C1E] border-zinc-800 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between mt-6">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Поиск по чатеру..." 
            className="w-full bg-black/20 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-black/20 border border-zinc-800 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors w-full sm:w-auto">
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
        </div>
      </Card>

      <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1E] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-black/20 text-slate-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Чатер</th>
                <th className="px-6 py-4 font-semibold">Начало смены</th>
                <th className="px-6 py-4 font-semibold">Конец смены</th>
                {currentUser?.role === 'ADMIN' && (
                  <>
                    <th className="px-6 py-4 font-semibold">Скриншот</th>
                    <th className="px-6 py-4 font-semibold">Доступы</th>
                  </>
                )}
                <th className="px-6 py-4 font-semibold text-right">Профит</th>
                <th className="px-6 py-4 font-semibold">Выплаты</th>
                <th className="px-6 py-4 font-semibold text-right">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {reports.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Отчетов пока нет
                  </td>
                </tr>
              )}
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-medium text-white">
                    {report.chatter?.name || 'Без имени'}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {new Date(report.shiftStart).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {new Date(report.shiftEnd).toLocaleString()}
                  </td>
                  {currentUser?.role === 'ADMIN' && (
                    <>
                      <td className="px-6 py-4">
                        {report.screenshot ? (
                          <a href={report.screenshot} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline text-xs">
                            Скриншот
                          </a>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {report.accountAccess ? (
                          <div className="text-xs bg-black/30 p-2 rounded max-w-[150px] truncate" title={report.accountAccess}>
                            {report.accountAccess}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 font-medium text-emerald-400 text-right">
                    ${report.profitAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {report.status === 'APPROVED' ? (
                      <div className="flex flex-col gap-1 text-xs">
                        {report.chatterAmount != null && <span className="text-emerald-400">Чатер: ${report.chatterAmount.toFixed(2)}</span>}
                        {report.recruiterAmount != null && <span className="text-indigo-400">Рекрутер: ${report.recruiterAmount.toFixed(2)}</span>}
                        {report.ownerAmount != null && <span className="text-amber-400">Владелец: ${report.ownerAmount.toFixed(2)}</span>}
                        {report.adminAmount != null && <span className="text-purple-400">Платформа: ${report.adminAmount.toFixed(2)}</span>}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">Не рассчитано</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ReportActions 
                      reportId={report.id} 
                      status={report.status} 
                      userRole={currentUser?.role || ''} 
                      profitAmount={report.profitAmount}
                      chatterName={report.chatter?.name || 'Без имени'}
                      recruiterName={report.chatter?.invitedBy?.name || ''}
                      ownerName={report.chatter?.band?.owner?.name || ''}
                    />
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
