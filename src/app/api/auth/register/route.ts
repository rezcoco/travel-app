import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { generateToken } from "@/lib/token";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validation = createUserSchema.safeParse(body)

  if (!validation.success) return new NextResponse(validation.error.message, { status: 400 })

  try {
    const { email, password, fullName } = validation.data

    const findUser = await prisma.user.findUnique({ where: { email } })
    if (findUser) return new NextResponse("user already exists", { status: 400 })

    const hashedPwd = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPwd
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        picture: true
      }
    })

    const expires = 1000 * 60 * 30 // 30 min

    const token = generateToken()
    await prisma.session.create({
      data: {
        sessionToken: token,
        userId: user.id,
        expires: new Date(Date.now() + expires)
      }
    })

    return NextResponse.json({ data: user, token }, { status: 201 })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}