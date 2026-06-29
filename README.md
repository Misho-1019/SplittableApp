
# 💸 Splittable

### Full-Stack Expense Splitting App with Per-Pair Balance Calculation

A production-oriented **React Native mobile application** designed to **split expenses fairly, track group balances, and settle debts** across multiple groups and members.

This project focuses on **real-world money math, per-pair balance computation, payment integration, and cross-platform deployment** — not just a simple bill splitter.

---

## 🎯 Project Purpose

Expense splitting apps often get the math wrong for groups with 3+ people — they show every member's full net balance without isolating who actually owes whom. **Splittable** addresses this by:

- allowing you to **select which members** are included in each expense
- computing **true per-pair balances** (not just group-level net)
- supporting **percentage, equal, and custom** split types
- tracking **cash and card settlements** with pending/completed/cancelled statuses
- running entirely on **Firebase** (Auth, Firestore, Functions) with **real-time sync**
- integrating **Stripe test-mode card payments**
- sending **push notifications** when expenses or settlements are created
- supporting **dark mode** and **user currency preferences**
- deploying as a **cross-platform mobile + web** app via Expo

The app handles the hard case correctly: when Pesho joins Misho and John's group, he only sees debts from expenses he participated in — not from their pre-existing transactions.

---

## 🚀 Core Features

### Group & Expense Management

- Create groups with invite codes
- Add/remove members (with outstanding-balance guard)
- Create expenses with **selectable member split** — exclude people who aren't part of the bill
- **Equal, percentage, and custom** split modes with real-time validation
- Attach receipt photos via camera or gallery
- Edit expense descriptions after creation
- Real-time expense list with user-involved filtering

### Balance Calculation (The Hard Part)

- **Per-pair balance computation** using `getUserInvolvedBalances()` — correctly isolates who owes whom
- New members never see pre-join debts
- Proper handling of selective splits (only involved members share the cost)
- Settlement-aware balance display (completed settlements reduce debts)
- Aggregate net balance across all groups

### Settlement & Payments

- Cash settlements with **pending → completed → cancelled** lifecycle
- Stripe test-mode card payments
- Per-button loading states, self-settlement guard, zero-amount guard
- Duplicate settlement prevention with Firestore checks
- Settlement history in the Balances tab

### Auth & Security

- Firebase Auth with email/password
- Role-based access: only expense creators can edit/delete
- Group deletion restricted to creator
- Member removal blocks if expenses exist
- Expense detail access control — non-participants see "Not Found"

### Push Notifications

- Expo Push API with Firebase Cloud Function triggers
- Notifications on: new expense (split members notified), settlement created/completed, member added to group
- Firestore token registration per device

### UX & Polish

- Dark mode with theme persistence
- Multi-currency support with user preference (8 currencies)
- Cross-platform: iOS, Android, Web
- Hardware back-button handling, discard-changes modals
- Branded splash screen with tagline
- First-run onboarding guide on empty groups
- Toast notifications with FIFO queue
- 30+ UX improvements across 3 sprints (accessibility, skeletons, error states, validation)

---

## 🌐 Live Demo

- **Web (Vercel):** https://splittable-app-one.vercel.app
- **Mobile:** Available via Expo Go (development) or EAS Build (production)

> ⚠️ Note:
> The web version lacks camera (receipts) and push notifications — core expense splitting features are fully functional. Card payments use Stripe test mode.

---

## 🖼️ Screenshots

<!-- Add your screenshots here -->
<!-- Example: ![Login Screen](assets/screenshots/login.png) -->
<!-- Example: ![Group Detail](assets/screenshots/group-detail.png) -->
<!-- Example: ![Expense Form with Member Selection](assets/screenshots/add-expense.png) -->
<!-- Example: ![Balances with Per-Pair Display](assets/screenshots/balances.png) -->
<!-- Example: ![Settlement Flow](assets/screenshots/settle.png) -->
<!-- Example: ![Settings with Currency Picker](assets/screenshots/settings.png) -->

---

## 🏗️ Architecture Overview

The application follows a layered architecture with real-time data sync:

```
┌─────────────────────────────────────────┐
│            Expo SDK 54 (React Native)    │
│   iOS / Android / Web (react-native-web) │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Firebase Client SDK              │
│  Auth · Firestore · Storage · Functions  │
└──────┬──────────────┬──────────┬────────┘
       │              │          │
┌──────▼────┐ ┌───────▼────┐ ┌──▼──────────┐
│ Firestore  │ │ Cloud      │ │ Expo Push   │
│ Realtime   │ │ Functions  │ │ API         │
│ Listeners  │ │ (5 triggers)│ │ (notifs)    │
└───────────┘ └───────┬────┘ └─────────────┘
                      │
               ┌──────▼──────┐
               │ Stripe API   │
               │ (test mode)  │
               └─────────────┘
```

### Key Architecture Decisions

**Per-Pair Balance Algorithm (`getUserInvolvedBalances()`):**

