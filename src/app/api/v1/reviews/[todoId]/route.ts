import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { TODO_REVIEW_ORDER_BY } from "@/constants/sort";
import { Prisma } from "@prisma/client";

const createTodoReviewSchema = z.object({
  content: z.string().min(12),
  rating: z.number().int().min(1).max(5),
  images: z.array(z.string()).optional(),
  userId: z.string(),
})

export async function POST(request: NextRequest, { params }: { params: { todoId: string } }) {
  const todoId = params.todoId
  const body = await request.json()
  const validation = createTodoReviewSchema.safeParse(body)

  if (!validation.success) return new NextResponse(validation.error.message, { status: 400 })

  try {
    const { content, rating: ratingValue, userId } = validation.data

    const findTodo = await prisma.todo.findUnique({ where: { id: todoId } })
    if (!findTodo) return new NextResponse("Todo not found", { status: 404 })

    const partnerId = findTodo.partnerId

    const findReview = await prisma.review.findUnique({
      where: {
        userId_todoId: { userId, todoId }
      }
    })
    if (findReview) return new NextResponse("Todo already reviewed", { status: 400 })

    const countAverageTodo = await prisma.review.aggregate({
      where: { todoId },
      _avg: { rating: true }
    })

    const reviewCount = await prisma.review.count({ where: { todoId } })

    // Todo rating
    await prisma.rating.upsert({
      where: { todoId },
      update: {
        todoId,
        reviewCount,
        average: countAverageTodo._avg.rating || 0
      },
      create: {
        todoId,
        reviewCount,
        average: countAverageTodo._avg.rating || 0
      }
    })

    const countAveragePartner = await prisma.review.aggregate({
      where: { todo: { partnerId } },
      _avg: { rating: true }
    })

    // Partner rating
    await prisma.rating.upsert({
      where: { partnerId: findTodo.partnerId },
      update: {
        partnerId,
        average: countAveragePartner._avg.rating || 0
      },
      create: {
        partnerId,
        average: countAveragePartner._avg.rating || 0
      }
    })

    const review = await prisma.review.create({
      data: {
        content,
        userId,
        todoId,
        rating: ratingValue,
      }
    })

    return NextResponse.json({ data: review }, { status: 201 })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { todoId: string } }) {
  const todoId = params.todoId
  const searchParams = request.nextUrl.searchParams
  const orderBy = (searchParams.get("orderBy") || "desc") as typeof TODO_REVIEW_ORDER_BY[number]["value"]
  const page = Number(searchParams.get("page")) || 1
  const pageSize = 10
  const skip = (page - 1) * pageSize

  const sort: Prisma.ReviewOrderByWithRelationInput = {}

  switch (orderBy) {
    case "latest":
      sort.createdAt = "desc"
      break
    case "desc":
      sort.rating = "desc"
      break
    case "asc":
      sort.rating = "asc"
      break
    case "most_helpful":
      sort.likes = { _count: "desc" }
    default:
      sort.rating = "desc"
  }

  try {
    const reviews = await prisma.review.findMany({
      take: pageSize,
      skip,
      orderBy: sort,
      where: { todoId },
    })

    return NextResponse.json({ data: reviews })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}