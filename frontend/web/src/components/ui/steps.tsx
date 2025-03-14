import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

export interface StepProps {
    title: string
    description?: string
}

interface StepsProps {
    currentStep: number
    steps: StepProps[]
    className?: string
}

export function Steps({ currentStep, steps, className }: StepsProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {steps.map((step, index) => (
                <div key={index} className={cn(
                    "flex items-center space-x-4",
                    index <= currentStep ? "text-foreground" : "text-muted-foreground"
                )}>
                    <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2",
                        index < currentStep ? "bg-primary border-primary" : "border-muted",
                        index === currentStep ? "border-primary" : ""
                    )}>
                        {index < currentStep ? (
                            <CheckIcon className="h-4 w-4 text-primary-foreground" />
                        ) : (
                            <span>{index + 1}</span>
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{step.title}</p>
                        {step.description && (
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
