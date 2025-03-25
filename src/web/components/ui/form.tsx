import * as React from "react"
import { forwardRef, useId } from "react"
import { Slot } from "@radix-ui/react-slot" // v1.0.0
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form" // v7.0.0

import { cn } from "../../lib/utils"
import { Label } from "./label"

// Form field context to track the field name
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

// Form item context to track unique IDs for accessibility
type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

// Hook to access form field state in nested components
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-description`,
    formMessageId: `${id}-form-message`,
    ...fieldState,
  }
}

// Root form component that provides react-hook-form context
const Form = <TFieldValues extends FieldValues = FieldValues>({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof FormProvider<TFieldValues>> & {
  children: React.ReactNode
}) => {
  return <FormProvider {...props}>{children}</FormProvider>
}
Form.displayName = "Form"

// Component to integrate form fields with react-hook-form using Controller
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  render,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  render: (props: FormFieldContextValue<TFieldValues, TName>) => React.ReactElement
}) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller
        {...props}
        render={({ field, fieldState }) => {
          // Create a FormFieldContext with field state and pass it to the render function
          return render({ name: props.name });
        }}
      />
    </FormFieldContext.Provider>
  )
}

// Container component for form field items with proper spacing and layout
const FormItem = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }
>(({ className, children, ...props }, ref) => {
  // Generate a unique ID for the form item
  const id = useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {children}
      </div>
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

// Label component for form fields that integrates with FormItemContext
const FormLabel = forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label> & { optional?: boolean }
>(({ className, optional, children, ...props }, ref) => {
  // Use FormItemContext to get the form item ID and error state
  const { error } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      {...props}
    >
      {children}
      {optional && <span className="text-muted-foreground ml-1">(Optional)</span>}
    </Label>
  )
})
FormLabel.displayName = "FormLabel"

// Component that wraps form inputs and provides proper accessibility attributes
const FormControl = forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  // Use FormItemContext to get the form item ID and error state
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

// Component for displaying descriptive text for form fields
const FormDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  // Use FormItemContext to get the form item ID
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

// Component for displaying validation error messages for form fields
const FormMessage = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => {
  // Use FormItemContext to get the form item ID
  // Use FormFieldContext to get field state including error message
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}