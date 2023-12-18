import React from "react"
import Image from "next/image"
import LoginForm from "@/components/forms/login-form"
import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Login",
}

const Login = async () => {
  const user = await getServerSession()

  if (user) return redirect("/")

  return (
    <div className="grid h-full max-md:grid-rows-[200px_1fr] md:grid-cols-2">
      <div className="flex w-full flex-col justify-center py-6 max-md:order-last">
        <div className="container flex max-w-[30rem] flex-col gap-4">
          <div className="mb-5">
            <h3 className="text-2xl font-bold">Log In</h3>
            <p className="text-sm text-primaryGray">
              By logging in you have agreed to our Terms & Conditions and
              Privacy Policy.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
      <div className="relative h-full w-full">
        <Image
          src="/assets/images/beach.jpg"
          fill
          className="absolute object-cover md:rounded-l-[3rem]"
          alt="Kelingking Beach - Photo by Szabolcs Toth on Unsplash"
        />
      </div>
    </div>
  )
}

export default Login
