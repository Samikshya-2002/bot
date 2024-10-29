require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require("openai").default;
const Groq = require('groq-sdk');
const { uploadAndProcessFile, searchFiles } = require('../vectorLibrary');

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, });
const groqModel = "llama3-groq-70b-8192-tool-use-preview"; // Groq model

// OpenAI initialization
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let assistantId = null;
const assistantFilePath = path.join(__dirname, '../assistant.json');
let threadId;

// Check whether to use OpenAI or Groq
const useOpenAI = process.env.USE_OPENAI === 'true';

// Function to initialize OpenAI assistant
async function initializeAssistant() {
    console.log("using openai");
  if (fs.existsSync(assistantFilePath)) {
    const data = fs.readFileSync(assistantFilePath);
    const { id } = JSON.parse(data);
    assistantId = id;
    console.log("Using existing assistant ID:", assistantId);
    await uploadAndProcessFile('data/data.json', assistantId);
  } else {
    if (useOpenAI) {
      console.log("Initializing OpenAI assistant...");
      try {
        const assistant = await openai.beta.assistants.create({
          name: "Quotus Assistant",
          instructions: `You are an intelligent assistant for Quotus...`, // shortened for brevity
          model: "gpt-4o",
          tools: [{ type: "file_search" }]
        });

        assistantId = assistant.id;
        console.log(`Assistant created with ID: ${assistantId}`);
        await uploadAndProcessFile('data/data.json', assistantId);

      } catch (error) {
        console.error(`Error initializing OpenAI assistant: ${error.message}`);
      }

      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      console.log(`Thread created with ID: ${threadId}`);
    }
  }
}

// Function to call Groq API with company data and user query
async function callGroqAssistant(userQuery) {
  const companyData = fs.readFileSync(path.join(__dirname, '../data/data.json'), 'utf8');
  const systemMessage = `You are an assistant for Quotus. You only provide information about Quotus. If a user asks about anything unrelated to Quotus, respond accordingly in a polite way. Company Info:\n${companyData}`;
  const messages = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: userQuery }
  ];
  console.log("using groqcloud");

  try {
    const response = await groq.chat.completions.create({
      model: groqModel,
      messages: messages,
      max_tokens: 4096
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error in Groq API call:", error);
    throw error;
  }
}

// Function to handle OpenAI conversation
async function callOpenAIAssistant(query) {
  try {
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: query,
    });

    const run = openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });

    let assistantReply = '';
    return new Promise((resolve, reject) => {
      run.on('textCreated', (text) => {
        if (text && text.value) {
          assistantReply += text.value;
        }
      });

      run.on('messageDone', () => {
        resolve(assistantReply);
      });

      run.on('error', (error) => {
        console.error(`Error running OpenAI thread: ${error.message}`);
        reject("Error processing your request.");
      });
    });
  } catch (error) {
    console.error(`Error handling chat: ${error.message}`);
    throw new Error("Error processing request.");
  }
}

module.exports = {
  initializeAssistant,
  callGroqAssistant,
  callOpenAIAssistant,
  useOpenAI
};
