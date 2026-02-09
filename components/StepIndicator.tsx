import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex flex-col items-center cursor-pointer",
                onStepClick && "hover:opacity-80"
              )}
              onClick={() => onStepClick?.(step.id)}
            >
              <div
                className={cn(
                  "step-indicator transition-all duration-200",
                  step.completed && "step-completed",
                  currentStep === step.id && !step.completed && "step-active",
                  currentStep !== step.id && !step.completed && "step-pending"
                )}
              >
                {step.completed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-1 text-center max-w-[80px] hidden sm:block",
                  currentStep === step.id
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                {step.shortName}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  step.completed ? "bg-[hsl(var(--success))]" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
