import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    // Если пользователь - АДМИН
    if (session.user.role === "ADMIN") {
      if (targetUserId) {
        // Получаем переписку с конкретным пользователем
        const messages = await prisma.chatMessage.findMany({
          where: {
            OR: [
              { senderId: targetUserId, receiverId: null }, // Юзер написал админу
              { senderId: session.user.id, receiverId: targetUserId }, // Админ написал юзеру
            ],
          },
          orderBy: { createdAt: "asc" },
        });

        // Отмечаем как прочитанные
        await prisma.chatMessage.updateMany({
          where: { senderId: targetUserId, receiverId: null, isRead: false },
          data: { isRead: true },
        });

        return NextResponse.json(messages);
      } else {
        // Получаем список всех пользователей, с которыми есть переписка
        const allMessages = await prisma.chatMessage.findMany({
          where: {
            OR: [
              { receiverId: null }, // Все сообщения к админам
              { senderId: session.user.id }, // Все сообщения от админа
            ],
          },
          include: {
            sender: { select: { id: true, name: true, email: true, role: true } },
            receiver: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        // Извлекаем уникальных пользователей (собеседников)
        const usersMap = new Map();
        
        allMessages.forEach((msg) => {
          if (msg.senderId !== session.user.id) {
            if (!usersMap.has(msg.senderId)) {
              usersMap.set(msg.senderId, {
                ...msg.sender,
                lastMessage: msg.text,
                lastMessageAt: msg.createdAt,
                unread: msg.isRead === false ? 1 : 0
              });
            } else if (!msg.isRead) {
               usersMap.get(msg.senderId).unread += 1;
            }
          }
          if (msg.receiverId && msg.receiverId !== session.user.id) {
            if (!usersMap.has(msg.receiverId)) {
              usersMap.set(msg.receiverId, {
                ...msg.receiver,
                lastMessage: msg.text,
                lastMessageAt: msg.createdAt,
                unread: 0
              });
            }
          }
        });

        return NextResponse.json(Array.from(usersMap.values()));
      }
    } else {
      // Для обычного пользователя
      const messages = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: null }, // Отправил админу
            { receiverId: session.user.id }, // Получил от админа
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      // Отмечаем как прочитанные
      await prisma.chatMessage.updateMany({
        where: { receiverId: session.user.id, isRead: false },
        data: { isRead: true },
      });

      return NextResponse.json(messages);
    }
  } catch (error) {
    console.error("[CHAT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { text, receiverId } = body;

    if (!text) {
      return new NextResponse("Text is required", { status: 400 });
    }

    let message;

    if (session.user.role === "ADMIN") {
      if (!receiverId) {
        return new NextResponse("ReceiverId is required for ADMIN", { status: 400 });
      }
      
      message = await prisma.chatMessage.create({
        data: {
          text,
          senderId: session.user.id,
          receiverId,
        },
      });
    } else {
      // Обычный пользователь пишет Главному Админу
      message = await prisma.chatMessage.create({
        data: {
          text,
          senderId: session.user.id,
          receiverId: null, // null означает, что сообщение адресовано системе (админам)
        },
      });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("[CHAT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
