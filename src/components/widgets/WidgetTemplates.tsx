import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart,
  Eye,
  Clock,
  Star
} from 'lucide-react';

interface WidgetData {
  [key: string]: any;
}

interface TemplateProps {
  title: string;
  data: WidgetData;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const MetricCard: React.FC<TemplateProps> = ({ title, data, size = 'medium' }) => {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-3'
  };

  const trend = data.change > 0 ? 'up' : 'down';
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <Card className={`${sizeClasses[size]} shadow-elegant hover:shadow-glow transition-all duration-300 border-l-4 border-l-primary`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
          {data.icon || <DollarSign className="h-4 w-4 text-primary-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {data.value}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
            <TrendIcon className="h-3 w-3" />
            {Math.abs(data.change)}%
          </div>
          <span className="text-xs text-muted-foreground">from last period</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProgressWidget: React.FC<TemplateProps> = ({ title, data, size = 'medium' }) => {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-3'
  };

  const percentage = (data.current / data.target) * 100;

  return (
    <Card className={`${sizeClasses[size]} shadow-elegant hover:shadow-glow transition-all duration-300`}>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {title}
          <Badge variant="secondary">{Math.round(percentage)}%</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current</span>
            <span className="font-medium">{data.current.toLocaleString()}</span>
          </div>
          <Progress value={percentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>Target: {data.target.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const StatsGrid: React.FC<TemplateProps> = ({ title, data, size = 'large' }) => {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-4'
  };

  const stats = [
    { label: 'Total Users', value: data.users || 0, icon: Users, change: 12 },
    { label: 'Revenue', value: `$${(data.revenue || 0).toLocaleString()}`, icon: DollarSign, change: 8 },
    { label: 'Orders', value: data.orders || 0, icon: ShoppingCart, change: -3 },
    { label: 'Page Views', value: (data.pageViews || 0).toLocaleString(), icon: Eye, change: 15 }
  ];

  return (
    <Card className={`${sizeClasses[size]} shadow-elegant`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const trend = stat.change > 0 ? 'up' : 'down';
            const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
            
            return (
              <div key={index} className="space-y-3 text-center p-6 rounded-xl bg-gradient-subtle border border-border/50 hover:shadow-elegant transition-all duration-300">
                <div className="h-12 w-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                <div className={`flex items-center justify-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                  <TrendIcon className="h-4 w-4" />
                  {Math.abs(stat.change)}%
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export const RecentActivity: React.FC<TemplateProps> = ({ title, data, size = 'medium' }) => {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-3'
  };

  const activities = data.activities || [];

  return (
    <Card className={`${sizeClasses[size]} shadow-elegant`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline">{activities.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity: any, index: number) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-subtle hover:bg-accent/50 transition-colors border border-border/50">
              <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              {activity.status && (
                <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'} className="shadow-sm">
                  {activity.status}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const QuickActions: React.FC<TemplateProps> = ({ title, data, size = 'small' }) => {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-3'
  };

  const actions = data.actions || [];

  return (
    <Card className={`${sizeClasses[size]} shadow-elegant`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action: any, index: number) => (
            <button
              key={index}
              className="p-4 rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 hover:scale-105 transition-all duration-200 text-sm font-medium shadow-elegant hover:shadow-glow"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};