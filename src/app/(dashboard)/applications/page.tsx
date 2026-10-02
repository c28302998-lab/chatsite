import { Search, Filter, ClipboardList, Settings, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AddApplicationDialog } from '@/components/forms/AddApplicationDialog';
import { ApplicationActions } from '@/components/applications/ApplicationActions';
import { InterviewDatePicker } from '@/components/applications/InterviewDatePicker';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);
  let applications: any[] = [];
  
  if (session?.user?.id) {
    if (session.user.role === 'ADMIN') {
      applications = await prisma.application.findMany({
        include: { recruiter: true },
        orderBy: { createdAt: 'desc' }
      });
    } else if (session.user.role === 'PARTNER') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { ownedBand: true }
      });
      applications = await prisma.application.findMany({
        where: {
          OR: [
            { recruiterId: session.user.id },
            { recruiter: { bandId: user?.ownedBand?.id } }
          ]
        },
        include: { recruiter: true },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      applications = await prisma.application.findMany({
        where: {
          recruiterId: session.user.id
        },
        include: { recruiter: true },
        orderBy: { createdAt: 'desc' }
      });
    }
  }

  // Проверяем наличие команды для отображения кнопки "Новая заявка"
  let hasTeam = false;
  if (session?.user?.role === 'ADMIN') {
    hasTeam = true;
  } else if (session?.user?.id) {
    const userWithBand = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });
    if (session.user.role === 'PARTNER' && userWithBand?.ownedBand) {
      hasTeam = true;
    } else if (session.user.role === 'WORKER' && userWithBand?.bandId) {
      hasTeam = true;
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap";
    switch (status) {
      case 'IN_PROGRESS':
        return <span className={`${baseClasses} bg-amber-500/10 text-amber-500 border-amber-500/20`}>В работе</span>;
      case 'INTERVIEW_SCHEDULED':
        return <span className={`${baseClasses} bg-blue-500/10 text-blue-400 border-blue-500/20`}>Собеседование</span>;
      case 'INTERNSHIP':
        return <span className={`${baseClasses} bg-purple-500/10 text-purple-400 border-purple-500/20`}>Стажировка</span>;
      case 'HIRED':
        return <span className={`${baseClasses} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>Нанят</span>;
      case 'REJECTED':
        return <span className={`${baseClasses} bg-red-500/10 text-red-400 border-red-500/20`}>Отказ</span>;
      default:
        return <span className={`${baseClasses} bg-slate-500/10 text-slate-400 border-slate-500/20`}>{status}</span>;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Заявки</h1>
          <p className="text-slate-400 mt-1">Кандидаты и процесс найма.</p>
        </div>
        {hasTeam ? (
          <AddApplicationDialog />
        ) : (
          <div className="text-amber-500 text-sm bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-lg">
            Сначала создайте Команду
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <ClipboardList className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Всего заявок</p>
              <p className="text-2xl font-bold text-white">{applications.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-[#1C1C1E] border-zinc-800 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between mt-6">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Поиск по имени или контактам..." 
            className="w-full bg-black/20 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
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
                <th className="px-6 py-4 font-semibold">Имя</th>
                <th className="px-6 py-4 font-semibold">Telegram</th>
                {(session?.user?.role === 'ADMIN' || session?.user?.role === 'PARTNER') && (
                  <th className="px-6 py-4 font-semibold">Рекрутер</th>
                )}
                <th className="px-6 py-4 font-semibold">Телефон</th>
                <th className="px-6 py-4 font-semibold">Статус</th>
                <th className="px-6 py-4 font-semibold">Дата добавления</th>
                <th className="px-6 py-4 font-semibold text-right">Настройки</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {applications.length === 0 && (
                <tr>
                  <td colSpan={(session?.user?.role === 'ADMIN' || session?.user?.role === 'PARTNER') ? 7 : 6} className="px-6 py-8 text-center text-slate-500">
                    Заявок пока нет
                  </td>
                </tr>
              )}
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-medium text-white">{app.name}</td>
                  <td className="px-6 py-4 text-amber-300">{app.telegram || '-'}</td>
                  {(session?.user?.role === 'ADMIN' || session?.user?.role === 'PARTNER') && (
                    <td className="px-6 py-4">
                      <div className="text-white">{app.recruiter?.name || 'Без имени'}</div>
                      <div className="text-xs text-slate-500">{app.recruiter?.email}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-slate-300">{app.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 items-start">
                      {getStatusBadge(app.status)}
                      {(app.status === 'INTERVIEW_SCHEDULED' || app.status === 'IN_PROGRESS') && (
                        <InterviewDatePicker 
                          applicationId={app.id}
                          date={app.interviewDate}
                          role={session?.user?.role as string}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <ApplicationActions 
                      applicationId={app.id} 
                      status={app.status} 
                      inviteToken={app.inviteToken}
                      generatedEmail={app.generatedEmail}
                      generatedPassword={app.generatedPassword}
                      role={session?.user?.role as string}
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
