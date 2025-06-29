
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Check, 
  Star, 
  Crown, 
  Calendar,
  DollarSign,
  Zap
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
      '7-day data retention'
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
      'Advanced analytics'
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
      'API access'
    ],
    icon: <Crown className="w-5 h-5" />
  }
];

const Billing: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing & Plans</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Current Plan Status */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">Free Plan</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-muted-foreground">
                  You're currently on the free plan with 3 integrations
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <div className="text-2xl font-bold">3/3</div>
              </div>
              <p className="text-sm text-muted-foreground">Integrations Used</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                <div className="text-2xl font-bold">7</div>
              </div>
              <p className="text-sm text-muted-foreground">Days Retention</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-500" />
                <div className="text-2xl font-bold">$0</div>
              </div>
              <p className="text-sm text-muted-foreground">Monthly Spend</p>
            </CardContent>
          </Card>
        </div>

        {/* Plans Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${
                  plan.popular 
                    ? 'border-blue-500 shadow-lg scale-105' 
                    : plan.current 
                      ? 'border-green-500' 
                      : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white">Current Plan</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {plan.icon}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={plan.current ? 'outline' : plan.popular ? 'default' : 'outline'}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No billing history available</p>
              <p className="text-sm">You're currently on the free plan</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Billing;
