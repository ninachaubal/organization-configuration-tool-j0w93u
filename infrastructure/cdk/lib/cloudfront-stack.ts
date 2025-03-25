import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib'; // v2.80.0
import { Construct } from 'constructs'; // v10.2.69
import {
  Distribution,
  OriginAccessIdentity,
  AllowedMethods,
  CachePolicy,
  OriginRequestPolicy,
  ViewerProtocolPolicy,
  SecurityPolicyProtocol,
} from 'aws-cdk-lib/aws-cloudfront'; // v2.80.0
import { HttpOrigin, S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'; // v2.80.0
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'; // v2.80.0
import { HostedZone, ARecord, AaaaRecord, RecordTarget } from 'aws-cdk-lib/aws-route53'; // v2.80.0
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'; // v2.80.0
import { AmplifyStack } from './amplify-stack';

/**
 * Interface for CloudFrontStack properties including the required Amplify stack reference
 */
export interface CloudFrontStackProps extends StackProps {
  /**
   * Reference to the Amplify stack that hosts the application
   */
  amplifyStack: AmplifyStack;
  
  /**
   * Optional custom domain for the CloudFront distribution
   */
  customDomain?: string;
  
  /**
   * Whether to enable IPv6 for the CloudFront distribution
   * @default true
   */
  enableIPv6?: boolean;
}

/**
 * CDK Stack that provisions and configures a CloudFront distribution for the 
 * Organization Configuration Management Tool
 */
export class CloudFrontStack extends Stack {
  /**
   * The CloudFront distribution
   */
  public readonly distribution: Distribution;
  
  /**
   * The domain name of the CloudFront distribution
   */
  public readonly distributionDomainName: string;
  
  /**
   * The ID of the CloudFront distribution
   */
  public readonly distributionId: string;

  /**
   * Creates a new instance of the CloudFrontStack
   * @param scope The parent construct
   * @param id The construct ID
   * @param props The stack properties
   */
  constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id, props);

    // Create the CloudFront distribution
    this.distribution = this.createCloudFrontDistribution();
    
    // Store the distribution domain name and ID
    this.distributionDomainName = this.distribution.distributionDomainName;
    this.distributionId = this.distribution.distributionId;

    // Configure DNS records if custom domain is specified
    if (props.customDomain) {
      this.configureDnsRecords(this.distribution);
    }

    // Create CloudFormation outputs
    new CfnOutput(this, 'CloudFrontDistributionDomainName', {
      value: this.distributionDomainName,
      description: 'The domain name of the CloudFront distribution',
    });
    
    new CfnOutput(this, 'CloudFrontDistributionId', {
      value: this.distributionId,
      description: 'The ID of the CloudFront distribution',
    });
  }

  /**
   * Creates and configures the CloudFront distribution
   * @returns The created CloudFront distribution
   */
  private createCloudFrontDistribution(): Distribution {
    const { amplifyStack } = this.props;
    
    // Check if a custom domain is specified
    const customDomain = this.node.tryGetContext('customDomain') || this.props.customDomain;
    let certificate;
    let domainNames;
    
    // If a custom domain is specified, set up the certificate and domain names
    if (customDomain) {
      const certificateArn = this.node.tryGetContext('certificateArn');
      certificate = certificateArn 
        ? Certificate.fromCertificateArn(this, 'Certificate', certificateArn)
        : undefined;
      
      domainNames = [customDomain];
      if (this.node.tryGetContext('wwwDomain') === 'true') {
        domainNames.push(`www.${customDomain}`);
      }
    }

    // Create the distribution
    return new Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: this.configureDefaultCacheBehavior(),
      domainNames,
      certificate,
      enableIpv6: this.props.enableIPv6 !== false,
      defaultRootObject: 'index.html',
      httpVersion: 'HTTP2_AND_3',
      priceClass: this.node.tryGetContext('environment') === 'production' 
        ? 'PRICE_CLASS_ALL' 
        : 'PRICE_CLASS_100',
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      enableLogging: this.node.tryGetContext('enableCloudFrontLogs') === 'true',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      additionalBehaviors: {
        '/_next/static/*': this.configureStaticAssetsCacheBehavior('/_next/static/*'),
        '/static/*': this.configureStaticAssetsCacheBehavior('/static/*'),
      },
    });
  }

  /**
   * Configures the default cache behavior for the distribution
   * @returns Default cache behavior configuration
   */
  private configureDefaultCacheBehavior() {
    const { amplifyStack } = this.props;
    
    // Create an origin for the Amplify app
    // The domain format is typically: https://{branchName}.{appId}.amplifyapp.com
    const amplifyDomain = amplifyStack.amplifyApp.defaultDomain || 
      `${amplifyStack.appId}.amplifyapp.com`;
    const origin = new HttpOrigin(`${amplifyStack.mainBranch.branchName}.${amplifyDomain}`, {
      originPath: '',
      protocolPolicy: 'https-only',
    });

    // Configure the cache behavior
    return {
      origin,
      allowedMethods: AllowedMethods.ALL,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: new CachePolicy(this, 'DefaultCachePolicy', {
        minTtl: Duration.seconds(0),
        maxTtl: Duration.seconds(60),
        defaultTtl: Duration.seconds(30),
        cookieBehavior: {
          cookies: { forward: 'all' },
        },
        headerBehavior: {
          behavior: 'AllExcept',
          headers: ['Authorization', 'Host'],
        },
        queryStringBehavior: {
          behavior: 'all',
        },
        enableAcceptEncodingGzip: true,
        enableAcceptEncodingBrotli: true,
      }),
      originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
      responseHeadersPolicy: {
        customHeadersBehavior: {
          customHeaders: [
            ...this.configureSecurityHeaders(),
          ],
        },
        securityHeadersBehavior: {
          contentSecurityPolicy: {
            override: true,
            contentSecurityPolicy: this.getContentSecurityPolicy(),
          },
          contentTypeOptions: {
            override: true,
          },
          frameOptions: {
            frameOption: 'DENY',
            override: true,
          },
          referrerPolicy: {
            referrerPolicy: 'strict-origin-when-cross-origin',
            override: true,
          },
          strictTransportSecurity: {
            accessControlMaxAge: Duration.seconds(31536000),
            includeSubdomains: true,
            override: true,
          },
          xssProtection: {
            protection: true,
            modeBlock: true,
            override: true,
          },
        },
      },
    };
  }

  /**
   * Configures cache behavior for static assets
   * @param pathPattern The path pattern for the cache behavior
   * @returns Cache behavior configuration for static assets
   */
  private configureStaticAssetsCacheBehavior(pathPattern: string) {
    const { amplifyStack } = this.props;
    
    // Create an origin for the Amplify app
    // The domain format is typically: https://{branchName}.{appId}.amplifyapp.com
    const amplifyDomain = amplifyStack.amplifyApp.defaultDomain || 
      `${amplifyStack.appId}.amplifyapp.com`;
    const origin = new HttpOrigin(`${amplifyStack.mainBranch.branchName}.${amplifyDomain}`, {
      originPath: '',
      protocolPolicy: 'https-only',
    });

    // Configure the cache behavior for static assets with longer TTL
    return {
      origin,
      pathPattern,
      allowedMethods: AllowedMethods.GET_HEAD,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: new CachePolicy(this, `StaticAssetsCachePolicy-${pathPattern.replace(/[^\w]/g, '')}`, {
        minTtl: Duration.days(1),
        maxTtl: Duration.days(365),
        defaultTtl: Duration.days(30),
        cookieBehavior: {
          cookies: { forward: 'none' },
        },
        headerBehavior: {
          behavior: 'none',
        },
        queryStringBehavior: {
          behavior: 'none',
        },
        enableAcceptEncodingGzip: true,
        enableAcceptEncodingBrotli: true,
      }),
      responseHeadersPolicy: {
        customHeadersBehavior: {
          customHeaders: [
            ...this.configureSecurityHeaders(),
          ],
        },
        securityHeadersBehavior: {
          contentSecurityPolicy: {
            override: true,
            contentSecurityPolicy: this.getContentSecurityPolicy(),
          },
          contentTypeOptions: {
            override: true,
          },
          frameOptions: {
            frameOption: 'DENY',
            override: true,
          },
          referrerPolicy: {
            referrerPolicy: 'strict-origin-when-cross-origin',
            override: true,
          },
          strictTransportSecurity: {
            accessControlMaxAge: Duration.seconds(31536000),
            includeSubdomains: true,
            override: true,
          },
          xssProtection: {
            protection: true,
            modeBlock: true,
            override: true,
          },
        },
      },
    };
  }

  /**
   * Configures DNS records for custom domain if specified
   * @param distribution The CloudFront distribution
   */
  private configureDnsRecords(distribution: Distribution): void {
    const customDomain = this.node.tryGetContext('customDomain') || this.props.customDomain;
    
    if (!customDomain) {
      return;
    }
    
    // Extract the domain parts
    const domainParts = customDomain.split('.');
    const rootDomain = domainParts.length > 2 
      ? `${domainParts[domainParts.length - 2]}.${domainParts[domainParts.length - 1]}`
      : customDomain;
    
    // Get the hosted zone ID from context or try to find by domain name
    const hostedZoneId = this.node.tryGetContext('hostedZoneId');
    const hostedZone = hostedZoneId
      ? HostedZone.fromHostedZoneId(this, 'HostedZone', hostedZoneId)
      : HostedZone.fromLookup(this, 'HostedZone', { domainName: rootDomain });
    
    // Create an A record for the domain
    new ARecord(this, 'CloudFrontAliasRecord', {
      zone: hostedZone,
      recordName: customDomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
    
    // Create an AAAA record for IPv6 if enabled
    if (this.props.enableIPv6 !== false) {
      new AaaaRecord(this, 'CloudFrontAliasAaaaRecord', {
        zone: hostedZone,
        recordName: customDomain,
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      });
    }
  }

  /**
   * Configures security headers for the CloudFront distribution
   * @returns Security headers configuration
   */
  private configureSecurityHeaders() {
    return [
      {
        header: 'X-Content-Type-Options',
        value: 'nosniff',
        override: true,
      },
      {
        header: 'X-Frame-Options',
        value: 'DENY',
        override: true,
      },
      {
        header: 'X-XSS-Protection',
        value: '1; mode=block',
        override: true,
      },
      {
        header: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
        override: true,
      },
      {
        header: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
        override: true,
      },
    ];
  }

  /**
   * Gets the Content Security Policy for the application
   * @returns The Content Security Policy string
   */
  private getContentSecurityPolicy(): string {
    // Define a secure CSP suitable for an internal administrative application
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for NextJS
      "style-src 'self' 'unsafe-inline'", // Needed for styled-components
      "img-src 'self' data: https: blob:", // Allow images from HTTPS sources
      "font-src 'self' data:", // Allow fonts from the same origin and data URLs
      "connect-src 'self' https://*.amazonaws.com", // Allow connections to AWS services
      "frame-ancestors 'none'", // Prevent embedding in iframes
      "base-uri 'self'", // Restrict base URIs
      "form-action 'self'", // Restrict form submissions
      "object-src 'none'", // Prevent object/embed
      "upgrade-insecure-requests", // Upgrade HTTP to HTTPS
    ].join('; ');
  }
}