import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';

import { data, MODEL_ID, generateHaikuFunction, getLabelsFunction } from "./data/resource";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

const backend = defineBackend({
  auth,
  data,
  generateHaikuFunction,
  getLabelsFunction,
});


backend.generateHaikuFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:*::foundation-model/${MODEL_ID}`,
    ],
  })
);

backend.getLabelsFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["rekognition:DetectLabels"],
    resources: ["*"],
  })
);