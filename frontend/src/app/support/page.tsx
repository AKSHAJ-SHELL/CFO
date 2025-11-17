'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, MessageSquare, HelpCircle } from 'lucide-react';
import SaaSNavbar from '@/components/saas/Navbar';
import Section from '@/components/saas/Section';
import ContactForm from '@/components/saas/ContactForm';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How does FinPilot integrate with my existing systems?',
    answer: 'FinPilot integrates seamlessly with popular tools like Plaid, Stripe, QuickBooks, and more. Our API also allows custom integrations.',
  },
  {
    question: 'Is my financial data secure?',
    answer: 'Yes, we use bank-level encryption and follow industry best practices for data security. Your data is encrypted both in transit and at rest.',
  },
  {
    question: 'Can I try FinPilot before purchasing?',
    answer: 'Absolutely! We offer a free tier with limited features, and you can start a free trial of our Standard or Pro plans.',
  },
  {
    question: 'How accurate are the AI predictions?',
    answer: 'Our AI models are trained on millions of financial data points and achieve over 90% accuracy in cash flow predictions.',
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'We offer email support for all plans, priority support for Standard, and dedicated support for Pro customers.',
  },
];

/**
 * Support page with contact form and FAQ
 */
export default function SupportPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background-main">
      <SaaSNavbar />
      
      <Section id="support-hero" title="We're Here to Help" subtitle="Get in touch or find answers to common questions">
        <div className="max-w-4xl mx-auto">
          {/* Contact Form */}
          <div className="card-base mb-12">
            <h3 className="text-2xl font-bold text-text-dark mb-6">Contact Us</h3>
            <ContactForm />
          </div>

          {/* FAQ */}
          <div className="card-base mb-12">
            <h3 className="text-2xl font-bold text-text-dark mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-background-main transition-colors"
                    aria-expanded={openFAQ === index}
                  >
                    <span className="font-semibold text-text-dark">{faq.question}</span>
                    {openFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-text-muted" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-text-muted" />
                    )}
                  </button>
                  {openFAQ === index && (
                    <div className="px-4 pb-4 text-text-muted">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Support Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Mail, title: 'Email Support', description: 'support@finpilot.ai', href: 'mailto:support@finpilot.ai' },
              { icon: MessageSquare, title: 'Live Chat', description: 'Available 9am-5pm EST', href: '#' },
              { icon: HelpCircle, title: 'Documentation', description: 'Browse our guides', href: '#' },
            ].map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="card-base hover:shadow-xl transition-all text-center"
              >
                <link.icon className="h-8 w-8 text-primary-blue mx-auto mb-4" />
                <h4 className="font-semibold text-text-dark mb-2">{link.title}</h4>
                <p className="text-sm text-text-muted">{link.description}</p>
              </a>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

