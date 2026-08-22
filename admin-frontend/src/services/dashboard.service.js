/**
 * Aggregates live CMS + CRM data for the admin Dashboard overview.
 * Maps API responses into the shapes expected by Dashboard.jsx (no UI changes).
 */
import { listPackages } from '@/api/packages.api';
import { listFeaturedDestinations, listExperiences, listTestimonials } from '@/api/home.api';
import { listBlogArticles } from '@/api/blog.api';
import { listInquiries, listJourneyRequests, listSubscribers } from '@/api/crm.api';
import { listMedia } from '@/api/media.api';
import { getAnalyticsStats } from '@/api/analytics.api';
import { buildMediaUrl } from '@/services/media.service';
import {
  trafficChartData as fallbackTrafficChartData,
  leadChartData as fallbackLeadChartData,
} from '@/lib/adminMockData';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=120&h=80&fit=crop';

function formatCount(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(value);
}

function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function formatDateLabel(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function relativeTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDateLabel(value);
}

function capitalizeStatus(status) {
  if (!status) return 'New';
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function monthKey(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function lastMonths(count = 7) {
  const now = new Date();
  const items = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    items.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: MONTHS[d.getMonth()],
    });
  }
  return items;
}

function groupCountsByMonth(items, dateField) {
  const buckets = Object.fromEntries(lastMonths().map((m) => [m.key, 0]));
  for (const item of items) {
    const key = monthKey(item[dateField]);
    if (key && key in buckets) buckets[key] += 1;
  }
  return buckets;
}

function packageImage(pkg) {
  const url = pkg.featured_image?.file_url || pkg.featured_image?.url;
  return url ? buildMediaUrl(url) : FALLBACK_IMAGE;
}

function destinationImage(dest) {
  const url = dest.image?.file_url || dest.image?.url || dest.image_url;
  return url ? buildMediaUrl(url) : FALLBACK_IMAGE;
}

function articleImage(article) {
  const url = article.featured_image?.file_url || article.featured_image?.url;
  return url ? buildMediaUrl(url) : FALLBACK_IMAGE;
}

function buildStats({
  packages,
  destinations,
  experiences,
  articles,
  testimonials,
  mediaTotal,
  pendingLeads,
  analytics,
}) {
  const pageViews = analytics?.total_pageviews ?? 0;
  const liveVisitors = analytics?.live_visitors ?? 0;

  return [
    { label: 'Total Packages', value: String(packages.length), change: null, trend: 'up', icon: 'Package', color: 'primary' },
    { label: 'Destinations', value: String(destinations.length), change: null, trend: 'up', icon: 'MapPin', color: 'success' },
    { label: 'Experiences', value: String(experiences.length), change: null, trend: 'up', icon: 'Compass', color: 'warning' },
    { label: 'Blog Articles', value: String(articles.length), change: null, trend: 'up', icon: 'FileText', color: 'chart-4' },
    { label: 'Testimonials', value: String(testimonials.length), change: null, trend: 'up', icon: 'Quote', color: 'chart-5' },
    { label: 'Media Files', value: formatCount(mediaTotal), change: null, trend: 'up', icon: 'Image', color: 'primary' },
    {
      label: 'Pending Leads',
      value: String(pendingLeads),
      change: pendingLeads > 0 ? 'Active' : null,
      trend: pendingLeads > 0 ? 'down' : 'up',
      icon: 'Mail',
      color: 'destructive',
    },
    {
      label: 'Live Visitors',
      value: String(liveVisitors),
      change: pageViews > 0 ? `${formatCount(pageViews)} views` : null,
      trend: 'up',
      icon: 'Eye',
      color: 'success',
    },
  ];
}

function buildPopularPackages(packages) {
  return [...packages]
    .sort((a, b) => {
      if (Number(b.is_popular) !== Number(a.is_popular)) return Number(b.is_popular) - Number(a.is_popular);
      if (Number(b.is_featured) !== Number(a.is_featured)) return Number(b.is_featured) - Number(a.is_featured);
      return (a.starting_price ?? 0) - (b.starting_price ?? 0);
    })
    .slice(0, 5)
    .map((pkg) => ({
      name: pkg.title,
      bookings: pkg.is_popular ? 'Popular' : pkg.is_featured ? 'Featured' : 'Published',
      revenue: formatCurrency(pkg.starting_price, pkg.currency || 'USD'),
      image: packageImage(pkg),
    }));
}

