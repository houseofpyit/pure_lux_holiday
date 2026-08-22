// Centralized mock data for Pure Luxe Holidays Admin Panel

export const dashboardStats = [
  { label: 'Total Packages', value: '148', change: '+12.5%', trend: 'up', icon: 'Package', color: 'primary' },
  { label: 'Destinations', value: '62', change: '+4.2%', trend: 'up', icon: 'MapPin', color: 'success' },
  { label: 'Experiences', value: '89', change: '+8.1%', trend: 'up', icon: 'Compass', color: 'warning' },
  { label: 'Blog Articles', value: '234', change: '+23.3%', trend: 'up', icon: 'FileText', color: 'chart-4' },
  { label: 'Testimonials', value: '156', change: '+5.7%', trend: 'up', icon: 'Quote', color: 'chart-5' },
  { label: 'Media Files', value: '1,842', change: '+124', trend: 'up', icon: 'Image', color: 'primary' },
  { label: 'Pending Leads', value: '24', change: '-8.3%', trend: 'down', icon: 'Mail', color: 'destructive' },
  { label: 'Visitors', value: '48.2K', change: '+18.9%', trend: 'up', icon: 'Eye', color: 'success' },
];

export const trafficChartData = [
  { month: 'Jan', visitors: 32000, pageviews: 89000 },
  { month: 'Feb', visitors: 35000, pageviews: 92000 },
  { month: 'Mar', visitors: 41000, pageviews: 102000 },
  { month: 'Apr', visitors: 38000, pageviews: 98000 },
  { month: 'May', visitors: 45000, pageviews: 115000 },
  { month: 'Jun', visitors: 52000, pageviews: 134000 },
  { month: 'Jul', visitors: 48200, pageviews: 128000 },
];

export const leadChartData = [
  { month: 'Jan', enquiries: 45, journey: 12, newsletter: 230 },
  { month: 'Feb', enquiries: 52, journey: 18, newsletter: 245 },
  { month: 'Mar', enquiries: 68, journey: 22, newsletter: 312 },
  { month: 'Apr', enquiries: 61, journey: 19, newsletter: 298 },
  { month: 'May', enquiries: 78, journey: 28, newsletter: 367 },
  { month: 'Jun', enquiries: 92, journey: 34, newsletter: 421 },
  { month: 'Jul', enquiries: 84, journey: 31, newsletter: 389 },
];

