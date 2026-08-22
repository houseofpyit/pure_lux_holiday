import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Calendar, Users, Plane, Send, Check, ArrowLeft, ArrowRight,
  MapPin, Clock, DollarSign, Sparkles, User, Mail, Phone,
} from 'lucide-react';
import PageHero from '@/components/PageHero';
import ConciergeCTA from '@/components/home/ConciergeCTA';
import { Monogram } from '@/components/Logo';
import { IMAGES } from '@/lib/images';
import { useJourneyRequest } from '@/hooks/use-forms';
import { useDestinations } from '@/hooks/use-destinations';
import { resolveDestinationName } from '@/lib/destinations';
import { useToast } from '@/components/ui/use-toast';

const EXTRA_DESTINATION_OPTIONS = ['Multiple Destinations', 'Surprise Me'];
const DURATIONS = ['3–5 Days', '1 Week', '2 Weeks', '3+ Weeks'];
const TRAVELERS = ['Solo', 'Couple', '3–4 Guests', '5+ Guests'];
const BUDGETS = ['$5,000 – $10,000', '$10,000 – $25,000', '$25,000 – $50,000', '$50,000+'];

const STEP_IMAGES = [
  IMAGES.maldives,
  IMAGES.swiss,
  IMAGES.bali,
  IMAGES.dubai,
  IMAGES.cta,
];

const fadeSlide = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

