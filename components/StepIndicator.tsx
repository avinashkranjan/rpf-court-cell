import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
  shortName: string;
  completed: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex flex-col items-center cursor-pointer",
                  onStepClick && "hover:opacity-80",
                )}
                onClick={() => onStepClick?.(step.id)}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200",
                    step.completed && "bg-green-500 text-white",
                    currentStep === step.id &&
                      !step.completed &&
                      "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                    currentStep !== step.id &&
                      !step.completed &&
                      "bg-muted text-muted-foreground",
                  )}
                >
                  {step.completed ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 font-semibold text-center max-w-[80px] hidden sm:block",
                    currentStep === step.id
                      ? "text-primary font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {step.shortName}
                </span>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 self-center">
                <div
                  className={cn(
                    "h-0.5 transition-colors duration-200 -mt-2",
                    step.completed ? "bg-green-500" : "bg-border",
                  )}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
