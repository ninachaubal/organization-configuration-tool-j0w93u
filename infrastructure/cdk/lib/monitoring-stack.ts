import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib'; // v2.80.0
import { Construct } from 'constructs'; // v10.2.69
import { 
  Dashboard, 
  GraphWidget, 
  TextWidget, 
  Alarm,
  ComparisonOperator,
  TreatMissingData,
  Metric
} from 'aws-cdk-lib/aws-cloudwatch'; // v2.80.0
import { Topic } from 'aws-cdk-lib/aws-sns'; // v2.80.0
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions'; // v2.80.0
import { AmplifyStack } from './amplify-stack';
import { DynamoDBStack } from './dynamodb-stack';
import { CloudFrontStack } from './cloudfront-stack';

/**
 * Interface for MonitoringStack properties including references to other infrastructure stacks
 */
export interface MonitoringStackProps extends StackProps {
  /**
   * Reference to the Amplify stack that hosts the application
   */
  amplifyStack: AmplifyStack;
  
  /**
   * Reference to the DynamoDB stack that stores configuration data
   */
  dynamoDBStack: DynamoDBStack;
  
  /**
   * Reference to the CloudFront stack that serves the application
   */
  cloudFrontStack: CloudFrontStack;
  
  /**
   * Email addresses for alarm notifications
   */
  alarmEmailAddresses?: string[];
}

/**
 * CDK Stack that provisions and configures CloudWatch monitoring resources for the 
 * Organization Configuration Management Tool
 */
export class MonitoringStack extends Stack {
  /**
   * The main CloudWatch dashboard
   */
  public readonly mainDashboard: Dashboard;
  
  /**
   * The SNS topic for alarm notifications
   */
  public readonly alarmTopic: Topic;
  
  /**
   * The CloudWatch alarms
   */
  public readonly alarms: Alarm[] = [];

  /**
   * Creates a new instance of the MonitoringStack
   * @param scope The parent construct
   * @param id The construct ID
   * @param props The stack properties
   */
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    // Create the SNS topic for alarm notifications
    this.alarmTopic = this.createAlarmTopic();
    
    // Create the main CloudWatch dashboard
    this.mainDashboard = this.createMainDashboard();
    
    // Create alarms for critical metrics
    this.alarms = this.createAlarms();
    
    // Create CloudFormation outputs
    new CfnOutput(this, 'DashboardURL', {
      value: `https://${this.region}.console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.mainDashboard.dashboardName}`,
      description: 'URL to the CloudWatch Dashboard',
    });
    
