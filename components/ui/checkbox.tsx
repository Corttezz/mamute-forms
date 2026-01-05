import * as React from "react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.ComponentProps<"input">, 'type'> {
  label?: string
}

function Checkbox({ className, label, id, checked, onChange, ...props }: CheckboxProps) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <label htmlFor={checkboxId} className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        id={checkboxId}
        className={cn(
          "h-4 w-4 rounded border-slate-300 text-[#111827] focus:ring-[#111827] focus:ring-2 focus:ring-offset-0 cursor-pointer",
          className
        )}
        checked={checked}
        onChange={onChange}
        {...props}
      />
      {label && (
        <span className="text-[14px] text-slate-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
          {label}
        </span>
      )}
    </label>
  )
}

export { Checkbox }

