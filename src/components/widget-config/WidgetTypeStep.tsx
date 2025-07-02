import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, BarChart3, Target, Table } from 'lucide-react';
import { WidgetConfig } from './types';

interface WidgetTypeStepProps {
  config: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
}

const widgetTypes = [
  {
    id: 'chart',
    name: 'Chart',
    description: 'Visual data representation with graphs and charts',
    icon: BarChart3,
    preview: '📊'
  },
  {
    id: 'stat',
    name: 'Statistic',
    description: 'Key metrics and KPIs with trend indicators',
    icon: Target,
    preview: '📈'
  },
  {
    id: 'table',
    name: 'Table',
    description: 'Structured data in rows and columns',
    icon: Table,
    preview: '📋'
  }
];

export const WidgetTypeStep: React.FC<WidgetTypeStepProps> = ({ config, setConfig }) => {
  const handleTypeSelect = (type: string) => {
    setConfig({ ...config, widgetType: type });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {widgetTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                config.widgetType === type.id ? 'ring-2 ring-primary shadow-md' : ''
              }`}
              onClick={() => handleTypeSelect(type.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{type.name}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{type.preview}</span>
                    {config.widgetType === type.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};