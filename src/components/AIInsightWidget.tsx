import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Brain, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AIInsight {
  id: string;
  title: string;
  content: string;
  type: 'trend' | 'alert' | 'recommendation' | 'prediction';
  confidence: number;
  source: string;
  createdAt: string;
  isRead: boolean;
}

interface AIInsightWidgetProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const AIInsightWidget: React.FC<AIInsightWidgetProps> = ({ 
  size = 'medium', 
  className = '' 
}) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-3'
  };

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user]);

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const mappedInsights: AIInsight[] = data.map(insight => ({
        id: insight.id,
        title: insight.title,
        content: insight.content,
        type: insight.insight_type as any,
        confidence: insight.confidence_score || 0.8,
        source: insight.source_app || 'dashboard',
        createdAt: insight.created_at,
        isRead: insight.is_read
      }));

      setInsights(mappedInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    if (!user) return;
    
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // Generate insights using OpenAI
      const response = await supabase.functions.invoke('openai-chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Based on the current dashboard data, generate 3 business insights. Include trends, recommendations, and alerts. Focus on actionable insights that could help improve business performance. Return as JSON array with fields: title, content, type (trend/alert/recommendation), confidence (0-1).`
            }
          ],
          task: 'insights'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (response.data?.response) {
        try {
          // Try to extract JSON from the response
          let jsonStr = response.data.response;
          const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
          
          const aiInsights = JSON.parse(jsonStr);
          
          // Save insights to database
          for (const insight of aiInsights) {
            await supabase
              .from('insights')
              .insert({
                user_id: user.id,
                title: insight.title,
                content: insight.content,
                insight_type: insight.type,
                confidence_score: insight.confidence,
                source_app: 'ai-dashboard'
              });
          }
          
          // Refresh insights
          await fetchInsights();
        } catch (parseError) {
          console.error('Error parsing AI insights:', parseError);
          
          // Fallback: Create a general insight
          await supabase
            .from('insights')
            .insert({
              user_id: user.id,
              title: 'AI Analysis Complete',
              content: response.data.response,
              insight_type: 'recommendation',
              confidence_score: 0.7,
              source_app: 'ai-dashboard'
            });
          
          await fetchInsights();
        }
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  const markAsRead = async (insightId: string) => {
    try {
      await supabase
        .from('insights')
        .update({ is_read: true })
        .eq('id', insightId);
      
      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId ? { ...insight, isRead: true } : insight
        )
      );
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'alert': return AlertTriangle;
      case 'recommendation': return CheckCircle;
      case 'prediction': return Brain;
      default: return Lightbulb;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trend': return 'text-blue-500';
      case 'alert': return 'text-red-500';
      case 'recommendation': return 'text-green-500';
      case 'prediction': return 'text-purple-500';
      default: return 'text-primary';
    }
  };


  return (
    <Card className={`${sizeClasses[size]} ${className} shadow-elegant hover:shadow-glow transition-all duration-300 border-l-4 border-l-primary bg-gradient-subtle`}>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-6">
            <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-3">No insights yet</p>
            <Button 
              size="sm" 
              onClick={generateNewInsights}
              disabled={generating}
              className="bg-gradient-primary shadow-elegant"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Insights
            </Button>
          </div>
        ) : (
          <ScrollArea className={size === 'small' ? 'h-32' : size === 'medium' ? 'h-48' : 'h-64'}>
            <div className="space-y-3">
              {insights.map((insight) => {
                const TypeIcon = getTypeIcon(insight.type);
                const typeColor = getTypeColor(insight.type);
                
                return (
                  <div 
                    key={insight.id}
                    className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-elegant ${!insight.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card border-border/50 hover:bg-accent/50'}`}
                    onClick={() => markAsRead(insight.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-full bg-gradient-primary flex-shrink-0 mt-0.5 shadow-sm`}>
                        <TypeIcon className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium truncate text-gradient-primary">
                            {insight.title}
                          </h4>
                          <div className="flex items-center gap-1 ml-2">
                            <Badge variant="outline" className="text-xs">
                              {Math.round(insight.confidence * 100)}%
                            </Badge>
                            {!insight.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full shadow-glow" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {insight.content}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(insight.createdAt).toLocaleDateString()}
                          </span>
                          <Badge variant="secondary" className={`text-xs ${typeColor}`}>
                            {insight.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};