import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";

import {
	data,
	MODEL_ID,
	getLabelsFunction,
	generateTintFunction,
} from "./data/resource";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

const backend = defineBackend({
	auth,
	data,
	getLabelsFunction,
	generateTintFunction,
});

backend.getLabelsFunction.resources.lambda.addToRolePolicy(
	new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ["rekognition:DetectLabels"],
		resources: ["*"],
	})
);

backend.generateTintFunction.resources.cfnResources.cfnFunction.timeout = 30;
backend.generateTintFunction.resources.cfnResources.cfnFunction.memorySize = 8192;

backend.generateTintFunction.resources.lambda.addToRolePolicy(
	new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ["bedrock:InvokeModel"],
		resources: [`arn:aws:bedrock:*::foundation-model/${MODEL_ID}`],
	})
);
