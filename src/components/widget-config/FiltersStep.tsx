import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { WidgetConfig } from './types';

interface FiltersStepProps {
  config: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
}

export const FiltersStep: React.FC<FiltersStepProps> = ({ config, setConfig }) => {
  const addFilter = () => {
    const newFilter = {
      field: '',
      operator: 'equals',
      value: ''
    };
    setConfig({
      ...config,
      filters: [...(config.filters || []), newFilter]
    });
  };

  const removeFilter = (index: number) => {
    const newFilters = (config.filters || []).filter((_, i) => i !== index);
    setConfig({ ...config, filters: newFilters });
  };

  const updateFilter = (index: number, field: string, value: string) => {
    const newFilters = [...(config.filters || [])];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setConfig({ ...config, filters: newFilters });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Add filters to customize what data is displayed (optional):
      </div>

      <div className="space-y-3">
        {(config.filters || []).map((filter, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
            <Select
              value={filter.field}
              onValueChange={(value) => updateFilter(index, 'field', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filter.operator}
              onValueChange={(value) => updateFilter(index, 'operator', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="greater">Greater than</SelectItem>
                <SelectItem value="less">Less than</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Value"
              value={filter.value}
              onChange={(e) => updateFilter(index, 'value', e.target.value)}
              className="flex-1"
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFilter(index)}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addFilter} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Filter
      </Button>
    </div>
  );
};