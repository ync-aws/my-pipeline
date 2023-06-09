import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { MyPipelineAppStage } from './my-pipeline-app-stage';


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

    // add pre-deployment or post-deployment actions to the stage 
    const testingStage = pipeline.addStage(new MyPipelineAppStage(this, "test", {
      //env: { account: "111111111111", region: "eu-west-1" }
    }))
    testingStage.addPre(new ManualApprovalStep('approval'))

    //add stages to a Wave to deploy them in parallel,
      // const wave = pipeline.addWave('wave');
      // wave.addStage(new MyApplicationStage(this, 'MyAppEU', {
      //   env: { account: '111111111111', region: 'eu-west-1' }
      // }));
      // wave.addStage(new MyApplicationStage(this, 'MyAppUS', {
      //   env: { account: '111111111111', region: 'us-west-1' }
      // }));

    // to validate the deployments,
      // stage was returned by pipeline.addStage
      // testingStage.addPost(new ShellStep("validate", {
      //   commands: ['../tests/validate.sh'],
      // }));

      // given a stack lbStack that exposes a load balancer construct as loadBalancer
      // this.loadBalancerAddress = new cdk.CfnOutput(lbStack, 'LbAddress', {
      //   value: `https://${lbStack.loadBalancer.loadBalancerDnsName}/`
      // });

      // // pass the load balancer address to a shell step
      // stage.addPost(new ShellStep("lbaddr", {
      //   envFromCfnOutputs: {lb_addr: lbStack.loadBalancerAddress},
      //   commands: ['echo $lb_addr']
      // }));

    // validation tests right in the ShellStep

  }
}
