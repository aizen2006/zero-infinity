
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppSelectionStep } from './widget-config/AppSelectionStep';
import { WidgetTypeStep } from './widget-config/WidgetTypeStep';
import { DataFieldsStep } from './widget-config/DataFieldsStep';
import { FiltersStep } from './widget-config/FiltersStep';
import { DisplaySettingsStep } from './widget-config/DisplaySettingsStep';
import { WidgetPreview } from './widget-config/WidgetPreview';
import { WidgetConfig } from './widget-config/types';

interface WidgetConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: WidgetConfig) => void;
}

const steps = [
  { id: 1, title: 'Choose App', description: 'Select your data source' },
  { id: 2, title: 'Widget Type', description: 'Pick visualization style' },
  { id: 3, title: 'Data Fields', description: 'Choose what to display' },
  { id: 4, title: 'Filters', description: 'Set display conditions' },
  { id: 5, title: 'Display', description: 'Customize appearance' },
];

export const WidgetConfigModal: React.FC<WidgetConfigModalProps> = ({
  open,
  onOpenChange,
  onSave
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<WidgetConfig>({
    app: '',
    widgetType: '',
    dataFields: [],
    filters: [],
    displaySettings: {
      title: '',
      size: 'medium',
      color: 'blue',
      refreshRate: 5
    }
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    onSave(config);
    onOpenChange(false);
    setCurrentStep(1);
    setConfig({
      app: '',
      widgetType: '',
      dataFields: [],
      filters: [],
      displaySettings: {
        title: '',
        size: 'medium',
        color: 'blue',
        refreshRate: 5
      }
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return config.app !== '';
      case 2: return config.widgetType !== '';
      case 3: return config.dataFields.length > 0;
      case 4: return true; // Filters are optional
      case 5: return config.displaySettings.title !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <AppSelectionStep config={config} setConfig={setConfig} />;
      case 2:
        return <WidgetTypeStep config={config} setConfig={setConfig} />;
      case 3:
        return <DataFieldsStep config={config} setConfig={setConfig} />;
      case 4:
        return <FiltersStep config={config} setConfig={setConfig} />;
      case 5:
        return <DisplaySettingsStep config={config} setConfig={setConfig} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Left Panel - Configuration */}
          <div className="flex-1 flex flex-col">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-2xl font-bold">Add New Widget</DialogTitle>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Step {currentStep} of {steps.length}
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round((currentStep / steps.length) * 100)}%
                  </span>
                </div>
                <Progress value={(currentStep / steps.length) * 100} className="h-2" />
              </div>
            </DialogHeader>

            {/* Step Navigation */}
            <div className="px-6 pb-4">
              <div className="flex items-center space-x-2 text-sm">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
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
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 px-6 pb-6 overflow-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {steps[currentStep - 1].title}
                    </h3>
                    <p className="text-muted-foreground">
                      {steps[currentStep - 1].description}
                    </p>
                  </div>
                  {renderStep()}
                </CardContent>
              </Card>
            </div>

            {/* Navigation Buttons */}
            <div className="p-6 border-t bg-muted/50">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  {currentStep < steps.length ? (
                    <Button onClick={handleNext} disabled={!isStepValid()}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleSave} disabled={!isStepValid()}>
                      Add to Dashboard
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-96 border-l bg-muted/20">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
              <WidgetPreview config={config} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
