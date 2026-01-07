# Development Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see board_backend repository)

## Initial Setup

1. Clone repository
```bash
git clone <repository-url>
cd board-project
```

2. Install dependencies
```bash
npm install
```

3. Configure environment
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:4000" > .env
```

4. Start development server
```bash
npm run dev
```

Application runs at http://localhost:5173

## Environment Variables

**VITE_API_URL**
- Development: http://localhost:4000
- Production: Your deployed backend URL
- Required for API communication

Example `.env`:
```
VITE_API_URL=http://localhost:4000
```

## Development Workflow

Start backend first:
```bash
cd board_backend
./dev.sh server
```

Then start frontend:
```bash
cd board-project
npm run dev
```

## Project Structure

```
src/
├── App/
│   ├── index.tsx           # App component
│   └── router.tsx          # Route definitions
│
├── components/
│   └── ui/                 # Reusable UI components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── ...
│
├── pages/
│   ├── auth/
│   │   └── login/          # Login page with OTP
│   │
│   ├── boards/
│   │   ├── list/           # Board list page
│   │   │   ├── index.tsx
│   │   │   └── modals/     # Create board modal
│   │   │
│   │   └── detail/         # Single board page
│   │       ├── index.tsx
│   │       ├── modals/     # Edit board, reorder columns
│   │       └── components/ # Board columns, cards
│   │
│   └── NotFound/           # 404 page
│
├── services/               # API integration
│   ├── auth/
│   │   ├── auth.api.ts     # API calls
│   │   └── auth.query.ts   # React Query hooks
│   │
│   ├── board/
│   ├── column/
│   ├── card/
│   ├── comment/
│   └── user/
│
├── shared/
│   └── MainLayout/         # Layout component
│       ├── index.tsx
│       └── components/     # Header, sidebar, navigation
│
├── stores/                 # State management
│   └── authStore.ts        # Authentication state
│
└── types/                  # TypeScript types
    ├── auth.ts
    ├── board.ts
    └── ...
```

## Key Technologies

**React Query (TanStack Query)**
- Data fetching and caching
- Automatic refetching
- Optimistic updates

Example usage:
```typescript
import { useBoards } from '@/services/board/board.query';

function MyComponent() {
  const { data, isLoading, error } = useBoards();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  
  return <div>{data.map(...)}</div>;
}
```

**React Hook Form**
- Form handling
- Validation with Zod
- Error management

Example usage:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  
  return <form onSubmit={form.handleSubmit(...)}>...</form>;
}
```

**dnd-kit**
- Drag and drop functionality
- Cards between columns
- Column reordering

Example usage:
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

function DraggableList() {
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={items}>
        {items.map(item => <DraggableItem key={item.id} {...item} />)}
      </SortableContext>
    </DndContext>
  );
}
```

## Authentication Flow

1. User enters email on login page
2. API call to POST /api/auth/email/start
3. User receives OTP via email
4. User enters OTP
5. API call to POST /api/auth/email/verify
6. Tokens stored in localStorage
7. Axios interceptor adds token to all requests
8. Redirect to boards page

Token refresh:
- When access token expires (401 response)
- Interceptor automatically calls refresh endpoint
- New token stored and request retried

## API Services Pattern

Each resource has two files:

**api.ts** - API calls
```typescript
export const boardApi = {
  getBoards: () => api.get('/boards'),
  createBoard: (data) => api.post('/boards', data),
};
```

**query.ts** - React Query hooks
```typescript
export const useBoards = () => {
  return useQuery({
    queryKey: ['boards'],
    queryFn: () => boardApi.getBoards(),
  });
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: boardApi.createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};
```

## State Management

**Zustand** for global state:
```typescript
// stores/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
```

**React Query** for server state (recommended for most data)

## Component Patterns

**UI Components** (components/ui/)
- Built with Radix UI
- Styled with Tailwind
- Reusable across app

**Page Components** (pages/)
- Route-specific components
- Use service hooks for data
- Handle page-level logic

**Modal Components**
- Colocated with page using them
- Use dialog from Radix UI
- Manage open state locally

## Styling

**Tailwind CSS**
- Utility-first CSS framework
- Dark mode support
- Responsive design

Example:
```tsx
<div className="flex items-center gap-4 p-4 bg-background text-foreground">
  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
    Click me
  </button>
</div>
```

**CSS Variables** (Tailwind config)
- Theme colors defined in index.css
- Support for light/dark mode
- Custom color scheme

## Forms

All forms use React Hook Form + Zod:

1. Define schema
```typescript
const schema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
});
```

2. Create form
```typescript
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { title: '', description: '' },
});
```

3. Handle submit
```typescript
const onSubmit = (data) => {
  mutation.mutate(data);
};
```

## Error Handling

**API Errors**
- Caught by React Query
- Displayed via toast notifications
- Logged to console in development

**Form Errors**
- Validated by Zod
- Displayed inline via form state
- Field-specific messages

**Authentication Errors**
- Redirect to login on 401
- Clear tokens from localStorage
- Show appropriate message

## Building for Production

```bash
npm run build
```

Output in `dist/` directory.

Preview production build:
```bash
npm run preview
```

## Linting

```bash
npm run lint
```

ESLint configured with:
- TypeScript support
- React hooks rules
- React refresh rules

## Common Issues

**CORS errors**
- Ensure backend CORS_ALLOWED_ORIGINS includes http://localhost:5173
- Check backend is running

**API connection refused**
- Verify VITE_API_URL in .env
- Ensure backend is running on correct port

**Build errors**
- Check TypeScript errors: `npx tsc --noEmit`
- Ensure all dependencies installed

**Hot reload not working**
- Restart dev server
- Clear browser cache

## Debugging

**React Query Devtools**
- Enabled in development
- Access via floating icon
- Shows all queries and their state

**Browser DevTools**
- Network tab for API calls
- Console for errors
- React DevTools for component tree

## Performance

**Code Splitting**
- Routes lazy loaded
- Reduces initial bundle size

**React Query Caching**
- Automatic caching of API responses
- Reduces unnecessary requests
- Configurable staleTime

**Optimistic Updates**
- UI updates before API response
- Better user experience
- Rolled back on error

## Testing

Currently no tests configured.

Recommended setup:
- Vitest for unit tests
- Testing Library for component tests
- MSW for API mocking

## Resources

- React: https://react.dev
- Vite: https://vitejs.dev
- TanStack Query: https://tanstack.com/query
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev
- dnd-kit: https://dndkit.com
- Radix UI: https://radix-ui.com
- Tailwind CSS: https://tailwindcss.com