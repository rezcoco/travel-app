"use client"

import Loading from "@/components/loadings/loading-dot"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React from "react"
import { toast } from "react-toastify"

type VerifyReturnValueType = {
  email: string
  token: string
}

const VerifyEmail = () => {
  const [isLoading, setIsLoading] = React.useState(true)
  const [data, setData] = React.useState<null | VerifyReturnValueType>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  React.useEffect(() => {
    if (!token) return
    async function verify() {
      try {
        const res = await axios.post(`/api/auth/resend?token=${token}`)
        setIsLoading(false)
        return setData(res.data.data)
      } catch (error: any) {
        console.log(error.message)
        router.replace("/")
      }
    }

    verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleResend() {
    try {
      const res = await axios.get(`/api/auth/resend?id=${btoa(data!.email)}`)
      await axios.post(`/api/auth/resend?token=${res.data.data.token}`)

      toast("Email sent", { type: "success" })
    } catch (error: any) {
      console.log(error.message)
      router.replace("/")
    }
  }

  return (
    <>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loading className="text-primaryBlue" height={60} width={60} />
        </div>
      ) : (
        <section className="container flex h-full items-center justify-center">
          <div className="flex max-w-[480px] flex-col items-center justify-center rounded-lg border border-input bg-secondaryWhite p-8">
            <Image
              src="/assets/illustrations/message.svg"
              alt="message"
              width={150}
              height={150}
            />
            <h2 className="mt-8 text-center text-2xl font-bold">
              First, let&apos;s verify your email
            </h2>
            <div className="my-8 flex flex-col items-center justify-center gap-3">
              <p className="max-w-[35ch] text-center text-sm text-primaryGray">
                Check your{" "}
                <span className="font-bold">{data ? data.email : "email"}</span>{" "}
                to verify your account and get started.
              </p>
              <p className="text-sm text-primaryGray">
                <span className="text-sm font-bold">Check your spam</span>{" "}
                folder if you don&apos;t see it.
              </p>
            </div>
            <p className="mb-4 text-sm text-primaryGray">
              Still can&apos;t find the email?
            </p>
            <div className="flex w-full items-center gap-4">
              <button
                onClick={handleResend}
                className="flex h-10 w-full items-center justify-center rounded-lg bg-primaryBlue px-3 py-2 text-sm font-medium text-primaryWhite hover:bg-primaryBlue/90"
              >
                Resend email
              </button>
            </div>
            <p className="mt-4 text-sm text-primaryGray">
              Need help?{" "}
              <Link
                className="text-sm font-medium text-primaryBlue underline"
                href="/"
              >
                Contact us
              </Link>
            </p>
          </div>
        </section>
      )}
    </>
  )
}

export default VerifyEmail
