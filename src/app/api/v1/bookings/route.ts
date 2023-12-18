import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { BOOKING_ORDER_BY } from "@/constants/sort";
import { Prisma } from "@prisma/client";

const createBookingSchema = z.object({
  quantity: z.number().int(),
  totalPrice: z.number().int(),
  startDate: z.date(),
  endDate: z.date(),
  todoId: z.string(),
  userId: z.string()
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validation = createBookingSchema.safeParse(body)

  if (!validation.success) return new NextResponse(validation.error.message, { status: 400 })

  try {
    const {
      quantity,
      totalPrice,
      startDate,
      endDate,
      todoId,
      userId
    } = validation.data

    const todo = await prisma.todo.findUnique({ where: { id: todoId } })
    if (!todo) return new NextResponse("Todo not found", { status: 404 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return new NextResponse("User not found", { status: 404 })

    const isValidPrice = todo.price * quantity === totalPrice
    if (!isValidPrice) return new NextResponse("Price not valid", { status: 400 })

    const booking = await prisma.booking.create({
      data: {
        quantity,
        totalPrice,
        startDate,
        endDate,
        todoId: todo.id,
        userId: user.id
      }
    })

    return NextResponse.json({ data: booking }, { status: 201 })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const orderBy = (searchParams.get("orderBy") || "desc") as typeof BOOKING_ORDER_BY[number]["value"]
  const page = Number(searchParams.get("page")) || 1
  const searchQuery = searchParams.get("q")
  const pageSize = 10
  const skip = (page - 1) * pageSize

  const sort: Prisma.BookingOrderByWithRelationInput = {}
  const query: Prisma.BookingWhereInput = {}

  switch (orderBy) {
    case "desc":
      sort.createdAt = "desc"
      break
    case "asc":
      sort.createdAt = "desc"
      break
    default:
      sort.createdAt = "desc"
      break
  }

  if (searchQuery) {
    query.OR = [
      {
        todo: {
          title: {
            contains: searchQuery
          }
        }
      },
      {
        user: {
          OR: [
            {
              fullName: {
                contains: searchQuery
              }
            },
            {
              email: {
                contains: searchQuery
              }
            }
          ]
        }
      }
    ]
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: query,
      orderBy: sort,
      take: pageSize,
      skip
    })

    return NextResponse.json({ data: bookings })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}