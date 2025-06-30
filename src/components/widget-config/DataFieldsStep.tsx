
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WidgetConfig } from './types';

interface DataFieldsStepProps {
  config: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
}

const getFieldsForApp = (app: string): string[] => {
  const fieldMap: Record<string, string[]> = {
    'gmail': ['Subject', 'Sender', 'Date', 'Priority', 'Read Status', 'Attachments'],
    'trello': ['Card Name', 'List', 'Due Date', 'Members', 'Labels', 'Progress', 'Comments'],
    'google-sheets': ['Column A', 'Column B', 'Column C', 'Row Count', 'Last Updated', 'Formula Results'],
    'shopify': ['Orders', 'Products', 'Revenue', 'Customers', 'Inventory', 'Order Status'],
    'slack': ['Channel', 'Message', 'User', 'Timestamp', 'Reactions', 'Thread Count'],
    'github': ['Repository', 'Issues', 'Pull Requests', 'Commits', 'Contributors', 'Stars']
  };
  
  return fieldMap[app] || [];
};

export const DataFieldsStep: React.FC<DataFieldsStepProps> = ({
  config,
  setConfig
}) => {
  const availableFields = getFieldsForApp(config.app);

  const handleFieldToggle = (field: string) => {
    const updatedFields = config.dataFields.includes(field)
      ? config.dataFields.filter(f => f !== field)
      : [...config.dataFields, field];
    
    setConfig({ ...config, dataFields: updatedFields });
  };

  const handleSelectAll = () => {
    setConfig({ ...config, dataFields: availableFields });
  };

  const handleSelectNone = () => {
    setConfig({ ...config, dataFields: [] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Available Data Fields</h4>
          <p className="text-sm text-muted-foreground">
            Select the fields you want to display in your widget
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-sm text-primary hover:underline"
          >
            Select All
          </button>
          <button
            onClick={handleSelectNone}
            className="text-sm text-muted-foreground hover:underline"
          >
            Select None
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableFields.map((field) => (
              <div key={field} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
                <Checkbox
                  id={field}
                  checked={config.dataFields.includes(field)}
                  onCheckedChange={() => handleFieldToggle(field)}
                />
                <label
                  htmlFor={field}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {field}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {config.dataFields.length > 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3">Selected Fields ({config.dataFields.length})</h4>
          <div className="flex flex-wrap gap-2">
            {config.dataFields.map((field) => (
              <Badge key={field} variant="secondary">
                {field}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
