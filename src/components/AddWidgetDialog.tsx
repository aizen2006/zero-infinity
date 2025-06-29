
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (widget: any) => void;
}

const apps = [
  'Stripe', 'Google Analytics', 'Trello', 'Shopify', 'Slack', 'GitHub'
];

export const AddWidgetDialog: React.FC<AddWidgetDialogProps> = ({
  open,
  onOpenChange,
  onAdd
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [app, setApp] = useState('');
  const [size, setSize] = useState('small');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !type || !app) return;

    onAdd({
      title,
      type,
      app,
      size,
      data: generateMockData(type)
    });

    setTitle('');
    setType('');
    setApp('');
    setSize('small');
    onOpenChange(false);
  };

  const generateMockData = (widgetType: string) => {
    switch (widgetType) {
      case 'stat':
        return { value: '$1,234', change: '+8%' };
      case 'chart':
        return { completed: 15, pending: 5 };
      case 'table':
        return [
          { id: '#001', name: 'Item 1', value: '$50' },
          { id: '#002', name: 'Item 2', value: '$75' }
        ];
      default:
        return {};
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Widget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Widget Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter widget title"
            />
          </div>
          
          <div>
            <Label htmlFor="app">Connected App</Label>
            <Select value={app} onValueChange={setApp}>
              <SelectTrigger>
                <SelectValue placeholder="Select an app" />
              </SelectTrigger>
              <SelectContent>
                {apps.map((appName) => (
                  <SelectItem key={appName} value={appName}>
                    {appName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Widget Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select widget type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stat">Stat Block</SelectItem>
                <SelectItem value="chart">Chart</SelectItem>
                <SelectItem value="table">Table</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="size">Widget Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Widget</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
