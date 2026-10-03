"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface Payouts {
  chatterAmount: number;
  recruiterAmount: number;
  ownerAmount: number;
  adminAmount: number;
}

export async function approveReport(reportId: string, payouts: Payouts) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      throw new Error("Только Главный Админ может одобрять отчеты к выплате");
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { chatter: { include: { band: true } } }
    });

    if (!report || report.status !== 'PENDING_CALCULATION') {
      throw new Error("Отчет не найден или уже обработан");
    }

    if (!report.chatter.band) {
      throw new Error("Чатер не состоит в банде");
    }

    const { chatterAmount, recruiterAmount, ownerAmount, adminAmount } = payouts;
    const chatterId = report.chatterId;
    const recruiterId = report.chatter.invitedById;
    const ownerId = report.chatter.band.ownerId;

    const txs: any[] = [
      prisma.report.update({
        where: { id: reportId },
        data: { 
          status: 'APPROVED',
          chatterAmount,
          recruiterAmount: recruiterId && recruiterAmount > 0 ? recruiterAmount : null,
          ownerAmount: ownerId && ownerAmount > 0 ? ownerAmount : null,
          adminAmount: adminAmount > 0 ? adminAmount : null
        }
      })
    ];

    if (chatterAmount > 0) {
      txs.push(
        prisma.user.update({
          where: { id: chatterId },
          data: { balance: { increment: chatterAmount } }
        })
      );
    }
    
    if (recruiterId && recruiterAmount > 0 && recruiterId !== ownerId) {
      txs.push(
        prisma.user.update({
          where: { id: recruiterId },
          data: { balance: { increment: recruiterAmount } }
        })
      );
    }

    if (ownerId && ownerAmount > 0 && ownerId !== recruiterId) {
      txs.push(
        prisma.user.update({
          where: { id: ownerId },
          data: { balance: { increment: ownerAmount } }
        })
      );
    }

    // If owner is the same as recruiter, combine their increments to avoid transaction conflicts or double-updates overwriting each other
    if (ownerId && recruiterId === ownerId) {
      const combinedAmount = (ownerAmount || 0) + (recruiterAmount || 0);
      if (combinedAmount > 0) {
        txs.push(
          prisma.user.update({
            where: { id: ownerId },
            data: { balance: { increment: combinedAmount } }
          })
        );
      }
    }

    if (adminAmount > 0) {
      txs.push(
        prisma.user.update({
          where: { id: session.user.id },
          data: { balance: { increment: adminAmount } }
        })
      );
    }

    await prisma.$transaction(txs);

    revalidatePath("/reports");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error approving report:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectReport(reportId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Не авторизован");
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });

    if (currentUser?.role === 'CHATTER') {
      throw new Error("Нет прав");
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { chatter: true }
    });

    if (!report || (report.status !== 'PENDING_REVIEW' && report.status !== 'PENDING_CALCULATION')) {
      throw new Error("Отчет не найден или уже обработан");
    }

    if (currentUser?.role !== 'ADMIN' && report.chatter.bandId !== currentUser?.ownedBand?.id) {
      throw new Error("Нет прав: отчет не принадлежит вашей команде");
    }

    await prisma.report.update({
      where: { id: reportId },
      data: { status: 'REJECTED' }
    });

    revalidatePath("/reports");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting report:", error);
    return { success: false, error: error.message };
  }
}

export async function sendToCalculation(reportId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Не авторизован");
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedBand: true }
    });

    if (currentUser?.role === 'CHATTER') {
      throw new Error("Нет прав");
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { chatter: true }
    });

    if (!report || report.status !== 'PENDING_REVIEW') {
      throw new Error("Отчет не найден или уже обработан");
    }

    if (currentUser?.role !== 'ADMIN' && report.chatter.bandId !== currentUser?.ownedBand?.id) {
      throw new Error("Нет прав: отчет не принадлежит вашей команде");
    }

    await prisma.report.update({
      where: { id: reportId },
      data: { status: 'PENDING_CALCULATION' }
    });

    revalidatePath("/reports");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error sending report to calculation:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteReport(reportId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      throw new Error("Только Главный Админ может удалять отчеты");
    }

    await prisma.report.delete({
      where: { id: reportId }
    });

    revalidatePath("/reports");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting report:", error);
    return { success: false, error: error.message };
  }
}

