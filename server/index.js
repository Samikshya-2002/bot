require('dotenv').config();
const express = require('express');
const cors = require("cors");
const { initializeAssistant, callGroqAssistant, callOpenAIAssistant, useOpenAI } = require('./assistant/assistant.js');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize the assistant on server start if using OpenAI
if (useOpenAI) {
  initializeAssistant().catch(console.error);
}

// 2. Handle User Queries
app.post("/chat", async (req, res) => {
  const { query } = req.body;
  console.log('Received request:', req.body);

  try {
    if (useOpenAI) {
      // Handle OpenAI chat logic
      const assistantReply = await callOpenAIAssistant(query);
      res.status(200).send({ reply: assistantReply });
    } else {
      // Handle Groq chat logic
      const groqResponse = await callGroqAssistant(query);
      res.status(200).json({ response: groqResponse });
    }
  } catch (error) {
    console.error(`Error handling index.js chat: ${error.message}`);
    res.status(500).send({ error: "Error processing request." });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
