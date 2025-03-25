import React, { useCallback } from "react";
import { BuyTab } from "../../types/form";
import { ArrayFieldEditor } from "./ArrayFieldEditor";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Trash2 } from "lucide-react";

/**
 * Interface defining the props for the BuyTabsEditor component
 */
export interface BuyTabsEditorProps {
  /**
   * The current array of BuyTab items
   */
  value?: BuyTab[];

  /**
   * Callback for when the array changes
   */
  onChange: (value: BuyTab[]) => void;
}

/**
 * Renders a single BuyTab item form with fields for Label, Slug, Type, and GenreCode
 * 
 * @param item The BuyTab item to render
 * @param index The index of the item in the array
 * @param onChange Callback to update the item
 * @param onRemove Callback to remove the item
 * @returns The rendered BuyTab item form
 */
const BuyTabItem = (
  item: BuyTab,
  index: number,
  onChange: (item: BuyTab) => void,
  onRemove: () => void
): React.ReactElement => {
  // Handle changes to the Label field
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...item,
      Label: e.target.value,
    });
  };

  // Handle changes to the Slug field
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...item,
      Slug: e.target.value,
    });
  };

  // Handle changes to the Type field
  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...item,
      Type: e.target.value,
    });
  };

  // Handle changes to the GenreCode field
  const handleGenreCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...item,
      GenreCode: e.target.value || undefined, // Only set if not empty
    });
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-end mb-2">
      <div className="col-span-3">
        <Label htmlFor={`buytab-label-${index}`} className="mb-2 block">
          Label
        </Label>
        <Input
          id={`buytab-label-${index}`}
          value={item.Label}
          onChange={handleLabelChange}
          aria-required="true"
        />
      </div>
      <div className="col-span-3">
        <Label htmlFor={`buytab-slug-${index}`} className="mb-2 block">
          Slug
        </Label>
        <Input
          id={`buytab-slug-${index}`}
          value={item.Slug}
          onChange={handleSlugChange}
          aria-required="true"
        />
      </div>
      <div className="col-span-3">
        <Label htmlFor={`buytab-type-${index}`} className="mb-2 block">
          Type
        </Label>
        <Input
          id={`buytab-type-${index}`}
          value={item.Type}
          onChange={handleTypeChange}
          aria-required="true"
        />
      </div>
      <div className="col-span-2">
        <Label htmlFor={`buytab-genre-${index}`} className="mb-2 block">
          Genre Code
        </Label>
        <Input
          id={`buytab-genre-${index}`}
          value={item.GenreCode || ""}
          onChange={handleGenreCodeChange}
        />
      </div>
      <div className="col-span-1 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="text-destructive hover:text-destructive/80 p-2"
          aria-label={`Remove BuyTab item ${index + 1}`}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

/**
 * A component for editing an array of BuyTab items in organization configuration forms.
 * 
 * Provides a tabular interface for managing BuyTab items with fields for Label, Slug, Type, and GenreCode,
 * allowing administrators to configure purchase options displayed to users.
 */
export const BuyTabsEditor: React.FC<BuyTabsEditorProps> = ({
  value,
  onChange,
}) => {
  // Create a new BuyTab with default values
  const createNewBuyTab = useCallback((): BuyTab => {
    return {
      Label: "",
      Slug: "",
      Type: "",
    };
  }, []);

  return (
    <ArrayFieldEditor<BuyTab>
      value={value}
      onChange={onChange}
      renderItem={BuyTabItem}
      createNewItem={createNewBuyTab}
      addButtonLabel="Add BuyTab"
    />
  );
};