    new CfnOutput(this, 'AlarmTopicARN', {
      value: this.alarmTopic.topicArn,
      description: 'ARN of the SNS topic for alarm notifications',
    });
  }

  /**
   * Creates and configures an SNS topic for alarm notifications
   * @returns The created SNS topic
   */
  private createAlarmTopic(): Topic {
    // Create the SNS topic
    const topic = new Topic(this, 'AlarmTopic', {
      displayName: 'OrganizationConfigTool-Alarms',
      topicName: 'OrganizationConfigTool-Alarms',
    });
    
    // Add email subscriptions if email addresses are provided
    const emailAddresses = this.props.alarmEmailAddresses || [];
    emailAddresses.forEach((email) => {
      topic.addSubscription(new EmailSubscription(email));
    });
    
    return topic;
  }

  /**
   * Creates and configures the main CloudWatch dashboard
   * @returns The created CloudWatch dashboard
   */
  private createMainDashboard(): Dashboard {
    // Create the dashboard
    const dashboard = new Dashboard(this, 'MainDashboard', {
      dashboardName: 'OrganizationConfigTool-Dashboard',
    });
    
    // Add header section
    dashboard.addWidgets(
      new TextWidget({
        markdown: '# Organization Configuration Tool Dashboard\n' +
                 'This dashboard provides monitoring for the Organization Configuration Management Tool.',
        width: 24,
        height: 2,
      })
    );
    
    // Add Amplify section
    dashboard.addWidgets(
      new TextWidget({
        markdown: '## Amplify Application',
        width: 24,
        height: 1,
      }),
      ...this.createAmplifyWidgets()
    );
    
    // Add DynamoDB section
    dashboard.addWidgets(
      new TextWidget({
        markdown: '## DynamoDB',
        width: 24,
        height: 1,
      }),
      ...this.createDynamoDBWidgets()
    );
    
    // Add CloudFront section
    dashboard.addWidgets(
      new TextWidget({
        markdown: '## CloudFront',
        width: 24,
        height: 1,
      }),
      ...this.createCloudFrontWidgets()
    );
    
    return dashboard;
  }

  /**
   * Creates dashboard widgets for Amplify metrics
   * @returns Array of Amplify metric widgets
   */
  private createAmplifyWidgets(): GraphWidget[] {
    const { amplifyStack } = this.props;
    const appId = amplifyStack.appId;
    
    // Build status widget
    const buildStatusWidget = new GraphWidget({
      title: 'Amplify Build Status',
      left: [
        new Metric({
          namespace: 'AWS/AmplifyHosting',
          metricName: 'BuildSuccess',
          dimensions: {
            App: appId,
          },
          statistic: 'Sum',
          label: 'Successful Builds',
        }),
        new Metric({
          namespace: 'AWS/AmplifyHosting',
          metricName: 'BuildFailed',
          dimensions: {
            App: appId,
          },
          statistic: 'Sum',
          label: 'Failed Builds',
          color: '#ff0000',
        })
      ],
      width: 12,
      height: 6,
    });
    
    // Deployment status widget
    const deploymentWidget = new GraphWidget({
      title: 'Amplify Deployments',
      left: [
        new Metric({
          namespace: 'AWS/AmplifyHosting',
          metricName: 'DeploymentSuccess',
          dimensions: {
            App: appId,
          },
          statistic: 'Sum',
          label: 'Successful Deployments',
        }),
        new Metric({
          namespace: 'AWS/AmplifyHosting',
          metricName: 'DeploymentFailed',
          dimensions: {
            App: appId,
          },
          statistic: 'Sum',
          label: 'Failed Deployments',
          color: '#ff0000',
        })
      ],
      width: 12,
      height: 6,
    });
    
    return [buildStatusWidget, deploymentWidget];
  }

  /**
   * Creates dashboard widgets for DynamoDB metrics
   * @returns Array of DynamoDB metric widgets
   */
  private createDynamoDBWidgets(): GraphWidget[] {
    const { dynamoDBStack } = this.props;
    const tableName = dynamoDBStack.tableName;
    
    // Read/Write Capacity widget
    const capacityWidget = new GraphWidget({
      title: 'DynamoDB Capacity Consumption',
      left: [
        new Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'ConsumedReadCapacityUnits',
          dimensions: {
            TableName: tableName,
          },
          statistic: 'Sum',
          label: 'Read Capacity',
        }),
        new Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'ConsumedWriteCapacityUnits',
          dimensions: {
            TableName: tableName,
          },
          statistic: 'Sum',
          label: 'Write Capacity',
        })
      ],
      width: 12,
      height: 6,
    });
    
    // Throttled Requests widget
    const throttledWidget = new GraphWidget({
      title: 'DynamoDB Throttled Requests',
      left: [
        new Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'ReadThrottleEvents',
          dimensions: {
            TableName: tableName,
          },
          statistic: 'Sum',
          label: 'Read Throttles',
          color: '#ff9900',
        }),
        new Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'WriteThrottleEvents',
          dimensions: {
            TableName: tableName,
          },
          statistic: 'Sum',
          label: 'Write Throttles',
          color: '#ff0000',
        })
      ],
      width: 12,
      height: 6,
    });
    
    // Latency widget
    const latencyWidget = new GraphWidget({
      title: 'DynamoDB Latency',
      left: [
        new Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'SuccessfulRequestLatency',
          dimensions: {
            TableName: tableName,
            Operation: 'GetItem',
          },
          statistic: 'Average',
          label: 'GetItem Latency',
        }),
        new Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'SuccessfulRequestLatency',
          dimensions: {
            TableName: tableName,
            Operation: 'Query',
          },
          statistic: 'Average',
          label: 'Query Latency',
        }),
        new Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'SuccessfulRequestLatency',
          dimensions: {
            TableName: tableName,
            Operation: 'UpdateItem',
          },
          statistic: 'Average',
          label: 'UpdateItem Latency',
        })
      ],
      width: 12,
      height: 6,
    });
    
    // Error Rate widget
    const errorWidget = new GraphWidget({
      title: 'DynamoDB Errors',
      left: [
        new Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'SystemErrors',
          dimensions: {
            TableName: tableName,
          },
          statistic: 'Sum',
          label: 'System Errors',
          color: '#ff0000',
        }),
        new Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'UserErrors',
          dimensions: {
            TableName: tableName,
          },
          statistic: 'Sum',
          label: 'User Errors',
          color: '#ff9900',
        })
      ],
      width: 12,
      height: 6,
    });
    
    return [capacityWidget, throttledWidget, latencyWidget, errorWidget];
  }

  /**
   * Creates dashboard widgets for CloudFront metrics
   * @returns Array of CloudFront metric widgets
   */
  private createCloudFrontWidgets(): GraphWidget[] {
    const { cloudFrontStack } = this.props;
    const distributionId = cloudFrontStack.distributionId;
    
    // Request Count widget
    const requestWidget = new GraphWidget({
      title: 'CloudFront Requests',
      left: [
        new Metric({
          namespace: 'AWS/CloudFront',
          metricName: 'Requests',
          dimensions: {
            DistributionId: distributionId,
            Region: 'Global',
          },
          statistic: 'Sum',
          label: 'Total Requests',
        })
      ],
      width: 12,
      height: 6,
    });
    
    // Error Rate widget
    const errorWidget = new GraphWidget({
      title: 'CloudFront Error Rate',
      left: [
        new Metric({
          namespace: 'AWS/CloudFront',
          metricName: '4xxErrorRate',
          dimensions: {
            DistributionId: distributionId,
            Region: 'Global',
          },
          statistic: 'Average',
          label: '4xx Error Rate (%)',
          color: '#ff9900',
        }),
        new Metric({
          namespace: 'AWS/CloudFront',
          metricName: '5xxErrorRate',
          dimensions: {
            DistributionId: distributionId,
            Region: 'Global',
          },
          statistic: 'Average',
          label: '5xx Error Rate (%)',
          color: '#ff0000',
        })
      ],
      width: 12,
      height: 6,
    });
    
    // Cache Hit Ratio widget
    const cacheWidget = new GraphWidget({
      title: 'CloudFront Cache Performance',
      left: [
        new Metric({
          namespace: 'AWS/CloudFront',
          metricName: 'CacheHitRate',
          dimensions: {
            DistributionId: distributionId,
            Region: 'Global',
          },
          statistic: 'Average',
          label: 'Cache Hit Rate (%)',
        })
      ],
      width: 12,
      height: 6,
    });
    
    // Latency widget
    const latencyWidget = new GraphWidget({
      title: 'CloudFront Latency',
      left: [
        new Metric({
          namespace: 'AWS/CloudFront',
          metricName: 'TotalErrorRate',
          dimensions: {
            DistributionId: distributionId,
            Region: 'Global',
          },
          statistic: 'Average',
          label: 'Total Error Rate (%)',
          color: '#ff0000',
        })
      ],
      width: 12,
      height: 6,
    });
    
    return [requestWidget, errorWidget, cacheWidget, latencyWidget];
  }

  /**
   * Creates CloudWatch alarms for critical metrics
   * @returns Array of created CloudWatch alarms
   */
  private createAlarms(): Alarm[] {
    const alarms: Alarm[] = [];
    
    // DynamoDB throttling alarm
    const dynamoDBThrottlingAlarm = this.createDynamoDBThrottlingAlarm();
    alarms.push(dynamoDBThrottlingAlarm);
    
    // Amplify build failure alarm
    const amplifyBuildFailureAlarm = this.createAmplifyBuildFailureAlarm();
    alarms.push(amplifyBuildFailureAlarm);
    
    // CloudFront error rate alarm
    const cloudFrontErrorRateAlarm = this.createCloudFrontErrorRateAlarm();
    alarms.push(cloudFrontErrorRateAlarm);
    
    return alarms;
  }

  /**
   * Creates an alarm for DynamoDB throttled requests
   * @returns The created CloudWatch alarm
   */
  private createDynamoDBThrottlingAlarm(): Alarm {
    const { dynamoDBStack } = this.props;
    const tableName = dynamoDBStack.tableName;
    
    // Create the throttling metric (combining read and write throttle events)
    const readThrottleMetric = new Metric({
      namespace: 'AWS/DynamoDB',
      metricName: 'ReadThrottleEvents',
      dimensions: {
        TableName: tableName,
      },
      statistic: 'Sum',
      period: Duration.minutes(1),
    });
    
    // Create and configure the alarm
    const alarm = new Alarm(this, 'DynamoDBThrottlingAlarm', {
      alarmName: `${tableName}-ThrottlingAlarm`,
      alarmDescription: 'Alarm for DynamoDB throttled requests',
      metric: readThrottleMetric.with({
        statistic: 'Sum',
        period: Duration.minutes(1),
      }),
      threshold: 5, // Alert if more than 5 throttled requests in 5 minutes
      evaluationPeriods: 5,
      datapointsToAlarm: 3,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    });
    
    // Add the alarm to the SNS topic
    alarm.addAlarmAction({
      bind: () => ({
        alarmActionArn: this.alarmTopic.topicArn,
      }),
    });
    
    return alarm;
  }

  /**
   * Creates an alarm for Amplify build failures
   * @returns The created CloudWatch alarm
   */
  private createAmplifyBuildFailureAlarm(): Alarm {
    const { amplifyStack } = this.props;
    const appId = amplifyStack.appId;
    
    // Create the build failure metric
    const buildFailureMetric = new Metric({
      namespace: 'AWS/AmplifyHosting',
      metricName: 'BuildFailed',
      dimensions: {
        App: appId,
      },
      statistic: 'Sum',
      period: Duration.minutes(5),
    });
    
    // Create and configure the alarm
    const alarm = new Alarm(this, 'AmplifyBuildFailureAlarm', {
      alarmName: `${appId}-BuildFailureAlarm`,
      alarmDescription: 'Alarm for Amplify build failures',
      metric: buildFailureMetric,
      threshold: 1, // Alert on any build failure
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    });
    
    // Add the alarm to the SNS topic
    alarm.addAlarmAction({
      bind: () => ({
        alarmActionArn: this.alarmTopic.topicArn,
      }),
    });
    
    return alarm;
  }

  /**
   * Creates an alarm for CloudFront error rate
   * @returns The created CloudWatch alarm
   */
  private createCloudFrontErrorRateAlarm(): Alarm {
    const { cloudFrontStack } = this.props;
    const distributionId = cloudFrontStack.distributionId;
    
    // Create the 5xx error rate metric
    const errorRateMetric = new Metric({
      namespace: 'AWS/CloudFront',
      metricName: '5xxErrorRate',
      dimensions: {
        DistributionId: distributionId,
        Region: 'Global',
      },
      statistic: 'Average',
      period: Duration.minutes(5),
    });
    
    // Create and configure the alarm
    const alarm = new Alarm(this, 'CloudFrontErrorRateAlarm', {
      alarmName: `${distributionId}-ErrorRateAlarm`,
      alarmDescription: 'Alarm for CloudFront 5xx error rate',
      metric: errorRateMetric,
      threshold: 1, // Alert if error rate exceeds 1%
      evaluationPeriods: 3,
      datapointsToAlarm: 2,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    });
    
    // Add the alarm to the SNS topic
    alarm.addAlarmAction({
      bind: () => ({
        alarmActionArn: this.alarmTopic.topicArn,
      }),
    });
    
    return alarm;
  }
}