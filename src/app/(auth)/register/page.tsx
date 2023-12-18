import React from "react"
import Image from "next/image"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import RegisterForm from "@/components/forms/register-form"
import { getServerSession } from "next-auth"

export const metadata: Metadata = {
  title: "Create Account",
}

const Register = async () => {
  const user = await getServerSession()

  if (user) return redirect("/")

  return (
    <div className="grid h-full max-md:grid-rows-[200px_1fr] md:grid-cols-2">
      <div className="flex w-full flex-col justify-center py-6 max-md:order-last">
        <div className="container flex max-w-[30rem] flex-col gap-4">
          <div className="mb-5">
            <h3 className="text-2xl font-bold">Create Account</h3>
            <p className="text-left text-sm text-primaryGray">
              By creating an account you have agreed to our Terms & Condition
              and Privacy Policy.
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
      <div className="relative h-full w-full">
        <Image
          src="/assets/images/beach.jpg"
          alt="Kelingking Beach - Photo by Szabolcs Toth on Unsplash"
          fill
          className="absolute object-cover md:rounded-l-[3rem]"
        />
      </div>
    </div>
  )
}

export default Register