Most expense splitters compute group-level net balances and display them as if they're per-person. This is wrong for 3+ people. Splittable's algorithm iterates each expense directly: if user A paid $100 with members B and C in the split, A is owed $50 by B and $50 by C — not $100 by "the group." Settlements between specific pairs adjust these per-pair balances independently.

This is implemented in `src/utils/calculateBalances.ts` — the most critical module in the app.

### Data Model

```
groups/{groupId}
  ├── expenses/{expenseId}      (immutable, splitDetails per member)
  ├── settlements/{settlementId} (pending/completed/cancelled)
users/{userId}
  └── tokens/{tokenId}          (Expo push tokens)
```

### Cloud Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `onexpensewrite` | `onDocumentWritten` on expenses | Recalculates totalExpenses + sends expense notification to split members |
| `createpaymentintent` | `onCall` (client) | Creates Stripe PaymentIntent for card payments |
| `confirmsettlement` | `onCall` (client) | Confirms Stripe payment, updates settlement status |
| `onsettlementwrite` | `onDocumentWritten` on settlements | Notifies both parties when a settlement is created or completed |
| `ongroupupdate` | `onDocumentWritten` on groups | Notifies new members when added to a group |

---

## 🛠️ Tech Stack

### Mobile (React Native)

| Technology | Purpose |
|-----------|---------|
| Expo SDK 54 | Cross-platform framework |
| React Native 0.81 | Mobile UI runtime |
| Expo Router v6 | File-based navigation |
| react-native-gesture-handler | Swipe gestures, touch handling |
| react-native-reanimated | Animations |
| expo-camera / expo-image-picker | Receipt photo capture |
| expo-notifications | Push notification registration |

### Backend

| Technology | Purpose |
|-----------|---------|
| Firebase Auth | Email/password authentication |
| Cloud Firestore | Real-time document database |
| Cloud Functions (v2, Node 22) | Serverless triggers |
| Firebase Storage | Receipt photo storage |

### Payments & Notifications

| Technology | Purpose |
|-----------|---------|
| Stripe (test mode) | Card payment processing |
| Expo Push API | Push notification delivery |

### Web Deployment

| Technology | Purpose |
|-----------|---------|
| Vercel | Web hosting with SPA routing |
| react-native-web | Web platform support |

---

## 🔒 Security Considerations

- Firebase Auth for user authentication
- Creator-only delete guards on expenses and groups
- Member removal blocked if outstanding expenses exist
- Expense detail access restricted to participants
- Self-settlement blocked with error toast
- Duplicate settlement detection via Firestore query
- Cloud Function validates group membership for all operations
- CSRF protection on auth routes
- Input validation with Zod schemas (client-side)
- iOS-only `Alert.prompt` replaced with cross-platform Forgot Password modal

---

## 🗄️ The Math — Why It's Different

Most expense splitting apps compute balances like this:

```
Alice pays $100. Split: Alice ($33), Bob ($33), Charlie ($34)
→ Alice: +$66 (owes $0, receives $100, owes $33... net = +$66)
→ Bob: -$33
→ Charlie: -$34
```

Then, when Pesho joins a new expense where only Alice and Bob participate, most apps show Pesho's perspective as "you owe Bob $40" — incorrectly mixing Charlie into a relationship where no money flowed between them.

**Splittable** handles this correctly with `getUserInvolvedBalances()`:

```
For each expense where you participated:
  - If you paid → each split member owes you their share
  - If someone else paid → you owe that payer your share
  → Accumulate per-pair (not per-group)
  → Apply settlements between that specific pair
```

Result: Pesho sees exactly what he owes and to whom — nothing more.

---

## ▶️ Running Locally

### Prerequisites

- **Node.js 22** or later
- **Firebase project** with Auth, Firestore, and Cloud Functions enabled
- **Expo CLI** (`npx expo`)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd splittable
npm install

# Configure environment
cp .env.example .env
# Fill in your Firebase project credentials

# Start Expo dev server
npx expo start
```

Scan the QR with **Expo Go** on iOS or Android.

### Web Build & Deploy

```bash
# Build the web export
npx expo export --platform web

# Fix font files for static serving (Vercel/Netlify)
.\build-web.ps1

# Upload dist/ to Vercel or Netlify
```

### Firestore Indexes

One composite index is required. Deploy with:

```bash
firebase deploy --only firestore:indexes
```

### Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

---

## 🌱 Future Improvements

- Unit tests for `calculateBalances.ts` (core math — highest priority)
- EAS development build for full native support (notifications, camera)
- Firestore security rules file
- Delete account / GDPR compliance
- Group-level currency setting
- Multi-language support (i18n)
- Full data export with expenses and settlements
- Production Stripe integration (real payments)
- Revamped onboarding flow with guided walkthrough

---

## 👤 Author Note

Built with a production mindset, focusing on **correct money math, per-pair balance computation, multi-member group dynamics, and cross-platform mobile + web deployment.**

This project demonstrates applied full-stack React Native development with **real-time Firebase integration, payment processing, push notifications, and a mathematically sound expense-splitting algorithm** — reflecting real engineering scenarios beyond basic CRUD applications.
