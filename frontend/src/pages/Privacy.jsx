import React from 'react';
import LegalPage from '@/pages/LegalPage';
import { IMAGES } from '@/lib/images';

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      breadcrumb="Your Information"
      subtitle="How Pure Luxe Holidays collects, uses, and protects personal data."
      image={IMAGES.cta}
      updated="August 2026"
    >
      <p>
        Pure Luxe Holidays (“we”, “us”) provides bespoke luxury travel planning. This policy explains how we handle
        information you share through our website, enquiry forms, and concierge correspondence.
      </p>

      <h2>Information we collect</h2>
      <p>We may collect:</p>
      <ul>
        <li>Contact details such as name, email, phone number, and mailing address.</li>
        <li>Travel preferences including destinations, dates, party size, budget, and special requests.</li>
        <li>Messages you send via Contact, Plan My Journey, or newsletter signup.</li>
        <li>Technical data such as browser type, device, and approximate location from your IP address.</li>
      </ul>

      <h2>How we use it</h2>
      <p>We use this information to:</p>
      <ul>
        <li>Respond to enquiries and design itineraries.</li>
        <li>Manage bookings with hotels, airlines, and experience partners where you have asked us to do so.</li>
        <li>Send travel updates you have requested, including newsletter stories if you subscribe.</li>
        <li>Improve our website and protect it from misuse.</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We do not sell your personal data. We share it only with trusted suppliers needed to deliver your journey
        (for example hotels or transfer companies), with service providers who host our website or email, or when
        required by law. Those partners may be located outside your country.
      </p>

      <h2>Retention</h2>
      <p>
        We keep enquiry and booking records for as long as needed to complete your journey, meet legal obligations,
        and resolve disputes. Newsletter addresses are kept until you unsubscribe.
      </p>

      <h2>Your choices</h2>
      <p>
        You may request access, correction, or deletion of your personal data, or withdraw marketing consent, by
        writing to concierge@pureluxeholidays.com. You may also unsubscribe from emails using the link in those messages.
      </p>

      <h2>Cookies</h2>
      <p>
        Our site may use essential cookies to operate and optional analytics to understand how pages are used.
        You can control cookies through your browser settings.
      </p>

      <h2>Contact</h2>
      <p>
        Pure Luxe Holidays, Boulevard Plaza, Downtown Dubai, UAE. Email: concierge@pureluxeholidays.com.
        Telephone: +971 4 123 4567.
      </p>
    </LegalPage>
  );
}
