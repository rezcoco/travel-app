import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")

  if (!token) return new NextResponse("Token is missing", { status: 400 })

  try {
    const verificationData = await prisma.verificationToken.findUnique({ where: { token } })

    if (!verificationData) return new NextResponse("Bad Request", { status: 400 })

    const expires = new Date(verificationData.expires).getTime()

    if (expires < Date.now()) return new NextResponse("Token Expired", { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: verificationData.identifier } })
    if (!user) throw new Error("user by token not found")

    if (user.emailVerified) {
      await prisma.verificationToken.delete({ where: { token } })
      return new NextResponse("Email already verified", { status: 400 })
    }

    await prisma.user.update({
      where: { email: user.email },
      data: {
        emailVerified: new Date()
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        picture: true
      }
    })

    await prisma.verificationToken.delete({
      where: { token }
    })

    return NextResponse.json({ data: user })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}