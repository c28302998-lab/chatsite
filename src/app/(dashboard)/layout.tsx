import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardWrapper } from "@/components/layout/DashboardWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  let hasOwnedBand = false;
  let hasBandId = false;
  let role = 'PARTNER';

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });
    if (user) {
      hasOwnedBand = !!user.ownedBand;
      hasBandId = !!user.bandId;
      role = user.role;
    }
  }

  return (
    <DashboardWrapper sidebar={<Sidebar hasOwnedBand={hasOwnedBand} hasBandId={hasBandId} role={role} />}>
      {children}
    </DashboardWrapper>
  );
}
