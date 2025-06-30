
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, BarChart3, Users, DollarSign, Activity, Grip } from 'lucide-react';
import { WidgetConfigModal } from '@/components/WidgetConfigModal';
import { WidgetConfig } from '@/components/widget-config/types';

interface Widget {
  id: string;
  type: 'chart' | 'stat' | 'table';
  title: string;
  app: string;
  data: any;
  size: 'small' | 'medium' | 'large';
}

const mockWidgets: Widget[] = [
  {
    id: '1',
    type: 'stat',
    title: 'Total Revenue',
    app: 'Stripe',
    data: { value: '$12,345', change: '+12%' },
    size: 'small'
  },
  {
    id: '2',
    type: 'stat',
    title: 'Active Users',
    app: 'Google Analytics',
    data: { value: '2,847', change: '+5%' },
    size: 'small'
  },
  {
    id: '3',
    type: 'chart',
    title: 'Task Completion',
    app: 'Trello',
    data: { completed: 24, pending: 8 },
    size: 'medium'
  },
  {
    id: '4',
    type: 'table',
    title: 'Recent Orders',
    app: 'Shopify',
    data: [
      { id: '#1234', customer: 'John Doe', amount: '$99' },
      { id: '#1235', customer: 'Jane Smith', amount: '$149' },
    ],
    size: 'large'
  }
];

const Dashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>(mockWidgets);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);

  const addWidget = (config: WidgetConfig) => {
    const newWidget: Widget = {
      id: Date.now().toString(),
      type: config.widgetType as 'chart' | 'stat' | 'table',
      title: config.displaySettings.title,
      app: config.app,
      data: generateMockData(config.widgetType),
      size: config.displaySettings.size
    };
    setWidgets([...widgets, newWidget]);
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

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Monitor all your business metrics in one place</p>
          </div>
          <Button onClick={() => setShowWidgetConfig(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
        </div>

        {/* AI Insights Section */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Revenue Growth Detected</p>
                  <p className="text-sm text-muted-foreground">Your revenue has increased by 12% this month. Consider scaling your marketing efforts.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Task Bottleneck Identified</p>
                  <p className="text-sm text-muted-foreground">8 tasks have been pending for over a week. Review your workflow efficiency.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              onRemove={() => removeWidget(widget.id)}
            />
          ))}
        </div>

        <WidgetConfigModal
          open={showWidgetConfig}
          onOpenChange={setShowWidgetConfig}
          onSave={addWidget}
        />
      </div>
    </Layout>
  );
};

interface WidgetCardProps {
  widget: Widget;
  onRemove: () => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ widget, onRemove }) => {
  const getGridSpan = () => {
    switch (widget.size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      default: return 'col-span-1';
    }
  };

  return (
    <Card className={`group relative ${getGridSpan()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{widget.app}</Badge>
          <Grip className="w-4 h-4 text-muted-foreground cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardHeader>
      <CardContent>
        {widget.type === 'stat' && (
          <div>
            <div className="text-2xl font-bold">{widget.data.value}</div>
            <p className="text-xs text-green-500">{widget.data.change}</p>
          </div>
        )}
        {widget.type === 'chart' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed: {widget.data.completed}</span>
              <span>Pending: {widget.data.pending}</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${(widget.data.completed / (widget.data.completed + widget.data.pending)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        {widget.type === 'table' && (
          <div className="space-y-2">
            {widget.data.map((row: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{row.customer}</span>
                <span className="font-medium">{row.amount}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Dashboard;
