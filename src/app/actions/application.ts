"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function addApplication(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Нет доступа");
    }

    const name = formData.get("name") as string;
    const telegram = formData.get("telegram") as string;
    const phone = formData.get("phone") as string;

    if (!name) {
      throw new Error("Имя обязательно");
    }

    await prisma.application.create({
      data: {
        name,
        telegram,
        phone,
        recruiterId: session.user.id,
      },
    });

    revalidatePath("/applications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateApplicationStatus(id: string, status: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Нет доступа");

    await prisma.application.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/applications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function acceptApplication(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Нет доступа. Только Администратор может одобрять заявки.");
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        recruiter: {
          include: {
            ownedBand: true
          }
        }
      }
    });

    if (!application) throw new Error("Заявка не найдена");
    if (application.userId) throw new Error("Чатер уже создан");

    const bandId = application.recruiter.ownedBand?.id || application.recruiter.bandId || null;

    // Generate credentials
    const cleanPhone = application.phone?.replace(/[^0-9]/g, "") || "";
    const cleanTg = application.telegram?.replace(/[^a-zA-Z0-9]/g, "") || "";
    const randomSuffix = Math.floor(Math.random() * 10000);
    const generatedEmail = `${cleanTg || cleanPhone || "chatter"}_${randomSuffix}@huntme.crm`.toLowerCase();
    const generatedPassword = "123456"; // Default password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create User
    const newUser = await prisma.user.create({
      data: {
        name: application.name,
        email: generatedEmail,
        password: hashedPassword,
        role: "CHATTER",
        status: "ACTIVE",
        bandId: bandId,
        invitedById: application.recruiterId,
      }
    });

    await prisma.application.update({
      where: { id },
      data: { 
        status: "HIRED",
        userId: newUser.id,
        generatedEmail,
        generatedPassword
      },
    });

    revalidatePath("/applications");
    return { success: true, email: generatedEmail, password: generatedPassword };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateInterviewDate(id: string, date: Date | null) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") throw new Error("Нет доступа");

    await prisma.application.update({
      where: { id },
      data: { interviewDate: date },
    });
    
    revalidatePath("/applications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectApplication(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Нет доступа. Только Администратор может отклонять заявки.");
    }

    await prisma.application.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    revalidatePath("/applications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
