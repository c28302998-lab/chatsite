"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserBalance(userId: string, newBalance: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Только администратор может изменять баланс");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance }
    });

    revalidatePath("/admin/finances");
    revalidatePath("/balance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
