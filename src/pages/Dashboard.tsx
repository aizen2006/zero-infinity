import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, RefreshCw, TrendingUp, Users, DollarSign, Activity, Calendar, BarChart3 } from 'lucide-react';
import { WidgetConfigModal } from '@/components/WidgetConfigModal';
import { WidgetConfig } from '@/components/widget-config/types';
import { useWidgets, Widget } from '@/hooks/useWidgets';
import { 
  MetricCard, 
  ProgressWidget, 
  StatsGrid, 
  RecentActivity, 
  QuickActions 
} from '@/components/widgets/WidgetTemplates';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Dashboard: React.FC = () => {
  const { widgets, loading, addWidget, removeWidget, refreshWidgets } = useWidgets();
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);

  const handleAddWidget = async (config: WidgetConfig) => {
    await addWidget(config);
    setShowWidgetConfig(false);
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

  const chartData = [
    { name: 'Jan', value: 4000, users: 2400 },
    { name: 'Feb', value: 3000, users: 1398 },
    { name: 'Mar', value: 2000, users: 9800 },
    { name: 'Apr', value: 2780, users: 3908 },
    { name: 'May', value: 1890, users: 4800 },
    { name: 'Jun', value: 2390, users: 3800 }
  ];

  const pieData = [
    { name: 'Desktop', value: 400, color: 'hsl(var(--primary))' },
    { name: 'Mobile', value: 300, color: 'hsl(var(--secondary))' },
    { name: 'Tablet', value: 200, color: 'hsl(var(--accent))' },
    { name: 'Other', value: 100, color: 'hsl(var(--muted))' }
  ];

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
            <Button variant="outline" onClick={refreshWidgets}>
              <RefreshCw className="w-4 h-4 mr-2" />
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
            <MetricCard title="Total Revenue" data={sampleMetricData} size="small" />
            <MetricCard title="Active Users" data={{...sampleMetricData, value: '12,450', change: 8, icon: <Users className="h-4 w-4" />}} size="small" />
            <MetricCard title="Conversion Rate" data={{...sampleMetricData, value: '3.2%', change: -2, icon: <Activity className="h-4 w-4" />}} size="small" />
            <MetricCard title="Monthly Growth" data={{...sampleMetricData, value: '24.5%', change: 15, icon: <TrendingUp className="h-4 w-4" />}} size="small" />
          </div>

          {/* Second Row - Progress and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ProgressWidget title="Sales Target" data={sampleProgressData} size="medium" />
            <StatsGrid title="Key Performance Indicators" data={sampleStatsData} size="large" />
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

          {/* Fourth Row - Activity and Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <RecentActivity title="Recent Activity" data={sampleActivityData} size="large" />
            </div>
            <QuickActions title="Quick Actions" data={sampleActionsData} size="small" />
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

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading widgets...</span>
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