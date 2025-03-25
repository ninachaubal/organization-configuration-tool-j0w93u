import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib'; // v2.80.0
import { Construct } from 'constructs'; // v10.2.69
import { App, Branch, BuildSpec, CodeCommitSourceCodeProvider, GitHubSourceCodeProvider } from 'aws-cdk-lib/aws-amplify'; // v2.80.0
import { Repository } from 'aws-cdk-lib/aws-codecommit'; // v2.80.0
import { IRole } from 'aws-cdk-lib/aws-iam'; // v2.80.0

/**
 * Interface for AmplifyStack properties including the required service role
 */
export interface AmplifyStackProps extends StackProps {
  /**
   * IAM role that Amplify will assume to access AWS resources
   */
  amplifyServiceRole: IRole;
}

/**
 * CDK Stack that provisions and configures an AWS Amplify application for hosting the 
 * Organization Configuration Management Tool
 */
export class AmplifyStack extends Stack {
  /**
   * The Amplify application instance
   */
  public readonly amplifyApp: App;
  
  /**
   * The main production branch of the Amplify application
   */
  public readonly mainBranch: Branch;
  
  /**
   * The development branch of the Amplify application
   */
  public readonly devBranch: Branch;
  
  /**
   * The Amplify application ID
   */
  public readonly appId: string;
  
  /**
   * The Amplify application name
   */
  public readonly appName: string;

  private readonly amplifyServiceRole: IRole;

  /**
   * Creates a new instance of the AmplifyStack
   * @param scope The parent construct
   * @param id The construct ID
   * @param props The stack properties
   */
  constructor(scope: Construct, id: string, props: AmplifyStackProps) {
    super(scope, id, props);

    // Extract the service role from props
    this.amplifyServiceRole = props.amplifyServiceRole;

    // Create the Amplify application
    this.amplifyApp = this.createAmplifyApp();
    this.appId = this.amplifyApp.appId;
    this.appName = this.amplifyApp.appName;

    // Configure branches
    this.mainBranch = this.configureMainBranch(this.amplifyApp);
    this.devBranch = this.configureDevelopmentBranch(this.amplifyApp);

    // Set environment variables for both branches
    this.configureEnvironmentVariables(this.mainBranch, 'production');
    this.configureEnvironmentVariables(this.devBranch, 'development');

    // Create outputs
    new CfnOutput(this, 'AmplifyAppId', {
      value: this.amplifyApp.appId,
      description: 'The ID of the Amplify app',
    });

    new CfnOutput(this, 'AmplifyAppUrl', {
      value: `https://${this.mainBranch.branchName}.${this.amplifyApp.defaultDomain}`,
      description: 'The URL of the Amplify app',
    });
  }

  /**
   * Creates and configures the Amplify application
   * @returns The created Amplify application
   */
  private createAmplifyApp(): App {
    // Get app configuration from context or use defaults
    const appName = this.node.tryGetContext('appName') || 'organization-config-tool';
    const repoOwner = this.node.tryGetContext('repoOwner');
    const repoName = this.node.tryGetContext('repoName');
    const tokenSecretArn = this.node.tryGetContext('githubTokenSecretArn');
    const useCodeCommit = this.node.tryGetContext('useCodeCommit') === 'true';
    
    let sourceCodeProvider;

    if (useCodeCommit) {
      // Use CodeCommit as the source
      const repository = Repository.fromRepositoryName(
        this,
        'CodeCommitRepo',
        this.node.tryGetContext('codeCommitRepoName') || appName
      );
      
      sourceCodeProvider = new CodeCommitSourceCodeProvider({ repository });
    } else {
      // Use GitHub as the source
      sourceCodeProvider = new GitHubSourceCodeProvider({
        owner: repoOwner,
        repository: repoName,
        oauthToken: GitHubSourceCodeProvider.oauthToken(tokenSecretArn),
      });
    }

    // Create the Amplify app
    return new App(this, 'AmplifyApp', {
      appName,
      role: this.amplifyServiceRole,
      sourceCodeProvider,
      autoBranchCreation: {
        patterns: ['feature/*', 'bugfix/*'],
        basicAuth: App.basicAuth('admin', 'amplify-password'),
        buildSpec: this.createBuildSpec('development'),
        pullRequestPreview: true,
      },
      buildSpec: this.createBuildSpec('production'),
      // NextJS specific custom rules for routing
      customRules: [
        // Handle API routes
        {
          source: '/api/<*>',
          target: '/api/<*>',
          status: '200',
        },
        // Handle NextJS static assets
        {
          source: '/_next/<*>',
          target: '/_next/<*>',
          status: '200',
        },
        // Handle static files
        {
          source: '/static/<*>',
          target: '/static/<*>',
          status: '200',
        },
        // SPA fallback for client-side routing
        {
          source: '/<*>',
          target: '/index.html',
          status: '200-rewrite',
        },
      ],
      environmentVariables: {
        NODE_VERSION: '18',
      },
    });
  }

