import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';


export class MyPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const secret = sm.Secret.fromSecretAttributes(this, "ImportedSecret", {
      secretCompleteArn: "arn:aws:secretsmanager:eu-central-1:767873598297:secret:yncGitHubToken-G89cfS", 
        //secretArn: "arn:aws:secretsmanager:eu-central-1:767873598297:secret:yncGitHubToken-G89cfS",
    })

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'MyPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('ync-aws/my-pipeline', 'master', {
          authentication: secret.secretValue //cdk.SecretValue.secretsManager('my-token')
        }),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    });
  }
}
