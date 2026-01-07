/**
 * Boards Feature
 *
 * This module exports all public components, hooks, and types
 * for the boards feature.
 */

// =============================================================================
// Pages
// =============================================================================

export { BoardsListPage } from "./list";
export { SingleBoardPage } from "./detail";

// =============================================================================
// Components (for external use if needed)
// =============================================================================

export { BoardItem } from "./list";
export { BoardCard, BoardColumn } from "./detail";

// =============================================================================
// Modals (for external use if needed)
// =============================================================================

export { CreateBoardModal } from "./list";
export { EditCardModal, CreateColumnModal, EditColumnModal } from "./detail";

// =============================================================================
// Hooks
// =============================================================================

export { useBoardColumn } from "./detail";
export type { UseBoardColumnReturn } from "./detail";

// =============================================================================
// Constants
// =============================================================================

export {
  COLUMN_COLORS,
  COLUMN_COLOR_MAP,
  CARD_PRIORITIES,
  type ColumnColorValue,
  type CardPriorityValue,
} from "./constants";
