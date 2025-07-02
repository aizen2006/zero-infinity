import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WidgetConfigButtonsProps {
  currentStep: number;
  totalSteps: number;
  isStepValid: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export const WidgetConfigButtons: React.FC<WidgetConfigButtonsProps> = ({
  currentStep,
  totalSteps,
  isStepValid,
  onPrevious,
  onNext,
  onCancel,
  onSave
}) => {
  return (
    <div className="p-6 border-t bg-muted/50">
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {currentStep < totalSteps ? (
            <Button onClick={onNext} disabled={!isStepValid}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={onSave} disabled={!isStepValid}>
              Add to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};