import { imageUpload } from "@/lib/imageUpload";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zfd } from "zod-form-data";

const uploadSchema = zfd.formData({
    images: z.array(zfd.file())
})

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const validation = uploadSchema.safeParse(formData)

    if (!validation.success) {
        return NextResponse.json({
            success: false,
            message: validation.error
        }, { status: 400 })
    }

    try {
        const { images } = validation.data

        const upload = await Promise.all(images.map(img => imageUpload(img)))
        const result = upload.map(res => {
            return {
                url: res?.secure_url,
                fileSize: res?.bytes,
                createdAt: res?.created_at
            }
        })

        return NextResponse.json({
            success: true,
            data: result
        }, { status: 200 })

    } catch (error: any) {
        console.log(error.message)
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 })
    }
}