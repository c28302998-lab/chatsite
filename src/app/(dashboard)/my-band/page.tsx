import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Building2, Sparkles, Send, Clock, XCircle } from "lucide-react";
import { revalidatePath } from "next/cache";

async function requestBand(formData: FormData) {
  "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;
  
  const bandName = formData.get("bandName") as string;
  const description = formData.get("description") as string;
  
  if (!bandName || !description) return;

  await prisma.bandRequest.create({
    data: {
      userId: session.user.id,
      bandName,
      description
    }
  });
  
  revalidatePath("/my-band");
}

export default async function MyBandPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "PARTNER") {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { ownedBand: true, bandRequests: { orderBy: { createdAt: 'desc' }, take: 1 } }
  });

  if (user?.ownedBand) {
    // Если команда уже есть, редиректим или показываем инфу
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Ваша Команда</h1>
        <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Building2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.ownedBand.name}</h2>
              <p className="text-slate-400">Управляйте командой через раздел "Настройки"</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const lastRequest = user?.bandRequests[0];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold text-white tracking-tight">Создайте свою команду</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Получите возможность нанимать рекрутеров и чатеров, отслеживать их статистику и управлять финансами в одном месте.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#1C1C1E] border-zinc-800 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Преимущества</h2>
          </div>
          <ul className="space-y-4 text-slate-300">
            <li className="flex gap-3">
              <CheckIcon />
              <span>Нанимайте своих сотрудников по реферальным ссылкам</span>
            </li>
            <li className="flex gap-3">
              <CheckIcon />
              <span>Отслеживайте балансы и выплаты в реальном времени</span>
            </li>
            <li className="flex gap-3">
              <CheckIcon />
              <span>Устанавливайте персональные ставки для каждого чатера</span>
            </li>
            <li className="flex gap-3">
              <CheckIcon />
              <span>Подробная статистика профита и эффективности</span>
            </li>
          </ul>
        </Card>

        <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#B9FF66]/10 rounded-lg">
              <Building2 className="w-5 h-5 text-[#B9FF66]" />
            </div>
            <h2 className="text-xl font-bold text-white">Заявка на создание</h2>
          </div>

          {lastRequest?.status === "PENDING" ? (
             <div className="text-center py-8">
               <div className="inline-flex p-3 bg-amber-500/10 rounded-full mb-4">
                 <Clock className="w-8 h-8 text-amber-400" />
               </div>
               <h3 className="text-lg font-bold text-white mb-2">Заявка на рассмотрении</h3>
               <p className="text-slate-400 text-sm">
                 Вы запросили создание команды "{lastRequest.bandName}". Администратор скоро рассмотрит вашу заявку.
               </p>
             </div>
          ) : lastRequest?.status === "REJECTED" ? (
             <div className="text-center py-8">
               <div className="inline-flex p-3 bg-rose-500/10 rounded-full mb-4">
                 <XCircle className="w-8 h-8 text-rose-400" />
               </div>
               <h3 className="text-lg font-bold text-white mb-2">Заявка отклонена</h3>
               <p className="text-slate-400 text-sm mb-6">
                 К сожалению, ваша предыдущая заявка была отклонена. Вы можете подать новую.
               </p>
               <RequestForm />
             </div>
          ) : (
            <RequestForm />
          )}
        </Card>
      </div>
    </div>
  );
}

function RequestForm() {
  return (
    <form action={requestBand} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Желаемое название команды</label>
        <input
          name="bandName"
          required
          placeholder="Например: Alpha Team"
          className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#B9FF66]/50 focus:ring-1 focus:ring-[#B9FF66]/50 transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Как планируете вести команду?</label>
        <textarea
          name="description"
          required
          placeholder="Опишите ваш опыт и планы работы..."
          rows={4}
          className="w-full bg-black/20 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#B9FF66]/50 focus:ring-1 focus:ring-[#B9FF66]/50 transition-all resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-[#B9FF66] hover:bg-[#B9FF66]/90 text-black px-6 py-3 rounded-xl text-sm font-bold transition-all mt-6"
      >
        <Send className="w-4 h-4" />
        Отправить заявку
      </button>
    </form>
  )
}

function CheckIcon() {
  return (
    <div className="mt-0.5 shrink-0">
      <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
        <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  )
}
