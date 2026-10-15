import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, inviteBy, bandId, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Все поля обязательны" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Определяем параметры для создания пользователя
    const createData: any = {
      name,
      email,
      password: hashedPassword,
      role: role === 'CHATTER' ? 'CHATTER' : "PARTNER",
    };

    // Если есть реферальные параметры, привязываем
    if (inviteBy) {
      createData.invitedById = inviteBy;
    }

    if (bandId) {
      createData.bandId = bandId;
    } else if (inviteBy) {
      const inviter = await prisma.user.findUnique({
        where: { id: inviteBy },
        include: { ownedBand: true }
      });
      if (inviter?.ownedBand?.id) {
        createData.bandId = inviter.ownedBand.id;
      } else if (inviter?.bandId) {
        createData.bandId = inviter.bandId;
      }
    }

    const user = await prisma.user.create({
      data: createData,
    });

    return NextResponse.json(
      { message: "Пользователь успешно зарегистрирован", user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Ошибка при регистрации" },
      { status: 500 }
    );
  }
}
