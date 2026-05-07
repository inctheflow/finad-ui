# finad-ui

The React frontend for [FINAD](../finad) — a personal finance tracker with bank sync, AI chat, and spending analytics.

---

## Pages

| Page | Description |
|---|---|
| **Dashboard** | Stat cards, donut spending chart, monthly bar chart, top expenses, AI chat banner |
| **Transactions** | Searchable full transaction list with category badges |
| **AI Summary** | AI-generated text summary of spending habits |
| **AI Chat** | Conversational AI assistant for questions about your finances |
| **Cash** | Log manual cash income and expenses |
| **Upload** | Upload PDF bank/card statements to import transactions |
| **Banks** | Connect bank accounts via Teller, sync transactions |
| **Account** | Update profile, phone, security question, change password |

---

## Tech Stack

| Package | Purpose |
|---|---|
| `react` 19 | UI framework |
| `typescript` | Type safety |
| `vite` | Dev server and bundler |
| `recharts` | Donut chart (spending by category) and bar chart (monthly spending) |
| `axios` | HTTP client — attaches JWT and handles 401 auto-logout |

---

## Project Structure

```
finad-ui/
├── src/
│   ├── App.tsx              # Root: auth gate, nav, page routing
│   ├── App.css              # All styles (single stylesheet)
│   ├── api.ts               # Typed API functions (axios)
│   ├── types.ts             # Shared TypeScript interfaces
│   ├── main.tsx             # React entry point
│   └── components/
│       ├── Auth.tsx         # Login / register form
│       ├── Dashboard.tsx    # Charts, stats, AI robot banner
│       ├── Transactions.tsx # Transaction table with search
│       ├── Summary.tsx      # AI text summary
│       ├── Upload.tsx       # PDF upload form
│       ├── Cash.tsx         # Manual cash entry
│       ├── BankConnect.tsx  # Teller Connect integration
│       ├── Account.tsx      # Profile settings
│       └── Chat.tsx         # AI chat interface
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- The [finad backend](../finad) running on `http://localhost:3000`
- (Optional) A [Teller](https://teller.io) Application ID for bank sync

### Install and run

```bash
cd finad-ui
npm install
npm run dev
# Opens at http://localhost:5173
```

### Build for production

```bash
npm run build
# Output in dist/
```

### Environment variables

Create a `.env` file in `finad-ui/` if you want to pre-configure Teller:

```env
VITE_TELLER_APP_ID=app_xxxxxxxxxxxxxxxx
VITE_TELLER_ENV=sandbox        # sandbox | development | production
```

If `VITE_TELLER_APP_ID` is not set, users can enter their App ID manually on the Banks page.

---

## Key Design Decisions

- **Single CSS file** (`App.css`) — no CSS-in-JS library, all styles are plain CSS classes
- **No global state** — each page fetches its own data on mount via `useEffect`
- **JWT stored in `localStorage`** — attached to every request via an axios interceptor; a 401 response auto-reloads the page to trigger logout
- **Collapsible sidebar navigation** — left sidebar with SVG icons and labels; collapses to icon-only mode (64px) via a toggle button for more screen space
- **AI Chat as a first-class nav item** — accessible directly from the sidebar, with a secondary entry point via the robot banner on the Dashboard
- **Small categories grouped** — pie/donut slices under 3% of total are collapsed into "Others" to keep the chart readable

---

## License

MIT
