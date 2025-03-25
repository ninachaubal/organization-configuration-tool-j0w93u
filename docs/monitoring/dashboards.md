# CloudWatch Dashboards: Organization Configuration Management Tool

## Introduction

This document describes the CloudWatch dashboards for the Organization Configuration Management Tool. The dashboards provide visibility into the health, performance, and usage of the application, enabling proactive monitoring and troubleshooting. The dashboards are implemented using AWS CloudWatch and are deployed as part of the infrastructure.

## Dashboard Overview

The monitoring system includes a set of CloudWatch dashboards that provide different views of the application's performance and health. These dashboards are designed to support various operational needs, from high-level status monitoring to detailed troubleshooting.

### Dashboard Types

The monitoring system includes the following dashboards:

- **Main Dashboard**: Provides a comprehensive view of all system components
- **DynamoDB Dashboard**: Focuses on database performance and health
- **Application Dashboard**: Focuses on the NextJS application performance
- **API Dashboard**: Focuses on API performance and error rates
- **User Experience Dashboard**: Focuses on client-side metrics and user experience

### Dashboard Access

Dashboards are accessible through the AWS CloudWatch console:

1. Log in to the AWS Management Console
2. Navigate to CloudWatch service
3. Select 'Dashboards' from the left navigation
4. Select the desired dashboard from the list
5. Optionally, save the dashboard URL for direct access

### Dashboard Permissions

Access to dashboards is controlled through AWS IAM:

- **Viewers**: Can view dashboards but not modify them (requires `cloudwatch:GetDashboard` and `cloudwatch:ListDashboards` permissions)
- **Editors**: Can modify dashboards (requires additional `cloudwatch:PutDashboard` and `cloudwatch:DeleteDashboards` permissions)
- **Administrators**: Full access to all CloudWatch resources

## Main Dashboard

The main dashboard provides a comprehensive view of all system components, with sections for each major component of the application.

### Dashboard Structure

The main dashboard is organized into the following sections:

- **System Health**: Overall health indicators for all components
- **Amplify Application**: Metrics for the NextJS application hosted on AWS Amplify
- **DynamoDB**: Metrics for the DynamoDB table storing organization configuration data
- **CloudFront**: Metrics for the CloudFront distribution
- **API Performance**: Metrics for API endpoints
- **User Experience**: Client-side performance metrics

### System Health Section

The System Health section provides a high-level overview of the application's health:

- **Health Status Indicators**: Visual indicators showing the current status of each component
- **Alarm Status**: Count of alarms in ALARM, INSUFFICIENT_DATA, and OK states
- **Service Availability**: Availability percentage for key components
- **Recent Alarms**: Timeline of recent alarm state changes

### Amplify Application Section

The Amplify Application section focuses on the NextJS application:

- **Build Status**: Success/failure status of recent builds
- **Deployment Status**: Success/failure status of recent deployments
- **Application Errors**: Count of application errors over time
- **Application Latency**: Response time for application requests

### DynamoDB Section

The DynamoDB section focuses on database performance:

- **Read/Write Capacity**: Consumed read and write capacity units
- **Throttled Requests**: Count of throttled read and write requests
- **Latency**: Average and p95 latency for read and write operations
- **Error Count**: Count of system errors

### CloudFront Section

The CloudFront section focuses on content delivery:

- **Request Count**: Total requests to the CloudFront distribution
- **Error Rate**: Percentage of 4xx and 5xx errors
- **Cache Hit Ratio**: Percentage of requests served from cache
- **Origin Latency**: Time taken for origin to respond to CloudFront

### API Performance Section

The API Performance section focuses on API endpoints:

- **Request Count**: Total API requests by endpoint
- **Error Rate**: Percentage of API errors by endpoint
- **Latency**: Average and p95 latency by endpoint
- **Status Code Distribution**: Count of responses by HTTP status code

### User Experience Section

The User Experience section focuses on client-side metrics:

- **Page Load Time**: Time to load and render pages
- **First Contentful Paint**: Time to first contentful paint
- **Time to Interactive**: Time until the page becomes interactive
- **Client-Side Errors**: Count of JavaScript errors

## DynamoDB Dashboard

The DynamoDB dashboard provides detailed metrics for the DynamoDB table storing organization configuration data.

### Dashboard Structure

The DynamoDB dashboard is organized into the following sections:

