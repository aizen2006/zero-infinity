import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { WidgetConfig } from '@/components/widget-config/types';
import { fetchGoogleAnalyticsData, generateMockData } from '@/services/integrationDataService';

export interface Widget {
  id: string;
  type: 'chart' | 'stat' | 'table';
  title: string;
  app: string;
  data: any;
  size: 'small' | 'medium' | 'large';
  position_x?: number;
  position_y?: number;
}

export const useWidgets = () => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWidgets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('widgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching widgets:', error);
        return;
      }

      const transformedWidgets: Widget[] = await Promise.all(data.map(async (widget) => {
        let widgetData = widget.data;
        
        // Fetch real data for Google Analytics widgets
        if (widget.app === 'google-analytics' && !widgetData) {
          const realData = await fetchGoogleAnalyticsData();
          if (realData) {
            // Transform real data based on widget type
            switch (widget.type) {
              case 'stat':
                widgetData = {
                  value: realData.sessions.toLocaleString(),
                  change: '+12%', // In real app, calculate from historical data
                  label: 'Sessions'
                };
                break;
              case 'chart':
                widgetData = {
                  sessions: realData.sessions,
                  users: realData.users,
                  label: 'Sessions vs Users'
                };
                break;
              case 'table':
                widgetData = [
                  { metric: 'Sessions', value: realData.sessions.toLocaleString(), change: '+12%' },
                  { metric: 'Users', value: realData.users.toLocaleString(), change: '+8%' },
                  { metric: 'Pageviews', value: realData.pageviews.toLocaleString(), change: '+15%' },
                  { metric: 'Bounce Rate', value: realData.bounceRate + '%', change: '-3%' }
                ];
                break;
            }
          }
        }

        return {
          id: widget.id,
          type: widget.type as 'chart' | 'stat' | 'table',
          title: widget.title,
          app: widget.app,
          data: widgetData || generateMockData(widget.type, widget.app),
          size: widget.size as 'small' | 'medium' | 'large',
          position_x: widget.position_x || 0,
          position_y: widget.position_y || 0,
        };
      }));

      setWidgets(transformedWidgets);
    } catch (error) {
      console.error('Error fetching widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWidget = async (config: WidgetConfig) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('widgets')
        .insert({
          user_id: user.id,
          type: config.widgetType,
          title: config.displaySettings.title,
          app: config.app,
          size: config.displaySettings.size,
          data: generateMockData(config.widgetType, config.app),
          position_x: 0,
          position_y: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding widget:', error);
        return;
      }

      const newWidget: Widget = {
        id: data.id,
        type: data.type as 'chart' | 'stat' | 'table',
        title: data.title,
        app: data.app,
        data: data.data || generateMockData(data.type, data.app),
        size: data.size as 'small' | 'medium' | 'large',
        position_x: data.position_x || 0,
        position_y: data.position_y || 0,
      };

      setWidgets(prev => [...prev, newWidget]);
    } catch (error) {
      console.error('Error adding widget:', error);
    }
  };

  const removeWidget = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('widgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing widget:', error);
        return;
      }

      setWidgets(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error removing widget:', error);
    }
  };

  const updateWidgetPosition = async (id: string, position_x: number, position_y: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('widgets')
        .update({ position_x, position_y })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating widget position:', error);
        return;
      }

      setWidgets(prev => prev.map(w => 
        w.id === id ? { ...w, position_x, position_y } : w
      ));
    } catch (error) {
      console.error('Error updating widget position:', error);
    }
  };


  useEffect(() => {
    fetchWidgets();
  }, [user]);

  return {
    widgets,
    loading,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    refreshWidgets: fetchWidgets,
  };
};