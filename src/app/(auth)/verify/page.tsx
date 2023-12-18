"use client"

import Loading from "@/components/loadings/loading-dot"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React from "react"

const VerificationPage = () => {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  React.useEffect(() => {
    if (!token) return

    async function verifyToken() {
      try {
        await axios.post(`/api/auth/verify?token=${token}`)
        setIsLoading(false)
        return setIsSuccess(true)
      } catch (error: any) {
        return setIsLoading(false)
      }
    }
    verifyToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="container flex h-full items-center justify-center">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loading className="text-primaryBlue" height={60} width={60} />
        </div>
      ) : (
        <div className="mx-auto flex max-w-[480px] flex-col items-center justify-center rounded-lg border border-input bg-secondaryWhite p-8">
          <Image
            src={`/assets/illustrations/${
              isSuccess ? "completing.svg" : "empty.svg"
            }`}
            width={150}
            height={150}
            className=""
            alt="Illustration"
          />
          <div className="my-8 flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-bold">
              {isSuccess
                ? "Thank you for verifying your email"
                : "Email confirmation link has expired"}
            </h2>
            <p className="text-sm text-primaryGray">
              {isSuccess
                ? "Please log in to continue"
                : "Please log in to resend confirmation link"}
            </p>
          </div>
          <Link
            href="/login"
            className="h-10 w-full rounded-lg bg-primaryBlue px-3 py-2 text-center text-sm font-medium text-primaryWhite hover:bg-primaryBlue/90"
          >
            Log In
          </Link>
        </div>
      )}
    </section>
  )
}

export default VerificationPage