- **Table Overview**: Basic information about the table
- **Capacity Metrics**: Read and write capacity consumption
- **Performance Metrics**: Latency and throughput
- **Error Metrics**: Throttling and system errors
- **Operation Breakdown**: Metrics by operation type

### Table Overview Section

The Table Overview section provides basic information about the DynamoDB table:

- **Table Name**: Name of the DynamoDB table
- **Item Count**: Approximate number of items in the table
- **Table Size**: Approximate size of the table in bytes
- **Capacity Mode**: Provisioned or on-demand capacity mode

### Capacity Metrics Section

The Capacity Metrics section focuses on capacity consumption:

- **Consumed Read Capacity Units**: RCUs consumed over time
- **Consumed Write Capacity Units**: WCUs consumed over time
- **Provisioned Read Capacity**: Provisioned RCUs (if applicable)
- **Provisioned Write Capacity**: Provisioned WCUs (if applicable)
- **Capacity Utilization**: Percentage of provisioned capacity used

### Performance Metrics Section

The Performance Metrics section focuses on latency and throughput:

- **Read Latency**: Average and p95 latency for read operations
- **Write Latency**: Average and p95 latency for write operations
- **Scan Latency**: Average and p95 latency for scan operations
- **Query Latency**: Average and p95 latency for query operations
- **Request Throughput**: Requests per second by operation type

### Error Metrics Section

The Error Metrics section focuses on errors and throttling:

- **Throttled Read Requests**: Count of throttled read requests
- **Throttled Write Requests**: Count of throttled write requests
- **System Errors**: Count of system errors by error type
- **User Errors**: Count of user errors by error type

### Operation Breakdown Section

The Operation Breakdown section provides metrics by operation type:

- **GetItem Operations**: Count and latency for GetItem operations
- **PutItem Operations**: Count and latency for PutItem operations
- **UpdateItem Operations**: Count and latency for UpdateItem operations
- **DeleteItem Operations**: Count and latency for DeleteItem operations
- **Query Operations**: Count and latency for Query operations
- **Scan Operations**: Count and latency for Scan operations

## Application Dashboard

The Application Dashboard provides detailed metrics for the NextJS application hosted on AWS Amplify.

### Dashboard Structure

The Application Dashboard is organized into the following sections:

- **Application Overview**: Basic information about the application
- **Build and Deployment**: Metrics for CI/CD pipeline
- **Application Performance**: Server-side performance metrics
- **Error Tracking**: Application errors and exceptions
- **Resource Utilization**: CPU, memory, and network usage

### Application Overview Section

The Application Overview section provides basic information about the application:

- **Application Name**: Name of the Amplify application
- **Environment**: Current deployment environment (dev, test, prod)
- **Version**: Current deployed version
- **Status**: Current application status

### Build and Deployment Section

The Build and Deployment section focuses on the CI/CD pipeline:

- **Build Status**: Success/failure status of recent builds
- **Build Duration**: Time taken to complete builds
- **Deployment Status**: Success/failure status of recent deployments
- **Deployment Duration**: Time taken to complete deployments
- **Build Frequency**: Number of builds over time

### Application Performance Section

The Application Performance section focuses on server-side performance:

- **Server Response Time**: Time taken to generate responses
- **Request Rate**: Requests per second
- **Request Duration**: Distribution of request durations
- **Server-Side Rendering Time**: Time taken for SSR
- **API Route Performance**: Performance of NextJS API routes

### Error Tracking Section

The Error Tracking section focuses on application errors:

- **Error Count**: Total count of errors over time
- **Error Rate**: Percentage of requests resulting in errors
- **Error Distribution**: Count of errors by type
- **Top Error Paths**: Paths with the highest error rates
- **Recent Errors**: Timeline of recent errors with details

### Resource Utilization Section

The Resource Utilization section focuses on resource usage:

- **CPU Utilization**: Percentage of CPU used
- **Memory Utilization**: Percentage of memory used
- **Network I/O**: Network traffic in and out
- **Disk I/O**: Disk read and write operations
- **Connection Count**: Number of active connections

## API Dashboard

The API Dashboard provides detailed metrics for the API endpoints of the application.

### Dashboard Structure

The API Dashboard is organized into the following sections:

- **API Overview**: Basic information about the API
- **Request Metrics**: Request volume and patterns
- **Performance Metrics**: Latency and throughput
- **Error Metrics**: Error rates and patterns
- **Endpoint Breakdown**: Metrics by endpoint

### API Overview Section

The API Overview section provides basic information about the API:

