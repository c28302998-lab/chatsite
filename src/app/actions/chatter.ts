"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function addChatter(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "PARTNER" && session.user.role !== "WORKER")) {
      throw new Error("Нет доступа");
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      throw new Error("Заполните все поля");
    }

    // Находим банду текущего пользователя
    let bandId: string | null = null;
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true },
    });

    if (currentUser?.role === "PARTNER" && currentUser.ownedBand) {
      bandId = currentUser.ownedBand.id;
    } else if (currentUser?.role === "WORKER" && currentUser.bandId) {
      bandId = currentUser.bandId;
    }

    if (!bandId) {
      throw new Error("Банда не найдена");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("Email уже используется");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CHATTER",
        bandId,
        invitedById: session.user.id,
      },
    });

    revalidatePath("/chatters");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveChatter(chatterId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Не авторизован");
    }

    const chatter = await prisma.user.findUnique({
      where: { id: chatterId },
      include: { band: true }
    });

    if (!chatter) throw new Error("Чатер не найден");

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });

    if (currentUser?.role !== "ADMIN" && chatter.bandId !== currentUser?.ownedBand?.id) {
      throw new Error("Нет прав");
    }

    await prisma.user.update({
      where: { id: chatterId },
      data: { status: 'ACTIVE' }
    });

    revalidatePath("/chatters");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteChatter(chatterId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Не авторизован");
    }

    const chatter = await prisma.user.findUnique({
      where: { id: chatterId },
      include: { band: true }
    });

    if (!chatter) throw new Error("Чатер не найден");

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });

    if (currentUser?.role !== "ADMIN" && chatter.bandId !== currentUser?.ownedBand?.id) {
      throw new Error("Нет прав");
    }

    await prisma.user.delete({
      where: { id: chatterId }
    });

    revalidatePath("/chatters");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