  /**
   * Configures the main production branch of the Amplify application
   * @param app The Amplify application
   * @returns The configured main branch
   */
  private configureMainBranch(app: App): Branch {
    const branchName = this.node.tryGetContext('mainBranchName') || 'main';
    
    return new Branch(this, 'MainBranch', {
      app,
      branchName,
      buildSpec: this.createBuildSpec('production'),
      stage: 'PRODUCTION',
      autoBuild: true,
      performanceMode: true,
    });
  }

  /**
   * Configures the development branch of the Amplify application
   * @param app The Amplify application
   * @returns The configured development branch
   */
  private configureDevelopmentBranch(app: App): Branch {
    const devBranchName = this.node.tryGetContext('devBranchName') || 'development';
    
    return new Branch(this, 'DevBranch', {
      app,
      branchName: devBranchName,
      buildSpec: this.createBuildSpec('development'),
      stage: 'DEVELOPMENT',
      autoBuild: true,
      pullRequestPreview: true,
    });
  }

  /**
   * Creates the Amplify build specification for the NextJS application
   * @param environment The environment (development or production)
   * @returns The created build specification
   */
  private createBuildSpec(environment: string): BuildSpec {
    return BuildSpec.fromObjectToYaml({
      version: 1,
      frontend: {
        phases: {
          preBuild: {
            commands: [
              'npm ci'
            ]
          },
          build: {
            commands: [
              'npm run lint',
              environment === 'production' ? 'npm run test' : 'echo "Skipping tests in development"',
              'npm run build'
            ]
          }
        },
        artifacts: {
          baseDirectory: '.next',
          files: [
            '**/*',
            'public/**/*',
            'package.json',
            'node_modules/**/*'
          ]
        },
        cache: {
          paths: [
            'node_modules/**/*',
            '.next/cache/**/*'
          ]
        }
      }
    });
  }

  /**
   * Configures environment variables for the Amplify application
   * @param branch The branch to configure
   * @param environment The environment (development or production)
   */
  private configureEnvironmentVariables(branch: Branch, environment: string): void {
    const tableName = this.node.tryGetContext('organizationConfigTable') || 'OrganizationConfiguration';
    const awsRegion = this.node.tryGetContext('awsRegion') || this.region;
    
    // Set environment variables
    branch.addEnvironment('ORGANIZATION_CONFIGURATION_TABLE_NAME', tableName);
    branch.addEnvironment('NODE_ENV', environment);
    branch.addEnvironment('AWS_REGION', awsRegion);
    branch.addEnvironment('NEXT_PUBLIC_API_BASE_URL', '/api');
    
    // Add any additional environment variables from context
    const additionalEnvVars = this.node.tryGetContext(`${environment}EnvVars`) || {};
    
    for (const [key, value] of Object.entries(additionalEnvVars)) {
      branch.addEnvironment(key, value.toString());
    }
  }
}