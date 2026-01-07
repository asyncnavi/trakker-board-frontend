# Boards Feature

A well-structured, feature-based boards module using React, TypeScript, React Query, and best practices.

## 📁 Directory Structure

```
boards/
├── constants/
│   └── index.ts                    # Shared constants (colors, priorities)
│
├── detail/                         # Single Board Page feature
│   ├── components/
│   │   ├── BoardCard.tsx           # Card component with drag support
│   │   ├── BoardColumn.tsx         # Column component with cards
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useBoardColumn.ts       # Column business logic hook
│   │   └── index.ts
│   ├── modals/
│   │   ├── CardDetailModal.tsx     # View/edit card modal
│   │   ├── ColumnModal.tsx         # Add/edit column modal
│   │   └── index.ts
│   ├── SingleBoardPage.tsx         # Main board detail page
│   └── index.ts
│
├── list/                           # Boards List Page feature
│   ├── components/
│   │   ├── BoardItem.tsx           # Individual board card
│   │   └── index.ts
│   ├── modals/
│   │   ├── CreateBoardModal.tsx    # Create board modal
│   │   └── index.ts
│   ├── BoardsListPage.tsx          # Main boards list page
│   └── index.ts
│
├── index.ts                        # Public exports
└── README.md                       # This file
```

## 🎯 Design Principles

### 1. Feature-Based Organization

Each feature (`list/`, `detail/`) is self-contained with its own:
- **Components** - Presentational UI components
- **Hooks** - Business logic and state management
- **Modals** - Dialog components for user interactions

### 2. Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Pages | `PascalCase` + `Page` | `BoardsListPage.tsx` |
| Components | `PascalCase` | `BoardCard.tsx` |
| Hooks | `camelCase` + `use` prefix | `useBoardColumn.ts` |
| Modals | `PascalCase` + `Modal` | `CardDetailModal.tsx` |
| Constants | `UPPER_SNAKE_CASE` | `COLUMN_COLORS` |
| Types | `PascalCase` | `BoardItemProps` |

### 3. Code Structure Within Files

Each file follows a consistent structure:

```typescript
// 1. External imports (React, libraries)
import { useState, useCallback } from "react";

// 2. Internal imports (components, hooks, types)
import { Button } from "@/components/ui/button";

// 3. Local imports (from same feature)
import { COLUMN_COLORS } from "../../constants";

// =============================================================================
// Types
// =============================================================================

interface ComponentProps {
  // ...
}

// =============================================================================
// Component
// =============================================================================

function Component({ prop }: ComponentProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [state, setState] = useState();

  // ---------------------------------------------------------------------------
  // Queries & Mutations
  // ---------------------------------------------------------------------------

  const { data } = useQuery();

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleClick = useCallback(() => {
    // ...
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return <div>...</div>;
}

export { Component };
```

### 4. Export Patterns

- **Named exports** for all components, hooks, and types
- **Barrel files** (`index.ts`) for clean imports
- **No default exports** (better refactoring support)

```typescript
// ✅ Good
export { BoardsListPage } from "./BoardsListPage";
export { useBoardColumn } from "./hooks";

// ❌ Avoid
export default BoardsListPage;
```

## 📖 Usage

### Importing Pages

```typescript
import { BoardsListPage, SingleBoardPage } from "@/pages/boards";

// Router setup
<Route path="/boards" element={<BoardsListPage />} />
<Route path="/boards/:boardId" element={<SingleBoardPage />} />
```

### Importing Components

```typescript
// For external use (if needed)
import { BoardCard, BoardColumn, BoardItem } from "@/pages/boards";
```

### Importing Constants

```typescript
import { COLUMN_COLORS, CARD_PRIORITIES } from "@/pages/boards";
```

### Importing Hooks

```typescript
import { useBoardColumn } from "@/pages/boards";
```

## 🔧 Component API Reference

### Pages

#### `BoardsListPage`

Main page displaying all boards.

