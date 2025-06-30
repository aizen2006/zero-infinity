
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { WidgetConfig } from './types';

interface DisplaySettingsStepProps {
  config: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
}

const colorOptions = [
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'green', label: 'Green', color: 'bg-green-500' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
  { value: 'gray', label: 'Gray', color: 'bg-gray-500' },
];

export const DisplaySettingsStep: React.FC<DisplaySettingsStepProps> = ({
  config,
  setConfig
}) => {
  const handleDisplaySettingChange = (key: string, value: any) => {
    setConfig({
      ...config,
      displaySettings: {
        ...config.displaySettings,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Widget Title */}
          <div>
            <Label htmlFor="title">Widget Title</Label>
            <Input
              id="title"
              value={config.displaySettings.title}
              onChange={(e) => handleDisplaySettingChange('title', e.target.value)}
              placeholder="Enter widget title"
              className="mt-2"
            />
          </div>

          {/* Widget Size */}
          <div>
            <Label>Widget Size</Label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {[
                { value: 'small', label: 'Small', description: '1 column' },
                { value: 'medium', label: 'Medium', description: '2 columns' },
                { value: 'large', label: 'Large', description: '3 columns' }
              ].map((size) => (
                <Card
                  key={size.value}
                  className={`cursor-pointer transition-all ${
                    config.displaySettings.size === size.value
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleDisplaySettingChange('size', size.value)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="font-medium">{size.label}</div>
                    <div className="text-sm text-muted-foreground">{size.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Color Theme */}
          <div>
            <Label>Color Theme</Label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {colorOptions.map((color) => (
                <Card
                  key={color.value}
                  className={`cursor-pointer transition-all ${
                    config.displaySettings.color === color.value
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleDisplaySettingChange('color', color.value)}
                >
                  <CardContent className="p-3 flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${color.color}`} />
                    <span className="text-sm font-medium">{color.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Refresh Rate */}
          <div>
            <Label>Auto-refresh Rate (minutes)</Label>
            <div className="mt-4 px-3">
              <Slider
                value={[config.displaySettings.refreshRate]}
                onValueChange={(value) => handleDisplaySettingChange('refreshRate', value[0])}
                max={60}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 min</span>
                <span className="font-medium">
                  {config.displaySettings.refreshRate} minutes
                </span>
                <span>60 min</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Summary */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Settings Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Title:</span>
              <span className="ml-2 font-medium">
                {config.displaySettings.title || 'Untitled Widget'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Size:</span>
              <span className="ml-2 font-medium capitalize">
                {config.displaySettings.size}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Color:</span>
              <span className="ml-2 font-medium capitalize">
                {config.displaySettings.color}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Refresh:</span>
              <span className="ml-2 font-medium">
                Every {config.displaySettings.refreshRate} min
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
