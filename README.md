# Dawakhana.com (दवाखाना) - Digital Pharmacy & Dispensary

A responsive, high-converting digital pharmacy and classical herbal dispensary website built for **Dawakhana.com**, inspired by modern Indian digital healthcare platforms like [Drug Mart](https://demodekho.in/drugmart/).

Official GitHub Repository: [https://github.com/shamshadkhan36/Dawakhana.git](https://github.com/shamshadkhan36/Dawakhana.git)

---

## 🌟 Key Highlights & Features

### 1. 💊 Authentic Medicine Product Packaging Images
All items feature authentic, high-resolution product packaging photos:
- **Prescription & Clinical Medicines**: Dolo 650 Tablet, Augmentin 625 Duo, Pan-D Gastro-resistant Capsule, Telma 40 Blood Pressure Tablet, Azithral 500mg, Combiflam, Glycomet-GP 1, Montair-LC, and more.
- **Healthcare & Diagnostic Devices**: Omron HEM-7120 Digital BP Monitor, Accu-Chek Active Blood Glucose Monitor, Dr. Morepen Digital Thermometer, Beurer Pulse Oximeter.
- **Heritage Unani, Ayurvedic & Wellness**: Pure Himalayan Shilajit Resin, Dabur Chyawanprash (1kg), Hamdard Safi Blood Purifier, Himalaya Liv.52 DS, Revital H Multivitamin, Limcee Vitamin C, Volini Pain Relief Gel, Betadine 10% Ointment, Dettol Antiseptic Liquid.

### 2. ⚡ In-App Medicine Ordering & Checkout
Customers can order directly on the website without third-party dependencies:
- **Instant "⚡ Buy Now"**: Available directly on each medicine card for rapid 1-click ordering.
- **Cart Checkout**: Slide-out cart drawer with item counter, quantity stepper, free delivery progress meter, and "Proceed to Order →" action.
- **Delivery Form**: Captures customer full name, WhatsApp/mobile number, delivery address, 6-digit PIN code, and optional doctor/delivery notes.
- **Payment Method Selection**:
  - 💵 **Cash on Delivery (COD)** - Pay cash when medicines arrive (Default).
  - 📱 **UPI / QR Code on Delivery** (GPay, PhonePe, Paytm).
  - 💳 **Debit / Credit Card on Delivery**.
- **Live Price Breakdown**: Real-time computation of Subtotal, 20% Discount Savings, Delivery fee (Free above ₹500), and Total Payable.
- **Animated Confirmation Screen**: Generates unique tracking ID (`DW-ORD-XXXXXX`), confirms **Within 2 Hours** express delivery, and provides a 1-click **Open Receipt on WhatsApp** button pre-populated with order details.

### 3. 🔍 Live Predictive Search & Filtering
- Predictive search box with real-time auto-complete dropdown, keyword highlighting, composition matching, and thumbnail previews.
- Multi-faceted filter sidebar on the catalogue page by Category, Health Concern, Rx requirement, and Pharmaceutical Brand.
- Sorting by popularity, highest discount, price low-to-high, price high-to-low, and name.

### 4. 📋 Prescription Upload & Desk
- Drag-and-drop / mobile camera prescription uploader on `prescription.html` and modal.
- Instant file preview and removal.
- Valid prescription checklist & Schedule H/H1 statutory warning.
- Structured dispatch generating an order lead with unique ID (`DW-RX-XXXXX`).

### 5. 🛡️ Statutory Regulatory Compliance
- Form 20B and 21B Drug License disclosures (Drugs and Cosmetics Act 1940).
- State Pharmacy Council Registered Pharmacist advisory.
- Cold-chain temperature-controlled storage notices (2°C - 8°C).

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
    │   └── app.js             # Cart engine, search autocomplete, modals & checkout handlers
    └── images/
        └── logo.svg           # Custom vector SVG emblem & branding
```

> **Note on Portability**: In addition to standard modular assets in `assets/`, `index.html`, `catalogue.html`, `prescription.html`, `about.html`, and `contact.html` include self-contained embedded style and script fallbacks so pages render properly when opened directly from disk or in environments where relative assets are restricted.

---

## 🚀 How to Run Locally

You can run Dawakhana.com locally using Node.js:

```bash
# 1. Start the built-in server
npm start
# or: node server.js

# 2. Open in your browser:
# http://localhost:3000
```

Alternatively, double-click `index.html` to open it directly in any modern web browser!

---

## ⚙️ Customization

To change dispensary contact numbers, WhatsApp numbers, or store address, edit the `CONFIG` object in [`assets/js/products.js`](assets/js/products.js):

```javascript
const CONFIG = {
    brandName: "Dawakhana.com",
    tagline: "आपका स्वास्थ्य, हमारी प्राथमिकता",
    phone: "+91 98765 43210",       // Display phone number
    whatsapp: "919876543210",        // WhatsApp number without '+' or dashes
    address: "Opposite SBI Main Branch, Central Market, New Delhi - 110001",
    drugLicenseNo: "DL-20B/21B-45920/2024",
    freeDeliveryThreshold: 500,     // Orders above this get free delivery
    discountRate: 0.20              // 20% discount across catalog
};
```
