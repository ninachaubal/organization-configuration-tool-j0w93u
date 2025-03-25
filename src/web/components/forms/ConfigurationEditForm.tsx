import React, { useMemo, useCallback } from "react";
import { Checkbox } from "lucide-react"; // v0.284.0
import {
  ConfigurationEditFormProps,
  ConfigFormValues
} from "../../types/form";
import { OrganizationConfigType } from "../../../backend/models/enums/OrganizationConfigType";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "../ui/alert-dialog";
import { BuyTabsEditor } from "./BuyTabsEditor";
import { ProfileFieldsEditor } from "./ProfileFieldsEditor";
import { useFormWithConfirmation } from "../../hooks/useFormWithConfirmation";
import { getSchemaByType } from "../../lib/schema-resolver";

/**
 * A form component for editing organization configuration settings based on configuration type
 * 
 * This component dynamically renders different form fields based on the configuration type
 * (ORGANIZATION_CONFIG, CLIENT_CONFIG, CLIENT_CONFIG_IOS, CLIENT_CONFIG_ANDROID) and
 * provides validation, confirmation dialog, and submission handling.
 */
export const ConfigurationEditForm = ({
  configData,
  onSubmit,
  onCancel,
  isSubmitting
}: ConfigurationEditFormProps) => {
  const configType = configData.OrganizationConfigType;
  
  // Get the appropriate schema for the configuration type
  const schema = useMemo(() => getSchemaByType(configType), [configType]);
  
  // Create confirmation message based on the organization name
  const confirmationMessage = useMemo(() => {
    return `Are you sure you want to save these configuration changes? This will update the settings for ${configData.Name || 'this organization'}.`;
  }, [configData.Name]);
  
  // Initialize form with useFormWithConfirmation hook
  const {
    formMethods,
    handleSubmit,
    isConfirmationOpen,
    setIsConfirmationOpen,
    handleConfirm,
    handleCancel
  } = useFormWithConfirmation<ConfigFormValues>({
    defaultValues: configData as unknown as ConfigFormValues,
    onSubmit,
    onCancel,
    confirmationMessage,
    schema
  });
  
  // Render form fields based on configuration type
  const renderFormFields = useCallback(() => {
    switch (configType) {
      case OrganizationConfigType.ORGANIZATION_CONFIG:
        return (
          <>
            <FormField
              control={formMethods.control}
              name="Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="TeamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="Slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="ShortName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="LogoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="FanWebRootUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fan Web Root URL</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="BrandColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Color</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="ExternalProviderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Provider ID</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="SocialLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Link</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="DonateLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Donate Link</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="BuyTabs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buy Tabs</FormLabel>
                  <FormControl>
                    <BuyTabsEditor 
                      value={field.value} 
                      onChange={field.onChange} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="Profile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Fields</FormLabel>
                  <FormControl>
                    <ProfileFieldsEditor 
                      value={field.value} 
                      onChange={field.onChange}
                      addButtonLabel="Add Profile Field" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="CustomerServiceConfig.CustomerServicePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Service Phone</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      
      case OrganizationConfigType.CLIENT_CONFIG:
        return (
          <>
            <FormField
              control={formMethods.control}
              name="PublicAmplitudeExperimentsKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Amplitude Experiments Key</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="PublicSegmentWriteKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Segment Write Key</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="Braze.PublicKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Braze Public Key</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="Braze.BaseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Braze Base URL</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="OrganizationCourtCash.Label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court Cash Label</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="OrganizationCourtCash.Enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        id="courtCashEnabled"
                      />
                    </div>
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="courtCashEnabled">Court Cash Enabled</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="PrivacyPolicyLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Privacy Policy Link</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formMethods.control}
              name="TermsLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms Link</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      
      case OrganizationConfigType.CLIENT_CONFIG_IOS:
        return (
          <FormField
            control={formMethods.control}
            name="IosStoreLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>iOS Store Link</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case OrganizationConfigType.CLIENT_CONFIG_ANDROID:
        return (
          <FormField
            control={formMethods.control}
            name="AndroidStoreLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Android Store Link</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      default:
        return null;
    }
  }, [configType, formMethods.control]);
  
  return (
    <>
      <Form {...formMethods}>
        <form onSubmit={(e) => e.preventDefault()}>
          <Card>
            <CardContent className="space-y-6 pt-6">
              {renderFormFields()}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  type="button"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
      
      <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmationOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};