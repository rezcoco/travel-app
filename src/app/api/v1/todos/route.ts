import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod'
import prisma from "@/lib/prisma";
import { TODO_ORDER_BY } from "@/constants/sort";
import { Prisma } from "@prisma/client";

const createTodoSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string(),
  price: z.number().int(),
  partnerId: z.string().cuid(),
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
    pax: z.number(),
    price: z.number(),
    description: z.string(),
    includes: z.string()
  })),
  itinerary: z.object({
    totalDay: z.number(),
    schedules: z.array(z.object({
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

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validation = createTodoSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({
      success: false,
      message: validation.error.message
    }, { status: 400 })
  }

  try {
    const {
      title,
      description,
      price,
      partnerId,
      images,
      location: { area, city, region, country },
      itinerary,
      includes,
      highlights,
      minReservationDay,
      isRefundable,
      isInstantConfirmation,
      earliestAvailabilityDate,
      latestAvailabilityDate,
      earliestBookingDate,
      longLat,
      packages,
      category
    } = validation.data

    const findTodo = await prisma.todo.findUnique({
      where: { title }
    })

    if (findTodo) {
      return NextResponse.json({
        success: false,
        message: `Todo with the name ${title} is already exist`
      }, { status: 400 })
    }

    const findCountry = await prisma.country.upsert({
      where: { name: country },
      update: {},
      create: {
        name: country
      }
    })

    const findRegion = await prisma.region.upsert({
      where: { regionId: region.id },
      update: {},
      create: {
        regionId: region.id,
        name: region.name,
        countryId: findCountry.name
      }
    })

    const findCity = await prisma.city.upsert({
      where: { cityId: city.id },
      update: {},
      create: {
        cityId: city.id,
        name: city.name,
        countryId: findCountry.name
      }
    })

    const findArea = await prisma.area.upsert({
      where: { areaId: area.id },
      update: {},
      create: {
        areaId: area.id,
        name: area.name,
        countryId: findCountry.name
      }
    })

    const findLocation = await prisma.location.upsert({
      where: {
        areaCodeId_cityCodeId_regionCodeId_countryCodeId: {
          areaCodeId: findArea.areaId,
          cityCodeId: findCity.cityId,
          regionCodeId: findRegion.regionId,
          countryCodeId: findCountry.name
        }
      },
      update: {},
      create: {
        areaCodeId: findArea.areaId,
        cityCodeId: findCity.cityId,
        regionCodeId: findRegion.regionId,
        countryCodeId: findCountry.name
      }
    })

    const findCategory = await prisma.category.upsert({
      where: { name: category },
      update: {},
      create: {
        name: category
      }
    })

    const startingPrice = Math.min(...packages.map(p => p.price))

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        price: startingPrice,
        highlights,
        partnerId,
        includes,
        minReservationDay,
        isRefundable,
        isInstantConfirmation,
        earliestAvailabilityDate,
        latestAvailabilityDate,
        earliestBookingDate,
        locationId: findLocation.id,
        categoryId: findCategory.id,
        longLat: {
          create: {
            longitude: longLat[0],
            latitude: longLat[1]
          }
        },
        images: {
          createMany: {
            data: images.map(url => ({ url }))
          }
        },
        packages: {
          createMany: {
            data: packages.map(p => ({
              price: p.price,
              pax: p.pax,
              inlcudes: p.includes,
              description: p.description
            }))
          }
        },
        itinerary: {
          create: {
            totalDay: itinerary.totalDay,
            schedules: {
              createMany: {
                data: itinerary.schedules.map(schedule => {
                  return {
                    activity: schedule.activity,
                    dayCount: schedule.dayCount,
                    time: schedule.time
                  }
                })
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ data: todo }, { status: 201 })

  } catch (error: any) {
    console.log(error.message)
    NextResponse.json({
      success: false,
      message: "Internal Server Error"
    },
      { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number(searchParams.get("page")) || 1
  const searchQuery = searchParams.get("q")
  const orderBy = (searchParams.get("orderBy") || "most_popular") as typeof TODO_ORDER_BY[number]["value"]
  const pageSize = 10
  const skip = (page - 1) * pageSize

  let sort: Prisma.TodoOrderByWithRelationInput | Prisma.TodoOrderByWithRelationInput[] = {}
  const query: Prisma.TodoWhereInput = {}

  switch (orderBy) {
    case "most_popular":
      sort = [
        { bookings: { _count: "desc" } },
        { reviews: { _count: "desc" } }
      ]
      break
    case "highest_price":
      sort.price = "desc"
      break
    case "lowest_price":
      sort.price = "asc"
      break
    case "highest_rating":
      sort.rating!.average = "desc"
      break
    case "newest":
      sort.createdAt = "desc"
      break
    default:
      break
  }

  if (searchQuery) {
    query.title = {
      contains: searchQuery
    }
  }

  try {
    const todos = await prisma.todo.findMany({
      where: query,
      take: pageSize,
      orderBy: sort,
      skip
    })

    return NextResponse.json({ data: todos })
  } catch (error: any) {
    console.log(error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

