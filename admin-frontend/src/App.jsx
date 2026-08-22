import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import GuestRoute from '@/components/GuestRoute';
// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
// Admin layout + pages
import AdminLayout from '@/components/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import Packages from '@/pages/admin/Packages';
import Destinations from '@/pages/admin/Destinations';
import Blog from '@/pages/admin/Blog';
import MediaLibrary from '@/pages/admin/MediaLibrary';
import Leads from '@/pages/admin/Leads';
// SEO module — API-connected pages
import Seo from '@/pages/admin/Seo';
import PageSeo from '@/pages/admin/PageSeo';
import SitemapManager from '@/pages/admin/SitemapManager';
import RobotsEditor from '@/pages/admin/RobotsEditor';
import RedirectManager from '@/pages/admin/RedirectManager';
import Users from '@/pages/admin/Users';
import Settings from '@/pages/admin/Settings';
import HomePageCms from '@/pages/admin/HomePageCms';
// (Placeholder import removed — unused)// Content modules
import Testimonials from '@/pages/admin/Testimonials';
import Faqs from '@/pages/admin/Faqs';
import BlogCategories from '@/pages/admin/BlogCategories';
import BlogTags from '@/pages/admin/BlogTags';
// Travel modules
import PackageCategories from '@/pages/admin/PackageCategories';
import Experiences from '@/pages/admin/Experiences';
import Itinerary from '@/pages/admin/Itinerary';
import Highlights from '@/pages/admin/Highlights';
import Inclusions from '@/pages/admin/Inclusions';
import Exclusions from '@/pages/admin/Exclusions';
// Leads modules
import JourneyRequests from '@/pages/admin/JourneyRequests';
import Newsletter from '@/pages/admin/Newsletter';
// Appearance modules
import NavigationManager from '@/pages/admin/NavigationManager';
import FooterManager from '@/pages/admin/FooterManager';
import CtaSettings from '@/pages/admin/CtaSettings';
// Admin modules
import ActivityLogs from '@/pages/admin/ActivityLogs';
// Website CMS pages
import AboutCms from '@/pages/admin/AboutCms';
import AboutPageCms from '@/pages/admin/AboutPageCms';
import AboutHeroCms from '@/pages/admin/about/AboutHeroCms';
import AboutStoryCms from '@/pages/admin/about/AboutStoryCms';
import AboutMissionVisionCms from '@/pages/admin/about/AboutMissionVisionCms';
import AboutCoreValuesCms from '@/pages/admin/about/AboutCoreValuesCms';
import AboutTimelineCms from '@/pages/admin/about/AboutTimelineCms';
import AboutLeadershipCms from '@/pages/admin/about/AboutLeadershipCms';
import AboutAwardsCms from '@/pages/admin/about/AboutAwardsCms';
import AboutPartnersCms from '@/pages/admin/about/AboutPartnersCms';
import AboutCtaCms from '@/pages/admin/about/AboutCtaCms';
import AboutSeoCms from '@/pages/admin/about/AboutSeoCms';
import ContactCms from '@/pages/admin/ContactCms';
import ContactPageCms from '@/pages/admin/ContactPageCms';
import PlanJourneyCms from '@/pages/admin/PlanJourneyCms';
// Destinations page CMS
import DestinationsPageCms from '@/pages/admin/DestinationsPageCms';
import DestinationsHeroCms from '@/pages/admin/destinations/DestinationsHeroCms';
import DestinationsListingCms from '@/pages/admin/destinations/DestinationsListingCms';
import DestinationsCtaCms from '@/pages/admin/destinations/DestinationsCtaCms';
import DestinationsSeoCms from '@/pages/admin/destinations/DestinationsSeoCms';
// Experiences page CMS
import ExperiencesPageCms from '@/pages/admin/ExperiencesPageCms';
import ExperiencesHeroCms from '@/pages/admin/experiences/ExperiencesHeroCms';
import ExperiencesListingCms from '@/pages/admin/experiences/ExperiencesListingCms';
import ExperiencesCtaCms from '@/pages/admin/experiences/ExperiencesCtaCms';
import ExperiencesSeoCms from '@/pages/admin/experiences/ExperiencesSeoCms';
// Packages page CMS
import PackagesPageCms from '@/pages/admin/PackagesPageCms';
import PackagesHeroCms from '@/pages/admin/packages/PackagesHeroCms';
import PackagesListingCms from '@/pages/admin/packages/PackagesListingCms';
import PackagesCtaCms from '@/pages/admin/packages/PackagesCtaCms';
import PackagesSeoCms from '@/pages/admin/packages/PackagesSeoCms';
// Gallery page CMS
import GalleryPageCms from '@/pages/admin/GalleryPageCms';
import GalleryHeroCms from '@/pages/admin/gallery/GalleryHeroCms';
import GallerySettingsCms from '@/pages/admin/gallery/GallerySettingsCms';
import GalleryCtaCms from '@/pages/admin/gallery/GalleryCtaCms';
import GallerySeoCms from '@/pages/admin/gallery/GallerySeoCms';
// Blog page CMS
import BlogPageCms from '@/pages/admin/BlogPageCms';
import BlogHeroCms from '@/pages/admin/blog/BlogHeroCms';
import BlogListingCms from '@/pages/admin/blog/BlogListingCms';
import BlogFeaturedCms from '@/pages/admin/blog/BlogFeaturedCms';
import BlogCtaCms from '@/pages/admin/blog/BlogCtaCms';
import BlogSeoCms from '@/pages/admin/blog/BlogSeoCms';
// Home page section CMS pages
import HeroBannerCms from '@/pages/admin/HeroBannerCms';
import CollectionsCms from '@/pages/admin/CollectionsCms';
import FeaturedDestinationsCms from '@/pages/admin/FeaturedDestinationsCms';
import ExperiencesCms from '@/pages/admin/ExperiencesCms';
import WhyChooseUsCms from '@/pages/admin/WhyChooseUsCms';
import AboutSectionCms from '@/pages/admin/AboutSectionCms';
import StatisticsCms from '@/pages/admin/StatisticsCms';
import TestimonialsCms from '@/pages/admin/TestimonialsCms';
import TravelJournalCms from '@/pages/admin/TravelJournalCms';
import ConciergeCtaCms from '@/pages/admin/ConciergeCtaCms';

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Guest-only routes — redirect to /admin if already logged in */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected admin routes — redirect to /login if not authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/packages" element={<Packages />} />
        <Route path="/admin/destinations" element={<Destinations />} />
        <Route path="/admin/blog" element={<Blog />} />
        <Route path="/admin/media" element={<MediaLibrary />} />
        <Route path="/admin/leads" element={<Leads />} />
        <Route path="/admin/leads/journey" element={<JourneyRequests />} />
        <Route path="/admin/leads/newsletter" element={<Newsletter />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/website/home" element={<HomePageCms />} />
        {/* Home page section CMS routes */}
        <Route path="/admin/website/home/hero" element={<HeroBannerCms />} />
        <Route path="/admin/website/home/collections" element={<CollectionsCms />} />
        <Route path="/admin/website/home/featured-destinations" element={<FeaturedDestinationsCms />} />
        <Route path="/admin/website/home/experiences" element={<ExperiencesCms />} />
        <Route path="/admin/website/home/why-choose-us" element={<WhyChooseUsCms />} />
        <Route path="/admin/website/home/about-section" element={<AboutSectionCms />} />
        <Route path="/admin/website/home/statistics" element={<StatisticsCms />} />
        <Route path="/admin/website/home/testimonials" element={<TestimonialsCms />} />
        <Route path="/admin/website/home/travel-journal" element={<TravelJournalCms />} />
        <Route path="/admin/website/home/concierge-cta" element={<ConciergeCtaCms />} />
        {/* Website CMS pages */}
        <Route path="/admin/website/about" element={<AboutPageCms />} />
        <Route path="/admin/website/about/hero" element={<AboutHeroCms />} />
        <Route path="/admin/website/about/story" element={<AboutStoryCms />} />
        <Route path="/admin/website/about/mission-vision" element={<AboutMissionVisionCms />} />
        <Route path="/admin/website/about/core-values" element={<AboutCoreValuesCms />} />
        <Route path="/admin/website/about/timeline" element={<AboutTimelineCms />} />
        <Route path="/admin/website/about/leadership" element={<AboutLeadershipCms />} />
        <Route path="/admin/website/about/awards" element={<AboutAwardsCms />} />
        <Route path="/admin/website/about/partners" element={<AboutPartnersCms />} />
        <Route path="/admin/website/about/cta" element={<AboutCtaCms />} />
        <Route path="/admin/website/about/seo" element={<AboutSeoCms />} />
<Route path="/admin/website/contact" element={<ContactCms />} />
<Route path="/admin/website/contact/hero" element={<ContactPageCms />} />
<Route path="/admin/website/contact/settings" element={<ContactPageCms />} />
<Route path="/admin/website/contact/cta" element={<ContactPageCms />} />
<Route path="/admin/website/contact/seo" element={<ContactPageCms />} />
<Route path="/admin/website/plan-journey" element={<PlanJourneyCms />} />
        {/* Destinations page CMS routes */}
        <Route path="/admin/website/destinations" element={<DestinationsPageCms />} />
        <Route path="/admin/website/destinations/hero" element={<DestinationsHeroCms />} />
        <Route path="/admin/website/destinations/listing" element={<DestinationsListingCms />} />
        <Route path="/admin/website/destinations/cta" element={<DestinationsCtaCms />} />
        <Route path="/admin/website/destinations/seo" element={<DestinationsSeoCms />} />
        {/* Experiences page CMS routes */}
        <Route path="/admin/website/experiences" element={<ExperiencesPageCms />} />
        <Route path="/admin/website/experiences/hero" element={<ExperiencesHeroCms />} />
        <Route path="/admin/website/experiences/listing" element={<ExperiencesListingCms />} />
        <Route path="/admin/website/experiences/cta" element={<ExperiencesCtaCms />} />
        <Route path="/admin/website/experiences/seo" element={<ExperiencesSeoCms />} />
        {/* Packages page CMS routes */}
        <Route path="/admin/website/packages" element={<PackagesPageCms />} />
        <Route path="/admin/website/packages/hero" element={<PackagesHeroCms />} />
        <Route path="/admin/website/packages/listing" element={<PackagesListingCms />} />
        <Route path="/admin/website/packages/cta" element={<PackagesCtaCms />} />
        <Route path="/admin/website/packages/seo" element={<PackagesSeoCms />} />
        {/* Gallery page CMS routes */}
        <Route path="/admin/website/gallery" element={<GalleryPageCms />} />
        <Route path="/admin/website/gallery/hero" element={<GalleryHeroCms />} />
        <Route path="/admin/website/gallery/settings" element={<GallerySettingsCms />} />
        <Route path="/admin/website/gallery/cta" element={<GalleryCtaCms />} />
        <Route path="/admin/website/gallery/seo" element={<GallerySeoCms />} />
        {/* Blog page CMS routes */}
        <Route path="/admin/website/blog" element={<BlogPageCms />} />
        <Route path="/admin/website/blog/hero" element={<BlogHeroCms />} />
        <Route path="/admin/website/blog/listing" element={<BlogListingCms />} />
        <Route path="/admin/website/blog/featured" element={<BlogFeaturedCms />} />
        <Route path="/admin/website/blog/cta" element={<BlogCtaCms />} />
        <Route path="/admin/website/blog/seo" element={<BlogSeoCms />} />
        {/* Travel modules */}
        <Route path="/admin/experiences" element={<Experiences />} />
        <Route path="/admin/travel/categories" element={<PackageCategories />} />
        <Route path="/admin/travel/itinerary" element={<Itinerary />} />
        <Route path="/admin/travel/highlights" element={<Highlights />} />
        <Route path="/admin/travel/inclusions" element={<Inclusions />} />
        <Route path="/admin/travel/exclusions" element={<Exclusions />} />
        {/* Content modules */}
        <Route path="/admin/categories" element={<BlogCategories />} />
        <Route path="/admin/tags" element={<BlogTags />} />
        <Route path="/admin/testimonials" element={<Testimonials />} />
        <Route path="/admin/faqs" element={<Faqs />} />
        {/* SEO modules */}
        <Route path="/admin/seo" element={<Seo />} />
        <Route path="/admin/seo/global" element={<Seo />} />
        <Route path="/admin/seo/page" element={<PageSeo />} />
        <Route path="/admin/seo/pages" element={<PageSeo />} />
        <Route path="/admin/seo/sitemap" element={<SitemapManager />} />
        <Route path="/admin/seo/robots" element={<RobotsEditor />} />
        <Route path="/admin/seo/redirects" element={<RedirectManager />} />
        {/* Appearance modules */}
        <Route path="/admin/appearance/navigation" element={<NavigationManager />} />
        <Route path="/admin/appearance/footer" element={<FooterManager />} />
        <Route path="/admin/appearance/cta" element={<CtaSettings />} />
        {/* Admin modules */}
        <Route path="/admin/users/roles" element={<Users />} />
        <Route path="/admin/activity" element={<ActivityLogs />} />
        {/* Settings sub-routes */}
        <Route path="/admin/settings/general" element={<Settings />} />
        <Route path="/admin/settings/contact" element={<Settings />} />
        <Route path="/admin/settings/email" element={<Settings />} />
        <Route path="/admin/settings/analytics" element={<Settings />} />
        <Route path="/admin/settings/security" element={<Settings />} />
        </Route>{/* end AdminLayout */}
      </Route>{/* end ProtectedRoute */}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
