import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Clock, MapPin, MessageCircle, Send, Check, ArrowRight } from 'lucide-react';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import ConciergeCTA from '@/components/home/ConciergeCTA';
import { LoadingState, ErrorState } from '@/components/state/ContentState';
import { useContact } from '@/hooks/use-contact';
import { createContactInquiry } from '@/api/forms.api';
import { mapContactInquiryPayload } from '@/services/mappers/public.mapper';
import { Monogram } from '@/components/Logo';
import { IMAGES } from '@/lib/images';

const HERO_FALLBACK = {
  title: 'Contact',
  breadcrumb: 'Begin the Conversation',
  subtitle: 'Our travel specialists are ready to craft your next extraordinary journey.',
  image: IMAGES.cta,
};

const SETTINGS_FALLBACK = {
  phone: '+91 261 400 1234',
  email: 'concierge@pureluxeholidays.com',
  address: 'International Business Center, Vesu, Surat, Gujarat 395007, India',
  workingHours: 'Monday – Saturday: 10:00 AM – 7:00 PM IST',
  whatsapp: '+919261400123',
};

const CONCIERGE_IMAGE = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  destination: '',
  message: '',
};

function buildWhatsAppUrl(number) {
  if (!number) return null;
  const digits = number.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

export default function Contact() {
  const { data, isLoading, isError, error } = useContact();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const page = data?.page;
  const settings = data?.settings;

  const hero = useMemo(() => ({
    title: page?.heroHeading || HERO_FALLBACK.title,
    breadcrumb: page?.heroLabel || HERO_FALLBACK.breadcrumb,
    subtitle: page?.heroDescription?.trim() || HERO_FALLBACK.subtitle,
    image: page?.heroBackgroundImage?.url || HERO_FALLBACK.image,
  }), [page]);

  const contactInfo = useMemo(() => ({
    phone: settings?.phone || SETTINGS_FALLBACK.phone,
    email: settings?.email || SETTINGS_FALLBACK.email,
    address: settings?.address || SETTINGS_FALLBACK.address,
    workingHours: settings?.workingHours || SETTINGS_FALLBACK.workingHours,
    whatsappUrl: buildWhatsAppUrl(settings?.whatsapp || SETTINGS_FALLBACK.whatsapp),
    googleMapUrl: settings?.googleMapUrl || null,
  }), [settings]);

  const showForm = page?.showContactForm !== false;
  const showBusinessHours = page?.showBusinessHours !== false;
  const showOffice = page?.showOfficeLocations !== false;
  const showMap = page?.showGoogleMap !== false;
  const showWhatsapp = page?.enableWhatsappButton !== false;

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await createContactInquiry(mapContactInquiryPayload(form));
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setSubmitError(err?.message || 'Unable to send your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        title={hero.title}
        breadcrumb={hero.breadcrumb}
        subtitle={hero.subtitle}
        image={hero.image}
      />

      {isLoading && (
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
          <LoadingState lines={6} />
        </section>
      )}

      {isError && (
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
          <ErrorState message={error?.message} />
        </section>
      )}

      {!isLoading && !isError && (
        <>
          {/* ── Contact Info Cards ── */}
          <section className="py-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-luxe to-white">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {page?.enableCallButton !== false && contactInfo.phone && (
                  <ScrollReveal delay={0}>
                    <a
                      href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                      className="group block p-6 bg-white rounded-2xl border border-border/50 hover:border-champagne/40 hover:shadow-lg hover:shadow-champagne/10 transition-all duration-500"
                    >
                      <div className="w-12 h-12 rounded-xl bg-emerald-deep flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                        <Phone className="w-5 h-5 text-champagne" strokeWidth={1.5} />
                      </div>
                      <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-1.5">Call Us</p>
                      <p className="font-heading text-lg text-emerald-dark">{contactInfo.phone}</p>
                    </a>
                  </ScrollReveal>
                )}

                {page?.enableEmailButton !== false && contactInfo.email && (
                  <ScrollReveal delay={0.1}>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="group block p-6 bg-white rounded-2xl border border-border/50 hover:border-champagne/40 hover:shadow-lg hover:shadow-champagne/10 transition-all duration-500"
                    >
                      <div className="w-12 h-12 rounded-xl bg-emerald-deep flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                        <Mail className="w-5 h-5 text-champagne" strokeWidth={1.5} />
                      </div>
                      <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-1.5">Email</p>
                      <p className="font-heading text-lg text-emerald-dark break-all">{contactInfo.email}</p>
                    </a>
                  </ScrollReveal>
                )}

                {showOffice && contactInfo.address && (
                  <ScrollReveal delay={0.2}>
                    <div className="group p-6 bg-white rounded-2xl border border-border/50 hover:border-champagne/40 hover:shadow-lg hover:shadow-champagne/10 transition-all duration-500">
                      <div className="w-12 h-12 rounded-xl bg-emerald-deep flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                        <MapPin className="w-5 h-5 text-champagne" strokeWidth={1.5} />
                      </div>
                      <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-1.5">Visit Us</p>
                      <p className="font-heading text-lg text-emerald-dark leading-snug">{contactInfo.address}</p>
                    </div>
                  </ScrollReveal>
                )}

                {showBusinessHours && contactInfo.workingHours && (
                  <ScrollReveal delay={0.3}>
                    <div className="group p-6 bg-white rounded-2xl border border-border/50 hover:border-champagne/40 hover:shadow-lg hover:shadow-champagne/10 transition-all duration-500">
                      <div className="w-12 h-12 rounded-xl bg-emerald-deep flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                        <Clock className="w-5 h-5 text-champagne" strokeWidth={1.5} />
                      </div>
                      <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-1.5">Hours</p>
                      <p className="font-heading text-lg text-emerald-dark leading-snug">{contactInfo.workingHours}</p>
                    </div>
                  </ScrollReveal>
                )}
              </div>
            </div>
          </section>

          {/* ── Form + Concierge Image Section ── */}
          {showForm && (
            <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden lux-shadow border border-border/30">
                  {/* Left — Concierge Image + Info */}
                  <div className="relative bg-emerald-deep overflow-hidden hidden lg:block">
                    <img
                      src={CONCIERGE_IMAGE}
                      alt="Travel concierge"
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-dark via-emerald-deep/80 to-emerald-deep/60" />
                    <div className="relative h-full flex flex-col justify-between p-10 lg:p-14">
                      <div>
                        <Monogram className="w-14 h-14 mb-8" onDark />
                        <h3 className="font-heading text-4xl text-luxe leading-tight mb-4">
                          Your Personal<br />Travel Concierge
                        </h3>
                        <p className="text-luxe/60 leading-relaxed max-w-sm">
                          Share your vision with us. Our specialists will craft a bespoke itinerary tailored to your every desire and reach out within 24 hours.
                        </p>
                      </div>

                      <div className="space-y-5 mt-12">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full border border-champagne/30 flex items-center justify-center">
                            <Phone className="w-4 h-4 text-champagne" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-luxe/50 text-xs uppercase tracking-wider">Call</p>
                            <p className="text-luxe text-sm">{contactInfo.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full border border-champagne/30 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-champagne" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-luxe/50 text-xs uppercase tracking-wider">Email</p>
                            <p className="text-luxe text-sm">{contactInfo.email}</p>
                          </div>
                        </div>
                        {showWhatsapp && contactInfo.whatsappUrl && (
                          <a
                            href={contactInfo.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-champagne/30 text-champagne text-xs font-semibold tracking-luxe uppercase hover:bg-champagne/10 transition-all duration-500 mt-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Chat on WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right — Form */}
                  <div className="bg-white p-8 md:p-12 lg:p-14">
                    {submitted ? (
                      <motion.div
                        className="h-full flex flex-col items-center justify-center text-center py-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        <div className="w-16 h-16 rounded-full bg-emerald-deep flex items-center justify-center mb-6">
                          <Check className="w-7 h-7 text-champagne" />
                        </div>
                        <h3 className="font-heading text-3xl text-emerald-dark mb-3">Thank You</h3>
                        <p className="text-muted-foreground leading-relaxed mb-8 max-w-sm">
                          Your inquiry has been received. One of our travel specialists will reach out within 24 hours to begin crafting your extraordinary journey.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSubmitted(false)}
                          className="text-xs tracking-luxe uppercase text-emerald-dark border-b border-champagne/40 pb-1 hover:border-champagne transition-colors"
                        >
                          Send Another Inquiry
                        </button>
                      </motion.div>
                    ) : (
                      <>
                        <div className="mb-8">
                          <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-3">Luxury Inquiry</p>
                          <h2 className="font-heading text-3xl md:text-4xl text-emerald-dark mb-2">Tell Us About Your Dream</h2>
                          <div className="w-12 h-px bg-champagne" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-xs tracking-luxe uppercase text-muted-foreground mb-2">First Name *</label>
                              <input
                                type="text"
                                required
                                value={form.firstName}
                                onChange={(e) => updateField('firstName', e.target.value)}
                                className="w-full px-4 py-3 bg-luxe/50 border border-border/50 rounded-xl outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/20 transition-all text-foreground text-sm"
                                placeholder="John"
                              />
                            </div>
                            <div>
                              <label className="block text-xs tracking-luxe uppercase text-muted-foreground mb-2">Last Name *</label>
                              <input
                                type="text"
                                required
                                value={form.lastName}
                                onChange={(e) => updateField('lastName', e.target.value)}
                                className="w-full px-4 py-3 bg-luxe/50 border border-border/50 rounded-xl outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/20 transition-all text-foreground text-sm"
                                placeholder="Smith"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-xs tracking-luxe uppercase text-muted-foreground mb-2">Email *</label>
                              <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                className="w-full px-4 py-3 bg-luxe/50 border border-border/50 rounded-xl outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/20 transition-all text-foreground text-sm"
                                placeholder="john@example.com"
                              />
                            </div>
                            <div>
                              <label className="block text-xs tracking-luxe uppercase text-muted-foreground mb-2">Phone</label>
                              <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => updateField('phone', e.target.value)}
                                className="w-full px-4 py-3 bg-luxe/50 border border-border/50 rounded-xl outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/20 transition-all text-foreground text-sm"
                                placeholder="+971 50 123 4567"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs tracking-luxe uppercase text-muted-foreground mb-2">Dream Destination</label>
                            <input
                              type="text"
                              value={form.destination}
                              onChange={(e) => updateField('destination', e.target.value)}
                              className="w-full px-4 py-3 bg-luxe/50 border border-border/50 rounded-xl outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/20 transition-all text-foreground text-sm"
                              placeholder="e.g. Maldives, Swiss Alps, Bali..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs tracking-luxe uppercase text-muted-foreground mb-2">Tell Us About Your Vision</label>
                            <textarea
                              rows={4}
                              value={form.message}
                              onChange={(e) => updateField('message', e.target.value)}
                              className="w-full px-4 py-3 bg-luxe/50 border border-border/50 rounded-xl outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/20 transition-all text-foreground text-sm resize-none"
                              placeholder="Describe your perfect journey..."
                            />
                          </div>

                          {submitError && (
                            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{submitError}</p>
                          )}

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-emerald-deep to-emerald-dark text-luxe text-sm font-semibold tracking-luxe uppercase hover:shadow-xl hover:shadow-emerald-dark/20 transition-all duration-500 disabled:opacity-60"
                          >
                            {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Map Section ── */}
          {showMap && (
            <section className="pb-24 px-6 md:px-12 lg:px-20">
              <div className="max-w-6xl mx-auto">
                <ScrollReveal>
                  <div className="rounded-3xl overflow-hidden lux-shadow h-[28rem] relative">
                    <iframe
                      title="Office Location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3715.5!2d72.8311!3d21.1702!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04e59411d1565%3A0x61767204d7ad9d13!2sVesu%2C%20Surat%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1690000000000!5m2!1sen!2sin"
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    {contactInfo.googleMapUrl && (
                      <a
                        href={contactInfo.googleMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-5 right-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-deep/90 backdrop-blur-sm text-champagne text-xs font-semibold tracking-luxe uppercase rounded-full hover:bg-emerald-deep transition-colors shadow-lg"
                      >
                        Open in Maps <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </ScrollReveal>
              </div>
            </section>
          )}
        </>
      )}

      <ConciergeCTA cta={data?.cta} />
    </>
  );
}
