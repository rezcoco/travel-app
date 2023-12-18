
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const createAndDeleteBookmarkSchema = z.object({
  userId: z.string(),
})

export async function POST(
  request: NextRequest,
  { params }: {
    params: { todoId: string }
  }
) {
  const body = await request.json()
  const validation = createAndDeleteBookmarkSchema.safeParse(body)

  if (!validation.success) return new NextResponse(validation.error.message, { status: 400 })

  const { userId } = validation.data
  const todoId = params.todoId

  try {
    const findBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_todoId: { userId, todoId }
      }
    })
    if (findBookmark) return new NextResponse("todo already bookmarked", { status: 400 })

    const bookmark = await prisma.bookmark.create({
      data: { userId, todoId }
    })

    return NextResponse.json({ data: bookmark }, { status: 201 })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: {
    params: { todoId: string }
  }
) {
  const body = await request.json()
  const validation = createAndDeleteBookmarkSchema.safeParse(body)

  if (!validation.success) return new NextResponse(validation.error.message, { status: 400 })

  const { userId } = validation.data
  const todoId = params.todoId

  try {
    const findBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_todoId: { userId, todoId }
      }
    })
    if (!findBookmark) return new NextResponse("nothing to delete", { status: 404 })

    const bookmark = await prisma.bookmark.delete({
      where: { userId_todoId: { userId, todoId } }
    })

    return NextResponse.json({ data: bookmark })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      console.error('Todo not found');
      return new NextResponse("Todo not found", { status: 404 })
    } else {
      return new NextResponse("Internal Server Error", { status: 500 })
    }
  }
}