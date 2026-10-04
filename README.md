# Dawakhana.com (दवाखाना) - Digital Pharmacy & Dispensary

A responsive, high-converting digital pharmacy and classical herbal dispensary website built for **Dawakhana.com**, inspired by modern Indian digital healthcare platforms like [Drug Mart](https://demodekho.in/drugmart/).

---

## 🌟 Key Highlights & Features

- **Heritage & Modern Pharmacy Hybrid**: Bridges allopathic medicines, chronic care, diabetes management, and healthcare devices with Dawakhana's heritage in Unani and Ayurvedic wellness (Pure Himalayan Shilajit, Sharbat Bazoori Motadil, Chyawanprash, Safi).
- **Interactive Cart & Free Delivery Meter**: Slide-out cart drawer with real-time price calculation, 20% discount savings display, item quantity steppers, and a live progress bar showing how much more to add for **FREE Delivery**.
- **Real-Time Predictive Search**: Live search bar with instant autocomplete dropdown, keyword highlighting, prices, and direct thumbnail previews.
- **Prescription Upload & WhatsApp Integration**:
  - Modal and dedicated prescription upload page (`prescription.html`).
  - Supports image and PDF upload with live preview and removal.
  - Automatically formats patient details, prescription reference, and unique lead tracking ID (`DW-RX-XXXXX`) into a pre-filled WhatsApp order message.
- **1-Click WhatsApp Ordering**: Generates structured order summaries with itemized lists, totals, and delivery location to send directly to the dispensary's WhatsApp desk.
- **Pincode & Delivery Checker**: Allows customers to verify express 2-hour delivery to their locality.
- **Regulatory & Statutory Compliance**: Form 20B and 21B drug license disclosures, registered pharmacist supervision notices, and Schedule H/H1 prescription advisories.
- **Mobile-First Experience**: Includes sticky header, bottom navigation bar for smartphones, and slide-in filter offcanvas drawers.

---

## 📂 Project Architecture

```
dawakhana.com/
├── index.html                 # Homepage with hero slider, deals, categories & essentials
├── catalogue.html             # Full catalogue with category, concern, brand & Rx filters
├── prescription.html          # Dedicated prescription upload & verification guide
├── about.html                 # About us, drug licenses & pharmacist safety guidelines
├── contact.html               # Store address, contact form, emergency line & FAQs
├── server.js                  # Lightweight zero-dependency Node static web server
├── package.json               # Project manifest and start scripts
└── assets/
    ├── css/
    │   └── theme.css          # Healthcare design system (Teal, Herbal Green, Amber)
    ├── js/
    │   ├── products.js        # 30+ curated medicines, ayurvedic remedies & devices
    │   └── app.js             # Cart engine, search autocomplete, modals & WhatsApp handlers
    └── images/
        └── logo.svg           # Custom SVG emblem & branding
```

---

## 🚀 How to Run Locally

You can run Dawakhana.com locally using standard Node.js:

```bash
# 1. Start the built-in server
npm start
# or: node server.js

# 2. Open in your browser:
# http://localhost:3000
```

Alternatively, you can double-click `index.html` to open it directly in any modern browser without any server required!

---

## ⚙️ Customization

To change the dispensary contact number, WhatsApp number, or store address:
Open [`assets/js/products.js`](assets/js/products.js) and update the `CONFIG` object:

```javascript
const CONFIG = {
    brandName: "Dawakhana.com",
    tagline: "आपका स्वास्थ्य, हमारी प्राथमिकता",
    phone: "+91 98765 43210",       // Display phone number
    whatsapp: "919876543210",        // WhatsApp number without '+' or dashes
    address: "Your Store Address...",
    drugLicenseNo: "DL-20B/21B-45920/2024",
    freeDeliveryThreshold: 500,     // Orders above this get free delivery
    discountRate: 0.20              // 20% discount
};
```
