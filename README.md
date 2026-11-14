# Cinepass — Modern Cinema Web Application

A responsive, high-performance cinema web application engineered with **React 19**, **Vite**, **Tailwind CSS v4**, and **Axios**.

Cinepass connects directly to the Cinepass Microservices API Gateway to provide an immersive cinema booking experience for moviegoers and a real-time operations console for cinema administrators.

---

## 1. Visual Design & Theme Engine

Cinepass features an adaptive luxury cinema aesthetic tailored for high visual engagement:

### Royal Night Mode (Dark)
- Deep obsidian backdrop (`#030712`) layered with ambient royal golden radial gradients (`rgba(217, 119, 6, 0.16)` and `rgba(180, 83, 9, 0.09)`).
- Golden hairline borders (`border-amber-500/25`) and amber micro-glows across cards and navigation elements, evoking a luxury VIP cinema lounge.

### Sunlit Peach Day Mode (Light)
- Warm, luminous canvas with translucent peach and apricot gradients (`rgba(254, 215, 170, 0.55)` and `rgba(253, 186, 116, 0.28)`).
- Warm orange accent borders and crisp typography delivering a modern boutique cinema concierge atmosphere.

---

## 2. Key Features & Workflows

### A. Universal Luxury Landing Page (`/`)
- **Default for Both Roles**: Automatically greets both `ROLE_USER` and `ROLE_ADMIN` with role-aware quick actions.
- **VIP Experience Pillars**: Highlights premium theatre formats—IMAX® with Laser, Dolby Atmos® 360° Sound, VIP Luxe Recliners, and 5-Minute Guaranteed Seat Holds.
- **Dynamic Catalog Grid**: Search by title or description, filter by genre and audio language, and sort by runtime or alphabetical order.
- **Instant Video Trailers**: Built-in modal player to watch high-definition movie trailers without navigating away from the page.

### B. Role-Adaptive Header Navigation
- **For `ROLE_ADMIN`**: Instant access via the golden **Admin Dashboard** button in the header, leading to the full operational console.
- **For `ROLE_USER` & Guests**: Prominent **Book Movies** header action jumping directly into the active movie catalog.

### C. Interactive Seat Reservation Matrix
- Visual seating grid color-coded by tier (Standard, Premium, VIP) and status (Available, Held by user, Held by others, Booked).
- **5-Minute Countdown Timer**: Displays live remaining hold time with instant expiration handling to prevent seat-locking conflicts.
- **Express Confirmation**: Real-time pricing calculation with instant PDF ticket issuance.

### D. Digital Passes & Ticket Wallet (`/my-bookings`)
- View active and past bookings with movie metadata, showtimes, screen details, and allocated seats.
- Dynamic high-resolution QR pass rendering for contactless mobile check-in.
- Instant official PDF ticket download.

### E. Comprehensive Admin Operations Console (`/admin/dashboard`)
- **Real-Time Dynamic Badges**: Tab badges for Movies, Screens, Show Scheduler, and Bookings reflect live database counts.
- **Zero-Refresh CRUD Operations**: Newly scheduled shows, movies, and auditorium screens update immediately upon creation or deletion.
- **Gate Admission & Ticket Scanner**: Scan or enter ticket tokens at theatre entry gates with 3-state real-time verification:
  - 🟢 **Valid Admission**: Grants immediate entry and timestamps the check-in.
  - 🟡 **Already Checked-In**: Warns gate attendants with the previous check-in timestamp.
  - 🔴 **Invalid Pass**: Flags fraudulent or non-existent tickets.

---

## 3. Frontend Architecture

```
Frontend/
├── src/
│   ├── api/                  # Axios HTTP client & microservice API connectors
│   │   ├── client.js         # Central Gateway client with JWT interceptors
│   │   ├── authApi.js        # Authentication & profile endpoints
│   │   ├── movieApi.js       # Movies catalog endpoints
│   │   ├── showApi.js        # Screen layouts & show schedules
│   │   └── bookingApi.js     # Seat holds, bookings, QR & admission
│   ├── components/
│   │   ├── admin/            # Admin tabs (Overview, Movies, Screens, Shows, Bookings)
│   │   ├── auth/             # Login & Registration modals
│   │   ├── common/           # Adaptive Navbar, Dynamic Footer, ProtectedRoute
│   │   ├── movies/           # HeroBanner, MovieCard, Filters, TrailerModal
│   │   └── seats/            # Interactive SeatingGrid, SeatCountdownTimer
│   ├── context/
│   │   ├── AuthContext.jsx   # Authentication state, JWT decoding, role tracking
│   │   ├── ThemeContext.jsx  # Dark/Light theme switching & persistence
│   │   └── ToastContext.jsx  # Non-intrusive floating feedback notifications
│   ├── pages/
│   │   ├── HomePage.jsx          # Default landing page & movie catalog
│   │   ├── MovieDetailPage.jsx   # Movie synopsis, cast, and available shows
│   │   ├── SeatBookingPage.jsx   # Interactive seat selection & hold engine
│   │   ├── MyBookingsPage.jsx    # User ticket wallet & pass downloader
│   │   ├── AdminDashboardPage.jsx# Admin operations suite (lazy-loaded)
│   │   └── ProfilePage.jsx       # User profile & account security (lazy-loaded)
│   ├── App.jsx               # Route definitions & Suspense boundaries
│   ├── index.css             # Tailwind CSS v4 styling & royal/peach background gradients
│   └── main.jsx              # Application bootstrap
└── package.json
```

---

## 4. Performance & Production Optimization

- **Production Chunks Under 500 kB**: Heavy views like `AdminDashboardPage` and `ProfilePage` are split via `React.lazy()` and `Suspense`.
- **Lightweight Dependencies**: Uses pure React Context API (no heavy state managers), native CSS radial gradients, and zero-overhead vector icons (`lucide-react`).
- **Client Bundle Metrics**:
  - `index.html`: ~1.4 kB
  - `index.css`: ~108 kB (14 kB gzipped)
  - `index.js`: ~477 kB (136 kB gzipped)
  - `AdminDashboardPage.js`: ~71 kB (13 kB gzipped)
  - `ProfilePage.js`: ~16 kB (3.6 kB gzipped)

---

## 5. Getting Started

### Development Server
```bash
cd Frontend
npm install
npm run dev
```
The application will launch at `http://localhost:5173` and proxy API calls to the API Gateway at `http://localhost:8080`.

### Linting & Quality Verification
```bash
npm run lint
```

### Production Build
```bash
npm run build
```
Generates optimized, minified production assets inside the `dist/` directory.
