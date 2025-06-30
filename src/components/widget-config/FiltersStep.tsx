import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { WidgetConfig, Filter } from './types';

interface FiltersStepProps {
  config: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
}

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does Not Contain' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
];

export const FiltersStep: React.FC<FiltersStepProps> = ({
  config,
  setConfig
}) => {
  const [newFilter, setNewFilter] = useState<Filter>({
    field: '',
    operator: '',
    value: ''
  });

  const handleAddFilter = () => {
    if (newFilter.field && newFilter.operator && (newFilter.value || ['is_empty', 'is_not_empty'].includes(newFilter.operator))) {
      setConfig({
        ...config,
        filters: [...config.filters, newFilter]
      });
      setNewFilter({ field: '', operator: '', value: '' });
    }
  };

  const handleRemoveFilter = (index: number) => {
    const updatedFilters = config.filters.filter((_, i) => i !== index);
    setConfig({ ...config, filters: updatedFilters });
  };

  const availableFields = config.dataFields;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-2">Filter Rules</h4>
        <p className="text-sm text-muted-foreground">
          Add conditions to filter your data. Leave empty to show all data.
        </p>
      </div>

      {/* Add New Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="field">Field</Label>
                <Select
                  value={newFilter.field}
                  onValueChange={(value) => setNewFilter({ ...newFilter, field: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="operator">Condition</Label>
                <Select
                  value={newFilter.operator}
                  onValueChange={(value) => setNewFilter({ ...newFilter, operator: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={newFilter.value}
                  onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                  placeholder="Enter value"
                  disabled={['is_empty', 'is_not_empty'].includes(newFilter.operator)}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleAddFilter} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Filter
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Filters */}
      {config.filters.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Active Filters</h4>
          <div className="space-y-2">
            {config.filters.map((filter, index) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{filter.field}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {operators.find(op => op.value === filter.operator)?.label}
                      </span>
                      {filter.value && (
                        <Badge variant="secondary">{filter.value}</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFilter(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {config.filters.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No filters applied. All data will be displayed.</p>
        </div>
      )}
    </div>
  );
};
