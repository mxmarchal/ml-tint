import {
	type ClientSchema,
	a,
	defineData,
	defineFunction,
} from "@aws-amplify/backend";

export const MODEL_ID = "amazon.titan-image-generator-v2:0";

export const getLabelsFunction = defineFunction({
	entry: "./getLabels.ts",
});

export const generateTintFunction = defineFunction({
	entry: "./generateTint.ts",
	environment: {
		MODEL_ID,
	},
});

const schema = a.schema({
	getLabels: a
		.query()
		.arguments({
			image: a.string().required(),
			filterConfidence: a.float(),
		})
		.returns(a.json())
		.authorization((allow) => [allow.publicApiKey()])
		.handler(a.handler.function(getLabelsFunction)),
	generateTint: a
		.query()
		.arguments({
			image: a.string().required(),
			width: a.float().required(),
			height: a.float().required(),
			prompt: a.string().required(),
			negativeText: a.string().required(),
			maskPrompt: a.string(),
			maskImage: a.string(),
			seed: a.integer(),
			cfgScale: a.integer(),
		})
		.returns(a.string())
		.authorization((allow) => [allow.publicApiKey()])
		.handler(a.handler.function(generateTintFunction)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
	schema,
	authorizationModes: {
		defaultAuthorizationMode: "apiKey",
		apiKeyAuthorizationMode: {
			expiresInDays: 30,
		},
	},
});
