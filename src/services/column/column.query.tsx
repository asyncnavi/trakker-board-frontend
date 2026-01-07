import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
} from "./column";
import type {
  CreateColumnRequestFields,
  UpdateColumnRequestFields,
  ReorderColumnsRequestFields,
  ColumnWithCards,
} from "./column.types";
import { boardKeys } from "../board/board.query";
import type { FullBoard } from "../board/board.types";

// Query Keys
export const columnKeys = {
  all: ["column"] as const,
  lists: () => [...columnKeys.all, "list"] as const,
  list: (boardId: string) => [...columnKeys.lists(), boardId] as const,
};

// Query hook to get columns for a board
export const useColumnsQuery = (boardId: string) => {
  return useQuery({
    queryKey: columnKeys.list(boardId),
    queryFn: () => getColumns(boardId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!boardId,
  });
};

// Mutation hooks with surgical updates
export const useColumnMutations = (boardId: string) => {
  const queryClient = useQueryClient();

  const createColumnMutation = useMutation({
    mutationFn: (data: CreateColumnRequestFields) =>
      createColumn(boardId, data),

    // Optimistic update (optional - for instant UI feedback)
    onMutate: async (newColumnData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });

      // Snapshot previous value
      const previousBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );

      // Optimistically update board cache
      if (previousBoard) {
        const tempColumn: ColumnWithCards = {
          id: `temp-${Date.now()}`,
          name: newColumnData.name,
          position: newColumnData.position,
          background_color: newColumnData.background_color || null,
          board_id: boardId,
          cards: [],
        };

        queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
          ...previousBoard,
          columns: [...(previousBoard.columns || []), tempColumn],
        });
      }

      return { previousBoard };
    },

    // On success, replace temp with real data
    onSuccess: (newColumn) => {
      // Surgically update the board cache
      const currentBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );

      if (currentBoard) {
        queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
          ...currentBoard,
          columns: [
            ...(currentBoard.columns || []).filter(
              (col) => !col.id.startsWith("temp-"),
            ),
            { ...newColumn, cards: [] },
          ],
        });
      }

      // Update columns list cache if it exists
      queryClient.setQueryData<ColumnWithCards[]>(
        columnKeys.list(boardId),
        (old) => [...(old || []), { ...newColumn, cards: [] }],
      );
    },

    // On error, rollback
    onError: (_err, _newColumn, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.detail(boardId),
          context.previousBoard,
        );
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });

  const updateColumnMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateColumnRequestFields;
    }) => updateColumn(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });

      const previousBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );

      // Optimistically update
      if (previousBoard) {
        queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
          ...previousBoard,
          columns: (previousBoard.columns || []).map((col) =>
            col.id === id ? { ...col, ...data } : col,
          ),
        });
      }

      return { previousBoard };
    },

    onSuccess: (updatedColumn) => {
      // Surgically update the board cache
      const currentBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );

      if (currentBoard) {
        queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
          ...currentBoard,
          columns: (currentBoard.columns || []).map((col) =>
            col.id === updatedColumn.id ? { ...col, ...updatedColumn } : col,
          ),
        });
      }

      // Update columns list cache
      queryClient.setQueryData<ColumnWithCards[]>(
        columnKeys.list(boardId),
        (old) =>
          (old || []).map((col) =>
            col.id === updatedColumn.id ? { ...col, ...updatedColumn } : col,
          ),
      );
    },

    onError: (_err, _variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.detail(boardId),
          context.previousBoard,
        );
      }
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (id: string) => deleteColumn(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });

      const previousBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );

      // Optimistically remove column
      if (previousBoard) {
        queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
          ...previousBoard,
          columns: (previousBoard.columns || []).filter((col) => col.id !== id),
        });
      }

      return { previousBoard };
    },

    onSuccess: (_, deletedId) => {
      // Surgically remove from board cache
      const currentBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );

      if (currentBoard) {
        queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
          ...currentBoard,
          columns: (currentBoard.columns || []).filter(
            (col) => col.id !== deletedId,
          ),
        });
      }

      // Remove from columns list cache
      queryClient.setQueryData<ColumnWithCards[]>(
        columnKeys.list(boardId),
        (old) => (old || []).filter((col) => col.id !== deletedId),
      );
    },

    onError: (_err, _deletedId, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.detail(boardId),
          context.previousBoard,
        );
      }
    },
  });

  const reorderColumnsMutation = useMutation({
    mutationFn: (data: ReorderColumnsRequestFields) =>
      reorderColumns(boardId, data),

    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });

      const previousBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );

      // Optimistically reorder columns
      if (previousBoard && previousBoard.columns) {
        const reorderedColumns = [...previousBoard.columns];

        // Create a map of new positions
        const positionMap = new Map(
          newOrder.column_orders.map((order) => [order.id, order.position]),
        );

        // Update positions and sort
        reorderedColumns.forEach((col) => {
          const newPosition = positionMap.get(col.id);
          if (newPosition !== undefined) {
            col.position = newPosition;
          }
        });

        reorderedColumns.sort((a, b) => a.position - b.position);

        queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
          ...previousBoard,
          columns: reorderedColumns,
        });
      }

      return { previousBoard };
    },

    onSuccess: (reorderedColumns) => {
      // Update board cache with server response
      const currentBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );

      if (currentBoard) {
        queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
          ...currentBoard,
          columns: reorderedColumns,
        });
      }

      // Update columns list cache
      queryClient.setQueryData<ColumnWithCards[]>(
        columnKeys.list(boardId),
        reorderedColumns,
      );
    },

    onError: (_err, _variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.detail(boardId),
          context.previousBoard,
        );
      }
    },
  });

  return {
    createColumn: createColumnMutation,
    updateColumn: updateColumnMutation,
    deleteColumn: deleteColumnMutation,
    reorderColumns: reorderColumnsMutation,
  };
};
