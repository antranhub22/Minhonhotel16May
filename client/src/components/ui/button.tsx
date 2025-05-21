import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-base font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 shadow-sm px-5 py-2",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-tr from-[#5E0B2B] to-[#FAE6EE] text-white hover:brightness-110 hover:shadow-lg",
        yellow: "bg-gradient-to-b from-[#DAC17A] to-[#DAC17A] text-[#DAC17A] border-2 border-[#DAC17A] shadow-xl hover:brightness-105 hover:shadow-2xl text-shadow-white",
        outline: "border-2 border-[#5E0B2B] bg-white text-[#5E0B2B] hover:bg-[#f5f7fa]",
        secondary: "bg-white text-[#5E0B2B] border border-[#5E0B2B] hover:bg-[#e8eaf6]",
        destructive: "bg-[#5E0B2B] text-white hover:bg-[#8B1A47]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 rounded-md px-4 py-2 text-sm",
        lg: "h-14 rounded-xl px-8 py-3 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
