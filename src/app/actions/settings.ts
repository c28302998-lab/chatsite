"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function changePassword(oldPass: string, newPass: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Не авторизован");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      throw new Error("Пользователь не найден");
    }
    if (!user.password) {
      throw new Error("У пользователя нет пароля");
    }

    const isValid = await bcrypt.compare(oldPass, user.password);
    if (!isValid) {
      throw new Error("Неверный старый пароль");
    }

    const hashed = await bcrypt.hash(newPass, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error changing password:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProfile(data: { name: string; email: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Не авторизован");
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    
    // Проверка, не занят ли email
    if (data.email !== user?.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });
      if (existingUser) {
        throw new Error("Этот Email уже используется другим пользователем");
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        email: data.email,
      }
    });

    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBandName(newName: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Не авторизован");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });

    if (!user?.ownedBand) {
      throw new Error("У вас нет команды");
    }

    await prisma.band.update({
      where: { id: user.ownedBand.id },
      data: { name: newName }
    });

    revalidatePath("/settings");
    revalidatePath("/workers");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating band name:", error);
    return { success: false, error: error.message };
  }
}
