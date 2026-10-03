import { Search, Filter, MessageSquare, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReferralLink } from '@/components/ReferralLink';
import { ChatterActions } from '@/components/ChatterActions';

export default async function ChattersPage() {
  const session = await getServerSession(authOptions);
  let chatters: any[] = [];
  let currentUserId = null;
  let bandId = null;
  
  if (session?.user?.id) {
    currentUserId = session.user.id;
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });

    let isOwner = false;

    if (currentUser?.role === 'ADMIN') {
      // Админ видит ВСЕХ чатеров
      chatters = await prisma.user.findMany({
        where: { role: 'CHATTER' },
        include: { invitedBy: true },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      if (currentUser?.role === 'PARTNER' && currentUser.ownedBand) {
        bandId = currentUser.ownedBand.id;
        isOwner = true;
      } else if (currentUser?.role === 'PARTNER' && currentUser.bandId) {
        bandId = currentUser.bandId;
        isOwner = false;
      } else if (currentUser?.role === 'WORKER') {
        bandId = currentUser.bandId;
        isOwner = false;
      }

      if (bandId) {
        const whereClause: any = {
          bandId,
          role: 'CHATTER'
        };

        if (!isOwner) {
          whereClause.invitedById = currentUserId;
        }

        chatters = await prisma.user.findMany({
          where: whereClause,
          include: { invitedBy: true },
          orderBy: { createdAt: 'desc' }
        });
      } else {
        // Одиночки видят только своих приглашенных чатеров
        chatters = await prisma.user.findMany({
          where: { invitedById: currentUserId, role: 'CHATTER' },
          include: { invitedBy: true },
          orderBy: { createdAt: 'desc' }
        });
      }
    }
  }

  let chattersWithApps = chatters;

  if (chatters.length > 0) {
    const apps = await prisma.application.findMany({
      where: { userId: { in: chatters.map(c => c.id) } },
      select: { userId: true, generatedEmail: true, generatedPassword: true }
    });
    chattersWithApps = chatters.map(chatter => {
      const app = apps.find(a => a.userId === chatter.id);
      return {
        ...chatter,
        generatedPassword: app?.generatedPassword || null,
        generatedEmail: app?.generatedEmail || chatter.email
      };
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Чатеры</h1>
          <p className="text-slate-400 mt-1">Управление чатерами вашей банды.</p>
        </div>
        {currentUserId && (
          <ReferralLink userId={currentUserId} bandId={bandId} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-500/20 rounded-xl">
              <MessageSquare className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Всего чатеров</p>
              <p className="text-2xl font-bold text-white">{chatters.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-[#1C1C1E] border-zinc-800 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between mt-6">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Поиск по имени или Email..." 
            className="w-full bg-black/20 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-black/20 border border-zinc-800 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors w-full sm:w-auto">
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chattersWithApps.length === 0 && (
          <div className="col-span-full text-center text-slate-500 py-10">
            Чатеров пока нет
          </div>
        )}
        {chattersWithApps.map((chatter) => (
          <Card key={chatter.id} className="bg-[#1C1C1E] border-zinc-800 p-6 flex flex-col justify-between group hover:border-pink-500/30 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{chatter.name || 'Без имени'}</h3>
                  <p className="text-sm text-zinc-400">{chatter.email}</p>
                </div>
                <button className="text-slate-500 hover:text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-start text-sm">
                  <span className="text-slate-500">Рекрутер</span>
                  <div className="text-right">
                    <div className="text-slate-300">{chatter.invitedBy?.name || 'Неизвестно'}</div>
                    <div className="text-slate-500 text-xs">{chatter.invitedBy?.email}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800 gap-2 flex-wrap">
              <ChatterActions 
                chatterId={chatter.id} 
                status={chatter.status} 
                generatedEmail={chatter.generatedEmail}
                generatedPassword={chatter.generatedPassword}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
