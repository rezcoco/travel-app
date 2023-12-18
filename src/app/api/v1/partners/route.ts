import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { PARTNER_ORDER_BY } from "@/constants/sort";

const createPartnerSchema = z.object({
  email: z.string().email(),
  name: z.string().max(36),
  description: z.string().max(191),
  imageUrl: z.string()
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validdation = createPartnerSchema.safeParse(body)

  if (!validdation.success) return new NextResponse(validdation.error.message, { status: 400 })

  const { email, name, description, imageUrl } = validdation.data

  try {
    const findPartner = await prisma.partner.findUnique({ where: { name } })
    if (findPartner) return new NextResponse(`Partner with name ${name} already exists`, { status: 400 })

    const partner = await prisma.partner.create({
      data: {
        name,
        email,
        description,
        imageUrl
      }
    })

    return NextResponse.json({ data: partner }, { status: 201 })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number(searchParams.get("page")) || 1
  const searchQuery = searchParams.get("q")
  const orderBy = (searchParams.get("orderBy") || "desc") as typeof PARTNER_ORDER_BY[number]["value"]
  const pageSize = 10
  const skip = (page - 1) * pageSize

  const sort: Prisma.PartnerOrderByWithRelationInput = {}
  const query: Prisma.PartnerWhereInput = {}

  switch (orderBy) {
    case "latest":
      sort.createdAt = "desc"
      break
    case "desc":
      sort.name = "desc"
      break
    case "asc":
      sort.name = "asc"
      break
    default:
      sort.name = "asc"
      break
  }

  if (searchQuery) {
    query.name = { contains: searchQuery }
  }

  try {
    const partners = await prisma.partner.findMany({
      take: pageSize,
      skip,
      where: query,
      orderBy: sort
    })

    return NextResponse.json({ data: partners })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}