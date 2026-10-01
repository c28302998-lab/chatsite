import { Search, Filter, Users, Settings, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AddWorkerDialog } from '@/components/forms/AddWorkerDialog';
import { CreateBandForm } from '@/components/forms/CreateBandForm';
import { ReferralLink } from '@/components/ReferralLink';
import { WorkerActions } from '@/components/WorkerActions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function WorkersPage() {
  const session = await getServerSession(authOptions);
  let workers: any[] = [];
  let owner = null;
  
  if (session?.user?.id) {
    owner = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        ownedBand: true, 
        band: {
          include: {
            owner: true
          }
        },
        invitees: true 
      }
    });

    if (owner?.role === 'ADMIN') {
      workers = await prisma.user.findMany({
        where: {
          role: 'PARTNER',
          NOT: { id: owner.id }
        },
        include: {
          invitees: true,
          band: true,
          ownedBand: true
        }
      });
    } else if (owner?.ownedBand) {
      workers = await prisma.user.findMany({
        where: {
          bandId: owner.ownedBand.id,
          role: 'PARTNER',
          NOT: {
            id: owner.id
          }
        },
        include: {
          invitees: true 
        }
      });
    }
  }

  // Если это саб-рекрутер, он просто видит информацию о команде
  if (owner && !owner.ownedBand && owner.bandId && owner.band) {
    const chattersCount = owner.invitees?.length || 0;
    
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Команда: {owner.band.name}</h1>
          <p className="text-slate-400 mt-1">Информация о вашей команде и ваша статистика.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Владелец команды</p>
                <p className="text-xl font-bold text-white">{owner.band.owner?.name || 'Неизвестно'}</p>
                <p className="text-xs text-slate-500 mt-1">{owner.band.owner?.email}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-sm text-slate-400 leading-relaxed">
                В качестве саб-рекрутера вы можете добавлять своих чатеров в эту команду во вкладке <span className="text-indigo-400 font-medium">Чатеры</span>. Вы привязаны к этой банде и все ваши действия идут в ее зачет.
              </p>
            </div>
          </Card>

          <Card className="bg-[#1C1C1E] border-zinc-800 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#B9FF66]/20 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-[#B9FF66]" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Ваша эффективность</p>
                <p className="text-3xl font-bold text-white mt-1">{chattersCount}</p>
                <p className="text-sm text-slate-500 mt-1">приведенных чатеров</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Если это Партнер и у него нет команды, показываем форму создания
  if (session?.user?.role === 'PARTNER' && (!owner || (!owner.ownedBand && !owner.bandId))) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <CreateBandForm />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {owner?.role === 'ADMIN' ? 'Все рекрутеры' : `Команда: ${owner?.ownedBand?.name || 'Моя Команда'}`}
          </h1>
          <p className="text-slate-400 mt-1">
            {owner?.role === 'ADMIN' ? 'Управление всеми рекрутерами в системе.' : 'Управление вашей командой рекрутеров.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {session?.user?.id && owner?.ownedBand && (
             <ReferralLink userId={session.user.id} bandId={owner.ownedBand.id} role="PARTNER" text="Пригласить рекрутера" />
          )}
          {owner?.role !== 'ADMIN' && <AddWorkerDialog />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {owner?.ownedBand && (
          <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Создатель команды</p>
                <p className="text-xl font-bold text-white truncate">{owner.name || 'Вы'}</p>
                <p className="text-xs text-slate-500 mt-1">{owner.email}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#B9FF66]/20 rounded-xl">
              <Users className="w-6 h-6 text-[#B9FF66]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Всего саб-рекрутеров</p>
              <p className="text-3xl font-bold text-white">{workers.length}</p>
            </div>
          </div>
        </Card>

        {owner?.ownedBand && (
          <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <UserPlus className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Мои чатеры</p>
                <p className="text-3xl font-bold text-white">{owner.invitees?.length || 0}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card className="bg-[#1C1C1E] border-zinc-800 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between mt-6">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Поиск по имени или Email..." 
            className="w-full bg-black/20 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B9FF66]/50 focus:ring-1 focus:ring-[#B9FF66]/50 transition-all"
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
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Роль</th>
                <th className="px-6 py-4 font-semibold">Команда</th>
                <th className="px-6 py-4 font-semibold">Привел чатеров</th>
                <th className="px-6 py-4 font-semibold text-right">Настройки</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {workers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Работников пока нет
                  </td>
                </tr>
              )}
              {workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-medium text-white">{worker.name || 'Без имени'}</td>
                  <td className="px-6 py-4 text-zinc-400">{worker.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-[#B9FF66]/10 text-[#B9FF66] border-[#B9FF66]/20">
                      {worker.ownedBand ? 'Владелец' : 'Саб-рекрутер'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    {worker.ownedBand?.name || worker.band?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{worker.invitees?.length || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <WorkerActions workerId={worker.id} />
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
