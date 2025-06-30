
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';
import { WidgetConfig, App } from './types';

interface AppSelectionStepProps {
  config: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
}

const mockApps: App[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    icon: '📧',
    connected: true,
    fields: ['Subject', 'Sender', 'Date', 'Priority', 'Read Status']
  },
  {
    id: 'trello',
    name: 'Trello',
    icon: '📋',
    connected: true,
    fields: ['Card Name', 'List', 'Due Date', 'Members', 'Labels', 'Progress']
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    icon: '📊',
    connected: true,
    fields: ['Column A', 'Column B', 'Column C', 'Row Count', 'Last Updated']
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    connected: false,
    fields: ['Channel', 'Message', 'User', 'Timestamp', 'Reactions']
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    connected: false,
    fields: ['Repository', 'Issues', 'Pull Requests', 'Commits', 'Contributors']
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: '🛍️',
    connected: true,
    fields: ['Orders', 'Products', 'Revenue', 'Customers', 'Inventory']
  }
];

export const AppSelectionStep: React.FC<AppSelectionStepProps> = ({
  config,
  setConfig
}) => {
  const handleAppSelect = (appId: string) => {
    setConfig({ ...config, app: appId });
  };

  const handleConnect = (appId: string) => {
    // Simulate connection - in real app, this would trigger OAuth
    console.log(`Connecting to ${appId}...`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockApps.map((app) => (
          <Card
            key={app.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              config.app === app.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => app.connected && handleAppSelect(app.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{app.icon}</div>
                  <div>
                    <h4 className="font-medium">{app.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {app.fields.length} data fields available
                    </p>
                  </div>
                </div>
                {config.app === app.id && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                {app.connected ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Connected
                  </Badge>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Not Connected</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect(app.id);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Connect
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {config.app && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Selected App</h4>
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {mockApps.find(app => app.id === config.app)?.icon}
            </span>
            <span className="font-medium">
              {mockApps.find(app => app.id === config.app)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
