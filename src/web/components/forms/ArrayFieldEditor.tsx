import React, { useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus } from "lucide-react";

/**
 * Interface defining the props for the ArrayFieldEditor component
 */
export interface ArrayFieldEditorProps<T> {
  /**
   * The current array value
   */
  value?: T[];

  /**
   * Callback for when the array changes
   */
  onChange: (value: T[]) => void;

  /**
   * Function to render an individual item in the array
   * @param item The item to render
   * @param index The index of the item in the array
   * @param onChange Callback to update the item
   * @param onRemove Callback to remove the item
   */
  renderItem: (
    item: T,
    index: number,
    onChange: (item: T) => void,
    onRemove: () => void
  ) => React.ReactNode;

  /**
   * Function to create a new item
   */
  createNewItem: () => T;

  /**
   * Label for the add button
   */
  addButtonLabel: string;
}

/**
 * A generic component for editing arrays of items in forms with customizable item rendering.
 * This component provides a flexible interface for adding, removing, and modifying items in an array.
 * It's used as the foundation for specialized array editors like BuyTabsEditor and ProfileFieldsEditor.
 */
export const ArrayFieldEditor = <T,>({
  value = [], // Default to empty array if not provided
  onChange,
  renderItem,
  createNewItem,
  addButtonLabel,
}: ArrayFieldEditorProps<T>): React.ReactElement => {
  // Add a new item to the array
  const handleAddItem = useCallback(() => {
    const newItem = createNewItem();
    const newItems = [...value, newItem];
    onChange(newItems);
  }, [value, onChange, createNewItem]);

  // Remove an item from the array at the given index
  const handleRemoveItem = useCallback(
    (index: number) => {
      const newItems = [...value];
      newItems.splice(index, 1);
      onChange(newItems);
    },
    [value, onChange]
  );

  // Update an item at the given index
  const handleItemChange = useCallback(
    (index: number, item: T) => {
      const newItems = [...value];
      newItems[index] = item;
      onChange(newItems);
    },
    [value, onChange]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {value.map((item, index) =>
          renderItem(
            item,
            index,
            (updatedItem) => handleItemChange(index, updatedItem),
            () => handleRemoveItem(index)
          )
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddItem}
        className="flex items-center"
      >
        <Plus className="mr-1 h-4 w-4" />
        {addButtonLabel}
      </Button>
    </div>
  );
};