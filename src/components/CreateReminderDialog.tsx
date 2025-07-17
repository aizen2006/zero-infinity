
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CreateReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (reminder: any) => void;
}

export const CreateReminderDialog: React.FC<CreateReminderDialogProps> = ({
  open,
  onOpenChange,
  onAdd
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState('');
  const [frequency, setFrequency] = useState('');
  const [method, setMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !trigger || !frequency || !method || !user) return;

    setIsSubmitting(true);

    try {
      // Create trigger config based on frequency
      const triggerConfig = {
        condition: trigger,
        frequency: frequency,
        notificationChannels: method === 'both' ? ['email', 'in-app'] : [method]
      };

      // Save to database
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          title,
          description,
          trigger_type: frequency === 'real-time' ? 'real_time' : frequency === 'when-met' ? 'when_met' : frequency,
          trigger_config: triggerConfig,
          notification_channels: method === 'both' ? ['email', 'in_app'] : method === 'in-app' ? ['in_app'] : [method],
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Send confirmation email if email notifications are enabled
      if (method === 'email' || method === 'both') {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.functions.invoke('send-notification-email', {
            body: {
              to: user.email,
              subject: `✅ Reminder Created: ${title}`,
              content: `Your reminder "${title}" has been successfully created and is now active.\n\nTrigger: ${trigger}\nFrequency: ${frequency}\nMethod: ${method}`,
              type: 'reminder'
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            }
          });
        }
      }

      toast.success('Reminder created successfully!');
      
      // Call the onAdd callback with the new reminder
      onAdd(data);

      // Reset form
      setTitle('');
      setDescription('');
      setTrigger('');
      setFrequency('');
      setMethod('');
      onOpenChange(false);

    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error('Failed to create reminder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="reminder-dialog-description">
        <DialogHeader>
          <DialogTitle>Create New Reminder</DialogTitle>
          <div id="reminder-dialog-description" className="text-sm text-muted-foreground">
            Set up automated reminders based on your data and preferences.
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Reminder Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter reminder title"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this reminder is for"
            />
          </div>

          <div>
            <Label htmlFor="trigger">Trigger Condition</Label>
            <Input
              id="trigger"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="e.g., Tasks overdue > 5 days"
            />
          </div>

          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="real-time">Real-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="when-met">When condition is met</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="method">Notification Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="in-app">In-app</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Reminder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
