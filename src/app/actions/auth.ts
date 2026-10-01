"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerViaInvite(formData: FormData) {
  try {
    const token = formData.get("token") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!token || !name || !email || !password) {
      throw new Error("Заполните все поля");
    }

    // 1. Найти заявку по токену
    const application = await prisma.application.findUnique({
      where: { inviteToken: token },
      include: { recruiter: { include: { ownedBand: true } } }
    });

    if (!application) {
      throw new Error("Недействительная или истекшая ссылка");
    }

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("Этот Email уже зарегистрирован");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Определяем банд, к которому привяжем чатера
    let bandId = null;
    if (application.recruiter.role === 'PARTNER' && application.recruiter.ownedBand) {
      bandId = application.recruiter.ownedBand.id;
    } else {
      bandId = application.recruiter.bandId;
    }

    // 2. Создаем пользователя
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CHATTER",
        invitedById: application.recruiterId,
        bandId: bandId,
      },
    });

    // 3. Уничтожаем токен
    await prisma.application.update({
      where: { id: application.id },
      data: { inviteToken: null },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
