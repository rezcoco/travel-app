import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"
import { sendEmail } from "@/lib/mailer";
import { emailConfirmation } from "@/components/email";
import { generateToken } from "@/lib/token";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")

  if (!token) return new NextResponse("Token is missing", { status: 400 })

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true }
    })

    if (!session) return new NextResponse("Invalid Token", { status: 400 })
    const sessionExpires = new Date(session.expires).getTime()

    if (sessionExpires < Date.now()) return new NextResponse("Token expired", { status: 400 })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        fullName: true,
        email: true
      }
    })
    if (!user) throw new Error("user by token not found")

    const verificationToken = generateToken()
    const expires = 1000 * 60 * 30 // 30 min

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: new Date(Date.now() + expires)
      }
    })

    await prisma.session.delete({ where: { sessionToken: session.sessionToken } })

    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify?token=${verificationToken}`

    sendEmail(user.email, "Email Confirmation", emailConfirmation(user.fullName, verifyUrl))

    return NextResponse.json({ data: user })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get("id")

  if (!id) return new NextResponse("Missing required field", { status: 400 })
  const email = atob(id)

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return new NextResponse(`user with email ${email} not found`, { status: 404 })

    if (user.emailVerified) return new NextResponse("Email already verified", { status: 400 })

    const findSession = await prisma.session.findFirst({ where: { userId: user.id } })
    const expires = 1000 * 60 * 30 // 30 min

    if (findSession) {
      const token = generateToken()
      await prisma.session.update({
        where: { sessionToken: findSession.sessionToken },
        data: {
          sessionToken: token,
          userId: user.id,
          expires: new Date(Date.now() + expires)
        }
      })

      return NextResponse.json({ data: { token, email: user.email } })
    }

    const token = generateToken()
    await prisma.session.create({
      data: {
        sessionToken: token,
        userId: user.id,
        expires: new Date(Date.now() + expires)
      }
    })

    return NextResponse.json({ data: { token, email: user.email } })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}