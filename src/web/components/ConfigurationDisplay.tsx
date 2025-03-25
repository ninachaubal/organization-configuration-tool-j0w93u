import React from 'react';
import { Edit } from 'lucide-react'; // v0.284.0
import { 
  ConfigurationDisplayProps, 
  OrganizationConfigRecord, 
  ClientConfigRecord,
  ClientConfigIOSRecord,
  ClientConfigAndroidRecord,
  BuyTab,
  ProfileField
} from '../types/configuration';
import { OrganizationConfigType } from '../../backend/models/enums/OrganizationConfigType';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import LoadingIndicator from './LoadingIndicator';
import { formatEnumValue } from '../lib/utils';

/**
 * Component that displays configuration data for a selected organization
 */
function ConfigurationDisplay({
  configData,
  onEditClick,
  isLoading
}: ConfigurationDisplayProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingIndicator size="lg" text="Loading configuration..." />
      </div>
    );
  }

  // Determine title based on configuration type
  const configTitle = formatEnumValue(configData.OrganizationConfigType);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{configTitle}</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex gap-2 items-center"
          onClick={onEditClick}
          data-testid="edit-button"
        >
          <Edit size={16} />
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        {configData.OrganizationConfigType === OrganizationConfigType.ORGANIZATION_CONFIG && 
          renderOrganizationConfig(configData as OrganizationConfigRecord)}
        
        {configData.OrganizationConfigType === OrganizationConfigType.CLIENT_CONFIG && 
          renderClientConfig(configData as ClientConfigRecord)}
        
        {configData.OrganizationConfigType === OrganizationConfigType.CLIENT_CONFIG_IOS && 
          renderClientConfigIOS(configData as ClientConfigIOSRecord)}
        
        {configData.OrganizationConfigType === OrganizationConfigType.CLIENT_CONFIG_ANDROID && 
          renderClientConfigAndroid(configData as ClientConfigAndroidRecord)}
      </CardContent>
    </Card>
  );
}

/**
 * Helper function to render a configuration field with label and value
 */
function renderField(label: string, value: any): React.ReactNode {
  if (value === undefined || value === null) {
    return null;
  }
  
  return (
    <div className="mb-4" data-testid={`field-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
      <div className="text-base">{formatValue(value)}</div>
    </div>
  );
}

/**
 * Helper function to format a value for display based on its type
 */
function formatValue(value: any): React.ReactNode {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'string') {
    // For URLs, make them clickable
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline"
        >
          {value}
        </a>
      );
    }
    return value;
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'None';
    }
    
    return (
      <ul className="list-disc pl-5">
        {value.map((item, index) => (
          <li key={index}>
            {typeof item === 'object' 
              ? Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ')
              : String(item)
            }
          </li>
        ))}
      </ul>
    );
  }
  
  if (typeof value === 'object') {
    return (
      <ul className="list-disc pl-5">
        {Object.entries(value).map(([key, val]) => (
          <li key={key}>
            <span className="font-medium">{key}:</span> {String(val)}
          </li>
        ))}
      </ul>
    );
  }
  
  return String(value);
}

/**
 * Helper function to render BuyTabs array in a structured format
 */
function renderBuyTabs(buyTabs?: BuyTab[]): React.ReactNode {
  if (!buyTabs || buyTabs.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold mb-2">Buy Tabs</h3>
      <div className="space-y-4">
        {buyTabs.map((tab, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-md">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(tab).map(([key, value]) => (
                <div key={key} className="col-span-1">
                  <span className="text-sm font-medium text-gray-500">{key}:</span>{' '}
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Helper function to render Profile fields array in a structured format
 */
function renderProfileFields(profileFields?: ProfileField[]): React.ReactNode {
  if (!profileFields || profileFields.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold mb-2">Profile Fields</h3>
      <div className="space-y-4">
        {profileFields.map((field, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-md">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2 font-medium">
                {formatEnumValue(field.FieldName)}
              </div>
              <div className="col-span-1">
                <span className="text-sm text-gray-500">Editable:</span>{' '}
                {field.IsEditable ? 'Yes' : 'No'}
              </div>
              <div className="col-span-1">
                <span className="text-sm text-gray-500">SSO User Editable:</span>{' '}
                {field.IsSSOUserEditable ? 'Yes' : 'No'}
              </div>
              <div className="col-span-1">
                <span className="text-sm text-gray-500">Required:</span>{' '}
                {field.IsRequired ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Helper function to render ORGANIZATION_CONFIG type fields
 */
function renderOrganizationConfig(config: OrganizationConfigRecord): React.ReactNode {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {renderField('Name', config.Name)}
          {renderField('Team Name', config.TeamName)}
          {renderField('Slug', config.Slug)}
          {renderField('Short Name', config.ShortName)}
        </div>
        <div>
          {renderField('Logo URL', config.LogoUrl)}
          {renderField('Fan Web Root URL', config.FanWebRootUrl)}
          {renderField('Brand Color', config.BrandColor)}
          {renderField('External Provider ID', config.ExternalProviderId)}
          {renderField('Social Link', config.SocialLink)}
          {renderField('Donate Link', config.DonateLink)}
        </div>
      </div>
      
      {renderBuyTabs(config.BuyTabs)}
      {renderProfileFields(config.Profile)}
      
      {config.CustomerServiceConfig && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Customer Service Configuration</h3>
          {renderField('Customer Service Phone', config.CustomerServiceConfig.CustomerServicePhone)}
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to render CLIENT_CONFIG type fields
 */
function renderClientConfig(config: ClientConfigRecord): React.ReactNode {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {renderField('Public Amplitude Experiments Key', config.PublicAmplitudeExperimentsKey)}
          {renderField('Public Segment Write Key', config.PublicSegmentWriteKey)}
          {renderField('Privacy Policy Link', config.PrivacyPolicyLink)}
          {renderField('Terms Link', config.TermsLink)}
        </div>
      </div>
      
      {config.Braze && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Braze Configuration</h3>
          {renderField('Public Key', config.Braze.PublicKey)}
          {renderField('Base URL', config.Braze.BaseUrl)}
        </div>
      )}
      
      {config.OrganizationCourtCash && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Organization Court Cash</h3>
          {renderField('Label', config.OrganizationCourtCash.Label)}
          {renderField('Enabled', config.OrganizationCourtCash.Enabled)}
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to render CLIENT_CONFIG_IOS type fields
 */
function renderClientConfigIOS(config: ClientConfigIOSRecord): React.ReactNode {
  return (
    <div className="space-y-6">
      {renderField('iOS Store Link', config.IosStoreLink)}
    </div>
  );
}

/**
 * Helper function to render CLIENT_CONFIG_ANDROID type fields
 */
function renderClientConfigAndroid(config: ClientConfigAndroidRecord): React.ReactNode {
  return (
    <div className="space-y-6">
      {renderField('Android Store Link', config.AndroidStoreLink)}
    </div>
  );
}

export default ConfigurationDisplay;