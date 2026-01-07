# Contributing Guide

## Features to Implement

### High Priority

**Comments UI**
- Backend endpoints exist and work
- Frontend display not implemented
- Need to show comments under cards
- Add comment input form
- Real-time updates on new comments
- Files: src/pages/boards/detail/components/CardDetailModal.tsx

**Card Positioning**
- Cards can move between columns but always go to position 0
- Need to implement drag positioning within columns
- Update optimistic updates to handle positions
- Files: src/pages/boards/detail/components/BoardColumn.tsx

**Loading States**
- Add skeleton loaders for boards
- Loading states for cards
- Improve overall loading UX

**Error Boundaries**
- Catch and display component errors
- Prevent full app crashes
- User-friendly error messages

### Medium Priority

**Search Functionality**
- Search across boards and cards
- Filter by card title, description
- Quick keyboard navigation
- Files: src/shared/MainLayout/components/SearchForm.tsx (stub exists)

**Card Labels**
- Visual label display on cards
- Color coding
- Filter by labels
- Label management

**Card Attachments**
- File upload support
- Display attached files
- Download functionality
- Image previews

**Board Filters**
- Filter cards by labels
- Filter by due dates
- Filter by assignees
- Sort options

**Keyboard Shortcuts**
- Quick navigation between boards
- Card creation shortcuts
- Search activation
- Modal controls

### Low Priority

**User Avatars**
- Avatar upload
- Display on cards (assignees)
- Profile picture management

**Notifications**
- In-app notifications
- Toast for mentions
- Activity feed

**Board Templates**
- Predefined board structures
- Quick board setup
- Template library

**Activity Timeline**
- Show board activity
- Card change history
- User action logs

**Offline Support**
- Service worker for caching
- Offline mode indicators
- Sync when online

**Mobile Optimization**
- Touch-friendly drag and drop
- Responsive modals
- Mobile navigation

**Export Functionality**
- Export board as JSON
- Export as Markdown
- Print view

## How to Contribute

1. Pick a feature from above
2. Create branch: `git checkout -b feature-name`
3. Implement with TypeScript
4. Test thoroughly
5. Submit pull request

## Development Guidelines

**Code Style**
- Use TypeScript for type safety
- Follow existing patterns
- Use functional components
- Prefer hooks over classes

**Component Structure**
- Keep components focused and small
- Extract reusable logic to hooks
- Colocate related components
- Use composition over inheritance

**State Management**
- Use React Query for server state
- Use Zustand for global client state
- Keep component state local when possible
- Avoid prop drilling

**API Integration**
- Add API calls in services/*.api.ts
- Create React Query hooks in services/*.query.ts
- Handle errors gracefully
- Use optimistic updates for better UX

**Forms**
- Use React Hook Form
- Validate with Zod schemas
- Show inline errors
- Clear error messages

**Styling**
- Use Tailwind utility classes
- Follow existing design patterns
- Support dark mode
- Maintain responsive design

**Performance**
- Lazy load routes
- Memoize expensive computations
- Optimize re-renders
- Use React Query caching

## Testing

Add tests for:
- API service functions
- Custom hooks
- Complex components
- Form validation logic

Use Vitest and Testing Library when tests are added.

## Commits

Write clear commit messages:
- Use present tense
- Be descriptive
- One logical change per commit
- Reference issues if applicable

Examples:
- "Add comment display under cards"
- "Fix card drag position bug"
- "Improve loading states for boards"

## Pull Requests

Include:
- Clear description of changes
- Screenshots for UI changes
- Test results
- Breaking changes noted

## Architecture Decisions

When adding features:
- Maintain separation between pages and components
- Keep API logic in services
- Use existing UI components from components/ui
- Follow React Query patterns for data fetching
- Maintain TypeScript type safety

## Questions

Open an issue for discussion before starting major features.