function buildTopDestinations(destinations, packages) {
  if (!destinations.length) return [];

  const counts = destinations.map((dest) => {
    const matchCount = packages.filter((pkg) => {
      const country = (pkg.country || '').toLowerCase();
      const city = (pkg.city || '').toLowerCase();
      const name = (dest.name || '').toLowerCase();
      const destCountry = (dest.country || '').toLowerCase();
      return country.includes(name) || name.includes(country) || city.includes(name) || destCountry === country;
    }).length;
    return { dest, count: Math.max(matchCount, 1) };
  });

  const max = Math.max(...counts.map((item) => item.count), 1);

  return counts
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(({ dest, count }) => ({
      name: dest.country ? `${dest.name}, ${dest.country}` : dest.name,
      visits: `${count} pkg${count === 1 ? '' : 's'}`,
      percentage: Math.round((count / max) * 100),
      image: destinationImage(dest),
    }));
}

function buildLeadChart(inquiries, journeys, subscribers) {
  const months = lastMonths();
  const enquiryBuckets = groupCountsByMonth(inquiries, 'created_at');
  const journeyBuckets = groupCountsByMonth(journeys, 'created_at');
  const newsletterBuckets = groupCountsByMonth(subscribers, 'created_at');

  const chart = months.map(({ key, month }) => ({
    month,
    enquiries: enquiryBuckets[key] || 0,
    journey: journeyBuckets[key] || 0,
    newsletter: newsletterBuckets[key] || 0,
  }));

  const hasData = chart.some((row) => row.enquiries || row.journey || row.newsletter);
  return hasData ? chart : fallbackLeadChartData;
}

function buildTrafficChartFromAnalytics(trafficChart) {
  if (!trafficChart?.length) return null;
  const hasData = trafficChart.some((row) => row.visitors || row.pageviews);
  return hasData ? trafficChart : null;
}

function buildTrafficChart(articles, inquiries, journeys, analyticsChart) {
  const fromAnalytics = buildTrafficChartFromAnalytics(analyticsChart);
  if (fromAnalytics) return fromAnalytics;

  const months = lastMonths();
  const viewBuckets = Object.fromEntries(months.map((m) => [m.key, 0]));
  const leadBuckets = Object.fromEntries(months.map((m) => [m.key, 0]));

  for (const article of articles) {
    const key = monthKey(article.published_at || article.created_at);
    if (key && key in viewBuckets) viewBuckets[key] += article.views_count || 0;
  }

  for (const item of [...inquiries, ...journeys]) {
    const key = monthKey(item.created_at);
    if (key && key in leadBuckets) leadBuckets[key] += 1;
  }

  const chart = months.map(({ key, month }) => ({
    month,
    visitors: leadBuckets[key] || 0,
    pageviews: (viewBuckets[key] || 0) + (leadBuckets[key] || 0) * 5,
  }));

  const hasData = chart.some((row) => row.visitors || row.pageviews);
  return hasData ? chart : fallbackTrafficChartData;
}

function buildRecentBlogPosts(articles) {
  return [...articles]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 3)
    .map((article) => ({
      title: article.title,
      author: article.author_name || 'Editorial Team',
      status: capitalizeStatus(article.status),
      date: formatDateLabel(article.published_at || article.updated_at || article.created_at),
      image: articleImage(article),
    }));
}

function buildRecentInquiries(inquiries, journeys) {
  const rows = [
    ...inquiries.map((item) => ({
      name: item.name,
      email: item.email,
      type: 'Contact Enquiry',
      status: capitalizeStatus(item.status),
      time: relativeTime(item.created_at),
      created_at: item.created_at,
    })),
    ...journeys.map((item) => ({
      name: item.name,
      email: item.email,
      type: 'Journey Request',
      status: capitalizeStatus(item.status),
      time: relativeTime(item.created_at),
      created_at: item.created_at,
    })),
  ];

  return rows
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);
}

