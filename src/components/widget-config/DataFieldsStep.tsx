import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { WidgetConfig } from './types';

interface DataFieldsStepProps {
  config: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
}

const getFieldsForApp = (app: string) => {
  switch (app) {
    case 'stripe':
      return [
        { id: 'revenue', name: 'Revenue', type: 'currency', description: 'Total revenue amount' },
        { id: 'transactions', name: 'Transactions', type: 'number', description: 'Number of transactions' },
        { id: 'customers', name: 'Customers', type: 'number', description: 'Total customers' },
        { id: 'mrr', name: 'Monthly Recurring Revenue', type: 'currency', description: 'MRR growth' }
      ];
    case 'mailchimp':
      return [
        { id: 'subscribers', name: 'Subscribers', type: 'number', description: 'Total subscribers' },
        { id: 'open_rate', name: 'Open Rate', type: 'percentage', description: 'Email open rate' },
        { id: 'click_rate', name: 'Click Rate', type: 'percentage', description: 'Email click rate' },
        { id: 'campaigns', name: 'Campaigns', type: 'number', description: 'Active campaigns' }
      ];
    case 'trello':
      return [
        { id: 'tasks', name: 'Tasks', type: 'number', description: 'Total tasks' },
        { id: 'completed', name: 'Completed', type: 'number', description: 'Completed tasks' },
        { id: 'overdue', name: 'Overdue', type: 'number', description: 'Overdue tasks' },
        { id: 'progress', name: 'Progress', type: 'percentage', description: 'Overall progress' }
      ];
    case 'analytics':
      return [
        { id: 'visitors', name: 'Visitors', type: 'number', description: 'Unique visitors' },
        { id: 'sessions', name: 'Sessions', type: 'number', description: 'Total sessions' },
        { id: 'bounce_rate', name: 'Bounce Rate', type: 'percentage', description: 'Bounce rate' },
        { id: 'conversion', name: 'Conversion Rate', type: 'percentage', description: 'Conversion rate' }
      ];
    default:
      return [];
  }
};

export const DataFieldsStep: React.FC<DataFieldsStepProps> = ({ config, setConfig }) => {
  const availableFields = getFieldsForApp(config.app);

  const handleFieldToggle = (fieldId: string) => {
    const currentFields = config.dataFields || [];
    const isSelected = currentFields.includes(fieldId);
    
    const newFields = isSelected
      ? currentFields.filter(id => id !== fieldId)
      : [...currentFields, fieldId];
    
    setConfig({ ...config, dataFields: newFields });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Select the data fields you want to display in your widget:
      </div>
      
      <div className="space-y-3">
        {availableFields.map((field) => (
          <div
            key={field.id}
            className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              id={field.id}
              checked={config.dataFields?.includes(field.id) || false}
              onCheckedChange={() => handleFieldToggle(field.id)}
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <label
                  htmlFor={field.id}
                  className="text-sm font-medium cursor-pointer"
                >
                  {field.name}
                </label>
                <Badge variant="outline" className="text-xs">
                  {field.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{field.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};