export const popularPackages = [
  { name: 'Maldives Overwater Villa Retreat', bookings: 342, revenue: '$1.2M', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=80&h=80&fit=crop' },
  { name: 'Santorini Luxury Caldera Escape', bookings: 287, revenue: '$890K', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=80&h=80&fit=crop' },
  { name: 'Bali Ubud Jungle Sanctuary', bookings: 256, revenue: '$720K', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=80&h=80&fit=crop' },
  { name: 'Swiss Alps Private Chalet', bookings: 198, revenue: '$1.5M', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=80&h=80&fit=crop' },
  { name: 'Dubai Burj Royal Experience', bookings: 174, revenue: '$980K', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=80&h=80&fit=crop' },
];

export const topDestinations = [
  { name: 'Maldives', visits: '12.4K', percentage: 92, image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=60&h=60&fit=crop' },
  { name: 'Santorini, Greece', visits: '9.8K', percentage: 78, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=60&h=60&fit=crop' },
  { name: 'Bali, Indonesia', visits: '8.2K', percentage: 65, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=60&h=60&fit=crop' },
  { name: 'Swiss Alps', visits: '6.1K', percentage: 48, image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=60&h=60&fit=crop' },
  { name: 'Dubai, UAE', visits: '5.4K', percentage: 42, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=60&h=60&fit=crop' },
];

export const recentActivities = [
  { user: 'Sarah Mitchell', action: 'published blog article', target: 'Top 10 Luxury Honeymoon Destinations', time: '5 min ago', avatar: 'SM', color: 'primary' },
  { user: 'James Carter', action: 'updated package', target: 'Maldives Overwater Villa Retreat', time: '23 min ago', avatar: 'JC', color: 'success' },
  { user: 'Emma Wilson', action: 'replied to lead', target: 'Journey Request from Robert K.', time: '1 hour ago', avatar: 'EW', color: 'warning' },
  { user: 'Michael Brown', action: 'uploaded 12 images to', target: 'Santorini Gallery', time: '2 hours ago', avatar: 'MB', color: 'chart-4' },
  { user: 'Lisa Anderson', action: 'created new destination', target: 'Amalfi Coast, Italy', time: '3 hours ago', avatar: 'LA', color: 'chart-5' },
  { user: 'David Lee', action: 'updated SEO settings for', target: 'Luxury Packages page', time: '5 hours ago', avatar: 'DL', color: 'primary' },
];

export const recentBlogPosts = [
  { title: 'Top 10 Luxury Honeymoon Destinations for 2026', author: 'Sarah Mitchell', status: 'Published', date: 'Jul 28, 2026', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=80&h=60&fit=crop' },
  { title: 'The Ultimate Guide to Private Island Rentals', author: 'James Carter', status: 'Draft', date: 'Jul 27, 2026', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=80&h=60&fit=crop' },
  { title: 'Inside the World\'s Most Exclusive Safari Lodges', author: 'Emma Wilson', status: 'Published', date: 'Jul 25, 2026', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=80&h=60&fit=crop' },
];

export const recentInquiries = [
  { name: 'Robert Kingsley', email: 'robert.k@email.com', type: 'Journey Request', status: 'New', time: '12 min ago' },
  { name: 'Sophia Chen', email: 'sophia.c@email.com', type: 'Contact Enquiry', status: 'New', time: '34 min ago' },
  { name: 'William Hayes', email: 'w.hayes@email.com', type: 'Journey Request', status: 'In Progress', time: '1 hour ago' },
  { name: 'Olivia Martinez', email: 'olivia.m@email.com', type: 'Contact Enquiry', status: 'Responded', time: '2 hours ago' },
];

export const pendingTasks = [
  { title: 'Review 8 pending journey requests', priority: 'High', due: 'Today', color: 'destructive' },
  { title: 'Publish 3 draft blog articles', priority: 'Medium', due: 'Tomorrow', color: 'warning' },
  { title: 'Update SEO meta for Destinations page', priority: 'Medium', due: 'Jul 30', color: 'warning' },
  { title: 'Approve 24 new media uploads', priority: 'Low', due: 'Jul 31', color: 'muted' },
  { title: 'Archive expired summer packages', priority: 'Low', due: 'Aug 02', color: 'muted' },
];

export const packages = [
  { id: 'PKG-001', title: 'Maldives Overwater Villa Retreat', category: 'Beach & Islands', destination: 'Maldives', duration: '7 Nights', price: '$8,499', status: 'Published', featured: true, image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=100&h=70&fit=crop', created: 'Jun 15, 2026', updated: 'Jul 28, 2026' },
  { id: 'PKG-002', title: 'Santorini Luxury Caldera Escape', category: 'Beach & Islands', destination: 'Greece', duration: '5 Nights', price: '$6,299', status: 'Published', featured: true, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=100&h=70&fit=crop', created: 'Jun 20, 2026', updated: 'Jul 27, 2026' },
  { id: 'PKG-003', title: 'Bali Ubud Jungle Sanctuary', category: 'Wellness & Spa', destination: 'Indonesia', duration: '8 Nights', price: '$5,899', status: 'Published', featured: false, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100&h=70&fit=crop', created: 'Jun 22, 2026', updated: 'Jul 26, 2026' },
  { id: 'PKG-004', title: 'Swiss Alps Private Chalet Experience', category: 'Mountain & Ski', destination: 'Switzerland', duration: '6 Nights', price: '$12,999', status: 'Published', featured: true, image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=100&h=70&fit=crop', created: 'Jul 01, 2026', updated: 'Jul 25, 2026' },
  { id: 'PKG-005', title: 'Dubai Burj Royal Experience', category: 'City Breaks', destination: 'UAE', duration: '4 Nights', price: '$7,499', status: 'Draft', featured: false, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&h=70&fit=crop', created: 'Jul 10, 2026', updated: 'Jul 24, 2026' },
  { id: 'PKG-006', title: 'Amalfi Coast Yacht & Villa Tour', category: 'Beach & Islands', destination: 'Italy', duration: '9 Nights', price: '$14,999', status: 'Published', featured: true, image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=100&h=70&fit=crop', created: 'Jul 05, 2026', updated: 'Jul 23, 2026' },
  { id: 'PKG-007', title: 'Serengeti Luxury Safari Adventure', category: 'Wildlife & Safari', destination: 'Tanzania', duration: '10 Nights', price: '$18,999', status: 'Published', featured: false, image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=100&h=70&fit=crop', created: 'Jun 28, 2026', updated: 'Jul 22, 2026' },
  { id: 'PKG-008', title: 'Kyoto Cultural Immersion Retreat', category: 'Cultural Tours', destination: 'Japan', duration: '7 Nights', price: '$9,799', status: 'Draft', featured: false, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=100&h=70&fit=crop', created: 'Jul 12, 2026', updated: 'Jul 20, 2026' },
  { id: 'PKG-009', title: 'French Riviera Glamour Getaway', category: 'Beach & Islands', destination: 'France', duration: '6 Nights', price: '$11,299', status: 'Published', featured: false, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=100&h=70&fit=crop', created: 'Jul 08, 2026', updated: 'Jul 19, 2026' },
  { id: 'PKG-010', title: 'Fiji Private Island Paradise', category: 'Beach & Islands', destination: 'Fiji', duration: '8 Nights', price: '$13,499', status: 'Archived', featured: false, image: 'https://images.unsplash.com/photo-1589197331516-4d84b72d4af4?w=100&h=70&fit=crop', created: 'May 30, 2026', updated: 'Jul 10, 2026' },
];

export const destinations = [
  { id: 'DST-001', name: 'Maldives', slug: 'maldives', country: 'Maldives', region: 'South Asia', featured: true, status: 'Published', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=100&h=70&fit=crop', created: 'Jun 10, 2026' },
  { id: 'DST-002', name: 'Santorini', slug: 'santorini', country: 'Greece', region: 'Mediterranean', featured: true, status: 'Published', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=100&h=70&fit=crop', created: 'Jun 12, 2026' },
  { id: 'DST-003', name: 'Bali', slug: 'bali', country: 'Indonesia', region: 'Southeast Asia', featured: true, status: 'Published', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100&h=70&fit=crop', created: 'Jun 14, 2026' },
  { id: 'DST-004', name: 'Swiss Alps', slug: 'swiss-alps', country: 'Switzerland', region: 'Central Europe', featured: true, status: 'Published', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=100&h=70&fit=crop', created: 'Jun 16, 2026' },
  { id: 'DST-005', name: 'Dubai', slug: 'dubai', country: 'UAE', region: 'Middle East', featured: false, status: 'Published', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&h=70&fit=crop', created: 'Jun 18, 2026' },
  { id: 'DST-006', name: 'Amalfi Coast', slug: 'amalfi-coast', country: 'Italy', region: 'Mediterranean', featured: true, status: 'Published', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=100&h=70&fit=crop', created: 'Jun 20, 2026' },
  { id: 'DST-007', name: 'Serengeti', slug: 'serengeti', country: 'Tanzania', region: 'East Africa', featured: false, status: 'Published', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=100&h=70&fit=crop', created: 'Jun 22, 2026' },
  { id: 'DST-008', name: 'Kyoto', slug: 'kyoto', country: 'Japan', region: 'East Asia', featured: false, status: 'Draft', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=100&h=70&fit=crop', created: 'Jun 25, 2026' },
];

export const blogArticles = [
  { id: 'BLG-001', title: 'Top 10 Luxury Honeymoon Destinations for 2026', category: 'Travel Guides', author: 'Sarah Mitchell', status: 'Published', date: 'Jul 28, 2026', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=100&h=70&fit=crop' },
  { id: 'BLG-002', title: 'The Ultimate Guide to Private Island Rentals', category: 'Luxury Stays', author: 'James Carter', status: 'Draft', date: 'Jul 27, 2026', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=100&h=70&fit=crop' },
  { id: 'BLG-003', title: 'Inside the World\'s Most Exclusive Safari Lodges', category: 'Wildlife', author: 'Emma Wilson', status: 'Published', date: 'Jul 25, 2026', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=100&h=70&fit=crop' },
  { id: 'BLG-004', title: 'A Food Lover\'s Guide to Amalfi Coast', category: 'Culinary', author: 'Lisa Anderson', status: 'Published', date: 'Jul 23, 2026', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=100&h=70&fit=crop' },
  { id: 'BLG-005', title: 'Wellness Retreats: Rejuvenate in Bali', category: 'Wellness', author: 'Michael Brown', status: 'Scheduled', date: 'Aug 01, 2026', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100&h=70&fit=crop' },
  { id: 'BLG-006', title: 'Skiing the Alps: A Luxury Guide', category: 'Travel Guides', author: 'David Lee', status: 'Published', date: 'Jul 20, 2026', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=100&h=70&fit=crop' },
];

export const leads = [
  { id: 'LD-001', name: 'Robert Kingsley', email: 'robert.k@email.com', phone: '+1 (555) 123-4567', type: 'Journey Request', status: 'New', date: 'Jul 29, 2026', message: 'Interested in a 2-week luxury safari in Tanzania for a family of 4.' },
  { id: 'LD-002', name: 'Sophia Chen', email: 'sophia.c@email.com', phone: '+1 (555) 234-5678', type: 'Contact Enquiry', status: 'New', date: 'Jul 29, 2026', message: 'Looking for honeymoon packages in Maldives for December 2026.' },
  { id: 'LD-003', name: 'William Hayes', email: 'w.hayes@email.com', phone: '+1 (555) 345-6789', type: 'Journey Request', status: 'In Progress', date: 'Jul 28, 2026', message: 'Planning a 10-day European tour covering Italy, France, and Switzerland.' },
  { id: 'LD-004', name: 'Olivia Martinez', email: 'olivia.m@email.com', phone: '+1 (555) 456-7890', type: 'Contact Enquiry', status: 'Responded', date: 'Jul 28, 2026', message: 'Need information about private yacht charters in Amalfi Coast.' },
  { id: 'LD-005', name: 'Daniel Foster', email: 'd.foster@email.com', phone: '+1 (555) 567-8901', type: 'Journey Request', status: 'In Progress', date: 'Jul 27, 2026', message: 'Luxury Bali wellness retreat for 2, 8 nights, private villa preferred.' },
  { id: 'LD-006', name: 'Charlotte Evans', email: 'charlotte.e@email.com', phone: '+1 (555) 678-9012', type: 'Contact Enquiry', status: 'Closed', date: 'Jul 26, 2026', message: 'Interested in Swiss Alps ski package for January 2027.' },
  { id: 'LD-007', name: 'Benjamin Wright', email: 'b.wright@email.com', phone: '+1 (555) 789-0123', type: 'Newsletter', status: 'Subscribed', date: 'Jul 25, 2026', message: 'Subscribed to newsletter' },
];

export const mediaItems = [
  { id: 'M-001', name: 'maldives-aerial.jpg', type: 'image', size: '4.2 MB', url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=300&h=200&fit=crop', folder: 'Maldives' },
  { id: 'M-002', name: 'santorini-sunset.jpg', type: 'image', size: '3.8 MB', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&h=200&fit=crop', folder: 'Greece' },
  { id: 'M-003', name: 'bali-rice-terraces.jpg', type: 'image', size: '5.1 MB', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&h=200&fit=crop', folder: 'Bali' },
  { id: 'M-004', name: 'swiss-alps-chalet.jpg', type: 'image', size: '6.3 MB', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=300&h=200&fit=crop', folder: 'Switzerland' },
  { id: 'M-005', name: 'dubai-skyline.jpg', type: 'image', size: '4.7 MB', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300&h=200&fit=crop', folder: 'Dubai' },
  { id: 'M-006', name: 'amalfi-coast.jpg', type: 'image', size: '3.9 MB', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=300&h=200&fit=crop', folder: 'Italy' },
  { id: 'M-007', name: 'safari-serengeti.jpg', type: 'image', size: '5.5 MB', url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=300&h=200&fit=crop', folder: 'Tanzania' },
  { id: 'M-008', name: 'kyoto-temple.jpg', type: 'image', size: '4.1 MB', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=200&fit=crop', folder: 'Japan' },
  { id: 'M-009', name: 'fiji-beach.jpg', type: 'image', size: '3.6 MB', url: 'https://images.unsplash.com/photo-1589197331516-4d84b72d4af4?w=300&h=200&fit=crop', folder: 'Fiji' },
  { id: 'M-010', name: 'paris-eiffel.jpg', type: 'image', size: '2.9 MB', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=200&fit=crop', folder: 'France' },
  { id: 'M-011', name: 'villa-interior.jpg', type: 'image', size: '5.8 MB', url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=300&h=200&fit=crop', folder: 'Villas' },
  { id: 'M-012', name: 'luxury-yacht.jpg', type: 'image', size: '6.2 MB', url: 'https://images.unsplash.com/photo-1565260100215-fb30c30a1267?w=300&h=200&fit=crop', folder: 'Yachts' },
];

export const mediaFolders = [
  { name: 'Maldives', count: 48, color: 'primary' },
  { name: 'Greece', count: 32, color: 'success' },
  { name: 'Bali', count: 27, color: 'warning' },
  { name: 'Switzerland', count: 19, color: 'chart-4' },
  { name: 'Dubai', count: 22, color: 'chart-5' },
  { name: 'Italy', count: 31, color: 'primary' },
  { name: 'Villas', count: 45, color: 'success' },
  { name: 'Yachts', count: 18, color: 'warning' },
];

export const adminUsers = [
  { id: 'U-001', name: 'Sarah Mitchell', email: 'sarah@pureluxe.com', role: 'Super Admin', status: 'Active', lastActive: 'Online now', avatar: 'SM', color: 'primary' },
  { id: 'U-002', name: 'James Carter', email: 'james@pureluxe.com', role: 'Content Manager', status: 'Active', lastActive: '5 min ago', avatar: 'JC', color: 'success' },
  { id: 'U-003', name: 'Emma Wilson', email: 'emma@pureluxe.com', role: 'Marketing Team', status: 'Active', lastActive: '23 min ago', avatar: 'EW', color: 'warning' },
  { id: 'U-004', name: 'Michael Brown', email: 'michael@pureluxe.com', role: 'SEO Manager', status: 'Active', lastActive: '1 hour ago', avatar: 'MB', color: 'chart-4' },
  { id: 'U-005', name: 'Lisa Anderson', email: 'lisa@pureluxe.com', role: 'Content Manager', status: 'Active', lastActive: '2 hours ago', avatar: 'LA', color: 'chart-5' },
  { id: 'U-006', name: 'David Lee', email: 'david@pureluxe.com', role: 'Marketing Team', status: 'Inactive', lastActive: '3 days ago', avatar: 'DL', color: 'muted' },
];

export const roles = [
  { name: 'Super Admin', users: 1, permissions: 'All Access', color: 'primary', description: 'Full access to all modules, settings, and user management' },
  { name: 'Content Manager', users: 2, permissions: '24 permissions', color: 'success', description: 'Manage content, packages, destinations, blog, and media' },
  { name: 'Marketing Team', users: 2, permissions: '18 permissions', color: 'warning', description: 'Manage blog, SEO, leads, and appearance settings' },
  { name: 'SEO Manager', users: 1, permissions: '12 permissions', color: 'chart-4', description: 'Manage SEO settings, sitemaps, redirects, and analytics' },
];

export const activityLogs = [
  { user: 'Sarah Mitchell', action: 'Login', detail: 'Logged in from Chrome on macOS', ip: '192.168.1.1', time: 'Jul 29, 2026 09:14 AM', type: 'auth' },
  { user: 'James Carter', action: 'Content Updated', detail: 'Updated package "Maldives Overwater Villa Retreat"', ip: '192.168.1.2', time: 'Jul 29, 2026 08:52 AM', type: 'content' },
  { user: 'Emma Wilson', action: 'Lead Replied', detail: 'Replied to journey request from Robert K.', ip: '192.168.1.3', time: 'Jul 29, 2026 08:30 AM', type: 'lead' },
  { user: 'Sarah Mitchell', action: 'Blog Published', detail: 'Published "Top 10 Luxury Honeymoon Destinations"', ip: '192.168.1.1', time: 'Jul 29, 2026 08:15 AM', type: 'content' },
  { user: 'Michael Brown', action: 'Media Uploaded', detail: 'Uploaded 12 images to Santorini Gallery', ip: '192.168.1.4', time: 'Jul 28, 2026 06:42 PM', type: 'media' },
  { user: 'Lisa Anderson', action: 'Destination Created', detail: 'Created new destination "Amalfi Coast, Italy"', ip: '192.168.1.5', time: 'Jul 28, 2026 05:18 PM', type: 'content' },
];

export const homePageSections = [
  { id: 's1', name: 'Hero Banner', type: 'Hero', status: 'Published', items: 1, image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=200&h=120&fit=crop' },
  { id: 's2', name: 'Collections', type: 'Collection Grid', status: 'Published', items: 4, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=200&h=120&fit=crop' },
  { id: 's3', name: 'Featured Destinations', type: 'Destination Carousel', status: 'Published', items: 6, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200&h=120&fit=crop' },
  { id: 's4', name: 'Experiences', type: 'Experience Grid', status: 'Published', items: 8, image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=200&h=120&fit=crop' },
  { id: 's5', name: 'Why Choose Us', type: 'Feature Block', status: 'Published', items: 4, image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&h=120&fit=crop' },
  { id: 's6', name: 'About Section', type: 'Content Block', status: 'Published', items: 1, image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=200&h=120&fit=crop' },
  { id: 's7', name: 'Statistics', type: 'Stats Counter', status: 'Published', items: 4, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&h=120&fit=crop' },
  { id: 's8', name: 'Testimonials', type: 'Testimonial Slider', status: 'Published', items: 6, image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=200&h=120&fit=crop' },
  { id: 's9', name: 'Travel Journal', type: 'Blog Preview', status: 'Published', items: 3, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&h=120&fit=crop' },
  { id: 's10', name: 'CTA Section', type: 'Call to Action', status: 'Draft', items: 1, image: 'https://images.unsplash.com/photo-1565260100215-fb30c30a1267?w=200&h=120&fit=crop' },
];

export const notifications = [
  { id: 1, title: 'New Lead', message: 'Robert Kingsley submitted a journey request', time: '12 min ago', type: 'lead', unread: true },
  { id: 2, title: 'Blog Published', message: 'Sarah published "Top 10 Luxury Honeymoon Destinations"', time: '1 hour ago', type: 'content', unread: true },
  { id: 3, title: 'Media Uploaded', message: 'Michael uploaded 12 images to Santorini Gallery', time: '2 hours ago', type: 'media', unread: true },
  { id: 4, title: 'Package Updated', message: 'James updated "Maldives Overwater Villa Retreat"', time: '3 hours ago', type: 'content', unread: false },
  { id: 5, title: 'New Newsletter Subscriber', message: 'benjamin.w@email.com subscribed to newsletter', time: '5 hours ago', type: 'lead', unread: false },
];

// ===== Testimonials =====
export const testimonials = [
  { id: 'TST-001', customer: 'Emily & James Parker', review: 'Our Maldives honeymoon was beyond perfect. Every detail was handled with such care...', rating: 5, location: 'New York, USA', trip: 'Maldives Overwater Villa Retreat', category: 'Honeymoon', photo: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=100&h=100&fit=crop', featured: true, status: 'Published', date: 'Jul 28, 2026' },
  { id: 'TST-002', customer: 'Sophia Laurent', review: 'The Santorini experience was magical. The private caldera villa exceeded all expectations...', rating: 5, location: 'Paris, France', trip: 'Santorini Luxury Caldera Escape', category: 'Couples', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', featured: true, status: 'Published', date: 'Jul 25, 2026' },
  { id: 'TST-003', customer: 'The Henderson Family', review: 'Our African safari was the trip of a lifetime. The guides were incredibly knowledgeable...', rating: 5, location: 'London, UK', trip: 'Serengeti Luxury Safari Adventure', category: 'Family', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', featured: false, status: 'Published', date: 'Jul 22, 2026' },
  { id: 'TST-004', customer: 'Marcus Chen', review: 'Bali wellness retreat was exactly what I needed. The private villa and spa treatments were world-class...', rating: 4, location: 'Singapore', trip: 'Bali Ubud Jungle Sanctuary', category: 'Wellness', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', featured: false, status: 'Published', date: 'Jul 20, 2026' },
  { id: 'TST-005', customer: 'Isabella Romano', review: 'Amalfi Coast tour was stunning. The yacht charter and private chef made it unforgettable...', rating: 5, location: 'Milan, Italy', trip: 'Amalfi Coast Yacht & Villa Tour', category: 'Luxury', photo: 'https://images.unsplash.com/photo-1534528741775-348a3364e9c8?w=100&h=100&fit=crop', featured: true, status: 'Draft', date: 'Jul 18, 2026' },
  { id: 'TST-006', customer: 'Robert & Linda Foster', review: 'Swiss Alps chalet was breathtaking. Private ski instructor and gourmet dining every night...', rating: 5, location: 'Toronto, Canada', trip: 'Swiss Alps Private Chalet Experience', category: 'Couples', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', featured: false, status: 'Published', date: 'Jul 15, 2026' },
];

export const testimonialCategories = [
  { id: 'TC-01', name: 'Honeymoon', count: 42, status: 'Published' },
  { id: 'TC-02', name: 'Family Travel', count: 38, status: 'Published' },
  { id: 'TC-03', name: 'Couples', count: 35, status: 'Published' },
  { id: 'TC-04', name: 'Wellness', count: 18, status: 'Published' },
  { id: 'TC-05', name: 'Luxury', count: 23, status: 'Published' },
  { id: 'TC-06', name: 'Adventure', count: 12, status: 'Draft' },
];

// ===== FAQs =====
export const faqs = [
  { id: 'FAQ-001', question: 'What is included in your luxury travel packages?', answer: 'Our packages include luxury accommodation, private transfers, daily breakfast, selected meals, curated experiences, and 24/7 concierge support...', category: 'General', order: 1, status: 'Published' },
  { id: 'FAQ-002', question: 'Can I customize my travel itinerary?', answer: 'Absolutely! All our packages are fully customizable. Our travel designers will work with you to create a bespoke itinerary...', category: 'Booking', order: 2, status: 'Published' },
  { id: 'FAQ-003', question: 'What is your cancellation policy?', answer: 'We offer flexible cancellation policies depending on the package. Most packages allow free cancellation up to 30 days before departure...', category: 'Booking', order: 3, status: 'Published' },
  { id: 'FAQ-004', question: 'Do you offer travel insurance?', answer: 'Yes, we offer comprehensive travel insurance through our trusted partners. Insurance can be added during the booking process...', category: 'General', order: 4, status: 'Published' },
  { id: 'FAQ-005', question: 'How far in advance should I book?', answer: 'We recommend booking 3-6 months in advance for peak season travel. For last-minute bookings, contact our concierge team...', category: 'Booking', order: 5, status: 'Published' },
  { id: 'FAQ-006', question: 'Are flights included in the packages?', answer: 'Flight inclusions vary by package. Some packages include business class flights, while others are land-only. Check individual package details...', category: 'General', order: 6, status: 'Draft' },
];

export const faqCategories = [
  { id: 'FC-01', name: 'General', count: 24, status: 'Published' },
  { id: 'FC-02', name: 'Booking', count: 18, status: 'Published' },
  { id: 'FC-03', name: 'Payments', count: 12, status: 'Published' },
  { id: 'FC-04', name: 'Travel Insurance', count: 8, status: 'Published' },
  { id: 'FC-05', name: 'Customization', count: 15, status: 'Published' },
];

// ===== Blog Categories & Tags =====
export const blogCategories = [
  { id: 'BC-01', name: 'Travel Guides', slug: 'travel-guides', count: 48, status: 'Published', color: 'primary' },
  { id: 'BC-02', name: 'Luxury Stays', slug: 'luxury-stays', count: 36, status: 'Published', color: 'success' },
  { id: 'BC-03', name: 'Wildlife', slug: 'wildlife', count: 22, status: 'Published', color: 'warning' },
  { id: 'BC-04', name: 'Culinary', slug: 'culinary', count: 18, status: 'Published', color: 'chart-4' },
  { id: 'BC-05', name: 'Wellness', slug: 'wellness', count: 15, status: 'Published', color: 'chart-5' },
  { id: 'BC-06', name: 'Adventure', slug: 'adventure', count: 12, status: 'Draft', color: 'primary' },
];

export const blogTags = [
  { id: 'TG-01', name: 'honeymoon', slug: 'honeymoon', count: 24 },
  { id: 'TG-02', name: 'beach', slug: 'beach', count: 38 },
  { id: 'TG-03', name: 'luxury', slug: 'luxury', count: 52 },
  { id: 'TG-04', name: 'safari', slug: 'safari', count: 18 },
  { id: 'TG-05', name: 'island', slug: 'island', count: 29 },
  { id: 'TG-06', name: 'mountain', slug: 'mountain', count: 15 },
  { id: 'TG-07', name: 'cultural', slug: 'cultural', count: 22 },
  { id: 'TG-08', name: 'wellness', slug: 'wellness', count: 19 },
  { id: 'TG-09', name: 'family', slug: 'family', count: 31 },
  { id: 'TG-10', name: 'romantic', slug: 'romantic', count: 27 },
];

// ===== Package Categories =====
export const packageCategories = [
  { id: 'PC-01', name: 'Beach & Islands', slug: 'beach-islands', count: 42, icon: 'Waves', status: 'Published', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=100&h=70&fit=crop' },
  { id: 'PC-02', name: 'Wellness & Spa', slug: 'wellness-spa', count: 28, icon: 'Sparkles', status: 'Published', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100&h=70&fit=crop' },
  { id: 'PC-03', name: 'Mountain & Ski', slug: 'mountain-ski', count: 22, icon: 'Mountain', status: 'Published', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=100&h=70&fit=crop' },
  { id: 'PC-04', name: 'City Breaks', slug: 'city-breaks', count: 18, icon: 'Building2', status: 'Published', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&h=70&fit=crop' },
  { id: 'PC-05', name: 'Wildlife & Safari', slug: 'wildlife-safari', count: 15, icon: 'Trees', status: 'Published', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=100&h=70&fit=crop' },
  { id: 'PC-06', name: 'Cultural Tours', slug: 'cultural-tours', count: 23, icon: 'Landmark', status: 'Published', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=100&h=70&fit=crop' },
];

// ===== Experiences =====
export const experiences = [
  { id: 'EXP-001', title: 'Private Overwater Dining', destination: 'Maldives', category: 'Dining', duration: '3 hours', price: '$450', status: 'Published', featured: true, image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=100&h=70&fit=crop' },
  { id: 'EXP-002', title: 'Sunset Caldera Cruise', destination: 'Santorini', category: 'Boating', duration: '4 hours', price: '$380', status: 'Published', featured: true, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=100&h=70&fit=crop' },
  { id: 'EXP-003', title: 'Rice Terrace Trek', destination: 'Bali', category: 'Adventure', duration: '5 hours', price: '$220', status: 'Published', featured: false, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100&h=70&fit=crop' },
  { id: 'EXP-004', title: 'Private Ski Lesson', destination: 'Swiss Alps', category: 'Sports', duration: 'Full day', price: '$680', status: 'Published', featured: false, image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=100&h=70&fit=crop' },
  { id: 'EXP-005', title: 'Helicopter City Tour', destination: 'Dubai', category: 'Sightseeing', duration: '45 min', price: '$520', status: 'Published', featured: true, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&h=70&fit=crop' },
  { id: 'EXP-006', title: 'Private Yacht Charter', destination: 'Amalfi Coast', category: 'Boating', duration: 'Full day', price: '$2,400', status: 'Draft', featured: false, image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=100&h=70&fit=crop' },
];

// ===== Itinerary =====
export const itineraryItems = [
  { id: 'ITN-001', package: 'Maldives Overwater Villa Retreat', day: 1, title: 'Arrival & Welcome', description: 'Private speedboat transfer to resort, welcome champagne, villa orientation', meals: 'Dinner', status: 'Published' },
  { id: 'ITN-002', package: 'Maldives Overwater Villa Retreat', day: 2, title: 'Snorkeling & Spa', description: 'Guided house reef snorkeling, couples spa treatment, sunset dolphin cruise', meals: 'Breakfast, Lunch', status: 'Published' },
  { id: 'ITN-003', package: 'Maldives Overwater Villa Retreat', day: 3, title: 'Private Sandbank Picnic', description: 'Private boat to deserted sandbank, gourmet picnic, swimming', meals: 'Breakfast, Lunch', status: 'Published' },
  { id: 'ITN-004', package: 'Santorini Luxury Caldera Escape', day: 1, title: 'Arrival & Sunset', description: 'Private transfer to villa, welcome wine, caldera sunset viewing', meals: 'Dinner', status: 'Published' },
  { id: 'ITN-005', package: 'Santorini Luxury Caldera Escape', day: 2, title: 'Island Tour & Wine Tasting', description: 'Private guide for island tour, visit to 3 wineries, traditional lunch', meals: 'Breakfast, Lunch', status: 'Published' },
  { id: 'ITN-006', package: 'Bali Ubud Jungle Sanctuary', day: 1, title: 'Arrival & Temple Visit', description: 'Airport transfer, Tirta Empul temple purification ceremony', meals: 'Dinner', status: 'Draft' },
];

// ===== Highlights =====
export const highlights = [
  { id: 'HLT-001', package: 'Maldives Overwater Villa Retreat', title: 'Private Overwater Villa', icon: 'Home', status: 'Published' },
  { id: 'HLT-002', package: 'Maldives Overwater Villa Retreat', title: 'Underwater Restaurant Dining', icon: 'UtensilsCrossed', status: 'Published' },
  { id: 'HLT-003', package: 'Maldives Overwater Villa Retreat', title: 'Couples Spa Treatment', icon: 'Sparkles', status: 'Published' },
  { id: 'HLT-004', package: 'Santorini Luxury Caldera Escape', title: 'Private Caldera Villa', icon: 'Home', status: 'Published' },
  { id: 'HLT-005', package: 'Santorini Luxury Caldera Escape', title: 'Sunset Catamaran Cruise', icon: 'Sailboat', status: 'Published' },
  { id: 'HLT-006', package: 'Bali Ubud Jungle Sanctuary', title: 'Private Jungle Pool Villa', icon: 'Home', status: 'Published' },
];

// ===== Inclusions & Exclusions =====
export const inclusions = [
  { id: 'INC-001', package: 'Maldives Overwater Villa Retreat', item: '7 nights in Overwater Villa', category: 'Accommodation', status: 'Published' },
  { id: 'INC-002', package: 'Maldives Overwater Villa Retreat', item: 'Daily breakfast & dinner', category: 'Meals', status: 'Published' },
  { id: 'INC-003', package: 'Maldives Overwater Villa Retreat', item: 'Speedboat transfers', category: 'Transfers', status: 'Published' },
  { id: 'INC-004', package: 'Maldives Overwater Villa Retreat', item: 'Couples spa treatment', category: 'Experiences', status: 'Published' },
  { id: 'INC-005', package: 'Santorini Luxury Caldera Escape', item: '5 nights in Caldera Villa', category: 'Accommodation', status: 'Published' },
  { id: 'INC-006', package: 'Santorini Luxury Caldera Escape', item: 'Private island tour', category: 'Experiences', status: 'Published' },
];

export const exclusions = [
  { id: 'EXC-001', package: 'Maldives Overwater Villa Retreat', item: 'International flights', category: 'Flights', status: 'Published' },
  { id: 'EXC-002', package: 'Maldives Overwater Villa Retreat', item: 'Personal expenses', category: 'Miscellaneous', status: 'Published' },
  { id: 'EXC-003', package: 'Maldives Overwater Villa Retreat', item: 'Travel insurance', category: 'Insurance', status: 'Published' },
  { id: 'EXC-004', package: 'Santorini Luxury Caldera Escape', item: 'International flights', category: 'Flights', status: 'Published' },
  { id: 'EXC-005', package: 'Santorini Luxury Caldera Escape', item: 'Lunch (unless specified)', category: 'Meals', status: 'Published' },
  { id: 'EXC-006', package: 'Bali Ubud Jungle Sanctuary', item: 'Visa fees', category: 'Documentation', status: 'Published' },
];

// ===== Newsletter Subscribers =====
export const newsletterSubscribers = [
  { id: 'NS-001', email: 'robert.k@email.com', name: 'Robert Kingsley', status: 'Subscribed', date: 'Jul 29, 2026', source: 'Footer Form' },
  { id: 'NS-002', email: 'sophia.c@email.com', name: 'Sophia Chen', status: 'Subscribed', date: 'Jul 28, 2026', source: 'Popup' },
  { id: 'NS-003', email: 'w.hayes@email.com', name: 'William Hayes', status: 'Subscribed', date: 'Jul 27, 2026', source: 'Blog Page' },
  { id: 'NS-004', email: 'olivia.m@email.com', name: 'Olivia Martinez', status: 'Unsubscribed', date: 'Jul 26, 2026', source: 'Footer Form' },
  { id: 'NS-005', email: 'd.foster@email.com', name: 'Daniel Foster', status: 'Subscribed', date: 'Jul 25, 2026', source: 'Popup' },
  { id: 'NS-006', email: 'charlotte.e@email.com', name: 'Charlotte Evans', status: 'Subscribed', date: 'Jul 24, 2026', source: 'Homepage' },
  { id: 'NS-007', email: 'b.wright@email.com', name: 'Benjamin Wright', status: 'Subscribed', date: 'Jul 23, 2026', source: 'Footer Form' },
  { id: 'NS-008', email: 'emma.t@email.com', name: 'Emma Turner', status: 'Unsubscribed', date: 'Jul 22, 2026', source: 'Blog Page' },
];

// ===== Journey Requests =====
export const journeyRequests = [
  { id: 'JR-001', name: 'Robert Kingsley', email: 'robert.k@email.com', phone: '+1 (555) 123-4567', destination: 'Tanzania', travelers: 4, budget: '$50,000+', duration: '14 days', status: 'New', date: 'Jul 29, 2026', assigned: 'Sarah Mitchell' },
  { id: 'JR-002', name: 'Sophia Chen', email: 'sophia.c@email.com', phone: '+1 (555) 234-5678', destination: 'Maldives', travelers: 2, budget: '$15,000-$25,000', duration: '7 days', status: 'New', date: 'Jul 29, 2026', assigned: 'Unassigned' },
  { id: 'JR-003', name: 'William Hayes', email: 'w.hayes@email.com', phone: '+1 (555) 345-6789', destination: 'Europe (Multi)', travelers: 2, budget: '$25,000-$50,000', duration: '10 days', status: 'In Progress', date: 'Jul 28, 2026', assigned: 'James Carter' },
  { id: 'JR-004', name: 'Daniel Foster', email: 'd.foster@email.com', phone: '+1 (555) 567-8901', destination: 'Bali', travelers: 2, budget: '$10,000-$15,000', duration: '8 days', status: 'In Progress', date: 'Jul 27, 2026', assigned: 'Emma Wilson' },
  { id: 'JR-005', name: 'Charlotte Evans', email: 'charlotte.e@email.com', phone: '+1 (555) 678-9012', destination: 'Switzerland', travelers: 4, budget: '$25,000-$50,000', duration: '6 days', status: 'Responded', date: 'Jul 26, 2026', assigned: 'Sarah Mitchell' },
  { id: 'JR-006', name: 'Benjamin Wright', email: 'b.wright@email.com', phone: '+1 (555) 789-0123', destination: 'Italy', travelers: 6, budget: '$50,000+', duration: '12 days', status: 'Closed', date: 'Jul 25, 2026', assigned: 'James Carter' },
];

// ===== Redirects =====
export const redirects = [
  { id: 'RD-001', from: '/old-maldives-packages', to: '/destinations/maldives', type: '301 Permanent', status: 'Active' },
  { id: 'RD-002', from: '/blog/old-post', to: '/blog/luxury-travel-guide', type: '301 Permanent', status: 'Active' },
  { id: 'RD-003', from: '/summer-deals', to: '/packages?season=summer', type: '302 Temporary', status: 'Active' },
  { id: 'RD-004', from: '/contact-us', to: '/contact', type: '301 Permanent', status: 'Active' },
  { id: 'RD-005', from: '/about-company', to: '/about', type: '301 Permanent', status: 'Inactive' },
  { id: 'RD-006', from: '/old-safari', to: '/packages/wildlife-safari', type: '301 Permanent', status: 'Active' },
];

// ===== Navigation Items =====
export const navigationItems = [
  { id: 'NAV-01', label: 'Home', url: '/', order: 1, target: 'Same Tab', status: 'Published', children: 0 },
  { id: 'NAV-02', label: 'Destinations', url: '/destinations', order: 2, target: 'Same Tab', status: 'Published', children: 8 },
  { id: 'NAV-03', label: 'Experiences', url: '/experiences', order: 3, target: 'Same Tab', status: 'Published', children: 6 },
  { id: 'NAV-04', label: 'Luxury Packages', url: '/packages', order: 4, target: 'Same Tab', status: 'Published', children: 4 },
  { id: 'NAV-05', label: 'Gallery', url: '/gallery', order: 5, target: 'Same Tab', status: 'Published', children: 0 },
  { id: 'NAV-06', label: 'Blog', url: '/blog', order: 6, target: 'Same Tab', status: 'Published', children: 0 },
  { id: 'NAV-07', label: 'About', url: '/about', order: 7, target: 'Same Tab', status: 'Published', children: 0 },
  { id: 'NAV-08', label: 'Contact', url: '/contact', order: 8, target: 'Same Tab', status: 'Published', children: 0 },
];

// ===== Footer Links =====
export const footerLinks = [
  { id: 'FL-01', section: 'Company', label: 'About Us', url: '/about', order: 1, status: 'Published' },
  { id: 'FL-02', section: 'Company', label: 'Our Team', url: '/team', order: 2, status: 'Published' },
  { id: 'FL-03', section: 'Company', label: 'Careers', url: '/careers', order: 3, status: 'Published' },
  { id: 'FL-04', section: 'Company', label: 'Press', url: '/press', order: 4, status: 'Published' },
  { id: 'FL-05', section: 'Destinations', label: 'Maldives', url: '/destinations/maldives', order: 1, status: 'Published' },
  { id: 'FL-06', section: 'Destinations', label: 'Santorini', url: '/destinations/santorini', order: 2, status: 'Published' },
  { id: 'FL-07', section: 'Destinations', label: 'Bali', url: '/destinations/bali', order: 3, status: 'Published' },
  { id: 'FL-08', section: 'Support', label: 'Contact Us', url: '/contact', order: 1, status: 'Published' },
  { id: 'FL-09', section: 'Support', label: 'FAQs', url: '/faqs', order: 2, status: 'Published' },
  { id: 'FL-10', section: 'Legal', label: 'Privacy Policy', url: '/privacy', order: 1, status: 'Published' },
  { id: 'FL-11', section: 'Legal', label: 'Terms of Service', url: '/terms', order: 2, status: 'Published' },
];

// ===== Hero Banner Data =====
export const heroBanner = {
  title: 'Curated Luxury',
  highlightedTitle: 'Travel Experiences',
  subtitle: 'Bespoke journeys for the discerning traveler',
  description: 'Discover the world\'s most exclusive destinations with our handcrafted luxury travel experiences. From private islands to overwater villas, every journey is tailored to perfection.',
  primaryButtonText: 'Explore Packages',
  primaryButtonLink: '/packages',
  secondaryButtonText: 'Plan My Journey',
  secondaryButtonLink: '/plan-journey',
  badge: '✨ #1 Luxury Travel Agency 2026',
  trustBadge: 'Trusted by 10,000+ travelers worldwide',
  desktopBanner: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&h=1080&fit=crop',
  tabletBanner: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1024&h=768&fit=crop',
  mobileBanner: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=640&h=960&fit=crop',
  overlay: 'Dark Gradient',
  overlayOpacity: 40,
  scrollIndicator: true,
  animation: 'Fade In',
  status: 'Published',
};

// ===== Collections =====
export const collections = [
  { id: 'COL-01', title: 'Beach Escapes', subtitle: 'Sun-kissed shores & private islands', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=200&h=140&fit=crop', link: '/packages?category=beach', order: 1, status: 'Published' },
  { id: 'COL-02', title: 'Mountain Retreats', subtitle: 'Alpine luxury & ski adventures', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&h=140&fit=crop', link: '/packages?category=mountain', order: 2, status: 'Published' },
  { id: 'COL-03', title: 'Cultural Journeys', subtitle: 'Immersive heritage experiences', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&h=140&fit=crop', link: '/packages?category=cultural', order: 3, status: 'Published' },
  { id: 'COL-04', title: 'Wildlife Safaris', subtitle: 'Untamed luxury in the wild', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=200&h=140&fit=crop', link: '/packages?category=safari', order: 4, status: 'Published' },
];

// ===== Statistics =====
export const statisticsData = [
  { id: 'ST-01', label: 'Happy Travelers', value: '10,000+', icon: 'Users', suffix: '', status: 'Published' },
  { id: 'ST-02', label: 'Destinations', value: '62', icon: 'MapPin', suffix: '', status: 'Published' },
  { id: 'ST-03', label: 'Luxury Packages', value: '148', icon: 'Package', suffix: '', status: 'Published' },
  { id: 'ST-04', label: 'Years of Excellence', value: '15', icon: 'Award', suffix: '+', status: 'Published' },
];

// ===== Why Choose Us =====
export const whyChooseUs = [
  { id: 'WCU-01', title: 'Bespoke Itineraries', description: 'Every journey is crafted to your unique preferences and desires', icon: 'Sparkles', status: 'Published', order: 1 },
  { id: 'WCU-02', title: '24/7 Concierge', description: 'Round-the-clock support from our dedicated travel concierge team', icon: 'Headphones', status: 'Published', order: 2 },
  { id: 'WCU-03', title: 'Verified Luxury', description: 'Hand-picked properties and experiences meeting our luxury standards', icon: 'BadgeCheck', status: 'Published', order: 3 },
  { id: 'WCU-04', title: 'Best Price Guarantee', description: 'Unmatched value with our price match promise on all packages', icon: 'Tag', status: 'Published', order: 4 },
];

// ===== Page SEO Data =====
export const pageSeoData = [
  { id: 'PS-01', page: 'Home', url: '/', title: 'Pure Luxe Holidays — Luxury Travel Experiences', score: 92, status: 'Optimized' },
  { id: 'PS-02', page: 'Destinations', url: '/destinations', title: 'Luxury Travel Destinations | Pure Luxe Holidays', score: 85, status: 'Optimized' },
  { id: 'PS-03', page: 'Packages', url: '/packages', title: 'Luxury Travel Packages | Pure Luxe Holidays', score: 78, status: 'Needs Attention' },
  { id: 'PS-04', page: 'About', url: '/about', title: 'About Pure Luxe Holidays', score: 65, status: 'Needs Attention' },
  { id: 'PS-05', page: 'Blog', url: '/blog', title: 'Luxury Travel Blog | Pure Luxe Holidays', score: 88, status: 'Optimized' },
  { id: 'PS-06', page: 'Contact', url: '/contact', title: 'Contact Pure Luxe Holidays', score: 72, status: 'Needs Attention' },
];