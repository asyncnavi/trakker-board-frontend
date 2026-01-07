# Card Service - Surgical Updates with React Query

This service implements CRUD operations for cards with **surgical cache updates** - updating React Query's cache directly instead of refetching entire resources.

## 📁 File Structure

```
src/services/card/
├── card.ts           # Pure API functions (no React)
├── card.types.tsx    # TypeScript types and Zod schemas
├── card.query.tsx    # React Query hooks with surgical updates
├── index.ts          # Re-exports
└── README.md         # This file
```

## 🔧 API Endpoints

Based on your Elixir backend:

| Method | Endpoint | Function | Purpose |
|--------|----------|----------|---------|
| GET | `/api/boards/:board_id/cards` | `getCards()` | List all cards for a board |
| GET | `/api/cards/:id` | `getCard()` | Get single card |
| POST | `/api/columns/:column_id/cards` | `createCard()` | Create new card |
| PATCH | `/api/cards/:id` | `updateCard()` | Update card details |
| DELETE | `/api/cards/:id` | `deleteCard()` | Delete a card |

## 🚀 Quick Start

### 1. Import the hooks

```typescript
import { useBoardQuery } from "@/services/board";
import { useCardMutations } from "@/services/card";
```

### 2. Use in your component

```typescript
function BoardColumn({ boardId, columnId }: { boardId: string; columnId: string }) {
  const { data: board } = useBoardQuery(boardId);
  const { createCard, updateCard, deleteCard } = useCardMutations(boardId, columnId);
  
  // Your UI here...
}
```

### 3. Create a card

```typescript
const handleAddCard = async () => {
  await createCard.mutateAsync({
    title: "New Task",
    description: "Task description",
    position: "0",
    due_date: null,
    labels: null,
    checklist: null,
    attachments: null
  });
  // ✅ Card appears instantly in UI
  // ✅ Board cache updated surgically
};
```

## 📖 Complete Examples

### Create Card

```typescript
import { useCardMutations } from "@/services/card";
import type { CreateCardRequestFields } from "@/services/card";

function AddCardButton({ boardId, columnId }: { boardId: string; columnId: string }) {
  const { createCard } = useCardMutations(boardId, columnId);
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    const cardData: CreateCardRequestFields = {
      title,
      description: null,
      position: "0", // Calculate based on existing cards
      due_date: null,
      labels: null,
      checklist: null,
      attachments: null
    };

    try {
      await createCard.mutateAsync(cardData);
      setTitle(""); // Clear input
      toast.success("Card created!");
      // ✅ Card added surgically to cache - no refetch!
    } catch (error) {
      toast.error("Failed to create card");
    }
  };

  return (
    <>
      <input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Card title"
      />
      <button 
        onClick={handleCreate}
        disabled={createCard.isPending}
      >
        {createCard.isPending ? "Adding..." : "Add Card"}
      </button>
    </>
  );
}
```

### Update Card (with Dirty Fields)

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDirtyFields } from "@/lib/form-utils";
import { UpdateCardRequestSchema, useCardMutations } from "@/services/card";
import type { UpdateCardRequestFields, Card } from "@/services/card";

