import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  archiveBoard,
  unarchiveBoard,
} from "./board";
import type {
  CreateBoardRequestFields,
  UpdateBoardRequestFields,
} from "./board.types";

export const boardKeys = {
  all: ["board"] as const,
  lists: () => [...boardKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...boardKeys.lists(), { filters }] as const,
  details: () => [...boardKeys.all, "detail"] as const,
  detail: (id: string) => [...boardKeys.details(), id] as const,
};

export const useBoardsQuery = () => {
  return useQuery({
    queryKey: boardKeys.lists(),
    queryFn: getBoards,
    staleTime: 1000 * 60 * 5,
  });
};

export const useBoardQuery = (id: string) => {
  return useQuery({
    queryKey: boardKeys.detail(id),
    queryFn: () => getBoard(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

export const useBoardMutations = () => {
  const queryClient = useQueryClient();

  const createBoardMutation = useMutation({
    mutationFn: (data: CreateBoardRequestFields) => createBoard(data),
    onSuccess: (newBoard) => {
      // Invalidate boards list to refetch
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      // Optionally add to cache
      queryClient.setQueryData(boardKeys.detail(newBoard.id), newBoard);
    },
  });

  const updateBoardMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBoardRequestFields;
    }) => updateBoard(id, data),
    onSuccess: (updatedBoard, variables) => {
      // Update single board in cache
      queryClient.setQueryData(boardKeys.detail(variables.id), updatedBoard);
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: (id: string) => deleteBoard(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: boardKeys.detail(deletedId) });
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });

  const archiveBoardMutation = useMutation({
    mutationFn: (id: string) => archiveBoard(id),
    onSuccess: (archivedBoard, id) => {
      queryClient.setQueryData(boardKeys.detail(id), archivedBoard);
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });

  const unarchiveBoardMutation = useMutation({
    mutationFn: (id: string) => unarchiveBoard(id),
    onSuccess: (unarchivedBoard, id) => {
      queryClient.setQueryData(boardKeys.detail(id), unarchivedBoard);
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });

  return {
    createBoard: createBoardMutation,
    updateBoard: updateBoardMutation,
    deleteBoard: deleteBoardMutation,
    archiveBoard: archiveBoardMutation,
    unarchiveBoard: unarchiveBoardMutation,
  };
};
