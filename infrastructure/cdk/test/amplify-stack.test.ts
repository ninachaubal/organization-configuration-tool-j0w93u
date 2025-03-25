import { App } from 'aws-cdk-lib'; // v2.80.0
import { Template, Match } from 'aws-cdk-lib/assertions'; // v2.80.0
import { Role } from 'aws-cdk-lib/aws-iam'; // v2.80.0
import { AmplifyStack } from '../../lib/amplify-stack';

describe('AmplifyStack', () => {
  test('creates an Amplify app with GitHub source code provider', () => {
    // Create a CDK app instance
    const app = new App();
    
    // Create a mock IAM role for Amplify service
    const serviceRole = new Role(app, 'TestRole', {
      assumedBy: new ServicePrincipal('amplify.amazonaws.com')
    });
    
    // Instantiate the AmplifyStack with test parameters
    const stack = new AmplifyStack(app, 'MyTestStack', {
      amplifyServiceRole: serviceRole
    });
    
    // Prepare the CloudFormation template for assertions
    const template = Template.fromStack(stack);
    
    // Assert that the Amplify app resource is created
    template.hasResourceProperties('AWS::Amplify::App', {
      Name: 'organization-config-tool',
      SourceCodeProvider: {
        Type: 'GitHub'
      }
    });
  });

  test('configures main branch correctly', () => {
    // Create a CDK app instance
    const app = new App();
    
    // Create a mock IAM role for Amplify service
    const serviceRole = new Role(app, 'TestRole', {
      assumedBy: new ServicePrincipal('amplify.amazonaws.com')
    });
    
    // Instantiate the AmplifyStack with test parameters
    const stack = new AmplifyStack(app, 'MyTestStack', {
      amplifyServiceRole: serviceRole
    });
    
    // Prepare the CloudFormation template for assertions
    const template = Template.fromStack(stack);
    
    // Assert that the main branch resource is created
    template.hasResourceProperties('AWS::Amplify::Branch', {
      BranchName: 'main',
      AppId: Match.anyValue(),
      EnableAutoBuild: true,
      EnvironmentVariables: Match.arrayWith([
        {
          Name: 'ORGANIZATION_CONFIGURATION_TABLE_NAME',
          Value: Match.anyValue()
        },
        {
          Name: 'NODE_ENV',
          Value: 'production'
        },
        {
          Name: 'AWS_REGION',
          Value: Match.anyValue()
        },
        {
          Name: 'NEXT_PUBLIC_API_BASE_URL',
          Value: '/api'
        }
      ])
    });
  });

  test('configures development branch correctly', () => {
    // Create a CDK app instance
    const app = new App();
    
    // Create a mock IAM role for Amplify service
    const serviceRole = new Role(app, 'TestRole', {
      assumedBy: new ServicePrincipal('amplify.amazonaws.com')
    });
    
    // Instantiate the AmplifyStack with test parameters
    const stack = new AmplifyStack(app, 'MyTestStack', {
      amplifyServiceRole: serviceRole
    });
    
    // Prepare the CloudFormation template for assertions
    const template = Template.fromStack(stack);
    
    // Assert that the development branch resource is created
    template.hasResourceProperties('AWS::Amplify::Branch', {
      BranchName: 'develop',
      AppId: Match.anyValue(),
      EnableAutoBuild: true,
      EnablePullRequestPreview: true,
      EnvironmentVariables: Match.arrayWith([
        {
          Name: 'ORGANIZATION_CONFIGURATION_TABLE_NAME',
          Value: Match.anyValue()
        },
        {
          Name: 'NODE_ENV',
          Value: 'development'
        },
        {
          Name: 'AWS_REGION',
          Value: Match.anyValue()
        },
        {
          Name: 'NEXT_PUBLIC_API_BASE_URL',
          Value: '/api'
        }
      ])
    });
  });

  test('includes correct build specification', () => {
    // Create a CDK app instance
    const app = new App();
    
    // Create a mock IAM role for Amplify service
    const serviceRole = new Role(app, 'TestRole', {
      assumedBy: new ServicePrincipal('amplify.amazonaws.com')
    });
    
    // Instantiate the AmplifyStack with test parameters
    const stack = new AmplifyStack(app, 'MyTestStack', {
      amplifyServiceRole: serviceRole
    });
    
    // Prepare the CloudFormation template for assertions
    const template = Template.fromStack(stack);
    
    // Assert that the build specification includes NextJS build commands
    template.hasResourceProperties('AWS::Amplify::App', {
      BuildSpec: Match.stringLikeRegexp('npm run build')
    });
    
    // Assert that the build specification includes the correct output directory
    template.hasResourceProperties('AWS::Amplify::App', {
      BuildSpec: Match.stringLikeRegexp('\\.next')
    });
    
    // Assert that the build specification includes Node.js version configuration
    template.hasResourceProperties('AWS::Amplify::App', {
      EnvironmentVariables: Match.arrayWith([
        {
          Name: 'NODE_VERSION',
          Value: '18'
        }
      ])
    });
  });

  test('creates CloudFormation outputs for app ID and URL', () => {
    // Create a CDK app instance
    const app = new App();
    
    // Create a mock IAM role for Amplify service
    const serviceRole = new Role(app, 'TestRole', {
      assumedBy: new ServicePrincipal('amplify.amazonaws.com')
    });
    
    // Instantiate the AmplifyStack with test parameters
    const stack = new AmplifyStack(app, 'MyTestStack', {
      amplifyServiceRole: serviceRole
    });
    
    // Prepare the CloudFormation template for assertions
    const template = Template.fromStack(stack);
    
    // Assert that the Amplify app ID is exported as a CloudFormation output
    template.hasOutput('AmplifyAppId', {});
    
    // Assert that the Amplify app URL is exported as a CloudFormation output
    template.hasOutput('AmplifyAppUrl', {});
  });

  test('assigns service role to Amplify app', () => {
    // Create a CDK app instance
    const app = new App();
    
    // Create a mock IAM role for Amplify service
    const serviceRole = new Role(app, 'TestRole', {
      assumedBy: new ServicePrincipal('amplify.amazonaws.com')
    });
    
    // Instantiate the AmplifyStack with test parameters
    const stack = new AmplifyStack(app, 'MyTestStack', {
      amplifyServiceRole: serviceRole
    });
    
    // Prepare the CloudFormation template for assertions
    const template = Template.fromStack(stack);
    
    // Assert that the Amplify app is configured with the provided service role
    template.hasResourceProperties('AWS::Amplify::App', {
      IAMServiceRole: Match.anyValue()
    });
  });
});

// Helper import not explicitly listed in specification
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';