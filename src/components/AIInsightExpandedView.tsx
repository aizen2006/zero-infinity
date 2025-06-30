
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Clock,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface ExpandedInsight {
  id: string;
  type: 'trend' | 'alert' | 'suggestion';
  title: string;
  content: string;
  detailedAnalysis: string;
  recommendations: string[];
  confidence: number;
  timestamp: Date;
  chartData?: Array<{ value: number; time: string; label: string }>;
  source: string[];
  impact: 'high' | 'medium' | 'low';
}

interface AIInsightExpandedViewProps {
  onClose: () => void;
}

const mockExpandedInsights: ExpandedInsight[] = [
  {
    id: '1',
    type: 'trend',
    title: 'Revenue Growth Detected',
    content: 'Your revenue has increased by 23% over the last 30 days, primarily driven by improved conversion rates from your email campaigns.',
    detailedAnalysis: 'Deep analysis of your revenue streams shows consistent growth across multiple channels. Email marketing campaigns show a 35% improvement in click-through rates, while your Stripe data indicates higher average order values. The growth is sustainable and shows strong momentum entering the next quarter.',
    recommendations: [
      'Scale successful email campaigns to similar audience segments',
      'Increase marketing budget allocation to high-performing channels',
      'Consider premium pricing strategy given improved conversion rates'
    ],
    confidence: 92,
    timestamp: new Date(),
    chartData: [
      { value: 1200, time: 'W1', label: 'Week 1' },
      { value: 1350, time: 'W2', label: 'Week 2' },
      { value: 1480, time: 'W3', label: 'Week 3' },
      { value: 1680, time: 'W4', label: 'Week 4' }
    ],
    source: ['Stripe', 'Mailchimp', 'Google Analytics'],
    impact: 'high'
  },
  {
    id: '2',
    type: 'alert',
    title: 'Task Bottleneck Identified',
    content: 'You have 15 tasks overdue by more than 3 days in your project management system.',
    detailedAnalysis: 'Analysis of your project workflows reveals a consistent pattern of delays in the review and approval phase. Tasks are completing the initial work phase on time but getting stuck in the final stages. This creates a cascading effect on subsequent project timelines.',
    recommendations: [
      'Implement automated reminders for review phases',
      'Redistribute workload during peak review periods',
      'Consider parallel review processes for urgent tasks'
    ],
    confidence: 87,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    source: ['Trello', 'Asana', 'Slack'],
    impact: 'medium'
  }
];

export const AIInsightExpandedView: React.FC<AIInsightExpandedViewProps> = ({ onClose }) => {
  const [selectedInsight, setSelectedInsight] = useState<ExpandedInsight>(mockExpandedInsights[0]);

  const getInsightIcon = (type: ExpandedInsight['type']) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'suggestion':
        return <Lightbulb className="w-5 h-5 text-green-400" />;
    }
  };

  const getImpactColor = (impact: ExpandedInsight['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] bg-gray-900 border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">AI</span>
              </div>
              AI Insights Dashboard
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex h-full">
          {/* Sidebar with insight list */}
          <div className="w-1/3 border-r border-gray-700 p-4">
            <h3 className="text-sm font-medium mb-4">Recent Insights</h3>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {mockExpandedInsights.map((insight) => (
                  <Card
                    key={insight.id}
                    className={`cursor-pointer transition-all hover:bg-gray-800/50 ${
                      selectedInsight.id === insight.id ? 'ring-2 ring-blue-500 bg-gray-800/30' : ''
                    }`}
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2 mb-2">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{insight.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {insight.content.substring(0, 60)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={`${getImpactColor(insight.impact)} text-xs`}>
                          {insight.impact} impact
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          2h ago
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-6">
            <ScrollArea className="h-full">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getInsightIcon(selectedInsight.type)}
                    <div>
                      <h2 className="text-xl font-semibold">{selectedInsight.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getImpactColor(selectedInsight.impact)} text-xs`}>
                          {selectedInsight.impact} impact
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {selectedInsight.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <Card className="bg-gray-800/30 border-gray-700">
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed">{selectedInsight.content}</p>
                  </CardContent>
                </Card>

                {/* Chart */}
                {selectedInsight.chartData && (
                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Trend Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedInsight.chartData}>
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#3b82f6" 
                              strokeWidth={3}
                              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Detailed Analysis */}
                <Card className="bg-gray-800/30 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Detailed Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedInsight.detailedAnalysis}
                    </p>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="bg-gray-800/30 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedInsight.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-muted-foreground">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Data Sources */}
                <Card className="bg-gray-800/30 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Data Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedInsight.source.map((source, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  );
};
