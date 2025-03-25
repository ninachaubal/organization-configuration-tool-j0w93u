import React, { useCallback } from "react";
import { Trash2 } from "lucide-react"; // v0.284.0

import { ArrayFieldEditor, ArrayFieldEditorProps } from "./ArrayFieldEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { ProfileField } from "../../types/configuration";
import { OrganizationFieldName } from "../../../backend/models/enums/OrganizationFieldName";

/**
 * A specialized component for editing an array of ProfileField objects in organization configuration
 */
export const ProfileFieldsEditor = ({
  ...props
}: Omit<ArrayFieldEditorProps<ProfileField>, "renderItem" | "createNewItem">) => {
  // Function to create a new ProfileField item with default values
  const createNewItem = useCallback((): ProfileField => {
    return {
      FieldName: OrganizationFieldName.EMAIL,
      IsEditable: false,
      IsSSOUserEditable: false,
      IsRequired: false,
    };
  }, []);

  // Function to render an individual ProfileField item
  const renderItem = useCallback(
    (
      item: ProfileField,
      index: number,
      onChange: (item: ProfileField) => void,
      onRemove: () => void
    ) => {
      return (
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center rounded-md border p-2">
          {/* Field Name Selection */}
          <Select
            value={item.FieldName}
            onValueChange={(value) =>
              onChange({ ...item, FieldName: value as OrganizationFieldName })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field name" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(OrganizationFieldName).map((fieldName) => (
                <SelectItem key={fieldName} value={fieldName}>
                  {fieldName.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* IsEditable Checkbox */}
          <div className="flex justify-center">
            <Checkbox
              id={`isEditable-${index}`}
              checked={item.IsEditable}
              onCheckedChange={(checked) =>
                onChange({ ...item, IsEditable: checked === true })
              }
            />
          </div>

          {/* IsSSOUserEditable Checkbox */}
          <div className="flex justify-center">
            <Checkbox
              id={`isSSOUserEditable-${index}`}
              checked={item.IsSSOUserEditable}
              onCheckedChange={(checked) =>
                onChange({ ...item, IsSSOUserEditable: checked === true })
              }
            />
          </div>

          {/* IsRequired Checkbox */}
          <div className="flex justify-center">
            <Checkbox
              id={`isRequired-${index}`}
              checked={item.IsRequired}
              onCheckedChange={(checked) =>
                onChange({ ...item, IsRequired: checked === true })
              }
            />
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-destructive hover:bg-destructive/10 rounded-full"
            aria-label="Remove profile field"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      );
    },
    []
  );

  return (
    <div className="space-y-2">
      {/* Table Headers */}
      <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 px-2 py-1 text-sm font-medium text-muted-foreground">
        <div>Field Name</div>
        <div className="text-center">Editable</div>
        <div className="text-center">SSO User Editable</div>
        <div className="text-center">Required</div>
        <div>Actions</div>
      </div>

      <ArrayFieldEditor<ProfileField>
        renderItem={renderItem}
        createNewItem={createNewItem}
        addButtonLabel="Add Profile Field"
        {...props}
      />
    </div>
  );
};