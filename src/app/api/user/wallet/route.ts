import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Не авторизован" },
        { status: 401 }
      );
    }

    const { walletAddress, cryptoExchange } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        walletAddress: walletAddress || null,
        cryptoExchange: cryptoExchange || null,
      },
    });

    return NextResponse.json(
      { message: "Данные сохранены", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating wallet:", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
