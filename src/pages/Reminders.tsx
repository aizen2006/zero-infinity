
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Clock, Mail, Smartphone, Loader2 } from 'lucide-react';
import { CreateReminderDialog } from '@/components/CreateReminderDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  trigger_type: string;
  trigger_config: any;
  notification_channels: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ReminderDisplay {
  id: string;
  title: string;
  description: string;
  trigger: string;
  frequency: string;
  method: 'email' | 'in-app' | 'both';
  active: boolean;
  createdAt: string;
}

const Reminders: React.FC = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<ReminderDisplay[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emailsSent, setEmailsSent] = useState(0);

  useEffect(() => {
    if (user) {
      fetchReminders();
      fetchEmailStats();
    }
  }, [user]);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database data to display format
      const displayReminders: ReminderDisplay[] = data.map((reminder: Reminder) => ({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description || '',
        trigger: reminder.trigger_config?.condition || 'No trigger defined',
        frequency: reminder.trigger_type,
        method: reminder.notification_channels.includes('email') && reminder.notification_channels.includes('in-app') 
          ? 'both' 
          : reminder.notification_channels.includes('email') 
            ? 'email' 
            : 'in-app',
        active: reminder.is_active,
        createdAt: reminder.created_at
      }));

      setReminders(displayReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailStats = async () => {
    try {
      // Get email notifications count from this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user?.id)
        .eq('type', 'reminder')
        .gte('created_at', weekAgo.toISOString());

      if (error) throw error;
      setEmailsSent(data.length);
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

  const toggleReminder = async (id: string) => {
    try {
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) return;

      const { error } = await supabase
        .from('reminders')
        .update({ is_active: !reminder.active })
        .eq('id', id);

      if (error) throw error;

      setReminders(reminders.map(r =>
        r.id === id ? { ...r, active: !r.active } : r
      ));

      toast.success(`Reminder ${!reminder.active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const addReminder = (reminder: Reminder) => {
    // Transform database reminder to display format
    const displayReminder: ReminderDisplay = {
      id: reminder.id,
      title: reminder.title,
      description: reminder.description || '',
      trigger: reminder.trigger_config?.condition || 'No trigger defined',
      frequency: reminder.trigger_type,
      method: reminder.notification_channels.includes('email') && reminder.notification_channels.includes('in-app') 
        ? 'both' 
        : reminder.notification_channels.includes('email') 
          ? 'email' 
          : 'in-app',
      active: reminder.is_active,
      createdAt: reminder.created_at
    };
    
    setReminders([displayReminder, ...reminders]);
  };

  const activeCount = reminders.filter(r => r.active).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="w-8 h-8 text-blue-500" />
              Reminders
            </h1>
            <p className="text-muted-foreground">
              Set up automated reminders based on your data
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Create Reminder
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-500" />
                <div className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : activeCount}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Active Reminders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : reminders.length}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Total Reminders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-500" />
                <div className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : emailsSent}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Sent This Week</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading reminders...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No reminders yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first reminder to get started with automated notifications.
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Reminder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              reminders.map((reminder) => (
                <Card key={reminder.id} className="group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{reminder.title}</CardTitle>
                          <Badge 
                            variant={reminder.active ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {reminder.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{reminder.description}</p>
                      </div>
                      <Switch
                        checked={reminder.active}
                        onCheckedChange={() => toggleReminder(reminder.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm font-medium">Trigger</div>
                        <div className="text-sm text-muted-foreground">{reminder.trigger}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Frequency</div>
                        <div className="text-sm text-muted-foreground">{reminder.frequency}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Method</div>
                        <div className="flex items-center gap-1">
                          {(reminder.method === 'email' || reminder.method === 'both') && (
                            <Mail className="w-4 h-4 text-blue-500" />
                          )}
                          {(reminder.method === 'in-app' || reminder.method === 'both') && (
                            <Smartphone className="w-4 h-4 text-green-500" />
                          )}
                          <span className="text-sm text-muted-foreground capitalize">
                            {reminder.method}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                      <span>Created: {new Date(reminder.createdAt).toLocaleDateString()}</span>
                      <span>Status: {reminder.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        <CreateReminderDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onAdd={addReminder}
        />
      </div>
    </Layout>
  );
};

export default Reminders;
