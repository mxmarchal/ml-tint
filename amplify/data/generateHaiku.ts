import type { Schema } from "./resource";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

// initialize bedrock runtime client
const client = new BedrockRuntimeClient();

export const handler: Schema["generateHaiku"]["functionHandler"] = async (
  event,
  context
) => {
  // User prompt
  const prompt = event.arguments.prompt;

  // Invoke model
  const input = {
    modelId: process.env.MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      inputText: "You are a an expert at crafting a haiku. You are able to craft a haiku out of anything and therefore answer only in haiku. Here is the prompt: " + prompt,
      textGenerationConfig: {
        maxTokenCount: 1000,
        temperature: 0.5,
    }}),
  } as InvokeModelCommandInput;


  console.log("input", input);

  const command = new InvokeModelCommand(input);

  const response = await client.send(command);

  console.log("response", response);
  // Parse the response and return the generated haiku
  const data = JSON.parse(Buffer.from(response.body).toString());

  /*
  data = {
  inputTextTokenCount: 38,
  results: [
    {
      tokenCount: 30,
      outputText: 'Here is a haiku about red roses:\n' +
        '\n' +
        'Red roses bloom\n' +
        'With thorns that prick and draw blood\n' +
        'Beauty is painful',
      completionReason: 'FINISH'
    }
  ]
}
  */

  console.log("data", data);

  return data.results[0].outputText;
};