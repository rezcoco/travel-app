"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { z } from "zod"
import Input from "../inputs/input"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(
      8,
      "Password must be at least 8 characters of number, uppercase and lowercase letters combination."
    )
    .max(20),
})

type LoginSchemaType = z.infer<typeof loginSchema>

const LoginForm = () => {
  const router = useRouter()
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({
    shouldFocusError: false,
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function resend(email: string): Promise<string | null> {
    try {
      const res = await axios.get(`/api/auth/resend?id=${btoa(email)}`)
      return res.data.data.token
    } catch (error: any) {
      toast(error.message, { type: "error" })
      return null
    }
  }

  async function handleLoginCredentials(values: LoginSchemaType) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (res?.error) {
        if (res.status === 401 && res.error === "Please verify your email") {
          const token = await resend(values.email)
          console.log(token)
          if (token) return router.push(`/verify-email?token=${token}`)
        } else if (res.status !== 500) {
          return toast(res.error, { type: "error" })
        } else if (res.status === 500) {
          return toast("Something went wrong!", { type: "error" })
        }
      }

      router.replace("/")
    } catch (error: any) {
      console.log(error.message)
      return toast(error.message)
    }
  }

  async function handleLoginGoogle() {
    setIsGoogleLoading(true)
    try {
      const res = await signIn("google", {
        callbackUrl: "/",
      })

      if (res?.error && res.status !== 500) {
        toast(res.error, { type: "error" })
        throw new Error(res.error)
      } else if (res?.error && res.status === 500) {
        toast("Something went wrong!", { type: "error" })
        throw new Error("Something went wrong!")
      }
    } catch (error) {
      setIsGoogleLoading(false)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  function clearError(key: keyof LoginSchemaType) {
    return errors[key] && clearErrors(key)
  }

  return (
    <form
      onSubmit={handleSubmit(handleLoginCredentials)}
      className="flex w-full flex-col gap-4"
    >
      <div>
        <button
          type="button"
          disabled={isGoogleLoading}
          onClick={handleLoginGoogle}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-medium hover:bg-accent"
        >
          <Image
            src="/assets/icons/google.svg"
            alt="google"
            width={20}
            height={20}
          />
          Log in with Google
        </button>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex items-center justify-center">
          <span className="bg-background px-2 text-xs uppercase text-primaryGray">
            or continue with
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Input
          name="email"
          label="Email"
          register={register}
          type="email"
          onFocus={() => clearError("email")}
          className={cn({
            "border-2 border-red-500 focus-visible:ring-0": errors.email,
          })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Input
          name="password"
          label="Password"
          register={register}
          type="password"
          onFocus={() => clearError("password")}
          className={cn({
            "border-2 border-red-500 focus-visible:ring-0": errors.password,
          })}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <button
        disabled={isSubmitting}
        className="mt-4 h-10 rounded-lg border border-input bg-primaryBlue px-3 py-2 text-sm font-medium text-primaryWhite hover:bg-primaryBlue/90 disabled:cursor-not-allowed disabled:bg-primaryBlue/90"
      >
        Log In
      </button>
      <p className="text-center text-sm font-medium">
        Dont&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primaryBlue">
          Let&apos;s create now
        </Link>
      </p>
    </form>
  )
}

export default LoginForm
