# FinPilot SaaS Frontend

Production-ready Next.js SaaS frontend for FinPilot - Intelligent Financial Management Platform.

## Features

- 🎨 Modern SaaS UI with TailwindCSS + Shadcn/UI
- 📱 Fully responsive design
- ♿ Accessibility compliant (WCAG 2.1)
- 🎭 Smooth animations with Framer Motion
- 🧪 Comprehensive testing setup
- 🐳 Docker support
- 🔄 CI/CD with GitHub Actions
- 📊 14 fully enabled features for beta testing

## Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ci` - Run tests in CI mode with coverage
- `npm run validate` - Run UI validation scripts
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run with Docker Compose
- `npm run docker:down` - Stop Docker Compose

## Docker

### Build and Run

```bash
# Build image
npm run docker:build

# Run with docker-compose
npm run docker:run
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Docker Compose

```bash
docker-compose up -d
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Overview page
│   │   ├── features/     # Features page
│   │   ├── integrations/ # Integrations page
│   │   ├── pricing/      # Pricing page
│   │   ├── testimonials/ # Testimonials page
│   │   ├── support/      # Support page
│   │   └── dashboard/    # Beta testing dashboard
│   ├── components/
│   │   ├── saas/         # SaaS-specific components
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Utilities and mock API
│   └── types/            # TypeScript types
├── public/               # Static assets
├── scripts/              # Validation and utility scripts
└── __tests__/            # Test files
```

## Beta Testing

### All Features Enabled

All 14 features are **enabled by default** for comprehensive testing:

1. Invoice Management & Collections
2. Scenario Planning & Budget Simulator
3. Bill Pay Automation
4. Profitability Intelligence
5. Financial Health Score
6. Smart Cash Reserves
7. Forecasting & Predictions
8. AI Alerts & Notifications
9. Analytics & Reports
10. AI CFO Chat
11. Model Playground
12. Custom Reports
13. Settings & Configuration
14. Integrations Hub

### Beta Dashboard

Access the beta testing dashboard at `/dashboard`:

- **Feature Toggles**: Enable/disable individual features
- **File Upload**: Upload CSV, XLSX, PDF, JSON, images, ZIP files
- **Quick Actions**: Run demo actions for each feature
- **Session Log**: View all beta testing actions
- **Integration Status**: See all mock integrations (all connected by default)

### Testing Features

1. Navigate to `/dashboard`
2. Click "Open" on any feature card to access the feature page
3. Click "Demo" to run a simulated action
4. Use the Beta Toolbar (bottom right) to manage settings
5. Upload files using the file upload component
6. Check session logs for action history

## File Upload

The app supports uploading various financial record formats:

- **CSV** - Transaction data
- **XLSX** - Excel spreadsheets
- **PDF** - Bank statements, invoices
- **JSON** - Structured data
- **PNG/JPG** - Receipt images
- **ZIP** - Batch uploads

**Note**: Files are stored locally in the browser (localStorage) for demo purposes. In production, files would be uploaded to a secure backend.

## Testing

### Unit Tests

```bash
npm run test
```

### Test Coverage

```bash
npm run test:ci
```

### Run Tests for Specific Component

```bash
npm run test FeatureCard
```

## Validation

Run UI validation checks:

```bash
npm run validate
```

This checks:
- Visual snapshots
- Responsive layouts
- Accessibility (axe-core)
- Navigation scrollspy

## CI/CD

GitHub Actions workflow runs on push/PR:

1. Lint code
2. Type check
3. Run tests
4. Build
5. Accessibility checks

## Accessibility

- Semantic HTML throughout
- ARIA attributes
- Keyboard navigation
- Skip links
- Reduced motion support
- Screen reader friendly

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS
- **UI Components**: Shadcn/UI + Radix UI
- **Animations**: Framer Motion
- **3D Graphics**: React Three Fiber + Drei
- **Charts**: Recharts + D3.js
- **Data Fetching**: TanStack Query
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint
- **Accessibility**: axe-core

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Adding a New Page

1. Create page in `src/app/[page-name]/page.tsx`
2. Add route to `SaaSNavbar.tsx` nav items
3. Update mock data if needed

### Adding a New Component

1. Create component in `src/components/saas/`
2. Export from component file
3. Add TypeScript types if needed
4. Write tests in `src/__tests__/`

## Production Deployment

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

### Docker Production Build

```bash
docker build -t finpilot-frontend .
docker run -p 3000:3000 finpilot-frontend
```

## Environment Variables

Create `.env.local` for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Validation Checklist

After major changes, verify:

- [ ] All pages render correctly
- [ ] Navigation works smoothly
- [ ] File upload functions
- [ ] Beta dashboard shows all features enabled
- [ ] Tests pass
- [ ] Accessibility checks pass
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] No console errors
- [ ] Build succeeds

## Troubleshooting

### Port Already in Use

Change port in `package.json`:
```json
"dev": "next dev -p 3001"
```

### Module Not Found

Clear cache and reinstall:
```bash
rm -rf .next node_modules
npm install --legacy-peer-deps
```

### Docker Build Fails

Ensure Docker Desktop is running and try:
```bash
docker-compose down
docker-compose build --no-cache
```

## Contributing

1. Create feature branch
2. Make changes
3. Run tests and validation
4. Submit PR

## License

Private - FinPilot AI

## Support

- Email: support@finpilot.ai
- Documentation: `/support` page
- Issues: Contact development team
