
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Check, 
  Star, 
  Crown, 
  Calendar,
  DollarSign,
  Zap,
  Download,
  ExternalLink,
  Shield,
  AlertTriangle,
  HelpCircle,
  X,
  Eye,
  Settings,
  Pause,
  RefreshCw
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
  icon: React.ReactNode;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  downloadUrl?: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    description: 'Get started with basic features',
    features: [
      'Up to 3 app integrations',
      'Basic dashboard widgets',
      'Email notifications',
      '7-day data retention',
      'Community support'
    ],
    current: true,
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'Perfect for growing businesses',
    features: [
      'Unlimited app integrations',
      'Advanced AI insights',
      'Custom reminder rules',
      '90-day data retention',
      'Priority support',
      'Advanced analytics',
      'Custom widgets',
      'Team collaboration'
    ],
    popular: true,
    icon: <Star className="w-5 h-5" />
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For large teams and organizations',
    features: [
      'Everything in Pro',
      'Unlimited data retention',
      'Custom integrations',
      'SSO authentication',
      'Dedicated support',
      'Custom branding',
      'API access',
      'White-label options',
      'SLA guarantee'
    ],
    icon: <Crown className="w-5 h-5" />
  }
];

const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    date: '2024-01-01',
    amount: 29.00,
    status: 'paid',
    plan: 'Pro Plan',
    downloadUrl: '#'
  },
  {
    id: 'inv_002',
    date: '2023-12-01',
    amount: 29.00,
    status: 'paid',
    plan: 'Pro Plan',
    downloadUrl: '#'
  },
  {
    id: 'inv_003',
    date: '2023-11-01',
    amount: 29.00,
    status: 'paid',
    plan: 'Pro Plan',
    downloadUrl: '#'
  }
];

const Billing: React.FC = () => {
  const [isCurrentlySubscribed] = useState(false); // This would come from your auth context
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleManageSubscription = () => {
    // This would integrate with Stripe Customer Portal
    window.open('https://billing.stripe.com/p/login/test_123', '_blank');
  };

  const handleUpgrade = (planId: string) => {
    // This would integrate with Stripe Checkout
    console.log('Upgrading to:', planId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage your subscription, billing information, and view invoices
            </p>
          </div>
        </div>

        {/* Current Plan Card */}
        <Card className="border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold">Free Plan</span>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                </div>
                <p className="text-muted-foreground mb-2">
                  You're currently on the free plan with basic features
                </p>
                {isCurrentlySubscribed && (
                  <p className="text-sm text-muted-foreground">
                    Next billing date: January 15, 2024
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleManageSubscription} className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Manage via Stripe
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Integrations</span>
                </div>
                <div className="text-2xl font-bold">3/3</div>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Limit reached</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Data Retention</span>
                </div>
                <div className="text-2xl font-bold">7d</div>
              </div>
              <p className="text-xs text-muted-foreground">Days of history</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">Monthly Spend</span>
                </div>
                <div className="text-2xl font-bold">$0</div>
              </div>
              <p className="text-xs text-muted-foreground">Current billing cycle</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isCurrentlySubscribed ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2027</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Update
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No payment method on file</p>
                <p className="text-sm text-muted-foreground">Add a payment method to upgrade your plan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Choose Your Plan</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              Secure payment powered by Stripe
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  plan.popular 
                    ? 'border-blue-500/50 shadow-lg scale-105 bg-gradient-to-b from-blue-500/5 to-purple-500/5' 
                    : plan.current 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : 'hover:border-border/80'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white border-0">Current Plan</Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600' :
                      plan.current ? 'bg-green-500' : 'bg-muted'
                    }`}>
                      {React.cloneElement(plan.icon as React.ReactElement, { 
                        className: `w-4 h-4 ${plan.popular || plan.current ? 'text-white' : 'text-muted-foreground'}` 
                      })}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : ''}`}
                    variant={plan.current ? 'outline' : plan.popular ? 'default' : 'outline'}
                    disabled={plan.current}
                    onClick={() => !plan.current && handleUpgrade(plan.id)}
                  >
                    {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Invoices & Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Invoices & Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isCurrentlySubscribed ? (
              <div className="space-y-4">
                {mockInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.plan}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Download className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No billing history available</p>
                <p className="text-sm text-muted-foreground">You're currently on the free plan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Management */}
        {isCurrentlySubscribed && (
          <Card className="border-orange-500/20 bg-orange-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <AlertTriangle className="w-5 h-5" />
                Subscription Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Need to make changes to your subscription? You can pause, cancel, or modify your plan at any time.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Pause className="w-4 h-4" />
                  Pause Subscription
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <X className="w-4 h-4" />
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help & FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">Billing Questions</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Have questions about your bill or need to update payment information?
                  </p>
                  <Button variant="outline" size="sm">Contact Support</Button>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">Plan Comparison</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Not sure which plan is right for you? Compare features and pricing.
                  </p>
                  <Button variant="outline" size="sm">View Comparison</Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Billing powered by Stripe</h4>
                  <p className="text-sm text-muted-foreground">
                    Your payment information is secured with bank-level encryption
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  256-bit SSL encryption
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancel Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  Cancel Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    You'll lose access to premium features at the end of your current billing period.
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground mb-6">
                  Your subscription will remain active until January 15, 2024. After that, your account will be downgraded to the free plan.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowCancelDialog(false)}
                  >
                    Keep Subscription
                  </Button>
                  <Button 
                    className="flex-1 bg-red-500 hover:bg-red-600"
                    onClick={() => setShowCancelDialog(false)}
                  >
                    Confirm Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Billing;