function EditCardForm({ card, boardId, columnId }: { 
  card: Card; 
  boardId: string;
  columnId: string;
}) {
  const { updateCard } = useCardMutations(boardId, columnId);
  const { register, handleSubmit, formState } = useForm<UpdateCardRequestFields>({
    resolver: zodResolver(UpdateCardRequestSchema),
    defaultValues: {
      title: card.title,
      description: card.description,
      due_date: card.due_date
    }
  });

  const onSubmit = async (values: UpdateCardRequestFields) => {
    // Only send changed fields
    const dirtyData = getDirtyFields<UpdateCardRequestFields>(
      formState.dirtyFields,
      values
    );

    if (Object.keys(dirtyData).length > 0) {
      try {
        await updateCard.mutateAsync({ id: card.id, data: dirtyData });
        toast.success("Card updated!");
        // ✅ Only changed fields sent to API
        // ✅ Cache updated surgically
      } catch (error) {
        toast.error("Failed to update card");
      }
    } else {
      toast.info("No changes to save");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} placeholder="Card title" />
      <textarea {...register("description")} placeholder="Description" />
      <input {...register("due_date")} type="date" />
      <button type="submit" disabled={updateCard.isPending}>
        {updateCard.isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
```

### Delete Card

```typescript
function DeleteCardButton({ 
  cardId, 
  boardId, 
  columnId 
}: { 
  cardId: string; 
  boardId: string;
  columnId: string;
}) {
  const { deleteCard } = useCardMutations(boardId, columnId);

  const handleDelete = async () => {
    if (confirm("Delete this card?")) {
      try {
        await deleteCard.mutateAsync(cardId);
        toast.success("Card deleted!");
        // ✅ Card removed from cache immediately
      } catch (error) {
        toast.error("Failed to delete card");
      }
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleteCard.isPending}>
      {deleteCard.isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
```

### View Single Card

```typescript
import { useCardQuery } from "@/services/card";

function CardDetailModal({ cardId }: { cardId: string }) {
  const { data: card, isLoading, error } = useCardQuery(cardId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!card) return null;

  return (
    <div>
      <h2>{card.title}</h2>
      <p>{card.description}</p>
      <p>Due: {card.due_date}</p>
      <p>Labels: {card.labels}</p>
    </div>
  );
}
```

## 🎨 How Surgical Updates Work

### Traditional Approach (Slow)
```
User creates card → API call → Invalidate board → Refetch entire board → UI updates
⏱️ Time: 500-1000ms
📦 Data: Full board + all columns + all cards
```

### Surgical Update Approach (Fast)
```
User creates card → API call → Update board cache directly → UI updates instantly
⏱️ Time: 0ms (optimistic) + 200ms (server confirmation)
📦 Data: Only the new card
```

### The Three Phases

#### 1. onMutate (Optimistic Update)
- Runs **before** API call
- Adds temp card to cache with fake ID
- User sees card immediately

```typescript
onMutate: async (newCardData) => {
  const tempCard = {
    id: `temp-${Date.now()}`,
    ...newCardData,
    column_id: columnId
  };
  
  // Add to board cache immediately
  queryClient.setQueryData(boardKeys.detail(boardId), (old) => ({
    ...old,
    columns: old.columns?.map(col => 
      col.id === columnId 
        ? { ...col, cards: [...col.cards, tempCard] }
        : col
    )
  }));
}
```

#### 2. onSuccess (Real Data)
- Runs **after** successful API call
- Replaces temp card with real card from server
- Seamless transition (user doesn't notice)

```typescript
onSuccess: (newCard) => {
  queryClient.setQueryData(boardKeys.detail(boardId), (old) => ({
    ...old,
    columns: old.columns?.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: [
              ...col.cards.filter(c => !c.id.startsWith('temp-')),
              newCard // Real card with real ID
            ]
          }
        : col
    )
  }));
}
```

#### 3. onError (Rollback)
- Runs if API call fails
- Restores previous state
- User sees original data again

```typescript
onError: (_err, _variables, context) => {
  queryClient.setQueryData(
    boardKeys.detail(boardId),
    context.previousBoard
  );
  toast.error("Failed to create card");
}
```

## 📊 Type Reference

### Card Interface
```typescript
interface Card {
  id: string;
  title: string;
  description: string | null;
  position: string;
  column_id: string;
  due_date: string | null;
  labels: string | null;
  checklist: string | null;
  attachments: string | null;
  inserted_at?: string;
  updated_at?: string;
}
```

### CreateCardRequestFields
```typescript
{
  title: string;              // Required, 1-255 chars
  description?: string | null; // Optional, max 5000 chars
  position: string;           // Required
  due_date?: string | null;   // Optional
  labels?: string | null;     // Optional
  checklist?: string | null;  // Optional
  attachments?: string | null; // Optional
}
```

### UpdateCardRequestFields
```typescript
{
  title?: string;             // Optional, 1-255 chars
  description?: string | null; // Optional, max 5000 chars
  position?: string;          // Optional
  column_id?: string;         // Optional (for moving cards)
  due_date?: string | null;   // Optional
  labels?: string | null;     // Optional
  checklist?: string | null;  // Optional
  attachments?: string | null; // Optional
}
```

## ⚠️ Important Notes

### 1. Board ID and Column ID Required
```typescript
// Both IDs needed for cache updates
const { createCard, updateCard, deleteCard } = useCardMutations(boardId, columnId);
```

### 2. Position Management
```typescript
// Calculate position before creating
const nextPosition = column.cards?.length || 0;

await createCard.mutateAsync({
  title: "New Card",
  position: nextPosition.toString(),
  // ...
});
```

### 3. Moving Cards Between Columns
```typescript
// Update card's column_id to move it
await updateCard.mutateAsync({
  id: cardId,
  data: {
    column_id: targetColumnId,
    position: newPosition.toString()
  }
});
// Cache will update both source and target columns
```

## 🎯 Benefits

| Feature | Traditional | Surgical Updates |
|---------|-------------|------------------|
| **UI Update Speed** | 500ms+ | Instant (0ms) |
| **Network Requests** | Create + Refetch | Create only |
| **Bandwidth** | Full board data | Single card |
| **User Experience** | Loading spinners | Seamless |
| **Error Handling** | Manual rollback | Automatic rollback |

## 🔗 Related Patterns

- **Column Service** (`src/services/column/`) - Similar pattern for columns
- **Dirty Fields** (`DIRTY_FIELDS_PATTERN.md`) - Only update changed fields
- **Form Utils** (`src/lib/form-utils.ts`) - Helper functions for forms

## 📚 Additional Resources

- `src/services/card/card.ts` - API functions
- `src/services/card/card.types.tsx` - Types and schemas
- `src/services/card/card.query.tsx` - React Query hooks (core logic)
- `SURGICAL_UPDATES_GUIDE.md` - Detailed guide
- `DIRTY_FIELDS_PATTERN.md` - Update optimization

---

**Summary:** The card service provides full CRUD operations with optimistic updates and surgical cache management. Cards appear instantly in the UI, and the board cache is updated without refetching the entire board structure.