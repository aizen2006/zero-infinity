
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw } from 'lucide-react';
import { WidgetConfig } from './types';

interface WidgetPreviewProps {
  config: WidgetConfig;
}

export const WidgetPreview: React.FC<WidgetPreviewProps> = ({ config }) => {
  const getSizeClass = () => {
    switch (config.displaySettings.size) {
      case 'small': return 'w-full h-32';
      case 'medium': return 'w-full h-48';
      case 'large': return 'w-full h-64';
      default: return 'w-full h-48';
    }
  };

  const getColorClass = () => {
    const colorMap: Record<string, string> = {
      blue: 'border-blue-500',
      green: 'border-green-500',
      purple: 'border-purple-500',
      orange: 'border-orange-500',
      red: 'border-red-500',
      gray: 'border-gray-500',
    };
    return colorMap[config.displaySettings.color] || 'border-blue-500';
  };

  const renderWidgetContent = () => {
    if (!config.widgetType) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Select a widget type to see preview</p>
        </div>
      );
    }

    switch (config.widgetType) {
      case 'stat':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-3xl font-bold">1,234</div>
            <div className="text-sm text-muted-foreground">Sample Metric</div>
            <div className="text-sm text-green-500 mt-1">+12%</div>
          </div>
        );
      
      case 'table':
        return (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Sample Data</div>
            {config.dataFields.slice(0, 3).map((field, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{field}</span>
                <span className="text-muted-foreground">Value {index + 1}</span>
              </div>
            ))}
          </div>
        );
      
      case 'chart':
        return (
          <div className="flex items-end justify-center h-full space-x-1">
            {[40, 70, 50, 80, 60].map((height, index) => (
              <div
                key={index}
                className={`w-4 bg-${config.displaySettings.color}-500 rounded-t`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        );
      
      case 'ai-summary':
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium">AI Insights</div>
            <div className="text-xs text-muted-foreground">
              Based on your data, we've identified key trends and patterns...
            </div>
            <div className="flex space-x-1 mt-2">
              <Badge variant="secondary" className="text-xs">Trend Up</Badge>
              <Badge variant="secondary" className="text-xs">Action Needed</Badge>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Preview not available</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Live preview of your widget
      </div>
      
      <Card className={`${getSizeClass()} border-2 ${getColorClass()}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              {config.displaySettings.title || 'Widget Title'}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {config.app && (
                <Badge variant="outline" className="text-xs">
                  {config.app}
                </Badge>
              )}
              <RefreshCcw className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1">
          {renderWidgetContent()}
        </CardContent>
      </Card>
      
      {/* Configuration Summary */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div><strong>App:</strong> {config.app || 'Not selected'}</div>
        <div><strong>Type:</strong> {config.widgetType || 'Not selected'}</div>
        <div><strong>Fields:</strong> {config.dataFields.length} selected</div>
        <div><strong>Filters:</strong> {config.filters.length} applied</div>
        <div><strong>Refresh:</strong> Every {config.displaySettings.refreshRate} min</div>
      </div>
    </div>
  );
};
