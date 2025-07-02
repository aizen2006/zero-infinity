import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WidgetConfig } from './types';

interface WidgetPreviewProps {
  config: WidgetConfig;
}

export const WidgetPreview: React.FC<WidgetPreviewProps> = ({ config }) => {
  const getSizeClasses = () => {
    switch (config.displaySettings.size) {
      case 'small': return 'w-48 h-32';
      case 'medium': return 'w-64 h-40';
      case 'large': return 'w-80 h-48';
      default: return 'w-64 h-40';
    }
  };

  const getColorClasses = () => {
    switch (config.displaySettings.color) {
      case 'blue': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20';
      case 'green': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20';
      case 'purple': return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20';
      case 'orange': return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20';
    }
  };

  const renderPreviewContent = () => {
    if (!config.widgetType) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Select a widget type
        </div>
      );
    }

    switch (config.widgetType) {
      case 'stat':
        return (
          <div className="space-y-2">
            <div className="text-2xl font-bold">$12,345</div>
            <p className="text-xs text-green-600">+15% this month</p>
          </div>
        );
      case 'chart':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed: 75</span>
              <span>Pending: 25</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full">
              <div className="bg-primary h-2 rounded-full w-3/4"></div>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Item 1</span>
              <span>$100</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Item 2</span>
              <span>$200</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card className={`${getSizeClasses()} ${getColorClasses()} transition-all duration-200`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            {config.displaySettings.title || 'Widget Title'}
            {config.app && (
              <Badge variant="secondary" className="text-xs">
                {config.app}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          {renderPreviewContent()}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground space-y-1">
        <div>Type: {config.widgetType || 'Not selected'}</div>
        <div>Size: {config.displaySettings.size || 'medium'}</div>
        <div>Fields: {config.dataFields?.length || 0} selected</div>
        <div>Filters: {config.filters?.length || 0} applied</div>
      </div>
    </div>
  );
};