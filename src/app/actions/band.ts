"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createBand(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PARTNER") {
      throw new Error("Нет доступа");
    }

    const name = formData.get("name") as string;
    if (!name) {
      throw new Error("Имя команды обязательно");
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });

    if (!currentUser) {
      throw new Error("Пользователь не найден. Пожалуйста, перезайдите в аккаунт.");
    }

    if (currentUser.ownedBand) {
      throw new Error("У вас уже есть команда");
    }

    const newBand = await prisma.band.create({
      data: {
        name,
        ownerId: session.user.id,
      },
    });

    revalidatePath("/workers");
    revalidatePath("/applications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
