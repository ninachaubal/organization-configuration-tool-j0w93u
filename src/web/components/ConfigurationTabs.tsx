import React from 'react';
import { 
  ConfigurationTabsProps, 
  ConfigurationRecord 
} from '../types/configuration';
import { OrganizationConfigType } from '../../backend/models/enums/OrganizationConfigType';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import ConfigurationDisplay from './ConfigurationDisplay';
import LoadingIndicator from './LoadingIndicator';
import { formatEnumValue } from '../lib/utils';

/**
 * Helper function to find the active configuration from the configuration data array
 */
const getActiveConfiguration = (
  configData: ConfigurationRecord[] | null,
  configType: OrganizationConfigType
): ConfigurationRecord | null => {
  if (!configData) {
    return null;
  }

  return configData.find(config => config.OrganizationConfigType === configType) || null;
};

/**
 * Component that displays organization configuration data in a tabbed interface
 */
const ConfigurationTabs = ({
  configData,
  activeTab,
  onTabChange,
  onEditClick,
  isLoading
}: ConfigurationTabsProps): React.ReactElement => {
  // Function to render tab content for a specific configuration type
  const renderTabContent = (configType: OrganizationConfigType) => {
    const typeConfig = getActiveConfiguration(configData, configType);
    
    if (isLoading) {
      return <LoadingIndicator size="lg" text="Loading configuration..." />;
    }
    
    if (!typeConfig) {
      // Get a more human-readable name for the missing config type
      const configTypeName = formatEnumValue(configType);
      return (
        <div className="p-6 text-center text-gray-500">
          No {configTypeName} found.
        </div>
      );
    }
    
    return (
      <ConfigurationDisplay
        configData={typeConfig}
        onEditClick={onEditClick}
        isLoading={false}
      />
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full" data-testid="config-tabs">
      <TabsList className="mb-4 w-full flex-wrap">
        <TabsTrigger value={OrganizationConfigType.ORGANIZATION_CONFIG} data-testid="tab-organization-config">
          {formatEnumValue(OrganizationConfigType.ORGANIZATION_CONFIG)}
        </TabsTrigger>
        <TabsTrigger value={OrganizationConfigType.CLIENT_CONFIG} data-testid="tab-client-config">
          {formatEnumValue(OrganizationConfigType.CLIENT_CONFIG)}
        </TabsTrigger>
        <TabsTrigger value={OrganizationConfigType.CLIENT_CONFIG_IOS} data-testid="tab-client-config-ios">
          {formatEnumValue(OrganizationConfigType.CLIENT_CONFIG_IOS)}
        </TabsTrigger>
        <TabsTrigger value={OrganizationConfigType.CLIENT_CONFIG_ANDROID} data-testid="tab-client-config-android">
          {formatEnumValue(OrganizationConfigType.CLIENT_CONFIG_ANDROID)}
        </TabsTrigger>
      </TabsList>

      <TabsContent value={OrganizationConfigType.ORGANIZATION_CONFIG} data-testid="content-organization-config">
        {renderTabContent(OrganizationConfigType.ORGANIZATION_CONFIG)}
      </TabsContent>

      <TabsContent value={OrganizationConfigType.CLIENT_CONFIG} data-testid="content-client-config">
        {renderTabContent(OrganizationConfigType.CLIENT_CONFIG)}
      </TabsContent>

      <TabsContent value={OrganizationConfigType.CLIENT_CONFIG_IOS} data-testid="content-client-config-ios">
        {renderTabContent(OrganizationConfigType.CLIENT_CONFIG_IOS)}
      </TabsContent>

      <TabsContent value={OrganizationConfigType.CLIENT_CONFIG_ANDROID} data-testid="content-client-config-android">
        {renderTabContent(OrganizationConfigType.CLIENT_CONFIG_ANDROID)}
      </TabsContent>
    </Tabs>
  );
};

export default ConfigurationTabs;