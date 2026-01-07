import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Legacy Zustand Store
 *
 * TODO: This store is being phased out in favor of API + React Query
 *
 * STATUS:
 * ✅ Boards - Now using API (src/services/board)
 * ✅ Columns - Now using API (src/services/column)
 * ✅ Cards - Now using API (src/services/card)
 *
 * REMAINING:
 * ⏸️ Card metadata (priority, tags, dueDate) - API not yet available
 *
 * Keep only what's not available in the API yet.
 */

// Legacy types - kept for ViewCardModal until API supports these fields
export type Card = {
  id: string;
  boardId: string;
  columnId: string;
  name: string | null;
  description: string | null;
  tags: string[];
  position: number;
  priority: "low" | "medium" | "high" | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

// Store type - minimal for features not in API yet
type BoardStore = {
  // State - only for features not in API
  cards: Card[]; // TODO: Remove when card metadata API is ready

  // Card actions - only for metadata not in API
  getCard: (cardId: string) => Card | undefined;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
};

const now = () => new Date().toISOString();

// Minimal store for features not yet in API
const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      // State - only card metadata not in API
      cards: [],

      // Card metadata actions (priority, tags, dueDate)
      // TODO: Remove when API supports these fields
      getCard: (cardId: string) => {
        return get().cards.find((card) => card.id === cardId);
      },

      updateCard: (cardId: string, updates: Partial<Card>) => {
        set({
          cards: get().cards.map((card) =>
            card.id === cardId
              ? { ...card, ...updates, updatedAt: now() }
              : card,
          ),
        });
      },
    }),
    {
      name: "board-store",
    },
  ),
);

export default useBoardStore;

// Re-export types
export type { BoardStore };

/**
 * Migration Guide:
 *
 * Old (Zustand):
 *   const boards = useBoardStore(state => state.boards);
 *   const createBoard = useBoardStore(state => state.createBoard);
 *
 * New (API + React Query):
 *   const { data: boards } = useBoardsQuery();
 *   const { createBoard } = useBoardMutations();
 *
 * See: src/services/board, src/services/column, src/services/card
 */
