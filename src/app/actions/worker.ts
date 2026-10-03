"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function deleteWorker(workerId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: workerId }
    });

    if (!targetUser) return { success: false, error: "Not found" };

    if (currentUser?.role !== "ADMIN" && targetUser.bandId !== currentUser?.ownedBand?.id) {
      return { success: false, error: "Not authorized" };
    }

    await prisma.$transaction([
      prisma.report.deleteMany({ where: { chatterId: workerId } }),
      prisma.bonusRate.deleteMany({ where: { userId: workerId } }),
      prisma.chatMessage.deleteMany({ where: { OR: [{ senderId: workerId }, { receiverId: workerId }] } }),
      prisma.application.deleteMany({ where: { recruiterId: workerId } }),
      prisma.user.updateMany({ where: { invitedById: workerId }, data: { invitedById: null } }),
      prisma.bandRequest.deleteMany({ where: { userId: workerId } }),
      prisma.user.delete({ where: { id: workerId } })
    ]);

    revalidatePath("/workers");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function addWorker(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !name) {
      return { success: false, error: "Заполните все поля" };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "Email уже используется" };
    }

    const hashed = await bcrypt.hash(password, 10);

    const bandId = currentUser?.ownedBand?.id || currentUser?.bandId;
    if (!bandId && currentUser?.role !== "ADMIN") {
      return { success: false, error: "У вас нет команды" };
    }

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "PARTNER", 
        bandId,
        invitedById: currentUser?.id,
        status: "ACTIVE"
      }
    });

    revalidatePath("/workers");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding worker:", error);
    return { success: false, error: error.message };
  }
}
