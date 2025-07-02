import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface WidgetConfigNavigationProps {
  steps: Step[];
  currentStep: number;
}

export const WidgetConfigNavigation: React.FC<WidgetConfigNavigationProps> = ({
  steps,
  currentStep
}) => {
  return (
    <div className="px-6 pb-4 flex-shrink-0">
      <div className="flex items-center space-x-2 text-sm">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-2">
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                currentStep === step.id
                  ? 'bg-primary text-primary-foreground'
                  : currentStep > step.id
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className="font-medium">{step.id}</span>
              <span className="hidden sm:inline">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};