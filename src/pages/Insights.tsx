
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  Lightbulb,
  Target,
  BarChart3
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'trend';
  title: string;
  description: string;
  metric: string;
  change: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  sources: string[];
}

const insights: Insight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Revenue Growth Opportunity',
    description: 'Your conversion rate has increased by 15% this month, indicating strong product-market fit.',
    metric: 'Conversion Rate',
    change: '+15%',
    recommendation: 'Consider increasing your marketing budget to capitalize on this trend.',
    priority: 'high',
    sources: ['Stripe', 'Google Analytics']
  },
  {
    id: '2',
    type: 'warning',
    title: 'Task Bottleneck Detected',
    description: 'Several high-priority tasks have been pending for over a week in your project management system.',
    metric: 'Overdue Tasks',
    change: '+8 tasks',
    recommendation: 'Review task assignments and consider redistributing workload.',
    priority: 'high',
    sources: ['Trello', 'Slack']
  },
  {
    id: '3',
    type: 'success',
    title: 'Customer Satisfaction Improved',
    description: 'Your customer support response time has decreased by 40% this quarter.',
    metric: 'Response Time',
    change: '-40%',
    recommendation: 'Document the improved processes to maintain this performance.',
    priority: 'medium',
    sources: ['Zendesk', 'Slack']
  },
  {
    id: '4',
    type: 'trend',
    title: 'Seasonal Traffic Pattern',
    description: 'Website traffic shows a consistent 20% increase during weekends.',
    metric: 'Weekend Traffic',
    change: '+20%',
    recommendation: 'Schedule content releases and promotions for Friday evenings.',
    priority: 'medium',
    sources: ['Google Analytics']
  }
];

const Insights: React.FC = () => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'trend': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-500" />
            AI Insights
          </h1>
          <p className="text-muted-foreground">
            AI-powered insights based on your connected app data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                <div className="text-2xl font-bold">12</div>
              </div>
              <p className="text-sm text-muted-foreground">Active Insights</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div className="text-2xl font-bold">3</div>
              </div>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div className="text-2xl font-bold">67%</div>
              </div>
              <p className="text-sm text-muted-foreground">Avg. Improvement</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <div className="text-2xl font-bold">8</div>
              </div>
              <p className="text-sm text-muted-foreground">Data Sources</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(insight.priority)}`}></div>
                        <span className="text-sm text-muted-foreground capitalize">{insight.priority} Priority</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-500">{insight.change}</div>
                    <div className="text-sm text-muted-foreground">{insight.metric}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{insight.description}</p>
                
                <div className="bg-accent/50 p-4 rounded-lg mb-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Recommendation</div>
                      <div className="text-sm text-muted-foreground">{insight.recommendation}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {insight.sources.map((source) => (
                      <Badge key={source} variant="secondary" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
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

export default Insights;
