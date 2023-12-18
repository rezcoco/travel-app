"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { BiSolidLock } from "react-icons/bi"
import { toast } from "react-toastify"
import { z } from "zod"
import Input from "../inputs/input"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { signIn } from "next-auth/react"

const registerSchema = z
  .object({
    email: z.string().min(1, "Email is required").email(),
    fullName: z.string().min(1, "Full Name is required"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(
        8,
        "Password must be at least 8 characters of number, uppercase and lowercase letters combination."
      )
      .max(20),
    confirmPassword: z
      .string()
      .min(1, "Confirm password is required")
      .min(
        8,
        "Password must be at least 8 characters of number, uppercase and lowercase letters combination."
      )
      .max(20),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type RegisterSchemaType = z.infer<typeof registerSchema>

const RegisterForm = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchemaType>({
    shouldFocusError: false,
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function handleRegister(values: RegisterSchemaType) {
    try {
      const res = await axios.post(
        "/api/auth/register",
        {
          email: values.email,
          fullName: values.fullName,
          password: values.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      router.push(`/verify-email?token=${res.data.token}`)
    } catch (error: any) {
      if (error.response.data === "user already exists") {
        return toast("User already registered using email or google", {
          type: "error",
        })
      }
      toast("Something went wrong", { type: "error" })
    }
  }

  function clearError(key: keyof RegisterSchemaType) {
    return errors[key] && clearErrors(key)
  }

  return (
    <form
      onSubmit={handleSubmit(handleRegister)}
      className="flex w-full flex-col gap-4"
    >
      <div>
        <button
          type="button"
          onClick={() => signIn("google")}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-input px-2 py-3 text-sm font-medium hover:bg-accent disabled:cursor-not-allowed"
        >
          <Image
            src="/assets/icons/google.svg"
            alt="google"
            width={20}
            height={20}
          />
          Create account with Google
        </button>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs uppercase text-primaryGray">
            or continue with
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Input
          type="text"
          placeholder="e.g. John Doe"
          label="Full Name"
          name="fullName"
          register={register}
          onFocus={() => clearError("fullName")}
          className={cn({
            "border-2 border-red-500 focus-visible:ring-0": errors.fullName,
          })}
        />
        {errors.fullName && (
          <p className="text-sm text-red-500">{errors.fullName.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Input
          type="email"
          placeholder="example@email.com"
          label="Email"
          name="email"
          register={register}
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
          type="password"
          label="Password"
          name="password"
          register={register}
          onFocus={() => clearError("password")}
          className={cn({
            "border-2 border-red-500 focus-visible:ring-0": errors.password,
          })}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
        {!errors.password && (
          <p className="text-xs text-primaryGray">
            Min. 8 characters, of number, uppercase and lowercase letters
            combination.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Input
          type="password"
          label="Confirm Password"
          name="confirmPassword"
          register={register}
          onFocus={() => clearError("confirmPassword")}
          className={cn({
            "border-2 border-red-500 focus-visible:ring-0":
              errors.confirmPassword,
          })}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <button
        disabled={isSubmitting}
        type="submit"
        className="mt-4 h-10 w-full rounded-lg bg-primaryBlue px-3 py-2 text-sm font-medium text-primaryWhite hover:bg-primaryBlue/90 disabled:cursor-not-allowed disabled:bg-primaryBlue/90"
      >
        Create Account
      </button>
      <div className="flex items-center gap-2">
        <BiSolidLock />
        <p className="text-xs text-primaryGray">
          Your data will always be protected and will not be used without your
          consent.
        </p>
      </div>
      <p className="text-center text-sm font-medium">
        Already have an account?{" "}
        <Link className="font-medium text-primaryBlue" href="/login">
          Log in
        </Link>
      </p>
    </form>
  )
}

export default RegisterForm
