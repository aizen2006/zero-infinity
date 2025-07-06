import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, RefreshCw, TrendingUp, Users, DollarSign, Activity, Calendar, BarChart3 } from 'lucide-react';
import { WidgetConfigModal } from '@/components/WidgetConfigModal';
import { WidgetConfig } from '@/components/widget-config/types';
import { useWidgets, Widget } from '@/hooks/useWidgets';
import { CalendarIntegration } from '@/components/CalendarIntegration';
import { 
  MetricCard, 
  ProgressWidget, 
  StatsGrid, 
  RecentActivity, 
  QuickActions 
} from '@/components/widgets/WidgetTemplates';
import { GmailWidget } from '@/components/widgets/GmailWidget';
import { AIInsightWidget } from '@/components/AIInsightWidget';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fetchRealTimeAnalytics, fetchSalesData, fetchSocialMediaData } from '@/services/enhancedIntegrationDataService';

const Dashboard: React.FC = () => {
  const { widgets, loading, addWidget, removeWidget, refreshWidgets } = useWidgets();
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [socialData, setSocialData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [analytics, sales, social] = await Promise.all([
        fetchRealTimeAnalytics(),
        fetchSalesData(),
        fetchSocialMediaData()
      ]);
      
      setAnalyticsData(analytics);
      setSalesData(sales);
      setSocialData(social);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddWidget = async (config: WidgetConfig) => {
    await addWidget(config);
    setShowWidgetConfig(false);
  };

  const handleRefresh = async () => {
    await Promise.all([refreshWidgets(), loadDashboardData()]);
  };

  // Enhanced data for widgets using real API data
  const getMetricData = () => {
    if (!analyticsData) {
      return {
        totalRevenue: { value: '$24,580', change: 12, icon: <DollarSign className="h-4 w-4" /> },
        activeUsers: { value: '12,450', change: 8, icon: <Users className="h-4 w-4" /> },
        conversionRate: { value: '3.2%', change: -2, icon: <Activity className="h-4 w-4" /> },
        bounceRate: { value: '42.3%', change: 15, icon: <TrendingUp className="h-4 w-4" /> }
      };
    }

    return {
      totalRevenue: {
        value: `$${analyticsData.revenue.toLocaleString()}`,
        change: 12,
        icon: <DollarSign className="h-4 w-4" />
      },
      activeUsers: {
        value: analyticsData.users.toLocaleString(),
        change: 8,
        icon: <Users className="h-4 w-4" />
      },
      conversionRate: {
        value: `${analyticsData.conversionRate.toFixed(1)}%`,
        change: -2,
        icon: <Activity className="h-4 w-4" />
      },
      bounceRate: {
        value: `${analyticsData.bounceRate.toFixed(1)}%`,
        change: 15,
        icon: <TrendingUp className="h-4 w-4" />
      }
    };
  };

  const getSalesProgressData = () => {
    if (!salesData) return { current: 12580, target: 20000 };
    return {
      current: salesData.totalRevenue,
      target: salesData.totalRevenue * 1.5 // 50% increase target
    };
  };

  const getStatsData = () => {
    if (!analyticsData) return {
      users: 15420,
      revenue: 48950,
      orders: 1250,
      pageViews: 89430
    };

    return {
      users: analyticsData.users,
      revenue: analyticsData.revenue,
      orders: salesData?.totalOrders || 0,
      pageViews: analyticsData.pageviews
    };
  };

  // Sample data for demo widgets
  const sampleMetricData = {
    value: '24,580',
    change: 12,
    icon: <TrendingUp className="h-4 w-4" />
  };

  const sampleProgressData = {
    current: 12580,
    target: 20000
  };

  const sampleStatsData = {
    users: 15420,
    revenue: 48950,
    orders: 1250,
    pageViews: 89430
  };

  const sampleActivityData = {
    activities: [
      { title: 'New user registration', time: '2 minutes ago', status: 'completed' },
      { title: 'Payment processed', time: '5 minutes ago', status: 'completed' },
      { title: 'Data sync pending', time: '10 minutes ago', status: 'pending' },
      { title: 'Report generated', time: '15 minutes ago', status: 'completed' },
      { title: 'Backup completed', time: '30 minutes ago', status: 'completed' }
    ]
  };

  const sampleActionsData = {
    actions: [
      { label: 'Sync Data', onClick: () => refreshWidgets() },
      { label: 'Export Report', onClick: () => console.log('Export') },
      { label: 'View Analytics', onClick: () => console.log('Analytics') },
      { label: 'Settings', onClick: () => console.log('Settings') }
    ]
  };

  const chartData = analyticsData?.trends?.daily?.slice(-6).map((item: any) => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    value: item.sessions,
    users: item.users
  })) || [
    { name: 'Jan', value: 4000, users: 2400 },
    { name: 'Feb', value: 3000, users: 1398 },
    { name: 'Mar', value: 2000, users: 9800 },
    { name: 'Apr', value: 2780, users: 3908 },
    { name: 'May', value: 1890, users: 4800 },
    { name: 'Jun', value: 2390, users: 3800 }
  ];

  const pieData = analyticsData?.userDemographics?.devices?.map((device: any, index: number) => ({
    name: device.device,
    value: device.users,
    color: ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'][index] || 'hsl(var(--muted))'
  })) || [
    { name: 'Desktop', value: 400, color: 'hsl(var(--primary))' },
    { name: 'Mobile', value: 300, color: 'hsl(var(--secondary))' },
    { name: 'Tablet', value: 200, color: 'hsl(var(--accent))' },
    { name: 'Other', value: 100, color: 'hsl(var(--muted))' }
  ];

  const metrics = getMetricData();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Business Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Monitor all your business metrics in one place with AI-powered insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={loadingData}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowWidgetConfig(true)} className="shadow-elegant">
              <Plus className="w-4 h-4 mr-2" />
              Add Widget
            </Button>
          </div>
        </div>

        {/* Demo Widgets Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <Badge variant="secondary" className="text-sm">Live Data</Badge>
          </div>
          
          {/* Top Row - Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Total Revenue" data={metrics.totalRevenue} size="small" />
            <MetricCard title="Active Users" data={metrics.activeUsers} size="small" />
            <MetricCard title="Conversion Rate" data={metrics.conversionRate} size="small" />
            <MetricCard title="Bounce Rate" data={metrics.bounceRate} size="small" />
          </div>

          {/* Second Row - Progress and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ProgressWidget title="Sales Target" data={getSalesProgressData()} size="medium" />
            <StatsGrid title="Key Performance Indicators" data={getStatsData()} size="large" />
          </div>

          {/* Third Row - Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-elegant)'
                      }} 
                    />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Traffic Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Fourth Row - Activity, Actions, Gmail and AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            <div className="lg:col-span-2">
              <RecentActivity title="Recent Activity" data={sampleActivityData} size="large" />
            </div>
            <QuickActions title="Quick Actions" data={sampleActionsData} size="small" />
            <div className="lg:col-span-2">
              <GmailWidget size="medium" />
            </div>
            <AIInsightWidget size="small" />
          </div>

          {/* Fifth Row - Calendar and AI Insights Expanded */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CalendarIntegration />
            </div>
            <AIInsightWidget size="medium" />
          </div>
        </div>

        {/* User Widgets Section */}
        {widgets.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Custom Widgets</h2>
              <Badge variant="outline">{widgets.length} widgets</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {widgets.map((widget) => (
                <EnhancedWidgetCard
                  key={widget.id}
                  widget={widget}
                  onRemove={() => removeWidget(widget.id)}
                />
              ))}
            </div>
          </div>
        )}

        {(loading || loadingData) && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">
              {loadingData ? 'Loading dashboard data...' : 'Loading widgets...'}
            </span>
          </div>
        )}

        <WidgetConfigModal
          open={showWidgetConfig}
          onOpenChange={setShowWidgetConfig}
          onSave={handleAddWidget}
        />
      </div>
    </Layout>
  );
};

