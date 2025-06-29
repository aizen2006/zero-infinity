
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Clock, Mail, Smartphone } from 'lucide-react';
import { CreateReminderDialog } from '@/components/CreateReminderDialog';

interface Reminder {
  id: string;
  title: string;
  description: string;
  trigger: string;
  frequency: string;
  method: 'email' | 'in-app' | 'both';
  active: boolean;
  lastTriggered?: string;
  nextTrigger?: string;
}

const mockReminders: Reminder[] = [
  {
    id: '1',
    title: 'High Priority Tasks',
    description: 'Send reminder when tasks are overdue for more than 3 days',
    trigger: 'Task overdue > 3 days',
    frequency: 'Daily at 9:00 AM',
    method: 'both',
    active: true,
    lastTriggered: '2024-01-15',
    nextTrigger: '2024-01-16'
  },
  {
    id: '2',
    title: 'Revenue Milestone',
    description: 'Notify when monthly revenue exceeds $10,000',
    trigger: 'Monthly revenue > $10,000',
    frequency: 'When condition is met',
    method: 'email',
    active: true,
    nextTrigger: 'Next month'
  },
  {
    id: '3',
    title: 'Customer Support Queue',
    description: 'Alert when support queue has more than 20 pending tickets',
    trigger: 'Support tickets > 20',
    frequency: 'Real-time',
    method: 'in-app',
    active: false,
    lastTriggered: '2024-01-10'
  }
];

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(reminder =>
      reminder.id === id ? { ...reminder, active: !reminder.active } : reminder
    ));
  };

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder = {
      ...reminder,
      id: Date.now().toString()
    };
    setReminders([...reminders, newReminder]);
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
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Reminder
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-500" />
                <div className="text-2xl font-bold">{activeCount}</div>
              </div>
              <p className="text-sm text-muted-foreground">Active Reminders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div className="text-2xl font-bold">{reminders.length}</div>
              </div>
              <p className="text-sm text-muted-foreground">Total Reminders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-500" />
                <div className="text-2xl font-bold">24</div>
              </div>
              <p className="text-sm text-muted-foreground">Sent This Week</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {reminders.map((reminder) => (
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

                {(reminder.lastTriggered || reminder.nextTrigger) && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    {reminder.lastTriggered && (
                      <span>Last triggered: {reminder.lastTriggered}</span>
                    )}
                    {reminder.nextTrigger && (
                      <span>Next trigger: {reminder.nextTrigger}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

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
