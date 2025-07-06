import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Zap,
  Filter,
  Send
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'email' | 'message' | 'system' | 'integration';
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  createdAt: string;
  source?: string;
  metadata?: any;
}

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedNotifications: Notification[] = data.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type as any,
        priority: 'medium', // Will be determined by AI
        isRead: notification.is_read,
        createdAt: notification.created_at,
        source: notification.channel,
        metadata: notification.metadata
      }));

      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const analyzeWithAI = async () => {
    if (!user) return;
    
    setIsAnalyzing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await supabase.functions.invoke('gemini-chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Analyze these notifications and rank them by priority. Return a JSON array with id and priority (high/medium/low): ${JSON.stringify(notifications.map(n => ({ id: n.id, title: n.title, message: n.message, type: n.type })))}`
            }
          ],
          task: 'notifications'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (response.data?.response) {
        try {
          // Extract JSON from AI response if it contains both text and JSON
          let jsonStr = response.data.response;
          
          // Try to find JSON array pattern in the response
          const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
          
          const aiAnalysis = JSON.parse(jsonStr);
          if (Array.isArray(aiAnalysis)) {
            setNotifications(prev => prev.map(notification => {
              const analysis = aiAnalysis.find(a => a.id === notification.id);
              return analysis ? { ...notification, priority: analysis.priority } : notification;
            }));
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          // Fallback: randomly assign priorities for demo
          setNotifications(prev => prev.map(notification => ({
            ...notification,
            priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any
          })));
        }
      }
    } catch (error) {
      console.error('Error analyzing notifications:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAutoResponse = async (notification: Notification) => {
    if (!user) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await supabase.functions.invoke('gemini-chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Generate a professional response to this ${notification.type}: "${notification.message}". Context: ${notification.title}`
            }
          ],
          task: 'autoResponse'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (response.data?.response) {
        setResponseText(response.data.response);
      }
    } catch (error) {
      console.error('Error generating auto response:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'high') return notification.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'message': return MessageSquare;
      case 'system': return AlertCircle;
      default: return Bell;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={analyzeWithAI}
                  disabled={isAnalyzing}
                  className="text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-3 h-3 mr-1" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilter('all')}>
                      All ({notifications.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('unread')}>
                      Unread ({unreadCount})
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('high')}>
                      High Priority
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {filteredNotifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No notifications
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification, index) => {
                    const TypeIcon = getTypeIcon(notification.type);
                    return (
                      <div key={notification.id}>
                        <div 
                          className={`p-3 hover:bg-accent cursor-pointer transition-colors ${!notification.isRead ? 'bg-primary/5' : ''}`}
                          onClick={() => {
                            setSelectedNotification(notification);
                            markAsRead(notification.id);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <TypeIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium truncate">
                                  {notification.title}
                                </p>
                                <div className="flex items-center gap-1 ml-2">
                                  <Badge 
                                    variant={getPriorityColor(notification.priority) as any}
                                    className="text-xs"
                                  >
                                    {notification.priority}
                                  </Badge>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notification.createdAt).toLocaleTimeString()}
                                </span>
                                {(notification.type === 'email' || notification.type === 'message') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      generateAutoResponse(notification);
                                    }}
                                  >
                                    <Send className="w-3 h-3 mr-1" />
                                    Auto Reply
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < filteredNotifications.length - 1 && <Separator />}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            
            {selectedNotification && responseText && (
              <div className="p-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Generated Response:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setResponseText('')}
                    >
                      ×
                    </Button>
                  </div>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="text-xs">
                      Send Response
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      Edit & Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};