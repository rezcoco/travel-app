import { cn } from "@/lib/utils"
import React from "react"
import { FieldPath, FieldValues, UseFormRegister } from "react-hook-form"

type Props<T extends FieldValues> = {
  label: string
  name: FieldPath<T>
  placeholder?: string
  className?: string
  type: React.HTMLInputTypeAttribute
  register: UseFormRegister<T>
} & React.InputHTMLAttributes<HTMLInputElement>

const Input = <T extends FieldValues>({
  label,
  name,
  placeholder,
  className,
  type,
  register,
  ...props
}: Props<T>) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-2 text-sm font-medium">
        {label}
      </label>
      <input
        {...props}
        type={type}
        id={name}
        placeholder={placeholder}
        className={cn(
          "h-10 rounded-lg border border-input bg-background p-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primaryBlue",
          className
        )}
        {...register(name)}
      />
    </div>
  )
}

export default Input