function buildRecentActivities({ packages, articles, inquiries, journeys, mediaItems }) {
  const activities = [];

  for (const pkg of packages.slice(0, 3)) {
    activities.push({
      user: 'CMS',
      action: pkg.is_active ? 'updated package' : 'saved draft package',
      target: pkg.title,
      time: relativeTime(pkg.created_at),
      avatar: 'PK',
      color: 'success',
      created_at: pkg.created_at,
    });
  }

  for (const article of articles.slice(0, 3)) {
    activities.push({
      user: article.author_name || 'Editorial',
      action: article.status === 'published' ? 'published blog article' : 'updated blog draft',
      target: article.title,
      time: relativeTime(article.updated_at || article.created_at),
      avatar: (article.author_name || 'BL').slice(0, 2).toUpperCase(),
      color: 'primary',
      created_at: article.updated_at || article.created_at,
    });
  }

  for (const item of inquiries.slice(0, 2)) {
    activities.push({
      user: item.name,
      action: 'submitted',
      target: 'contact enquiry',
      time: relativeTime(item.created_at),
      avatar: item.name.charAt(0).toUpperCase(),
      color: 'warning',
      created_at: item.created_at,
    });
  }

  for (const item of journeys.slice(0, 2)) {
    activities.push({
      user: item.name,
      action: 'submitted',
      target: 'journey request',
      time: relativeTime(item.created_at),
      avatar: item.name.charAt(0).toUpperCase(),
      color: 'warning',
      created_at: item.created_at,
    });
  }

  for (const media of (mediaItems || []).slice(0, 2)) {
    activities.push({
      user: 'Media Library',
      action: 'uploaded',
      target: media.original_name || media.filename || 'new media file',
      time: relativeTime(media.created_at),
      avatar: 'MD',
      color: 'chart-4',
      created_at: media.created_at,
    });
  }

  return activities
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);
}

const DashboardService = {
  async loadOverview() {
    const [
      packages,
      destinations,
      experiences,
      testimonials,
      articles,
      inquiries,
      journeys,
      subscribers,
      mediaResponse,
      analytics,
    ] = await Promise.all([
      listPackages().catch(() => []),
      listFeaturedDestinations().catch(() => []),
      listExperiences().catch(() => []),
      listTestimonials().catch(() => []),
      listBlogArticles().catch(() => []),
      listInquiries().catch(() => []),
      listJourneyRequests().catch(() => []),
      listSubscribers().catch(() => []),
      listMedia({ page: 1, page_size: 5, sort_by: 'created_at', sort_order: 'desc' }).catch(() => ({ total: 0, items: [] })),
      getAnalyticsStats().catch(() => null),
    ]);

    const mediaItems = mediaResponse?.items || [];
    const mediaTotal = mediaResponse?.total ?? mediaItems.length;
    const pendingLeads = [...inquiries, ...journeys].filter((item) => (item.status || 'new') === 'new').length;
    const recentInquiries = buildRecentInquiries(inquiries, journeys);
    const newInquiryCount = recentInquiries.filter((item) => item.status === 'New').length;

    return {
      dashboardStats: buildStats({
        packages,
        destinations,
        experiences,
        articles,
        testimonials,
        mediaTotal,
        pendingLeads,
        analytics,
      }),
      trafficChartData: buildTrafficChart(articles, inquiries, journeys, analytics?.traffic_chart),
      leadChartData: buildLeadChart(inquiries, journeys, subscribers),
      popularPackages: buildPopularPackages(packages),
      topDestinations: buildTopDestinations(destinations, packages),
      recentActivities: buildRecentActivities({
        packages,
        articles,
        inquiries,
        journeys,
        mediaItems,
      }),
      recentBlogPosts: buildRecentBlogPosts(articles),
      recentInquiries,
      newInquiryCount,
      liveVisitors: analytics?.live_visitors ?? 0,
      pageviewsToday: analytics?.pageviews_today ?? 0,
    };
  },
};

export default DashboardService;
