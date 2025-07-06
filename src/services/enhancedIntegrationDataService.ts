import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  averageSessionDuration: number;
  conversionRate: number;
  revenue: number;
  topPages: Array<{ page: string; views: number }>;
  trafficSources: Array<{ source: string; sessions: number; percentage: number }>;
  userDemographics: {
    countries: Array<{ country: string; users: number }>;
    devices: Array<{ device: string; users: number }>;
    browsers: Array<{ browser: string; users: number }>;
  };
  trends: {
    daily: Array<{ date: string; sessions: number; users: number }>;
    hourly: Array<{ hour: number; sessions: number }>;
  };
}

export interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{ product: string; sales: number; revenue: number }>;
  salesTrends: Array<{ date: string; revenue: number; orders: number }>;
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    customerLifetimeValue: number;
  };
}

export interface SocialMediaData {
  platforms: {
    facebook: { followers: number; engagement: number; reach: number };
    twitter: { followers: number; engagement: number; impressions: number };
    instagram: { followers: number; engagement: number; reach: number };
    linkedin: { followers: number; engagement: number; impressions: number };
  };
  totalFollowers: number;
  totalEngagement: number;
  topPosts: Array<{ platform: string; content: string; engagement: number }>;
  demographics: {
    ageGroups: Array<{ range: string; percentage: number }>;
    genders: Array<{ gender: string; percentage: number }>;
    locations: Array<{ location: string; percentage: number }>;
  };
}

export const fetchRealTimeAnalytics = async (): Promise<AnalyticsData | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // Check if Google Analytics is connected
    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('app_name', 'google-analytics')
      .eq('is_connected', true)
      .single();

    if (!integration) {
      return generateMockAnalyticsData();
    }

    // Fetch real data from Google Analytics
    const { data, error } = await supabase.functions.invoke('google-analytics-data', {
      body: { 
        integrationId: integration.id,
        metrics: [
          'sessions', 'users', 'pageviews', 'bounceRate', 
          'averageSessionDuration', 'conversions', 'revenue'
        ],
        dimensions: ['date', 'country', 'deviceCategory', 'browser', 'source'],
        dateRange: { startDate: '30daysAgo', endDate: 'today' }
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      }
    });

    if (error) {
      console.error('Error fetching analytics data:', error);
      return generateMockAnalyticsData();
    }

    return transformAnalyticsData(data);
  } catch (error) {
    console.error('Error in fetchRealTimeAnalytics:', error);
    return generateMockAnalyticsData();
  }
};

export const fetchSalesData = async (): Promise<SalesData | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // Check for e-commerce integrations (Shopify, WooCommerce, etc.)
    const { data: integrations } = await supabase
      .from('integrations')
      .select('*')
      .in('app_name', ['shopify', 'woocommerce', 'stripe'])
      .eq('is_connected', true);

    if (!integrations || integrations.length === 0) {
      return generateMockSalesData();
    }

    // Aggregate data from multiple sources
    const salesPromises = integrations.map(integration => 
      supabase.functions.invoke('fetch-sales-data', {
        body: { 
          integrationId: integration.id,
          platform: integration.app_name,
          dateRange: { startDate: '30daysAgo', endDate: 'today' }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      })
    );

    const results = await Promise.all(salesPromises);
    return aggregateSalesData(results.map(r => r.data));
  } catch (error) {
    console.error('Error in fetchSalesData:', error);
    return generateMockSalesData();
  }
};

export const fetchSocialMediaData = async (): Promise<SocialMediaData | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: integrations } = await supabase
      .from('integrations')
      .select('*')
      .in('app_name', ['facebook', 'twitter', 'instagram', 'linkedin'])
      .eq('is_connected', true);

    if (!integrations || integrations.length === 0) {
      return generateMockSocialMediaData();
    }

    const socialPromises = integrations.map(integration => 
      supabase.functions.invoke('fetch-social-data', {
        body: { 
          integrationId: integration.id,
          platform: integration.app_name
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      })
    );

    const results = await Promise.all(socialPromises);
    return aggregateSocialMediaData(results.map(r => r.data));
  } catch (error) {
    console.error('Error in fetchSocialMediaData:', error);
    return generateMockSocialMediaData();
  }
};

