# Insightify - Data Science Agency Platform

**Insightify** adalah platform modern untuk analisis sentimen berbasis teknologi cloud. Platform ini menyediakan tools analitik canggih untuk menganalisis dan memahami sentimen dari teks menggunakan kecerdasan buatan.

## 🎯 Tentang Proyek

Insightify adalah aplikasi web yang memungkinkan pengguna untuk:
- **Analisis Sentimen Real-time**: Analisis sentimen teks dengan akurasi tinggi menggunakan teknologi machine learning
- **Riwayat Analisis**: Menyimpan dan mengakses riwayat analisis sentimen pengguna
- **Sistem Pembayaran**: Integrasi pembayaran untuk paket premium dan enterprise
- **Dashboard Admin**: Panel administrasi untuk mengelola pengguna dan analytics
- **Multi-tier Pricing**: Berbagai paket berlangganan (Free, Pro, Enterprise)

## 📋 Fitur Utama

- 🔐 **Autentikasi Aman**: Login/Sign-up dengan Firebase Authentication
- 📊 **Dashboard Analytics**: Visualisasi data menggunakan Chart.js
- 💳 **Payment Integration**: Sistem pembayaran terintegrasi
- 📁 **File Upload**: Dukungan upload file CSV/Excel dengan react-dropzone
- 🎨 **Modern UI**: Interface modern dengan Material-UI dan Framer Motion
- 🌙 **Dark Theme**: Tema gelap yang elegan dan nyaman untuk mata
- 📱 **Responsive Design**: Fully responsive untuk desktop dan mobile

## 🛠 Tech Stack

### Frontend
- **React 19.2.0** - Library JavaScript untuk UI
- **Vite 7.2.4** - Build tool modern dengan fast HMR
- **Material-UI (MUI)** - Component library profesional
- **React Router DOM** - Client-side routing
- **Framer Motion** - Animasi smooth dan interaktif
- **Chart.js & react-chartjs-2** - Visualisasi data

### Backend & Services
- **Firebase** - Authentication, Firestore database, Cloud Storage
- **Supabase** - Alternative database dan API management
- **Firebase Cloud Functions** - Serverless functions (Node.js 24)

### Utilities
- **React-Firebase-Hooks** - Hooks untuk Firebase integration
- **React-Dropzone** - File upload handling
- **XLSX** - Excel file processing
- **Emotion** - CSS-in-JS styling

## 📁 Struktur Proyek

```
insightify-data-science-agency/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/            # Page components untuk routing
│   ├── App.jsx           # Root component dengan routing
│   ├── main.jsx          # Entry point React
│   ├── firebase.js       # Firebase configuration
│   ├── supabase.js       # Supabase configuration
│   ├── App.css           # Styling
│   └── index.css         # Global styles
├── functions/            # Firebase Cloud Functions
├── public/              # Static assets
├── package.json         # Project dependencies
├── vite.config.js       # Vite configuration
└── README.md            # This file

```

## 🚀 Mulai Menggunakan

### Prerequisites
- Node.js 20+ (atau sesuai dengan versi di package.json)
- npm atau yarn

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/NK47GG/insightify-data-science-agency.git
cd insightify-data-science-agency
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Environment Variables**
Buat file `.env` dan tambahkan konfigurasi Firebase dan Supabase Anda:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

### Development

**Jalankan Development Server:**
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5173` (default Vite)

### Build & Production

**Build untuk Production:**
```bash
npm run build
```

**Preview Build:**
```bash
npm run preview
```

## 📖 Halaman Utama

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| Home | `/` | Landing page utama |
| Sentiment Analysis | `/analysis` | Tool analisis sentimen |
| How to Use | `/how-to-use` | Panduan penggunaan |
| Pricing | `/pricing` | Paket berlangganan |
| Sign In | `/signin` | Login pengguna |
| Sign Up | `/signup` | Registrasi akun baru |
| Payment | `/payment` | Halaman pembayaran (protected) |
| History | `/history` | Riwayat analisis (protected) |
| Admin | `/admin` | Dashboard admin (admin only) |
| Contact | `/contact` | Hubungi tim sales |

## 🔐 Authentication & Authorization

- **Firebase Authentication**: Menangani login/signup dengan email
- **Admin Role**: Custom claims di Firebase untuk menentukan admin users
- **Protected Routes**: Routes tertentu hanya dapat diakses oleh authenticated users
- **Admin Dashboard**: Restricted access untuk admin users

## 📊 Data Analytics & Visualization

Platform menggunakan:
- **Chart.js** untuk membuat visualisasi data
- **Chartjs-plugin-datalabels** untuk label pada chart
- **Firestore** untuk menyimpan historical data
- **Material-UI Charts** components untuk display

## 🎨 Styling & Theme

Menggunakan Material-UI ThemeProvider dengan:
- **Dark Mode Theme** sebagai default
- **Custom Color Palette** dengan primary color `#42a5f5`
- **Typography**: Menggunakan font Poppins
- **Custom Component Styling**: Glassmorphism cards dengan backdrop blur

## 📦 Scripts

```bash
npm run dev       # Jalankan development server
npm run build     # Build untuk production
npm run lint      # Check ESLint
npm run preview   # Preview production build
```

### Firebase Functions
```bash
cd functions
npm run serve     # Jalankan Firebase emulator
npm run deploy    # Deploy ke Firebase
npm run logs      # Lihat logs
```

## 🔗 API & Integrations

### Firebase
- Authentication (Email/Password)
- Firestore Database
- Cloud Storage
- Cloud Functions (untuk backend logic)

### Supabase
- Alternative Database
- Real-time capabilities
- API management

### Payment Processing
- Integrated payment gateway (details di `/payment` page)

## 👥 User Roles & Permissions

1. **Anonymous User**: Akses ke home, how-to-use, pricing, contact
2. **Authenticated User**: Akses ke analysis, payment, history
3. **Admin User**: Full access ke admin dashboard

## 📝 Best Practices

- ESLint configuration untuk code quality
- React Hooks untuk state management
- Component-based architecture
- Async/await untuk operations
- Error handling dengan try-catch
- Loading states untuk user feedback

## 🐛 Troubleshooting

### Module not found
```bash
npm install
```

### Build errors
```bash
npm run lint --fix
npm run build
```

### Firebase connection issues
- Verifikasi Firebase config di `src/firebase.js`
- Check network connectivity
- Verify API keys di console.firebase.google.com

## 📧 Contact

Untuk pertanyaan atau support, hubungi tim sales:
- Email: [sales@insightify.com](mailto:sales@insightify.com)

## 📄 License

Proprietary - All rights reserved

---

**Last Updated**: 2026

Built with ❤️ using React, Firebase, and Material-UI
