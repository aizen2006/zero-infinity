
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCcw, 
  Expand, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Info,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Insight {
  id: string;
  type: 'trend' | 'alert' | 'suggestion';
  title: string;
  content: string;
  confidence: number;
  timestamp: Date;
  chartData?: Array<{ value: number; time: string }>;
  source: string[];
}

interface AIInsightWidgetProps {
  size?: 'small' | 'medium' | 'large';
  onExpand?: () => void;
  className?: string;
}

const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'trend',
    title: 'Revenue Growth Detected',
    content: 'Your revenue has increased by 23% over the last 30 days, primarily driven by improved conversion rates from your email campaigns. This trend suggests your recent marketing optimizations are working effectively.',
    confidence: 92,
    timestamp: new Date(),
    chartData: [
      { value: 1200, time: 'Week 1' },
      { value: 1350, time: 'Week 2' },
      { value: 1480, time: 'Week 3' },
      { value: 1680, time: 'Week 4' }
    ],
    source: ['Stripe', 'Mailchimp']
  },
  {
    id: '2',
    type: 'alert',
    title: 'Task Bottleneck Identified',
    content: 'You have 15 tasks overdue by more than 3 days in your project management system. This is 40% higher than usual and may impact upcoming deadlines.',
    confidence: 87,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    source: ['Trello', 'Asana']
  },
  {
    id: '3',
    type: 'suggestion',
    title: 'Optimize Email Send Times',
    content: 'Analysis shows your email open rates are 35% higher when sent on Tuesday mornings between 9-11 AM. Consider scheduling future campaigns during this window.',
    confidence: 78,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    source: ['Gmail', 'Mailchimp']
  }
];

export const AIInsightWidget: React.FC<AIInsightWidgetProps> = ({
  size = 'medium',
  onExpand,
  className = ''
}) => {
  const [currentInsight, setCurrentInsight] = useState<Insight>(mockInsights[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="w-4 h-4 text-primary" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-accent-foreground" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'trend':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'alert':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'suggestion':
        return 'bg-accent text-accent-foreground border-accent/20';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-48';
      case 'medium':
        return 'h-64';
      case 'large':
        return 'h-80';
    }
  };

  const refreshInsight = async () => {
    setIsLoading(true);
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Cycle through mock insights
    const currentIndex = mockInsights.findIndex(insight => insight.id === currentInsight.id);
    const nextIndex = (currentIndex + 1) % mockInsights.length;
    setCurrentInsight(mockInsights[nextIndex]);
    setIsLoading(false);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Card className={`${getSizeClasses()} ${className} relative overflow-hidden`}>
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">AI</span>
            </div>
            Weekly Insights
          </CardTitle>
          <div className="flex items-center gap-2">
            <div 
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              {showTooltip && (
                <div className="absolute top-6 right-0 bg-popover text-popover-foreground text-xs p-2 rounded-md shadow-lg z-10 w-48 border">
                  Insights generated from your connected apps using AI analysis
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshInsight}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Analyzing your data...</p>
          </div>
        ) : (
          <>
            {/* Insight Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getInsightIcon(currentInsight.type)}
                <Badge className={`${getInsightColor(currentInsight.type)} text-xs`}>
                  {currentInsight.type.charAt(0).toUpperCase() + currentInsight.type.slice(1)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {currentInsight.confidence}% confidence
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(currentInsight.timestamp)}
              </span>
            </div>

            {/* Insight Title */}
            <h3 className="font-semibold text-sm">{currentInsight.title}</h3>

            {/* Insight Content */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {size === 'small' 
                ? `${currentInsight.content.substring(0, 100)}...`
                : currentInsight.content
              }
            </p>

            {/* Mini Chart (if available and widget is medium/large) */}
            {currentInsight.chartData && size !== 'small' && (
              <div className="h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentInsight.chartData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Source Apps */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Sources:</span>
                {currentInsight.source.map((app, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {app}
                  </Badge>
                ))}
              </div>
              
              {onExpand && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExpand}
                  className="text-xs h-6 px-2"
                >
                  <Expand className="w-3 h-3 mr-1" />
                  See More
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
