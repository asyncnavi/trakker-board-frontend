# Column Service - Surgical Updates with React Query

This service demonstrates **surgical cache updates** - a pattern where we update React Query's cache directly instead of refetching entire resources.

## 📁 File Structure

```
src/services/column/
├── column.ts           # Pure API functions (no React)
├── column.types.tsx    # TypeScript types and Zod schemas
├── column.query.tsx    # React Query hooks with surgical updates
├── index.ts           # Re-exports
└── README.md          # This file
```

## 🎯 What are Surgical Updates?

**Without surgical updates:**
```
User creates column → API call → Invalidate board query → Refetch entire board (wasteful!)
```

**With surgical updates:**
```
User creates column → API call → Update board cache directly → No refetch needed! ✅
```

## 🔧 How It Works

### 1. The Problem

When you fetch a board with `getBoard(id)`, you get:

```typescript
{
  id: "board-1",
  name: "My Board",
  columns: [
    { id: "col-1", name: "Todo", cards: [...] },
    { id: "col-2", name: "Done", cards: [...] }
  ]
}
```

If you create a new column, you don't want to refetch the **entire board** (with all columns and cards). You just want to add the new column to the cache.

### 2. The Solution

React Query's `queryClient.setQueryData()` allows you to **directly manipulate the cache**:

```typescript
// Instead of this (refetch entire board):
queryClient.invalidateQueries({ queryKey: ["board", boardId] });

// Do this (surgical update):
const currentBoard = queryClient.getQueryData(["board", boardId]);
queryClient.setQueryData(["board", boardId], {
  ...currentBoard,
  columns: [...currentBoard.columns, newColumn]
});
```

### 3. The Three Phases

Each mutation has three phases:

#### **onMutate** (Optimistic Update)
- Runs **before** API call
- Shows instant UI feedback
- Saves previous state for rollback

```typescript
onMutate: async (newColumnData) => {
  // Cancel ongoing queries
  await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });
  
  // Save snapshot
  const previousBoard = queryClient.getQueryData(boardKeys.detail(boardId));
  
  // Add temp column to cache (instant UI update!)
  queryClient.setQueryData(boardKeys.detail(boardId), {
    ...previousBoard,
    columns: [...previousBoard.columns, tempColumn]
  });
  
  return { previousBoard }; // For rollback
}
```

#### **onSuccess** (Real Data)
- Runs **after** successful API call
- Replaces temp data with real data from server
- Updates cache with actual IDs

```typescript
onSuccess: (newColumn) => {
  const currentBoard = queryClient.getQueryData(boardKeys.detail(boardId));
  
  queryClient.setQueryData(boardKeys.detail(boardId), {
    ...currentBoard,
    columns: [
      ...currentBoard.columns.filter(col => !col.id.startsWith('temp-')),
      newColumn // Real data from server
    ]
  });
}
```

#### **onError** (Rollback)
- Runs if API call fails
- Restores previous state
- User sees original data again

```typescript
onError: (_err, _variables, context) => {
  // Rollback to snapshot
  queryClient.setQueryData(
    boardKeys.detail(boardId),
    context.previousBoard
  );
}
```

## 📖 Usage Examples

### Creating a Column

```typescript
import { useColumnMutations } from "@/services/column";

function BoardPage({ boardId }) {
  const { createColumn } = useColumnMutations(boardId);
  
  const handleAddColumn = async () => {
    try {
      await createColumn.mutateAsync({
        name: "New Column",
        position: 0,
        background_color: null
      });
      // ✅ Column appears instantly (optimistic)
      // ✅ Board cache updated surgically
      // ✅ No full board refetch!
    } catch (error) {
      // ✅ Automatic rollback on error
      console.error(error);
    }
  };
  
  return <button onClick={handleAddColumn}>Add Column</button>;
}
```

### Updating a Column

```typescript
const { updateColumn } = useColumnMutations(boardId);

await updateColumn.mutateAsync({
  id: "col-123",
  data: { name: "Updated Name" }
});
// ✅ Column updated in cache immediately
// ✅ No refetch of entire board
```

### Deleting a Column

```typescript
const { deleteColumn } = useColumnMutations(boardId);

await deleteColumn.mutateAsync("col-123");
// ✅ Column removed from cache immediately
// ✅ No refetch of entire board
```

### Displaying Columns (Auto-updates!)

```typescript
import { useBoardQuery } from "@/services/board";

function BoardDisplay({ boardId }) {
  const { data: board, isLoading } = useBoardQuery(boardId);
  
  if (isLoading) return <div>Loading...</div>;
  
  // ✅ This automatically updates when columns are added/updated/deleted
  // ✅ No manual refetch needed - React Query updates the cache!
  return (
    <div>
      {board.columns?.map(column => (
        <div key={column.id}>{column.name}</div>
      ))}
    </div>
  );
}
```

## 🎨 Benefits

| Traditional Approach | Surgical Updates |
|---------------------|------------------|
| ❌ Refetch entire board on every change | ✅ Only update changed data |
| ❌ Network overhead | ✅ Minimal network usage |
| ❌ Slower UI updates | ✅ Instant UI feedback (optimistic) |
| ❌ Loading states disrupt UX | ✅ Seamless user experience |
| ❌ Wasted bandwidth | ✅ Efficient cache management |

## 🔍 How to Debug

React Query DevTools shows you exactly what's happening:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

You'll see:
- Cache updates in real-time
- Optimistic updates (temp data)
- Server data replacing temp data
- Rollbacks on errors

## ⚠️ Important Notes

1. **Cache Consistency**: Surgical updates keep your cache in sync without refetching
2. **Optimistic Updates**: Users see changes instantly before server confirmation
3. **Automatic Rollback**: Errors automatically restore previous state
4. **Type Safety**: All cache updates are fully typed with TypeScript
5. **No Manual Invalidation**: You don't need to call `invalidateQueries` (we do on `onSettled` as a safety net)

## 🚀 Performance Comparison

**Traditional approach** (invalidate + refetch):
```
Create column → API call (200ms) → Invalidate → Refetch board (500ms) = 700ms total
User waits 700ms to see new column ❌
```

**Surgical update approach**:
```
Create column → Optimistic update (0ms) → API call (200ms) → Replace temp = 0ms perceived time
User sees column immediately ✅
```

## 📚 Related Files

- `src/services/board/board.query.tsx` - Board queries that get updated
- `src/services/board/board.types.tsx` - FullBoard type with columns
- `src/lib/query-client.ts` - React Query configuration

## 🔗 API Endpoints Used

- `GET /api/boards/:board_id/columns` - List columns
- `POST /api/boards/:board_id/columns` - Create column
- `PATCH /api/columns/:id` - Update column
- `DELETE /api/columns/:id` - Delete column