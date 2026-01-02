import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export type Board = {
  id: string;
  name: string;
  description: string | null;
  background: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Column = {
  id: string;
  boardId: string;
  name: string | null;
  color: string | null;
  position: number;
};

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

// Store type
type BoardStore = {
  // State
  boards: Board[];
  columns: Column[];
  cards: Card[];

  createBoard: (board: Board) => void;
  getBoard: (boardId: string) => Board | undefined;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (boardId: string) => void;

  getColumns: (boardId: string) => Column[];
  createColumn: (column: Column) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  deleteColumn: (columnId: string) => void;

  getCards: (boardId: string, columnId: string) => Card[];
  getCard: (cardId: string) => Card | undefined;
  createCard: (card: Card) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, toColumnId: string) => void;
};

// Helper functions
const buildDefaultColumns = (boardId: string): Column[] => {
  return [
    {
      id: crypto.randomUUID(),
      boardId: boardId,
      name: "Planned",
      color: null,
      position: 0,
    },
    {
      id: crypto.randomUUID(),
      boardId: boardId,
      name: "In Progress",
      color: null,
      position: 1,
    },
    {
      id: crypto.randomUUID(),
      boardId: boardId,
      name: "Done",
      color: null,
      position: 2,
    },
  ];
};

const now = () => new Date().toISOString();

// Store
const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      // State
      boards: [],
      columns: [],
      cards: [],

      // Board actions
      createBoard: (board: Board) => {
        set({
          boards: [...get().boards, board],
          columns: [...get().columns, ...buildDefaultColumns(board.id)],
        });
      },

      getBoard: (boardId: string) => {
        return get().boards.find((board) => board.id === boardId);
      },

      updateBoard: (boardId: string, updates: Partial<Board>) => {
        set({
          boards: get().boards.map((board) =>
            board.id === boardId
              ? { ...board, ...updates, updatedAt: now() }
              : board,
          ),
        });
      },

      deleteBoard: (boardId: string) => {
        set({
          boards: get().boards.filter((board) => board.id !== boardId),
          columns: get().columns.filter((column) => column.boardId !== boardId),
          cards: get().cards.filter((card) => card.boardId !== boardId),
        });
      },

      // Column actions
      getColumns: (boardId: string) => {
        return get().columns.filter((col) => col.boardId === boardId);
      },

      createColumn: (column: Column) => {
        set({
          columns: [...get().columns, column],
        });
      },

      updateColumn: (columnId: string, updates: Partial<Column>) => {
        set({
          columns: get().columns.map((column) =>
            column.id === columnId ? { ...column, ...updates } : column,
          ),
        });
      },

      deleteColumn: (columnId: string) => {
        set({
          columns: get().columns.filter((column) => column.id !== columnId),
          cards: get().cards.filter((card) => card.columnId !== columnId),
        });
      },

      // Card actions
      getCards: (boardId: string, columnId: string) => {
        return get().cards.filter(
          (card) => card.boardId === boardId && card.columnId === columnId,
        );
      },

      getCard: (cardId: string) => {
        return get().cards.find((card) => card.id === cardId);
      },

      createCard: (card: Card) => {
        set({
          cards: [...get().cards, card],
        });
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

      deleteCard: (cardId: string) => {
        set({
          cards: get().cards.filter((card) => card.id !== cardId),
        });
      },

      moveCard: (cardId: string, toColumnId: string) => {
        set({
          cards: get().cards.map((card) =>
            card.id === cardId
              ? { ...card, columnId: toColumnId, updatedAt: now() }
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

// Re-export types for convenience
export type { BoardStore };