export default function PlanMyJourney() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const destinationParam = searchParams.get('destination');
  const { toast } = useToast();
  const { data: destinations = [], isLoading: destinationsLoading } = useDestinations();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    destination: '',
    duration: '',
    travelers: '',
    dates: '',
    budget: '',
    notes: location.state?.packageTitle ? `Inquiring about package: ${location.state.packageTitle}. ` : '',
    name: '',
    email: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const destinationOptions = useMemo(() => {
    const active = [...destinations]
      .filter((d) => d.isActive !== false)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((d) => d.name);
    return [...active, ...EXTRA_DESTINATION_OPTIONS];
  }, [destinations]);

  useEffect(() => {
    if (!destinationParam && !location.state?.destination) return;
    const resolved = resolveDestinationName(destinations, {
      name: location.state?.destination,
      slug: destinationParam,
    });
    if (!resolved) return;
    setData((prev) => ({ ...prev, destination: resolved }));
    setStep(0);
  }, [destinations, destinationParam, location.state?.destination, location.key]);

  const update = (key, value) => setData((p) => ({ ...p, [key]: value }));

  const steps = useMemo(() => [
    { key: 'destination', title: 'Destination', subtitle: 'Where would you like to go?', icon: Globe, options: destinationOptions },
    { key: 'duration', title: 'Duration', subtitle: 'How long is your ideal escape?', icon: Calendar, options: DURATIONS },
    { key: 'travelers', title: 'Travelers', subtitle: 'Who\'s joining the journey?', icon: Users, options: TRAVELERS },
    { key: 'details', title: 'Trip Details', subtitle: 'Help us personalize your experience', icon: Plane, options: null },
    { key: 'contact', title: 'Your Details', subtitle: 'So we can reach you with your itinerary', icon: Send, options: null },
  ], [destinationOptions]);

  const current = steps[step];

  const mutation = useJourneyRequest({
    onSuccess: () => setSubmitted(true),
    onError: (err) => {
      toast({
        title: 'Submission Failed',
        description: err.response?.data?.detail || 'There was an error submitting your request. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const isStepInvalid = () => {
    if (step === 0) return !data.destination;
    if (step === 1) return !data.duration;
    if (step === 2) return !data.travelers;
    if (step === 3) return false;
    if (step === 4) return !data.name || !data.email || !data.phone;
    return false;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isStepInvalid()) return;
    mutation.mutate(data);
  };

  // ── Success state ──
  if (submitted) {
    const summaryItems = [
      { icon: MapPin, label: 'Destination', value: data.destination },
      { icon: Clock, label: 'Duration', value: data.duration },
      { icon: Users, label: 'Travelers', value: data.travelers },
      ...(data.dates ? [{ icon: Calendar, label: 'Dates', value: data.dates }] : []),
      ...(data.budget ? [{ icon: DollarSign, label: 'Budget', value: data.budget }] : []),
    ];

    return (
      <>
        <section className="min-h-screen flex">
          {/* Left — Destination image */}
          <div className="hidden lg:block lg:w-1/2 relative">
            <motion.img
              src={IMAGES.maldives}
              alt="Destination"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-emerald-dark/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-dark/80 via-transparent to-emerald-dark/20" />
            <motion.div
              className="absolute bottom-12 left-12 right-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <p className="text-luxe/60 text-xs tracking-widest uppercase mb-3">Your Selected Destination</p>
              <h2 className="font-heading text-5xl text-luxe mb-2">{data.destination || 'The World Awaits'}</h2>
              <div className="w-16 h-px bg-champagne/50 mt-4" />
            </motion.div>
          </div>

          {/* Right — Confirmation */}
          <div className="w-full lg:w-1/2 flex items-center justify-center px-8 md:px-16 py-20 bg-gradient-to-br from-luxe via-white to-luxe/80">
            <motion.div
              className="max-w-md w-full"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Monogram className="w-12 h-12 mb-8" />

              <motion.div
                className="w-16 h-16 rounded-2xl bg-emerald-deep flex items-center justify-center mb-8"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                <Check className="w-7 h-7 text-champagne" strokeWidth={2.5} />
              </motion.div>

              <h1 className="font-heading text-4xl md:text-5xl text-emerald-dark mb-2">Journey Confirmed</h1>
              <p className="font-accent text-xl text-champagne mb-6">We'll be in touch shortly</p>

              <p className="text-muted-foreground leading-relaxed mb-10">
                Thank you, <span className="font-semibold text-emerald-dark">{data.name}</span>. Our travel concierge will craft a bespoke itinerary for your trip to <span className="font-semibold text-emerald-dark">{data.destination}</span> and reach out within 24 hours.
              </p>

              {/* Trip summary */}
              <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden mb-10">
                <div className="px-5 py-3 bg-emerald-deep/5 border-b border-border/30">
                  <p className="text-xs tracking-luxe uppercase text-emerald-dark font-semibold">Trip Summary</p>
                </div>
                <div className="divide-y divide-border/30">
                  {summaryItems.map(({ icon: Icon, label, value }, i) => (
                    <motion.div
                      key={label}
                      className="flex items-center gap-4 px-5 py-3.5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-deep/8 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-emerald-deep" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-medium text-emerald-dark truncate">{value || '—'}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Contact info */}
              <div className="flex items-center gap-3 p-4 bg-emerald-deep/5 rounded-xl mb-10">
                <div className="w-10 h-10 rounded-full bg-emerald-deep flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-champagne" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Confirmation sent to</p>
                  <p className="text-sm font-medium text-emerald-dark truncate">{data.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setStep(0);
                    setData({ destination: '', duration: '', travelers: '', dates: '', budget: '', notes: '', name: '', email: '', phone: '' });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-deep text-luxe text-sm font-semibold hover:bg-emerald-dark transition-colors"
                >
                  <ArrowRight className="w-4 h-4" /> Plan Another Journey
                </button>
              </div>
            </motion.div>
          </div>
        </section>
        <ConciergeCTA />
      </>
    );
  }

  // ── Main form ──
  return (
    <>
      <PageHero
        title="Plan My Journey"
        breadcrumb="The Digital Concierge"
        subtitle="Tell us your dreams. We'll craft the rest."
        image={IMAGES.swiss}
      />

      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-0 rounded-3xl overflow-hidden lux-shadow border border-border/30 min-h-[36rem]">

            {/* ── Left: Image + Progress ── */}
            <div className="relative hidden lg:flex flex-col bg-emerald-deep overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={step}
                  src={STEP_IMAGES[step] || STEP_IMAGES[0]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-25"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.25 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-dark via-emerald-deep/70 to-emerald-deep/50" />

              <div className="relative flex-1 flex flex-col justify-between p-10 lg:p-12">
                <div>
                  <Monogram className="w-12 h-12 mb-8" onDark />
                  <h3 className="font-heading text-3xl text-luxe leading-tight mb-3">
                    Craft Your<br />Perfect Escape
                  </h3>
                  <p className="text-luxe/50 text-sm leading-relaxed max-w-xs">
                    Answer a few simple questions and our specialists will design a bespoke itinerary just for you.
                  </p>
                </div>

                {/* Step indicators */}
                <div className="space-y-3 mt-10">
                  {steps.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = i === step;
                    const isDone = i < step;
                    return (
                      <button
                        key={s.key}
                        onClick={() => (isDone ? setStep(i) : undefined)}
                        disabled={!isDone}
                        className={`flex items-center gap-3 w-full text-left transition-all duration-300 px-3 py-2.5 rounded-xl ${
                          isActive
                            ? 'bg-white/10 backdrop-blur-sm'
                            : isDone
                              ? 'hover:bg-white/5 cursor-pointer'
                              : 'opacity-40 cursor-default'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isDone ? 'bg-champagne/20' : isActive ? 'bg-champagne/30' : 'bg-white/10'
                        }`}>
                          {isDone ? (
                            <Check className="w-3.5 h-3.5 text-champagne" strokeWidth={2.5} />
                          ) : (
                            <Icon className="w-3.5 h-3.5 text-luxe/70" strokeWidth={1.5} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${isActive || isDone ? 'text-luxe' : 'text-luxe/50'}`}>{s.title}</p>
                          {isDone && data[s.key] && (
                            <p className="text-xs text-champagne/70 truncate">{data[s.key]}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Right: Form Content ── */}
            <div className="bg-white flex flex-col">
              {/* Mobile progress bar */}
              <div className="lg:hidden px-6 pt-6">
                <div className="flex items-center gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full flex-1 transition-colors duration-500 ${
                        i <= step ? 'bg-emerald-dark' : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Step {step + 1} of {steps.length}</p>
              </div>

              <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-10">
                <AnimatePresence mode="wait">
                  <motion.div key={step} {...fadeSlide}>
                    {/* Step header */}
                    <div className="mb-8">
                      <div className="w-11 h-11 rounded-xl bg-emerald-deep/10 flex items-center justify-center mb-4">
                        <current.icon className="w-5 h-5 text-emerald-deep" strokeWidth={1.5} />
                      </div>
                      <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-2">Step {step + 1}</p>
                      <h2 className="font-heading text-2xl md:text-3xl text-emerald-dark mb-1">{current.title}</h2>
                      <p className="text-sm text-muted-foreground">{current.subtitle}</p>
                    </div>

                    {/* Options */}
                    {current.options ? (
                      <div className="space-y-2 max-h-[22rem] overflow-y-auto pr-1">
                        {destinationsLoading && step === 0 ? (
                          <p className="text-sm text-muted-foreground py-8 text-center">Loading destinations…</p>
                        ) : current.options.length === EXTRA_DESTINATION_OPTIONS.length && step === 0 ? (
                          <p className="text-sm text-muted-foreground py-8 text-center">No destinations available yet.</p>
                        ) : (
                          current.options.map((opt) => {
                            const isSelected = data[current.key] === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  update(current.key, opt);
                                  setTimeout(() => setStep(Math.min(step + 1, steps.length - 1)), 350);
                                }}
                                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-left text-sm transition-all duration-300 ${
                                  isSelected
                                    ? 'bg-emerald-deep text-luxe shadow-md'
                                    : 'bg-luxe/50 border border-border/50 text-emerald-dark hover:border-champagne/40 hover:bg-champagne/5'
                                }`}
                              >
                                <span className="font-medium">{opt}</span>
                                {isSelected && <Check className="w-4 h-4 text-champagne shrink-0" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    ) : current.key === 'details' ? (
                      <div className="space-y-5">
                        <div>
                          <label className="flex items-center gap-2 text-xs tracking-luxe uppercase text-muted-foreground mb-2">
                            <Calendar className="w-3 h-3" /> Travel Dates
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. December 2026"
                            value={data.dates}
                            onChange={(e) => update('dates', e.target.value)}
                            className="w-full px-4 py-3 bg-luxe/50 border border-border/50 rounded-xl outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/20 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs tracking-luxe uppercase text-muted-foreground mb-2">
                            <DollarSign className="w-3 h-3" /> Budget Range
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {BUDGETS.map((b) => (
                              <button
                                key={b}
                                type="button"
                                onClick={() => update('budget', b)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
                                  data.budget === b
                                    ? 'bg-emerald-deep text-luxe'
                                    : 'bg-luxe/50 border border-border/50 text-emerald-dark hover:border-champagne/40'
                                }`}
                              >
                                {b}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs tracking-luxe uppercase text-muted-foreground mb-2">
                            <Sparkles className="w-3 h-3" /> Special Wishes
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Private dining, spa, adventure activities..."
                            value={data.notes}
                            onChange={(e) => update('notes', e.target.value)}
                            className="w-full px-4 py-3 bg-luxe/50 border border-border/50 rounded-xl outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/20 transition-all text-sm resize-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div>
                          <label className="flex items-center gap-2 text-xs tracking-luxe uppercase text-muted-foreground mb-2">
                            <User className="w-3 h-3" /> Full Name *
                          </label>
                          <input
                            type="text"
                            placeholder="John Smith"
                            value={data.name}
                            onChange={(e) => update('name', e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-luxe/50 border border-border/50 rounded-xl outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/20 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs tracking-luxe uppercase text-muted-foreground mb-2">
                            <Mail className="w-3 h-3" /> Email Address *
                          </label>
                          <input
                            type="email"
                            placeholder="john@example.com"
                            value={data.email}
                            onChange={(e) => update('email', e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-luxe/50 border border-border/50 rounded-xl outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/20 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs tracking-luxe uppercase text-muted-foreground mb-2">
                            <Phone className="w-3 h-3" /> Mobile Number *
                          </label>
                          <input
                            type="tel"
                            placeholder="+971 50 123 4567"
                            value={data.phone}
                            onChange={(e) => update('phone', e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-luxe/50 border border-border/50 rounded-xl outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/20 transition-all text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom navigation */}
              <div className="flex items-center justify-between px-8 md:px-12 py-5 border-t border-border/30 bg-luxe/30">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-dark transition-colors disabled:opacity-0 disabled:pointer-events-none"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {step < steps.length - 1 ? (
                  <button
                    onClick={() => !isStepInvalid() && setStep(step + 1)}
                    disabled={isStepInvalid()}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-deep to-emerald-dark text-luxe text-sm font-semibold tracking-wide hover:shadow-xl hover:shadow-emerald-dark/20 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isStepInvalid() || mutation.isPending}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-champagne to-gold text-emerald-dark text-sm font-semibold tracking-wide hover:shadow-xl hover:shadow-champagne/30 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? 'Submitting…' : 'Submit Request'}
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ConciergeCTA />
    </>
  );
}
