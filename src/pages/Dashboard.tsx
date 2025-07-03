import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Grip, Loader2 } from 'lucide-react';
import { WidgetConfigModal } from '@/components/WidgetConfigModal';
import { WidgetConfig } from '@/components/widget-config/types';
import { AIInsightWidget } from '@/components/AIInsightWidget';
import { AIInsightExpandedView } from '@/components/AIInsightExpandedView';
import { useWidgets, Widget } from '@/hooks/useWidgets';

const Dashboard: React.FC = () => {
  const { widgets, loading, addWidget, removeWidget } = useWidgets();
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [showExpandedInsights, setShowExpandedInsights] = useState(false);

  const handleAddWidget = async (config: WidgetConfig) => {
    await addWidget(config);
    setShowWidgetConfig(false);
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading widgets...</span>
          </div>
        ) : widgets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No widgets yet. Add your first widget to get started!</p>
            <Button onClick={() => setShowWidgetConfig(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Widget
            </Button>
          </div>
        ) : null}

        <WidgetConfigModal
          open={showWidgetConfig}
          onOpenChange={setShowWidgetConfig}
          onSave={handleAddWidget}
        />

        {showExpandedInsights && (
          <AIInsightExpandedView 
            onClose={() => setShowExpandedInsights(false)}
          />
        )}
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
            <p className="text-xs text-muted-foreground">
              {widget.data.change} {widget.data.label || ''}
            </p>
          </div>
        )}
        {widget.type === 'chart' && (
          <div className="space-y-2">
            {widget.app === 'google-analytics' ? (
              <>
                <div className="flex justify-between text-sm">
                  <span>Sessions: {widget.data.sessions?.toLocaleString()}</span>
                  <span>Users: {widget.data.users?.toLocaleString()}</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(widget.data.sessions / (widget.data.sessions + widget.data.users)) * 100}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
        {widget.type === 'table' && (
          <div className="space-y-2">
            {Array.isArray(widget.data) && widget.data.map((row: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{row.customer || row.metric}</span>
                <span className="font-medium">
                  {row.amount || row.value}
                  {row.change && (
                    <span className={`ml-2 text-xs ${row.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {row.change}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Dashboard;
