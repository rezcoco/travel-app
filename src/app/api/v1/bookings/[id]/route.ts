import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: {
    params: { id: string }
  }
) {
  const id = params.id

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        todo: true
      }
    })
    if (!booking) return new NextResponse("Booking not found", { status: 404 })

    return NextResponse.json({ data: booking })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  reques: NextRequest,
  { params }: {
    params: { id: string }
  }
) {
  try {
    const id = params.id

    const booking = await prisma.booking.delete({ where: { id } })

    return NextResponse.json({ data: booking })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      console.error('Booking not found');
      return new NextResponse("Booking not found", { status: 404 })
    } else {
      return new NextResponse("Internal Server Error", { status: 500 })
    }
  }
}