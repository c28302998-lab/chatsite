"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBonusRate(userId: string, amount: number, conditions: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      throw new Error("Только Главный Админ может назначать ставки");
    }

    await prisma.bonusRate.create({
      data: {
        userId,
        amount,
        conditions
      }
    });

    revalidatePath("/admin/bonuses");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error creating bonus rate:", error);
    return { success: false, error: error.message };
  }
}

export async function submitBonusReport(bonusId: string, reportText: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Не авторизован");
    }

    const bonus = await prisma.bonusRate.findUnique({
      where: { id: bonusId }
    });

    if (!bonus || bonus.userId !== session.user.id) {
      throw new Error("Ставка не найдена или нет доступа");
    }

    await prisma.bonusRate.update({
      where: { id: bonusId },
      data: {
        reportText,
        status: "PENDING_REVIEW"
      }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting bonus report:", error);
    return { success: false, error: error.message };
  }
}

export async function approveBonus(bonusId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      throw new Error("Только Главный Админ может одобрять ставки");
    }

    const bonus = await prisma.bonusRate.findUnique({
      where: { id: bonusId }
    });

    if (!bonus || bonus.status !== "PENDING_REVIEW") {
      throw new Error("Ставка не найдена или не готова к одобрению");
    }

    await prisma.$transaction([
      prisma.bonusRate.update({
        where: { id: bonusId },
        data: { status: "APPROVED" }
      }),
      prisma.user.update({
        where: { id: bonus.userId },
        data: { balance: { increment: bonus.amount } }
      })
    ]);

    revalidatePath("/admin/bonuses");
    return { success: true };
  } catch (error: any) {
    console.error("Error approving bonus:", error);
    return { success: false, error: error.message };
  }
}