- **API Name**: Name of the API
- **Environment**: Current deployment environment
- **Request Count**: Total API requests
- **Error Rate**: Overall API error rate

### Request Metrics Section

The Request Metrics section focuses on request volume and patterns:

- **Request Rate**: Requests per second
- **Request Volume**: Total requests over time
- **Request Method Distribution**: Requests by HTTP method
- **Request Size**: Distribution of request payload sizes
- **Client Distribution**: Requests by client type or location

### Performance Metrics Section

The Performance Metrics section focuses on latency and throughput:

- **Response Time**: Average and p95 response time
- **Response Time Distribution**: Distribution of response times
- **Throughput**: Requests processed per second
- **Response Size**: Distribution of response payload sizes
- **Time to First Byte**: Time to first byte of response

### Error Metrics Section

The Error Metrics section focuses on error rates and patterns:

- **Error Count**: Total count of errors over time
- **Error Rate**: Percentage of requests resulting in errors
- **Status Code Distribution**: Count of responses by HTTP status code
- **Error Type Distribution**: Count of errors by type
- **Top Error Endpoints**: Endpoints with the highest error rates

### Endpoint Breakdown Section

The Endpoint Breakdown section provides metrics by endpoint:

- **Organizations Endpoint**: Metrics for the /api/organizations endpoint
- **Organization Config Endpoint**: Metrics for the /api/organizations/{id}/config endpoint
- **Config Type Endpoint**: Metrics for the /api/organizations/{id}/config/{type} endpoint
- **Health Check Endpoint**: Metrics for the /api/health endpoint

## User Experience Dashboard

The User Experience Dashboard provides detailed metrics for client-side performance and user experience.

### Dashboard Structure

The User Experience Dashboard is organized into the following sections:

- **User Overview**: Basic information about user activity
- **Page Performance**: Client-side page performance metrics
- **Web Vitals**: Core Web Vitals metrics
- **Client-Side Errors**: JavaScript errors and exceptions
- **User Interactions**: Metrics for user interactions

### User Overview Section

The User Overview section provides basic information about user activity:

- **Active Users**: Count of active users over time
- **Session Count**: Total number of user sessions
- **Session Duration**: Average and distribution of session durations
- **Page Views**: Count of page views over time
- **Bounce Rate**: Percentage of single-page sessions

### Page Performance Section

The Page Performance section focuses on client-side page performance:

- **Page Load Time**: Time to fully load pages
- **DOM Content Loaded**: Time to DOM content loaded event
- **Time to Interactive**: Time until the page becomes interactive
- **Total Blocking Time**: Sum of blocking time periods
- **Speed Index**: Measure of how quickly content is visually displayed

### Web Vitals Section

The Web Vitals section focuses on Core Web Vitals metrics:

- **Largest Contentful Paint (LCP)**: Time to render the largest content element
- **First Input Delay (FID)**: Time from first user interaction to response
- **Cumulative Layout Shift (CLS)**: Measure of visual stability
- **First Contentful Paint (FCP)**: Time to first content render
- **Time to First Byte (TTFB)**: Time to receive the first byte of response

### Client-Side Errors Section

The Client-Side Errors section focuses on JavaScript errors:

- **Error Count**: Total count of client-side errors
- **Error Rate**: Percentage of sessions with errors
- **Error Distribution**: Count of errors by type
- **Top Error Pages**: Pages with the highest error rates
- **Recent Errors**: Timeline of recent errors with details

### User Interactions Section

The User Interactions section focuses on user interactions:

- **Form Submission Rate**: Rate of form submissions
- **Form Error Rate**: Percentage of form submissions with errors
- **Navigation Patterns**: Common navigation paths
- **Interaction Time**: Time spent on different pages
- **Feature Usage**: Usage metrics for key features

## Dashboard Customization

CloudWatch dashboards can be customized to meet specific monitoring needs.

### Time Range Selection

Dashboards support different time ranges for viewing metrics:

- **Predefined Ranges**: 1h, 3h, 12h, 1d, 3d, 1w, 2w
- **Custom Range**: Select a specific start and end time
- **Auto-refresh**: Set dashboards to auto-refresh at intervals
- **Relative Time**: View metrics relative to a specific point in time

### Widget Customization

Individual widgets can be customized:

- **Metric Selection**: Add or remove metrics from graphs
- **Statistic Selection**: Change between Average, Sum, Min, Max, etc.
- **Period Selection**: Adjust the aggregation period
- **Visualization Type**: Change between line, area, bar charts, etc.
- **Y-Axis Settings**: Adjust scale, units, and label

