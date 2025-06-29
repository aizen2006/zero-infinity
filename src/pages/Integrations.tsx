
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ExternalLink, CheckCircle, Circle } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
  logo: string;
  color: string;
}

const integrations: Integration[] = [
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track website traffic and user behavior',
    category: 'Analytics',
    connected: true,
    logo: '📊',
    color: 'bg-orange-500'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and financial data',
    category: 'Finance',
    connected: true,
    logo: '💳',
    color: 'bg-purple-500'
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Project management and task tracking',
    category: 'Productivity',
    connected: false,
    logo: '📋',
    color: 'bg-blue-500'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    category: 'Communication',
    connected: true,
    logo: '💬',
    color: 'bg-green-500'
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code repository and development metrics',
    category: 'Development',
    connected: false,
    logo: '🐱',
    color: 'bg-gray-500'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'E-commerce sales and inventory data',
    category: 'E-commerce',
    connected: false,
    logo: '🛍️',
    color: 'bg-emerald-500'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing campaigns and analytics',
    category: 'Marketing',
    connected: false,
    logo: '📧',
    color: 'bg-yellow-500'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Customer relationship management',
    category: 'CRM',
    connected: false,
    logo: '☁️',
    color: 'bg-blue-600'
  }
];

const Integrations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [apps, setApps] = useState(integrations);

  const categories = ['All', ...Array.from(new Set(integrations.map(app => app.category)))];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleConnection = (id: string) => {
    setApps(apps.map(app => 
      app.id === id ? { ...app, connected: !app.connected } : app
    ));
  };

  const connectedCount = apps.filter(app => app.connected).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your favorite apps to centralize your data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-500">{connectedCount}</div>
              <p className="text-sm text-muted-foreground">Connected Apps</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-500">{integrations.length - connectedCount}</div>
              <p className="text-sm text-muted-foreground">Available Apps</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-500">{integrations.length}</div>
              <p className="text-sm text-muted-foreground">Total Integrations</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <Card key={app.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${app.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {app.logo}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {app.category}
                      </Badge>
                    </div>
                  </div>
                  {app.connected ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {app.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleConnection(app.id)}
                    className="flex-1"
                    variant={app.connected ? 'outline' : 'default'}
                  >
                    {app.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Integrations;
