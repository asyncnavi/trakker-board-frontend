# Trakker - Board Management Frontend

A React-based frontend for managing Kanban-style boards with drag-and-drop functionality.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Application runs at http://localhost:5173

## Features

- Email-based OTP authentication
- Board management with custom backgrounds
- Drag-and-drop cards between columns
- Column reordering
- Card comments
- Markdown support for card descriptions
- Dark mode support
- Responsive design

## Tech Stack

- React 19
- TypeScript
- Vite
- TanStack Query (data fetching)
- React Hook Form (forms)
- Zod (validation)
- dnd-kit (drag and drop)
- Radix UI (components)
- Tailwind CSS
- Zustand (state management)

## Environment Setup

Create `.env` file:

```bash
VITE_API_URL=http://localhost:4000
```

For production, set your deployed backend URL:

```bash
VITE_API_URL=https://your-api.onrender.com
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── App/                    # App setup and routing
├── components/
│   └── ui/                 # Reusable UI components (Radix UI)
├── pages/
│   ├── auth/               # Login page
│   ├── boards/
│   │   ├── list/           # Board list page
│   │   └── detail/         # Single board page
│   └── NotFound/
├── services/               # API calls and queries
│   ├── auth/
│   ├── board/
│   ├── column/
│   ├── card/
│   ├── comment/
│   └── user/
├── shared/
│   └── MainLayout/         # Layout and navigation
├── stores/                 # Zustand stores
└── types/                  # TypeScript types
```

## Authentication

The app uses OTP (One-Time Password) email authentication:

1. User enters email
2. Backend sends 6-digit code
3. User enters code
4. JWT tokens returned
5. Tokens stored in localStorage

Access token expires in 24 hours. Refresh token used to get new access token.

## API Integration

API calls are centralized in `src/services/`:

```typescript
// Example: Fetch boards
import { useBoards } from '@/services/board/board.query';

function MyComponent() {
  const { data: boards } = useBoards();
  return <div>{boards?.map(...)}</div>;
}
```

All API requests automatically include JWT token from localStorage.

## Development

See DEVELOPMENT.md for detailed development guide.

## Deployment

Application can be deployed to:
- Vercel (recommended)
- Netlify
- Render Static Sites
- Any static hosting service

Build command: `npm run build`
Output directory: `dist`

Remember to set `VITE_API_URL` environment variable to your backend URL.

## License

MIT