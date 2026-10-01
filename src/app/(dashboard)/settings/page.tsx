import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SettingsForm } from "@/components/forms/SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null; // Or redirect
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { ownedBand: true }
  });

  const hasTeam = !!currentUser?.ownedBand;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Настройки</h1>
        <p className="text-slate-400 mt-1">Управление профилем и параметрами системы.</p>
      </div>

      <SettingsForm user={currentUser} hasTeam={hasTeam} />
    </div>
  );
}
