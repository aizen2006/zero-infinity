
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ExternalLink, CheckCircle, Circle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [apps, setApps] = useState(integrations);
  const [userIntegrations, setUserIntegrations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = ['All', ...Array.from(new Set(integrations.map(app => app.category)))];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const fetchUserIntegrations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('app_name')
        .eq('user_id', user.id)
        .eq('is_connected', true);
      
      if (error) throw error;
      
      const connectedApps = data.map(integration => integration.app_name);
      setUserIntegrations(connectedApps);
      
      // Update apps with real connection status
      setApps(integrations.map(app => ({
        ...app,
        connected: connectedApps.includes(app.id)
      })));
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const handleGoogleAnalyticsAuth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-analytics-auth', {
        body: { action: 'initiate' }
      });

      if (error) throw error;

      const authWindow = window.open(
        data.authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for auth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          toast({
            title: "Google Analytics Connected!",
            description: "Successfully connected your Google Analytics account.",
          });
          fetchUserIntegrations();
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          toast({
            title: "Connection Failed",
            description: event.data.error || "Failed to connect Google Analytics.",
            variant: "destructive",
          });
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Clean up if window is closed manually
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);

    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "Failed to start Google Analytics authentication.",
        variant: "destructive",
      });
    }
  };

  const toggleConnection = async (id: string) => {
    if (!user) return;
    
    setLoading(true);
    const app = apps.find(a => a.id === id);
    if (!app) return;

    try {
      if (app.connected) {
        // Disconnect
        const { error } = await supabase
          .from('integrations')
          .update({ is_connected: false })
          .eq('user_id', user.id)
          .eq('app_name', id);
        
        if (error) throw error;
        
        toast({
          title: "Integration disconnected",
          description: `${app.name} has been disconnected successfully.`,
        });
      } else {
        // Handle Google Analytics OAuth flow
        if (id === 'google-analytics') {
          setLoading(false);
          await handleGoogleAnalyticsAuth();
          return;
        }

        // Regular connection for other apps
        const { error } = await supabase
          .from('integrations')
          .upsert({
            user_id: user.id,
            app_name: id,
            app_type: app.category.toLowerCase(),
            is_connected: true,
            config: {}
          });
        
        if (error) throw error;
        
        toast({
          title: "Integration connected",
          description: `${app.name} has been connected successfully.`,
        });
      }
      
      await fetchUserIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: "Error",
        description: "Failed to update integration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectedCount = apps.filter(app => app.connected).length;

  useEffect(() => {
    fetchUserIntegrations();
  }, [user]);

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
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : app.connected ? 'Disconnect' : 'Connect'}
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
