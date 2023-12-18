import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const updateTodoSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string(),
  price: z.number().int(),
  images: z.array(z.string()),
  includes: z.string(),
  highlights: z.string(),
  minReservationDay: z.number(),
  isInstantConfirmation: z.boolean(),
  isActive: z.boolean().default(true),
  earliestAvailabilityDate: z.date(),
  latestAvailabilityDate: z.date(),
  earliestBookingDate: z.date(),
  isRefundable: z.boolean(),
  longLat: z.array(z.number(), z.number()),
  category: z.string(),
  packages: z.array(z.object({
    id: z.string(),
    pax: z.number(),
    price: z.number(),
    description: z.string(),
    includes: z.string()
  })),
  itinerary: z.object({
    totalDay: z.number(),
    schedules: z.array(z.object({
      id: z.string(),
      activity: z.string(),
      time: z.string(),
      dayCount: z.number().int()
    }))
  }),
  location: z.object({
    area: z.object({
      id: z.string(),
      name: z.string()
    }),
    city: z.object({
      id: z.string(),
      name: z.string()
    }),
    region: z.object({
      id: z.string(),
      name: z.string()
    }),
    country: z.string()
  }),
})

export async function PUT(
  request: NextRequest,
  { params }: {
    params: { todoId: string }
  }
) {
  const id = params.todoId
  const body = await request.json()
  const validation = updateTodoSchema.safeParse(body)

  if (!validation.success) return NextResponse.json({
    success: false,
    message: validation.error.message.toString()
  }, { status: 400 })

  const { data } = validation

  try {
    const t = await prisma.todo.findUnique({ where: { id } })
    if (!t) return new NextResponse("Todo not found", { status: 404 })

    const country = await prisma.country.upsert({
      where: { name: data.location.country },
      update: {},
      create: {
        name: data.location.country
      }
    })
    const region = await prisma.region.upsert({
      where: { regionId: data.location.region.id },
      update: {},
      create: {
        regionId: data.location.region.id,
        name: data.location.region.name,
        countryId: country.name
      }
    })

    const city = await prisma.city.upsert({
      where: { cityId: data.location.city.id },
      update: {},
      create: {
        cityId: data.location.city.id,
        name: data.location.city.name,
        countryId: country.name
      }
    })

    const area = await prisma.area.upsert({
      where: { areaId: data.location.area.id },
      update: {},
      create: {
        areaId: data.location.area.id,
        name: data.location.area.name,
        countryId: country.name
      }
    })

    const location = await prisma.location.upsert({
      where: {
        areaCodeId_cityCodeId_regionCodeId_countryCodeId: {
          areaCodeId: area.areaId,
          cityCodeId: city.cityId,
          regionCodeId: region.regionId,
          countryCodeId: country.name
        }
      },
      update: {},
      create: {
        areaCodeId: area.areaId,
        cityCodeId: city.cityId,
        regionCodeId: region.regionId,
        countryCodeId: country.name
      }
    })

    const category = await prisma.category.upsert({
      where: { name: data.category },
      update: {},
      create: {
        name: data.category
      }
    })

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        highlights: data.highlights,
        includes: data.includes,
        minReservationDay: data.minReservationDay,
        isRefundable: data.isRefundable,
        isInstantConfirmation: data.isRefundable,
        earliestAvailabilityDate: data.earliestAvailabilityDate,
        latestAvailabilityDate: data.latestAvailabilityDate,
        earliestBookingDate: data.earliestBookingDate,
        isActive: data.isActive,
        locationId: location.id,
        categoryId: category.id,
        longLat: {
          update: {
            longitude: data.longLat[0],
            latitude: data.longLat[1]
          }
        },
        packages: {
          updateMany: data.packages.map(p => {
            return {
              where: { id: p.id },
              data: {
                price: p.price,
                pax: p.pax,
                inlcudes: p.includes,
                description: p.description
              }
            }
          })
        },
        itinerary: {
          update: {
            data: {
              totalDay: data.itinerary.totalDay,
              schedules: {
                updateMany: data.itinerary.schedules.map(schedule => {
                  return {
                    where: { id: schedule.id },
                    data: {
                      activity: schedule.activity,
                      time: schedule.time,
                      dayCount: schedule.dayCount
                    }
                  }
                })
              }
            }
          }
        },
        images: {
          deleteMany: {},
          createMany: {
            data: data.images.map(url => ({ url }))
          }
          // TODO: delete images on cdn
        }
      }
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

export async function GET(
  request: NextRequest,
  { params }: {
    params: { todoId: string }
  }
) {
  const id = params.todoId

  try {
    const todo = await prisma.todo.findUnique({
      where: { id },
      include: {
        partner: true,
        itinerary: true,
        images: true,
        location: true,
      }
    })

    if (!todo) return new NextResponse("Todo not found", { status: 404 })

    return NextResponse.json({ data: todo })
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
  try {
    const id = params.todoId

    const todo = await prisma.todo.delete({
      where: { id }
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