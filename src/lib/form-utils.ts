/**
 * Form utility functions for React Hook Form
 */

/**
 * Extracts only the fields that have been modified (dirty fields) from form values.
 * Useful for PATCH requests where you only want to send changed fields.
 *
 * @example
 * ```tsx
 * const { formState, getValues } = useForm();
 * const values = getValues();
 * const dirtyData = getDirtyFields(formState.dirtyFields, values);
 * // dirtyData only contains fields that were modified
 * await updateColumn.mutateAsync({ id, data: dirtyData });
 * ```
 *
 * @param dirtyFields - The dirtyFields object from React Hook Form's formState
 * @param values - All form values
 * @returns An object containing only the dirty fields
 */
export function getDirtyFields<T extends Record<string, unknown>>(
  dirtyFields: Partial<Record<keyof T, boolean | unknown>>,
  values: T,
): Partial<T> {
  return Object.keys(dirtyFields).reduce((acc, key) => {
    const typedKey = key as keyof T;
    if (dirtyFields[typedKey]) {
      acc[typedKey] = values[typedKey];
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * Checks if any fields in the form have been modified.
 *
 * @example
 * ```tsx
 * const { formState } = useForm();
 * const hasChanges = hasAnyDirtyFields(formState.dirtyFields);
 * ```
 *
 * @param dirtyFields - The dirtyFields object from React Hook Form's formState
 * @returns True if any fields are dirty, false otherwise
 */
export function hasAnyDirtyFields<T extends Record<string, unknown>>(
  dirtyFields: Partial<Record<keyof T, boolean | unknown>>,
): boolean {
  return Object.keys(dirtyFields).length > 0;
}

/**
 * Gets a list of field names that have been modified.
 *
 * @example
 * ```tsx
 * const { formState } = useForm();
 * const changedFields = getDirtyFieldNames(formState.dirtyFields);
 * console.log('Changed:', changedFields); // ['name', 'email']
 * ```
 *
 * @param dirtyFields - The dirtyFields object from React Hook Form's formState
 * @returns Array of field names that are dirty
 */
export function getDirtyFieldNames<T extends Record<string, unknown>>(
  dirtyFields: Partial<Record<keyof T, boolean | unknown>>,
): (keyof T)[] {
  return Object.keys(dirtyFields).filter(
    (key) => dirtyFields[key as keyof T],
  ) as (keyof T)[];
}
