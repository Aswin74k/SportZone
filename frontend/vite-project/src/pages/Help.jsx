import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhone, FaHeadset, FaChevronDown, FaSearch } from "react-icons/fa";
import StoreShell from "../components/StoreShell";
import "./Help.css";

function Help() {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "How can I track my order?",
      answer: "You can track your order instantly from your account. Navigate to the Orders page using the profile dropdown menu in the navigation bar. Your orders will show real-time delivery status and progress tracking step indicators."
    },
    {
      question: "How do I cancel an order?",
      answer: "To cancel an order, go to your Orders page, find the order, and click the 'Cancel Order' button. Please note that cancellations are only supported before the order is marked as shipped."
    },
    {
      question: "What is the return policy?",
      answer: "We offer a 30-day return policy on all unused products in their original packaging. Simply reach out to our team at support@sportzone.com to receive a return authorization and return instructions."
    },
    {
      question: "How long does delivery take?",
      answer: "Standard delivery takes between 3 to 5 business days depending on your location. You will receive an automated email notification with confirmation details once your order has been dispatched."
    }
  ];

  // Optional simple client-side filter for FAQs
  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StoreShell>
      <div className="sz-page">
        <div className="sz-page-inner container-fluid container-xl px-3 px-md-4">
          <div className="sz-help-wrapper">
            
            {/* Header Section */}
            <motion.div 
              className="sz-help-header text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="sz-kicker mb-1">Track & Resolve</span>
              <h1 className="display-6 fw-extrabold mb-2" style={{ color: "var(--sz-navy)" }}>Help Center</h1>
              <p className="text-muted small">Have questions? Search our FAQ articles or contact customer support directly.</p>
            </motion.div>

            {/* Help Search Bar */}
            <motion.div 
              className="sz-help-search-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="sz-help-search-box">
                <input
                  type="text"
                  className="sz-help-search-input"
                  placeholder="Search frequently asked questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="button" className="sz-help-search-btn" aria-label="Search FAQs">
                  <FaSearch size={16} />
                </button>
              </div>
            </motion.div>

            {/* Main Content Layout Grid */}
            <div className="row g-4">
              
              {/* Left Column: FAQ Accordion */}
              <div className="col-lg-7 col-xl-8">
                <div className="sz-faq-accordion">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, index) => {
                      const isActive = openFaq === index;
                      return (
                        <div key={index} className={`sz-faq-item ${isActive ? "active" : ""}`}>
                          <button 
                            className="sz-faq-header" 
                            onClick={() => toggleFaq(index)}
                            aria-expanded={isActive}
                          >
                            <span>{faq.question}</span>
                            <FaChevronDown className="sz-faq-chevron" size={14} />
                          </button>
                          <div className="sz-faq-content-wrapper">
                            <div className="sz-faq-content">
                              {faq.answer}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-muted">
                      No matching questions found. Try searching another keyword or reach out directly below.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Contact Sidebar */}
              <div className="col-lg-5 col-xl-4">
                <div className="sz-help-sidebar">
                  <h2 className="sz-help-sidebar-title">Still need help?</h2>
                  
                  {/* Email Card */}
                  <div className="sz-contact-card">
                    <div className="sz-contact-icon-box">
                      <FaEnvelope size={18} />
                    </div>
                    <div className="sz-contact-details">
                      <span className="sz-contact-name">Email Support</span>
                      <span className="sz-contact-meta">Typical reply within 24 hours</span>
                      <a href="mailto:support@sportzone.com" className="sz-contact-value">
                        support@sportzone.com
                      </a>
                    </div>
                  </div>

                  {/* Phone Card */}
                  <div className="sz-contact-card">
                    <div className="sz-contact-icon-box">
                      <FaPhone size={18} />
                    </div>
                    <div className="sz-contact-details">
                      <span className="sz-contact-name">Call Support</span>
                      <span className="sz-contact-meta">Mon-Fri · 9 AM - 6 PM IST</span>
                      <a href="tel:+917736476734" className="sz-contact-value">
                        +91 7736476734
                      </a>
                    </div>
                  </div>

                  {/* Live Chat Status Card */}
                  <div className="sz-contact-card">
                    <div className="sz-contact-icon-box">
                      <FaHeadset size={18} />
                    </div>
                    <div className="sz-contact-details">
                      <span className="sz-contact-name">Live Assistance</span>
                      <span className="sz-contact-meta">24/7 Virtual Assistant</span>
                      <div className="sz-contact-status-badge">
                        Offline · Email us
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </StoreShell>
  );
}

export default Help;
