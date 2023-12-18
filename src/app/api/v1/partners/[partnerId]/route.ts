import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const updatePartnerSchema = z.object({
  email: z.string().email(),
  name: z.string().max(36),
  description: z.string().max(191),
  imageUrl: z.string()
})

export async function PUT(
  request: NextRequest,
  { params }: {
    params: { partnerId: string }
  }
) {
  const body = await request.json()
  const validdation = updatePartnerSchema.safeParse(body)

  if (!validdation.success) return new NextResponse(validdation.error.message, { status: 400 })

  const { email, name, description, imageUrl } = validdation.data

  try {
    const partnerId = params.partnerId
    const findPartner = await prisma.partner.findUnique({ where: { id: partnerId } })
    if (!findPartner) return new NextResponse("Partner not found", { status: 404 })

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        name,
        email,
        description,
        imageUrl
      }
    })

    return NextResponse.json({ data: partner })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: {
    params: { partnerId: string }
  }
) {
  try {
    const partnerId = params.partnerId

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        products: true,
        rating: true
      }
    })
    if (!partner) return new NextResponse("Partner not found", { status: 404 })

    return NextResponse.json({ data: partner })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: {
    params: { partnerId: string }
  }
) {
  try {
    const partnerId = params.partnerId

    const todo = await prisma.todo.delete({
      where: { id: partnerId }
    })

    return NextResponse.json({ data: todo })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      console.error('Todo not found');
      return new NextResponse("Todo not found", { status: 404 })
    } else {
      return new NextResponse("Internal Server Error", { status: 500 })
    }
  }
}