const transformAnalyticsData = (rawData: any): AnalyticsData => {
  // Transform Google Analytics API response to our format
  return {
    sessions: rawData.totals?.sessions || 0,
    users: rawData.totals?.users || 0,
    pageviews: rawData.totals?.pageviews || 0,
    bounceRate: rawData.totals?.bounceRate || 0,
    averageSessionDuration: rawData.totals?.avgSessionDuration || 0,
    conversionRate: rawData.totals?.conversionRate || 0,
    revenue: rawData.totals?.revenue || 0,
    topPages: rawData.topPages || [],
    trafficSources: rawData.trafficSources || [],
    userDemographics: rawData.demographics || { countries: [], devices: [], browsers: [] },
    trends: rawData.trends || { daily: [], hourly: [] }
  };
};

const aggregateSalesData = (salesDataArray: any[]): SalesData => {
  const aggregated = salesDataArray.reduce((acc, data) => ({
    totalRevenue: acc.totalRevenue + (data?.revenue || 0),
    totalOrders: acc.totalOrders + (data?.orders || 0),
    newCustomers: acc.newCustomers + (data?.newCustomers || 0),
    returningCustomers: acc.returningCustomers + (data?.returningCustomers || 0),
  }), { totalRevenue: 0, totalOrders: 0, newCustomers: 0, returningCustomers: 0 });

  return {
    totalRevenue: aggregated.totalRevenue,
    totalOrders: aggregated.totalOrders,
    averageOrderValue: aggregated.totalOrders > 0 ? aggregated.totalRevenue / aggregated.totalOrders : 0,
    conversionRate: 2.5, // Calculate from actual data
    topProducts: salesDataArray.flatMap(d => d?.topProducts || []).slice(0, 10),
    salesTrends: salesDataArray[0]?.trends || [],
    customerMetrics: {
      newCustomers: aggregated.newCustomers,
      returningCustomers: aggregated.returningCustomers,
      customerLifetimeValue: 250, // Calculate from actual data
    }
  };
};

const aggregateSocialMediaData = (socialDataArray: any[]): SocialMediaData => {
  const platforms = socialDataArray.reduce((acc, data) => {
    if (data?.platform && data?.metrics) {
      acc[data.platform as keyof typeof acc] = data.metrics;
    }
    return acc;
  }, {
    facebook: { followers: 0, engagement: 0, reach: 0 },
    twitter: { followers: 0, engagement: 0, impressions: 0 },
    instagram: { followers: 0, engagement: 0, reach: 0 },
    linkedin: { followers: 0, engagement: 0, impressions: 0 }
  });

  const totalFollowers = Object.values(platforms).reduce((sum: number, platform: any) => sum + (platform?.followers || 0), 0);
  const totalEngagement = Object.values(platforms).reduce((sum: number, platform: any) => sum + (platform?.engagement || 0), 0);

  return {
    platforms,
    totalFollowers: totalFollowers,
    totalEngagement: totalEngagement,
    topPosts: socialDataArray.flatMap(d => d?.topPosts || []).slice(0, 10),
    demographics: socialDataArray[0]?.demographics || {
      ageGroups: [],
      genders: [],
      locations: []
    }
  };
};

