import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { WidgetConfig } from './types';

interface AppSelectionStepProps {
  config: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
}

const availableApps = [
  {
    id: 'stripe',
    name: 'Stripe',
    type: 'payment',
    description: 'Payment processing and revenue analytics',
    icon: '💳',
    connected: true
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    type: 'marketing',
    description: 'Email marketing campaigns and analytics',
    icon: '📧',
    connected: true
  },
  {
    id: 'trello',
    name: 'Trello',
    type: 'project',
    description: 'Project management and task tracking',
    icon: '📋',
    connected: false
  },
  {
    id: 'analytics',
    name: 'Google Analytics',
    type: 'analytics',
    description: 'Website traffic and user behavior',
    icon: '📊',
    connected: true
  }
];

export const AppSelectionStep: React.FC<AppSelectionStepProps> = ({ config, setConfig }) => {
  const handleAppSelect = (appId: string) => {
    setConfig({ ...config, app: appId });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {availableApps.map((app) => (
          <Card
            key={app.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              config.app === app.id ? 'ring-2 ring-primary shadow-md' : ''
            } ${!app.connected ? 'opacity-50' : ''}`}
            onClick={() => app.connected && handleAppSelect(app.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{app.icon}</span>
                  <div>
                    <h3 className="font-medium">{app.name}</h3>
                    <p className="text-sm text-muted-foreground">{app.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {app.connected ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Connected</Badge>
                  )}
                  {config.app === app.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};