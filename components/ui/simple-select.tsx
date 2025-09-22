"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleSelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface SimpleSelectProps {
  options: SimpleSelectOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  size?: "sm" | "default"
}

export function SimpleSelect({
  options,
  value,
  onValueChange,
  placeholder = "Sélectionner...",
  className,
  size = "default",
}: SimpleSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState<SimpleSelectOption | undefined>(
    options.find((option) => option.value === value),
  )

  React.useEffect(() => {
    setSelectedOption(options.find((option) => option.value === value))
  }, [value, options])

  const handleSelect = (option: SimpleSelectOption) => {
    setSelectedOption(option)
    onValueChange(option.value)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "justify-between w-full bg-background hover:bg-muted/50 border-border/60",
          size === "sm" ? "h-8 px-3 text-sm" : "h-12 px-4 text-base",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon}
          <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border-border/60">
            <CardContent className="p-1">
              {options.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full justify-start gap-2 h-auto py-2 px-3 font-normal",
                    selectedOption?.value === option.value && "bg-accent text-accent-foreground",
                  )}
                >
                  {option.icon}
                  <span>{option.label}</span>
                  {selectedOption?.value === option.value && <Check className="h-4 w-4 ml-auto" />}
                </Button>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