interface EnhancedWidgetCardProps {
  widget: Widget;
  onRemove: () => void;
}

const EnhancedWidgetCard: React.FC<EnhancedWidgetCardProps> = ({ widget, onRemove }) => {
  const getGridSpan = () => {
    switch (widget.size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'md:col-span-2';
      case 'large': return 'lg:col-span-3';
      default: return 'col-span-1';
    }
  };

  return (
    <Card className={`group relative ${getGridSpan()} shadow-elegant hover:shadow-glow transition-all duration-300 border-l-4 border-l-primary`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium bg-gradient-primary bg-clip-text text-transparent">
          {widget.title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{widget.app}</Badge>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={onRemove}
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {widget.type === 'stat' && (
          <div className="space-y-2">
            <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {widget.data.value}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={widget.data.change?.startsWith('+') ? 'default' : 'destructive'} className="text-xs">
                {widget.data.change}
              </Badge>
              <span className="text-xs text-muted-foreground">{widget.data.label || ''}</span>
            </div>
          </div>
        )}
        
        {widget.type === 'chart' && (
          <div className="space-y-3">
            {widget.app === 'google-analytics' ? (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-lg font-semibold">{widget.data.sessions?.toLocaleString()}</div>
                    <div className="text-muted-foreground">Sessions</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{widget.data.users?.toLocaleString()}</div>
                    <div className="text-muted-foreground">Users</div>
                  </div>
                </div>
                <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-primary h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${(widget.data.sessions / (widget.data.sessions + widget.data.users)) * 100}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-lg font-semibold">{widget.data.completed}</div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{widget.data.pending}</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                </div>
                <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-primary h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${(widget.data.completed / (widget.data.completed + widget.data.pending)) * 100}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>
        )}
        
        {widget.type === 'table' && (
          <div className="space-y-3">
            {Array.isArray(widget.data) && widget.data.slice(0, 4).map((row: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-accent/50 transition-colors">
                <span className="font-medium">{row.customer || row.metric}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{row.amount || row.value}</span>
                  {row.change && (
                    <Badge variant={row.change.startsWith('+') ? 'default' : 'destructive'} className="text-xs">
                      {row.change}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Dashboard;