import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: 'drvevcqm2',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function imageUpload(file: File) {
    try {
        const imageArrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(imageArrayBuffer)
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: "assets"
            }, (err, result) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(result)
            }).end(buffer)

        })
        if (!result) throw new Error("Upload failed")

        return result as UploadApiResponse
    } catch (error: any) {
        console.log(error.message)
        throw error
    }
}