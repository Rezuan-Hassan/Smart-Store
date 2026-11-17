# 🏪 Smart Store

<div align="center">

  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/store.svg" width="80" height="80" alt="Smart Store Logo" />

  <h3>Modern, Real-Time Inventory & Point-of-Sale (POS) Web Application</h3>

  <p>
    A lightweight, responsive web-based store management platform featuring real-time inventory tracking, multi-tenant authentication, dynamic POS checkout, and live sales analytics.
  </p>

  <p>
    <a href="#-key-features">Key Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-firebase-setup">Firebase Setup</a> •
    <a href="#-project-structure">Project Structure</a> •
    <a href="#-deployment">Deployment</a> •
    <a href="#-license">License</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/Firebase_v11-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
  </p>
</div>

---

## 📖 About The Project

**Smart Store** is a client-side web application designed to help small and medium businesses, retail outlets, and shopkeepers track their products, monitor sales performance, and process checkout transactions seamlessly in real time. 

Built with **vanilla modern JavaScript (ES Modules)** and **Tailwind CSS**, it requires **zero build steps or compilation**. All data persistence and authentication are powered by **Google Firebase (Cloud Firestore & Firebase Auth)**, offering live multi-device syncing out of the box.

---

## ✨ Key Features

- 🔐 **Authentication & Store Profiles**
  - Secure Email/Password registration and login via Firebase Auth.
  - Personalized store profiles storing owner name, store name, and account metadata.
  - Protected dashboard routes with automatic auth state redirection.

- 📊 **Real-Time Analytics Dashboard (`dashboard.html`)**
  - **KPI Cards**: Real-time stats on today's revenue, all-time sales, total active products, and low-stock alerts.
  - **Live Activity Feed**: Up-to-the-minute sales stream with buyer information, timestamps, and order values.
  - **User Profile Management**: In-app modal to update profile settings and avatars.

- 📦 **Inventory & Catalog Management (`products.html`)**
  - **Full CRUD operations**: Add, edit, inspect, and remove products.
  - **Stock Tracking**: Automatic visual indicators for healthy stock, low stock, and out-of-stock items.
  - **Filtering & Search**: Instant client-side search by product name and category filtering.
  - **Metadata Fields**: Product name, SKU, category, purchase/selling price, and stock levels.

- 💳 **Point of Sale (POS) & Checkout (`sales.html`)**
  - **Interactive Catalog**: Visual product grid with instant "Add to Cart" capability.
  - **Slide-out Cart Drawer**: Manage item quantities, view price breakdowns (subtotal, tax, discounts, and total).
  - **Atomic Stock Decrement**: Checks and decreases product stock quantities immediately upon checkout using Firestore atomic operations.
  - **Transaction History**: Comprehensive log of past sales with receipt-style order inspection.

- ⚡ **Zero-Build & Lightweight**
  - Runs directly in the browser via CDN-loaded modern ES modules.
  - Ready for static hosting on **GitHub Pages**, **Vercel**, **Netlify**, or **Firebase Hosting**.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **HTML5 & Vanilla JavaScript (ES6+)** | Modular application architecture using native ES modules (`import`/`export`) |
| **Tailwind CSS (CDN)** | Utility-first responsive styling and layout |
| **Phosphor Icons** | Modern icon set for UI micro-interactions |
| **Firebase Authentication (v11)** | Client-side user auth and session handling |
| **Cloud Firestore (v11)** | Real-time NoSQL database with user-scoped isolation |

---

## 📂 Project Structure

```plaintext
Smart-Store/
├── css/
│   └── style.css                 # Global CSS variables, scrollbar styling, & drawer animations
├── js/
│   ├── app.js                    # Core logic: Firestore listeners, CRUD, POS, dashboard stats
│   ├── auth.js                   # Authentication logic: login, registration, and logout
│   ├── firebase-init.js          # Firebase SDK initialization and client configuration
│   └── firebase-config.example.js# Template for custom Firebase credentials
├── .gitignore                    # Ignored files (OS, IDE, environment keys, cache)
├── CONTRIBUTING.md               # Guidelines for contributors
├── dashboard.html                # Store analytics and management overview
├── firestore.rules               # Recommended Cloud Firestore security rules
├── index.html                    # Entry point / auth splash router
├── LICENSE                       # MIT License
├── login.html                    # Store owner sign-in portal
├── products.html                 # Inventory and product catalog management
├── README.md                     # Comprehensive project documentation
├── register.html                 # New store owner account creation
└── sales.html                    # POS checkout terminal & sales history
```

---

## 🚀 Getting Started

### Prerequisites

You only need a modern web browser (Google Chrome, Firefox, Safari, Edge) and optionally a local development server for testing ES modules.

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/smart-store.git
cd smart-store
```

### 2. Run Locally

Because the project utilizes native ES modules (`<script type="module">`), it is recommended to run it through any local HTTP server:

- **VS Code Live Server**: Right-click `index.html` and click **"Open with Live Server"**.
- **Python**:
  ```bash
  python -m http.server 8000
  ```
  Then open `http://localhost:8000` in your browser.
- **Node.js (`npx serve`)**:
  ```bash
  npx serve .
  ```

---

## 🔥 Firebase Setup

To connect this application to your own Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **"Add project"**.
2. **Enable Firebase Authentication**:
   - Navigate to **Build > Authentication** > Click **Get Started**.
   - Under the **Sign-in method** tab, enable **Email/Password**.
3. **Enable Cloud Firestore**:
   - Navigate to **Build > Firestore Database** > Click **Create database**.
   - Start in **Production mode** (or Test mode while prototyping).
   - In the **Rules** tab, paste the contents of [`firestore.rules`](./firestore.rules):
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /artifacts/{appId}/users/{userId}/{document=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
     ```
4. **Register a Web App**:
   - In Project Settings (`⚙️`), scroll down to **Your apps** and click the Web (`</>`) icon.
   - Copy your `firebaseConfig` object.
5. **Update your credentials in `js/firebase-init.js`**:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.firebasestorage.app",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

---

## 🌐 Deployment

### GitHub Pages

1. Push your repository to GitHub.
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**. Within a few minutes, your store management app will be live at:
   `https://<your-username>.github.io/<repo-name>/`

### Firebase Hosting / Netlify / Vercel

Since this is a static site with no backend build step required, you can drag-and-drop or connect the repository directly to [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/) with root directory `./` and no build command.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues). Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for details on our code of conduct and how to submit pull requests.

---

## 📝 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

---

<div align="center">
  Developed by <a href="https://github.com/RezuanHassan">Rezuan Hassan</a>
</div>