### Layout Customization

Dashboard layouts can be customized:

- **Widget Positioning**: Drag and drop widgets to rearrange
- **Widget Sizing**: Resize widgets to show more or less detail
- **Add Widgets**: Add new metric graphs, text widgets, or alarms
- **Remove Widgets**: Remove unnecessary widgets
- **Create Sections**: Organize widgets into logical sections

### Saving and Sharing

Customized dashboards can be saved and shared:

- **Save Changes**: Save customizations to the dashboard
- **Create Copy**: Create a copy of a dashboard for customization
- **Share URL**: Share the dashboard URL with others
- **Dashboard Permissions**: Control who can view or edit the dashboard
- **Export as Image**: Export the dashboard as an image for reports

## Dashboard Implementation

The dashboards are implemented using AWS CloudWatch and AWS CDK.

### Implementation Approach

Dashboards are defined as code in the infrastructure repository:

- **Infrastructure as Code**: Dashboards defined using AWS CDK
- **Version Control**: Dashboard definitions stored in Git
- **Automated Deployment**: Dashboards deployed through CI/CD pipeline
- **Environment-specific**: Different dashboard configurations for different environments

### Dashboard Definition

Dashboards are defined in the `MonitoringStack` class:

```typescript
// Example of dashboard creation in MonitoringStack
private createMainDashboard(): cloudwatch.Dashboard {
  const dashboard = new cloudwatch.Dashboard(this, 'MainDashboard', {
    dashboardName: `${this.stackName}-MainDashboard`,
  });

  // Add a header section
  dashboard.addWidgets(
    new cloudwatch.TextWidget({
      markdown: `# ${this.stackName} Dashboard\nEnvironment: ${this.node.tryGetContext('environment')}\nLast Updated: ${new Date().toISOString()}`,
      width: 24,
      height: 2,
    })
  );

  // Add Amplify section
  const amplifyWidgets = this.createAmplifyWidgets();
  dashboard.addWidgets(...amplifyWidgets);

  // Add DynamoDB section
  const dynamoDBWidgets = this.createDynamoDBWidgets();
  dashboard.addWidgets(...dynamoDBWidgets);

  // Add CloudFront section
  const cloudFrontWidgets = this.createCloudFrontWidgets();
  dashboard.addWidgets(...cloudFrontWidgets);

  return dashboard;
}
```

### Metric Collection

Metrics are collected from various sources:

- **AWS Service Metrics**: Automatically collected by CloudWatch
- **Custom Metrics**: Published from the application code
- **Synthetic Canaries**: Simulated user interactions
- **Logs Insights**: Metrics extracted from log data
- **X-Ray Traces**: Distributed tracing data

### Widget Implementation

Dashboard widgets are implemented using CloudWatch constructs:

```typescript
// Example of creating DynamoDB widgets
private createDynamoDBWidgets(): cloudwatch.GraphWidget[] {
  const table = this.props.dynamoDBStack.organizationConfigTable;
  
  // Create capacity widget
  const capacityWidget = new cloudwatch.GraphWidget({
    title: 'DynamoDB - Consumed Capacity',
    left: [
      new cloudwatch.Metric({
        namespace: 'AWS/DynamoDB',
        metricName: 'ConsumedReadCapacityUnits',
        dimensions: { TableName: table.tableName },
        statistic: 'Sum',
        period: Duration.minutes(1),
      }),
      new cloudwatch.Metric({
        namespace: 'AWS/DynamoDB',
        metricName: 'ConsumedWriteCapacityUnits',
        dimensions: { TableName: table.tableName },
        statistic: 'Sum',
        period: Duration.minutes(1),
      }),
    ],
    width: 12,
    height: 6,
  });

  // Create throttling widget
  const throttlingWidget = new cloudwatch.GraphWidget({
    title: 'DynamoDB - Throttled Requests',
    left: [
      new cloudwatch.Metric({
        namespace: 'AWS/DynamoDB',
        metricName: 'ReadThrottleEvents',
        dimensions: { TableName: table.tableName },
        statistic: 'Sum',
        period: Duration.minutes(1),
      }),
      new cloudwatch.Metric({
        namespace: 'AWS/DynamoDB',
        metricName: 'WriteThrottleEvents',
        dimensions: { TableName: table.tableName },
        statistic: 'Sum',
        period: Duration.minutes(1),
      }),
    ],
    width: 12,
    height: 6,
  });

  return [capacityWidget, throttlingWidget];
}
```

## Dashboard Usage Guidelines

Guidelines for effectively using the monitoring dashboards.

### Regular Monitoring

Recommendations for regular dashboard monitoring:

- **Daily Check**: Review the main dashboard at least once per day
- **Alert Investigation**: Use dashboards to investigate alerts
- **Trend Analysis**: Review longer time periods (1w, 2w) to identify trends
- **Pre/Post Deployment**: Check dashboards before and after deployments
- **Incident Response**: Use dashboards during incident response

### Troubleshooting with Dashboards

How to use dashboards for troubleshooting:

1. Start with the main dashboard to identify the affected component
2. Navigate to the component-specific dashboard for detailed metrics
3. Adjust the time range to focus on the period of interest
4. Compare metrics to identify correlations
5. Drill down into specific metrics for detailed analysis
6. Use CloudWatch Logs Insights for log analysis if needed

### Performance Analysis

How to use dashboards for performance analysis:

1. Identify baseline performance during normal operation
2. Compare current performance to the baseline
3. Look for patterns in performance variations
4. Correlate performance metrics with other events
5. Identify performance bottlenecks
6. Measure the impact of optimizations

### Capacity Planning

How to use dashboards for capacity planning:

1. Review resource utilization trends over time
2. Identify peak usage periods
3. Project future growth based on historical trends
4. Identify resources approaching capacity limits
5. Plan capacity increases before limits are reached
6. Validate the impact of capacity changes

## Integration with Alerting System

The dashboards are integrated with the CloudWatch alerting system to provide context for alerts and facilitate investigation.

### Alert Visualization

How alerts are visualized in dashboards:

- **Alarm Widgets**: Display the current state of alarms
- **Threshold Visualization**: Show alert thresholds on metric graphs
- **Alarm History**: Show the history of alarm state changes
- **Alarm Annotations**: Mark alarm events on metric graphs

### Alert Investigation

How to use dashboards to investigate alerts:

1. When an alert is triggered, navigate to the relevant dashboard
2. Adjust the time range to focus on the alert period
3. Examine the metric that triggered the alert
4. Look for correlated metrics that might indicate the root cause
5. Use the dashboard to determine if the alert is a false positive
6. Document findings for post-incident review

### Alert Tuning

How to use dashboards to tune alert thresholds:

1. Review historical metric data in the dashboard
2. Identify normal operating ranges for metrics
3. Determine appropriate threshold values based on data
4. Visualize proposed thresholds on metric graphs
5. Validate that new thresholds would have caught actual incidents
6. Update alert thresholds based on analysis

## Dashboard Maintenance

Procedures for maintaining and updating dashboards over time.

### Regular Review

Schedule for reviewing and updating dashboards:

- **Quarterly Review**: Comprehensive review of all dashboards
- **Post-Incident Review**: Update dashboards based on incident learnings
- **Feature Release**: Update dashboards when new features are added
- **Infrastructure Changes**: Update dashboards when infrastructure changes

### Adding New Metrics

Process for adding new metrics to dashboards:

1. Identify the metric to be added
2. Determine the appropriate dashboard and section
3. Update the dashboard definition in the infrastructure code
4. Test the updated dashboard in a non-production environment
5. Deploy the updated dashboard to production
6. Document the new metric in this documentation

```typescript
// Example of adding a new metric to a widget
private addNewMetricToWidget(widget: cloudwatch.GraphWidget, metricName: string, dimensions: Record<string, string>): void {
  widget.addLeftMetric(
    new cloudwatch.Metric({
      namespace: 'AWS/DynamoDB',
      metricName: metricName,
      dimensions: dimensions,
      statistic: 'Average',
      period: Duration.minutes(1),
    })
  );
}
```

### Removing or Modifying Metrics

Process for removing or modifying existing metrics:

1. Document the reason for removal or modification
2. Get approval from relevant stakeholders
3. Update the dashboard definition in the infrastructure code
4. Test the updated dashboard in a non-production environment
5. Deploy the updated dashboard to production
6. Update this documentation to reflect the changes

## Reference

Additional resources and references:

- [AWS CloudWatch Dashboards Documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html)
- [AWS CloudWatch Metrics Documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html)
- [AWS CloudWatch Alarms Documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html)
- [Infrastructure Monitoring Stack](../../infrastructure/cdk/lib/monitoring-stack.ts)
- [Architecture Overview](../architecture/high-level-overview.md)