```typescript
// No props - uses React Query internally
<BoardsListPage />
```

#### `SingleBoardPage`

Board detail page with columns and cards.

```typescript
// Uses useParams() to get boardId
<SingleBoardPage />
```

### Components

#### `BoardItem`

```typescript
interface BoardItemProps {
  board: Board;
  onDelete?: () => void;
  onEdit?: () => void;
  onView?: () => void;
}
```

#### `BoardColumn`

```typescript
interface BoardColumnProps {
  boardId: string;
  column: BoardColumnType;
  otherColumns: BoardColumnType[];
}
```

#### `BoardCard`

```typescript
interface BoardCardProps {
  card: CardType;
  columnName: string | null;
  otherColumns: ColumnType[];
  isDragging?: boolean;
  onMove?: (cardId: string, toColumnId: string) => void;
  onDelete?: (cardId: string) => void;
  onView?: (cardId: string) => void;
}
```

### Modals

#### `CreateBoardModal`

```typescript
interface CreateBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}
```

#### `ColumnModal`

```typescript
interface ColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  boardId: string;
  column?: BoardColumn | null; // If editing existing column
}
```

#### `CardDetailModal`

```typescript
interface CardDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  cardId: string;
}
```

### Hooks

#### `useBoardColumn`

```typescript
const {
  cards,
  isAddingCard,
  newCardTitle,
  isCreatingCard,
  isDeletingCard,
  isMovingCard,
  handleToggleAddCard,
  handleNewCardTitleChange,
  handleSaveCard,
  handleCancelAddCard,
  handleDeleteCard,
  handleMoveCard,
} = useBoardColumn(boardId, column);
```

## 🔄 State Management

### API State (React Query)

All server data is managed through React Query:

- `useBoardsQuery()` - Fetch all boards
- `useBoardQuery(boardId)` - Fetch single board with columns & cards
- `useBoardMutations()` - Create/update/delete boards
- `useColumnMutations(boardId)` - Create/update/delete columns
- `useCardMutations(boardId, columnId)` - Create/update/delete cards

### Local UI State

Component-level state for:
- Modal open/close states
- Form input values
- Drag & drop state

### Zustand (Temporary)

Currently used for card metadata (priority, tags, dueDate) until API supports these fields.

```typescript
// TODO: Replace with API hooks when available
const card = useBoardStore((state) => state.cards.find((c) => c.id === cardId));
```

## ✅ Best Practices Implemented

1. **Separation of Concerns**
   - UI components are pure and receive data via props
   - Business logic lives in hooks
   - API calls are in services

2. **Memoization**
   - `useCallback` for event handlers passed to children
   - Prevents unnecessary re-renders

3. **Type Safety**
   - Explicit interfaces for all props
   - Proper TypeScript generics usage

4. **Accessibility**
   - `aria-label` attributes on buttons
   - Proper `htmlFor` on labels
   - Keyboard navigation support

5. **Error Handling**
   - Try/catch in async handlers
   - User-friendly toast messages
   - Console logging for debugging

6. **Clean Imports**
   - Grouped and ordered imports
   - Barrel files for cleaner paths

## 🚀 Adding New Features

### Adding a New Modal

1. Create file in appropriate `modals/` folder
2. Follow the standard file structure
3. Export from `modals/index.ts`
4. Export from feature `index.ts` if needed externally

### Adding a New Hook

1. Create file in `hooks/` folder with `use` prefix
2. Define clear return type interface
3. Export from `hooks/index.ts`

### Adding a New Component

1. Create file in `components/` folder
2. Define props interface
3. Export from `components/index.ts`

## 📋 TODOs

- [ ] Replace Zustand usage with API for card metadata
- [ ] Add loading skeletons
- [ ] Add error boundaries
- [ ] Implement card position calculation
- [ ] Add real-time updates (WebSocket)
- [ ] Add unit tests for hooks
- [ ] Add integration tests for pages