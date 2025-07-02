import React from 'react';
import { Progress } from '@/components/ui/progress';

interface WidgetConfigProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const WidgetConfigProgress: React.FC<WidgetConfigProgressProps> = ({
  currentStep,
  totalSteps
}) => {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
      <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
    </div>
  );
};