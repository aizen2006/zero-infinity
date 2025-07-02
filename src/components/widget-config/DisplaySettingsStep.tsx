import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WidgetConfig } from './types';

interface DisplaySettingsStepProps {
  config: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
}

export const DisplaySettingsStep: React.FC<DisplaySettingsStepProps> = ({ config, setConfig }) => {
  const updateDisplaySetting = (field: string, value: string | number) => {
    setConfig({
      ...config,
      displaySettings: {
        ...config.displaySettings,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Widget Title</Label>
        <Input
          id="title"
          placeholder="Enter widget title"
          value={config.displaySettings.title}
          onChange={(e) => updateDisplaySetting('title', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="size">Widget Size</Label>
        <Select
          value={config.displaySettings.size}
          onValueChange={(value) => updateDisplaySetting('size', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small (1 column)</SelectItem>
            <SelectItem value="medium">Medium (2 columns)</SelectItem>
            <SelectItem value="large">Large (3 columns)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color Theme</Label>
        <Select
          value={config.displaySettings.color}
          onValueChange={(value) => updateDisplaySetting('color', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blue">Blue</SelectItem>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="purple">Purple</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="refresh">Refresh Rate (minutes)</Label>
        <Select
          value={config.displaySettings.refreshRate?.toString()}
          onValueChange={(value) => updateDisplaySetting('refreshRate', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 minute</SelectItem>
            <SelectItem value="5">5 minutes</SelectItem>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};