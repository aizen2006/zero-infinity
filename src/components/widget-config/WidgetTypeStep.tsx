
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { WidgetConfig, WidgetType } from './types';

interface WidgetTypeStepProps {
  config: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
}

const widgetTypes: WidgetType[] = [
  {
    id: 'stat',
    name: 'Stat Card',
    icon: '📊',
    description: 'Display key metrics and numbers with optional trend indicators'
  },
  {
    id: 'table',
    name: 'Data Table',
    icon: '📋',
    description: 'Show structured data in rows and columns with sorting and filtering'
  },
  {
    id: 'chart',
    name: 'Chart',
    icon: '📈',
    description: 'Visualize data trends with bar charts, line graphs, or pie charts'
  },
  {
    id: 'ai-summary',
    name: 'AI Summary',
    icon: '🤖',
    description: 'Generate intelligent insights and summaries from your data'
  }
];

export const WidgetTypeStep: React.FC<WidgetTypeStepProps> = ({
  config,
  setConfig
}) => {
  const handleTypeSelect = (typeId: string) => {
    setConfig({ ...config, widgetType: typeId });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {widgetTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              config.widgetType === type.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleTypeSelect(type.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="text-4xl">{type.icon}</div>
                <div>
                  <h4 className="font-semibold text-lg">{type.name}</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    {type.description}
                  </p>
                </div>
                {config.widgetType === type.id && (
                  <div className="mt-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {config.widgetType && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Selected Widget Type</h4>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {widgetTypes.find(type => type.id === config.widgetType)?.icon}
            </span>
            <div>
              <span className="font-medium">
                {widgetTypes.find(type => type.id === config.widgetType)?.name}
              </span>
              <p className="text-sm text-muted-foreground">
                {widgetTypes.find(type => type.id === config.widgetType)?.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
