"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addReport(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Нет доступа");
    }

    const chatterId = formData.get("chatterId") as string;
    const shiftStartStr = formData.get("shiftStart") as string;
    const shiftEndStr = formData.get("shiftEnd") as string;
    const profitAmountStr = formData.get("profitAmount") as string;

    if (!chatterId || !shiftStartStr || !shiftEndStr || !profitAmountStr) {
      throw new Error("Заполните все поля");
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });

    const targetChatter = await prisma.user.findUnique({
      where: { id: chatterId }
    });

    if (!targetChatter) {
      throw new Error("Чатер не найден");
    }

    if (
      currentUser?.role !== "ADMIN" &&
      targetChatter.bandId !== currentUser?.ownedBand?.id &&
      targetChatter.bandId !== currentUser?.bandId
    ) {
      throw new Error("У вас нет прав добавлять отчет для этого чатера");
    }

    const shiftStart = new Date(shiftStartStr);
    const shiftEnd = new Date(shiftEndStr);
    const profitAmount = parseFloat(profitAmountStr);

    if (isNaN(profitAmount)) {
      throw new Error("Сумма профита должна быть числом");
    }

    await prisma.report.create({
      data: {
        chatterId,
        shiftStart,
        shiftEnd,
        profitAmount,
      },
    });

    revalidatePath("/reports");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitReport(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      throw new Error("Нет доступа");
    }

    const shiftStartStr = formData.get("shiftStart") as string;
    const shiftEndStr = formData.get("shiftEnd") as string;
    const profitAmountStr = formData.get("profitAmount") as string;
    const screenshot = formData.get("screenshot") as string;
    const accountAccess = formData.get("accountAccess") as string;

    if (!shiftStartStr || !shiftEndStr || !profitAmountStr || !screenshot || !accountAccess) {
      throw new Error("Заполните все обязательные поля");
    }

    const shiftStart = new Date(shiftStartStr);
    const shiftEnd = new Date(shiftEndStr);
    const profitAmount = parseFloat(profitAmountStr);

    if (isNaN(profitAmount)) {
      throw new Error("Сумма профита должна быть числом");
    }

    await prisma.report.create({
      data: {
        chatterId: session.user.id,
        shiftStart,
        shiftEnd,
        profitAmount,
        screenshot,
        accountAccess,
        status: 'PENDING_REVIEW' // or whatever the default is, probably "PENDING_REVIEW"
      },
    });

    revalidatePath("/reports");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
