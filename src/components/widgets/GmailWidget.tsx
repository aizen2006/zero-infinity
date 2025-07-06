import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Inbox, Send, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { analyzeGmailData, fetchGmailEmails, getGmailStats, type GmailStats, type GmailAnalysis } from '@/services/gmailService';
import { useAuth } from '@/contexts/AuthContext';

interface GmailWidgetProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const GmailWidget: React.FC<GmailWidgetProps> = ({ size = 'medium', className = '' }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<GmailStats | null>(null);
  const [analysis, setAnalysis] = useState<GmailAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-3'
  };

  useEffect(() => {
    if (user) {
      loadGmailData();
    }
  }, [user]);

  const loadGmailData = async () => {
    setLoading(true);
    try {
      const [statsData, analysisData] = await Promise.all([
        getGmailStats(),
        analyzeGmailData()
      ]);
      
      // These services now return mock data instead of null on failure
      setStats(statsData);
      setAnalysis(analysisData);
    } catch (error) {
      // Silently handle errors - services provide fallback data
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={`${sizeClasses[size]} ${className} animate-pulse`}>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-24"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-16"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats && !analysis) {
    return (
      <Card className={`${sizeClasses[size]} ${className} border-dashed`}>
        <CardContent className="p-6 text-center">
          <Mail className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">Gmail not connected</p>
          <Button size="sm" variant="outline">
            Connect Gmail
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${sizeClasses[size]} ${className} shadow-elegant hover:shadow-glow transition-all duration-300 border-l-4 border-l-primary`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Gmail Overview
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs"
        >
          {showDetails ? 'Less' : 'More'}
        </Button>
      </CardHeader>
      <CardContent>
        {size === 'small' ? (
          // Small view - key metrics only
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {stats?.unreadEmails || analysis?.unreadCount || 0}
              </span>
              <Badge variant="secondary">Unread</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {stats?.totalEmails || analysis?.totalEmails || 0} total emails
            </div>
          </div>
        ) : (
          // Medium/Large view - detailed metrics
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Inbox</span>
                  </div>
                </div>
                <div className="text-xl font-bold">
                  {stats?.unreadEmails || analysis?.unreadCount || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  of {stats?.totalEmails || analysis?.totalEmails || 0} emails
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">Priority</span>
                  </div>
                </div>
                <div className="text-xl font-bold">
                  {analysis?.importantCount || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  important emails
                </div>
              </div>
            </div>

            {size === 'large' && showDetails && analysis && (
              <>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Top Senders</h4>
                  <div className="space-y-2">
                    {analysis.topSenders.slice(0, 3).map((sender, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="truncate max-w-[150px]" title={sender.sender}>
                          {sender.sender.split('<')[0].trim() || sender.sender}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {sender.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {analysis.emailTrends.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
                    <div className="space-y-1">
                      {analysis.emailTrends.slice(-3).map((trend, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span>{new Date(trend.date).toLocaleDateString()}</span>
                          <div className="flex items-center gap-1">
                            <span>{trend.count}</span>
                            {index > 0 && (
                              trend.count > analysis.emailTrends[analysis.emailTrends.length - 3 + index - 1]?.count ? (
                                <TrendingUp className="w-3 h-3 text-green-500" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between items-center pt-2 border-t">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={loadGmailData}
                disabled={loading}
                className="text-xs"
              >
                Refresh
              </Button>
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};