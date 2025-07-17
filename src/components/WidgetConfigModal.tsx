
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { AppSelectionStep } from './widget-config/AppSelectionStep';
import { WidgetTypeStep } from './widget-config/WidgetTypeStep';
import { DataFieldsStep } from './widget-config/DataFieldsStep';
import { FiltersStep } from './widget-config/FiltersStep';
import { DisplaySettingsStep } from './widget-config/DisplaySettingsStep';
import { WidgetPreview } from './widget-config/WidgetPreview';
import { WidgetConfigProgress } from './widget-config/WidgetConfigProgress';
import { WidgetConfigNavigation } from './widget-config/WidgetConfigNavigation';
import { WidgetConfigButtons } from './widget-config/WidgetConfigButtons';
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
      <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col" aria-describedby="widget-config-description">
        <div className="flex flex-1 min-h-0">
          {/* Left Panel - Configuration */}
          <div className="flex-1 flex flex-col min-h-0">
            <DialogHeader className="p-6 pb-4 flex-shrink-0">
              <DialogTitle className="text-2xl font-bold">Add New Widget</DialogTitle>
              <div id="widget-config-description" className="text-sm text-muted-foreground">
                Create and customize a new widget for your dashboard with data from connected apps.
              </div>
              <WidgetConfigProgress
                currentStep={currentStep} 
                totalSteps={steps.length} 
              />
            </DialogHeader>

            {/* Step Navigation */}
            <WidgetConfigNavigation 
              steps={steps} 
              currentStep={currentStep} 
            />

            {/* Step Content */}
            <div className="flex-1 px-6 pb-6 overflow-y-auto min-h-0">
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
            <WidgetConfigButtons
              currentStep={currentStep}
              totalSteps={steps.length}
              isStepValid={isStepValid()}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onCancel={() => onOpenChange(false)}
              onSave={handleSave}
            />
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
