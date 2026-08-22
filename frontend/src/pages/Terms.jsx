import React from 'react';
import { Link } from 'react-router-dom';
import LegalPage from '@/pages/LegalPage';
import { IMAGES } from '@/lib/images';

export default function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      breadcrumb="How We Travel Together"
      subtitle="The conditions that apply when you enquire with or book through Pure Luxe Holidays."
      image={IMAGES.hero}
      updated="August 2026"
    >
      <p>
        These terms govern use of this website and any travel services we arrange. By submitting an enquiry or
        confirming a booking, you agree to them. Please also read our{' '}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Our role</h2>
      <p>
        Pure Luxe Holidays designs and coordinates luxury journeys. Many elements (hotels, airlines, yachts,
        experiences) are provided by independent suppliers. We act as your planner and booking agent unless we
        state otherwise in writing.
      </p>

      <h2>Enquiries and quotations</h2>
      <p>
        Submitting Plan My Journey or a contact form is a request, not a booking. Availability, pricing, and
        inclusions are confirmed only in a written proposal or invoice. Prices may change until you pay the
        deposit we specify.
      </p>

      <h2>Bookings and payment</h2>
      <p>
        A booking is formed when we send written confirmation after receiving the required deposit. The balance
        is due by the date stated on your invoice. Supplier terms (hotels, airlines, and others) also apply and
        may include stricter cancellation rules.
      </p>

      <h2>Changes and cancellation</h2>
      <p>
        Please notify us as soon as possible if you need to change dates, names, or services. Fees depend on
        supplier policies and how close you are to departure. Unused services are typically non-refundable.
        We recommend comprehensive travel insurance.
      </p>

      <h2>Travel documents and health</h2>
      <p>
        You are responsible for valid passports, visas, vaccinations, and meeting entry rules for each country
        on your itinerary. We can advise, but we do not guarantee immigration outcomes.
      </p>

      <h2>Liability</h2>
      <p>
        We take reasonable care in selecting partners. We are not liable for supplier failures, weather, strikes,
        political events, or other circumstances beyond our control. Nothing in these terms limits liability for
        death or personal injury caused by our negligence, or any liability that cannot be excluded by law.
      </p>

      <h2>Website</h2>
      <p>
        Content on this site is for information only. Images and descriptions are illustrative. We may update
        packages, stories, and prices without notice. You may not copy our content for commercial use without
        permission.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the United Arab Emirates, without prejudice to any mandatory
        consumer protections that apply in your country of residence.
      </p>

      <h2>Contact</h2>
      <p>
        Pure Luxe Holidays, Boulevard Plaza, Downtown Dubai, UAE. Email: concierge@pureluxeholidays.com.
        Telephone: +971 4 123 4567.
      </p>
    </LegalPage>
  );
}
