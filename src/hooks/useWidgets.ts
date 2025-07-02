import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { WidgetConfig } from '@/components/widget-config/types';

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

      const transformedWidgets: Widget[] = data.map(widget => ({
        id: widget.id,
        type: widget.type as 'chart' | 'stat' | 'table',
        title: widget.title,
        app: widget.app,
        data: widget.data || generateMockData(widget.type),
        size: widget.size as 'small' | 'medium' | 'large',
        position_x: widget.position_x || 0,
        position_y: widget.position_y || 0,
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
          data: generateMockData(config.widgetType),
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
        data: data.data || generateMockData(data.type),
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

  const generateMockData = (widgetType: string) => {
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