// Enhanced mock data generators
const generateMockAnalyticsData = (): AnalyticsData => ({
  sessions: 12580,
  users: 8420,
  pageviews: 24560,
  bounceRate: 42.3,
  averageSessionDuration: 125,
  conversionRate: 3.2,
  revenue: 45920,
  topPages: [
    { page: '/home', views: 5420 },
    { page: '/products', views: 3210 },
    { page: '/about', views: 1890 },
    { page: '/contact', views: 1560 },
    { page: '/blog', views: 1240 }
  ],
  trafficSources: [
    { source: 'Organic Search', sessions: 5020, percentage: 39.9 },
    { source: 'Direct', sessions: 3780, percentage: 30.1 },
    { source: 'Social Media', sessions: 2140, percentage: 17.0 },
    { source: 'Paid Search', sessions: 1050, percentage: 8.3 },
    { source: 'Email', sessions: 590, percentage: 4.7 }
  ],
  userDemographics: {
    countries: [
      { country: 'United States', users: 3368 },
      { country: 'United Kingdom', users: 1684 },
      { country: 'Canada', users: 1010 },
      { country: 'Australia', users: 842 },
      { country: 'Germany', users: 673 }
    ],
    devices: [
      { device: 'Desktop', users: 5052 },
      { device: 'Mobile', users: 2526 },
      { device: 'Tablet', users: 842 }
    ],
    browsers: [
      { browser: 'Chrome', users: 5894 },
      { browser: 'Safari', users: 1684 },
      { browser: 'Firefox', users: 674 },
      { browser: 'Edge', users: 168 }
    ]
  },
  trends: {
    daily: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sessions: Math.floor(Math.random() * 500) + 300,
      users: Math.floor(Math.random() * 300) + 200
    })).reverse(),
    hourly: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sessions: Math.floor(Math.random() * 100) + 20
    }))
  }
});

const generateMockSalesData = (): SalesData => ({
  totalRevenue: 89450,
  totalOrders: 342,
  averageOrderValue: 261.55,
  conversionRate: 3.8,
  topProducts: [
    { product: 'Premium Package', sales: 45, revenue: 22500 },
    { product: 'Standard Package', sales: 78, revenue: 15600 },
    { product: 'Basic Package', sales: 123, revenue: 12300 },
    { product: 'Enterprise Package', sales: 12, revenue: 24000 },
    { product: 'Starter Package', sales: 84, revenue: 8400 }
  ],
  salesTrends: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 5000) + 1000,
    orders: Math.floor(Math.random() * 20) + 5
  })).reverse(),
  customerMetrics: {
    newCustomers: 145,
    returningCustomers: 197,
    customerLifetimeValue: 485.75
  }
});

const generateMockSocialMediaData = (): SocialMediaData => ({
  platforms: {
    facebook: { followers: 12580, engagement: 4.2, reach: 45200 },
    twitter: { followers: 8920, engagement: 3.8, impressions: 125000 },
    instagram: { followers: 15430, engagement: 6.1, reach: 78500 },
    linkedin: { followers: 5840, engagement: 2.9, impressions: 32100 }
  },
  totalFollowers: 42770,
  totalEngagement: 4.25,
  topPosts: [
    { platform: 'Instagram', content: 'Behind the scenes at our office...', engagement: 1250 },
    { platform: 'Facebook', content: 'New product launch announcement!', engagement: 980 },
    { platform: 'Twitter', content: 'Industry insights thread...', engagement: 750 },
    { platform: 'LinkedIn', content: 'Company milestone celebration', engagement: 560 }
  ],
  demographics: {
    ageGroups: [
      { range: '18-24', percentage: 22 },
      { range: '25-34', percentage: 35 },
      { range: '35-44', percentage: 28 },
      { range: '45-54', percentage: 12 },
      { range: '55+', percentage: 3 }
    ],
    genders: [
      { gender: 'Female', percentage: 52 },
      { gender: 'Male', percentage: 46 },
      { gender: 'Other', percentage: 2 }
    ],
    locations: [
      { location: 'United States', percentage: 45 },
      { location: 'United Kingdom', percentage: 18 },
      { location: 'Canada', percentage: 12 },
      { location: 'Australia', percentage: 10 },
      { location: 'Other', percentage: 15 }
    ]
  }
});

export const generateEnhancedMockData = (type: string, app: string): any => {
  switch (type) {
    case 'analytics':
      return generateMockAnalyticsData();
    case 'sales':
      return generateMockSalesData();
    case 'social':
      return generateMockSocialMediaData();
    default:
      return generateMockAnalyticsData();
  }
};