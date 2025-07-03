import { supabase } from '@/integrations/supabase/client';

export interface GoogleAnalyticsData {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: string;
  lastUpdated: string;
  chartData: Array<{
    date: string;
    sessions: number;
    users: number;
  }>;
}

export const fetchGoogleAnalyticsData = async (): Promise<GoogleAnalyticsData | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('google-analytics-data');
    
    if (error) {
      console.error('Error fetching Google Analytics data:', error);
      return null;
    }

    if (data.success) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch Google Analytics data:', error);
    return null;
  }
};

export const generateMockData = (widgetType: string, app?: string) => {
  // If it's Google Analytics and we can't get real data, return realistic mock data
  if (app === 'google-analytics') {
    switch (widgetType) {
      case 'stat':
        return { 
          value: `${Math.floor(Math.random() * 5000 + 1000).toLocaleString()}`, 
          change: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 20 + 5)}%`,
          label: 'Monthly Sessions'
        };
      case 'chart':
        return { 
          sessions: Math.floor(Math.random() * 1000 + 200), 
          users: Math.floor(Math.random() * 800 + 150),
          label: 'Sessions vs Users'
        };
      case 'table':
        return [
          { metric: 'Sessions', value: (Math.floor(Math.random() * 5000 + 1000)).toLocaleString(), change: '+12%' },
          { metric: 'Users', value: (Math.floor(Math.random() * 3000 + 800)).toLocaleString(), change: '+8%' },
          { metric: 'Pageviews', value: (Math.floor(Math.random() * 10000 + 2000)).toLocaleString(), change: '+15%' },
          { metric: 'Bounce Rate', value: (Math.random() * 30 + 40).toFixed(1) + '%', change: '-3%' }
        ];
    }
  }

  // Default mock data for other apps
  switch (widgetType) {
    case 'stat':
      return { 
        value: `$${Math.floor(Math.random() * 10000)}`, 
        change: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 20)}%` 
      };
    case 'chart':
      return { 
        completed: Math.floor(Math.random() * 50), 
        pending: Math.floor(Math.random() * 20) 
      };
    case 'table':
      return [
        { id: '#001', customer: 'John Doe', amount: '$50' },
        { id: '#002', customer: 'Jane Smith', amount: '$75' }
      ];
    default:
      return {};
  }
};