import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Users, CheckCircle2, XCircle } from "lucide-react";
import { revalidatePath } from "next/cache";

async function approveUser(formData: FormData) {
  "use server";
  const id = formData.get("userId") as string;
  if (!id) return;
  await prisma.user.update({
    where: { id },
    data: { status: "ACTIVE" }
  });
  revalidatePath("/admin/users");
}

async function rejectUser(formData: FormData) {
  "use server";
  const id = formData.get("userId") as string;
  if (!id) return;
  await prisma.user.update({
    where: { id },
    data: { status: "REJECTED" }
  });
  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const pendingUsers = await prisma.user.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" }
  });

  const activeUsersCount = await prisma.user.count({
    where: { status: "ACTIVE" }
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Пользователи</h1>
          <p className="text-slate-400 mt-1">Одобрение новых регистраций</p>
        </div>
        <div className="bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-xl text-sm font-medium border border-indigo-500/20">
          Активных пользователей: {activeUsersCount}
        </div>
      </div>

      <Card className="bg-[#1C1C1E] border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Ожидают подтверждения ({pendingUsers.length})</h2>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="text-center py-12 bg-black/20 rounded-xl border border-zinc-800 border-dashed">
            <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">Нет новых заявок</h3>
            <p className="text-slate-500">Все зарегистрированные пользователи уже обработаны.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-black/20 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Имя / Email</th>
                  <th className="px-4 py-3 font-medium">Роль</th>
                  <th className="px-4 py-3 font-medium">Дата регистрации</th>
                  <th className="px-4 py-3 font-medium text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{user.name || "Без имени"}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded-md text-[10px] uppercase font-bold bg-zinc-800 text-zinc-300">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <form action={approveUser}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button
                            type="submit"
                            title="Одобрить"
                            className="p-2 hover:bg-emerald-500/10 text-emerald-500/50 hover:text-emerald-400 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        </form>
                        <form action={rejectUser}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button
                            type="submit"
                            title="Отклонить"
                            className="p-2 hover:bg-rose-500/10 text-rose-500/50 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
