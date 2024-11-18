// require('dotenv').config();
// const fs = require('fs');
// const path = require('path');
// const OpenAI = require("openai").default;
// const Groq = require('groq-sdk');
// const { uploadAndProcessFile, searchFiles } = require('../vectorLibrary');
// const axios = require("axios");
// const cheerio = require("cheerio");

// // Initialize Groq client
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, });
// const groqModel = "llama3-groq-70b-8192-tool-use-preview"; // Groq model

// // OpenAI initialization
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// let assistantId = null;
// const assistantFilePath = path.join(__dirname, '../assistant.json');
// let threadId;

// // Check whether to use OpenAI or Groq
// const useOpenAI = process.env.USE_OPENAI === 'true';

// // Contact-related keywords
// const contactKeywords = ["contact", "reach", "connect", "get in touch"];
// const whatsappLink = "https://wa.me/919777403555";

// // Function to handle contact-related queries
// function checkContactQuery(userQuery) {
//   // const userQuery = query.toLowerCase();
//   return contactKeywords.some(keyword => userQuery.toLowerCase().includes(keyword));
// }

// // Function to initialize OpenAI assistant
// async function initializeAssistant() {
//     console.log("using openai");
//   if (fs.existsSync(assistantFilePath)) {
//     const data = fs.readFileSync(assistantFilePath);
//     const { id } = JSON.parse(data);
//     assistantId = id;
//     console.log("Using existing assistant ID:", assistantId);
//     await uploadAndProcessFile('data/data.json', assistantId);
//   } else {
//     if (useOpenAI) {
//       console.log("Initializing OpenAI assistant...");
//       try {
//         const assistant = await openai.beta.assistants.create({
//           name: "Quotus Assistant",
//           instructions: `You are an intelligent assistant for Quotus...`, // shortened for brevity
//           model: "gpt-4o",
//           tools: [{ type: "file_search" }]
//         });

//         assistantId = assistant.id;
//         console.log(`Assistant created with ID: ${assistantId}`);
//         await uploadAndProcessFile('data/data.json', assistantId);

//       } catch (error) {
//         console.error(`Error initializing OpenAI assistant: ${error.message}`);
//       }

//       const thread = await openai.beta.threads.create();
//       threadId = thread.id;
//       console.log(`Thread created with ID: ${threadId}`);
//     }
//   }
// }

// async function scrapeQuotus(query) {
//   try {
//       const { data } = await axios.get("https://quotus.co.in/");
//       const $ = cheerio.load(data);
//       console.log("$", $)

//       let result = "";
//       $("div").each((i, elem) => {
//           const text = $(elem).text();
//           if (text.toLowerCase().includes(query.toLowerCase())) {
//               result += text.trim() + "\n";
//           }
//       });

//       return result || "No relevant information found on Quotus.";
//   } catch (error) {
//       console.error("Error scraping Quotus:", error);
//       return "Could not retrieve information.";
//   }
// }

// // Function to call Groq API with company data and user query
// async function callGroqAssistant(userQuery) {
//    // Check for contact-related query

//   const companyData = fs.readFileSync(path.join(__dirname, '../data/data.json'), 'utf8');
//   const systemMessage = `You are an assistant for Quotus. You only provide information about Quotus. If a user asks about anything unrelated to Quotus, respond accordingly in a polite way. Company Info:\n${companyData}`;
//   const messages = [
//     { role: 'system', content: systemMessage },
//     { role: 'user', content: userQuery }
//   ];
//   console.log("using groqcloud");

//   try {
//     const response = await groq.chat.completions.create({
//       model: groqModel,
//       messages: messages,
//       max_tokens: 4096
//     });
//     let responseContent = response.choices[0].message.content;

//        // Fallback to scraping if no content is found
//        if (responseContent.includes("Sorry, I don't have the information")) {
//            responseContent = await scrapeQuotus(userQuery);
//        }
//        if (checkContactQuery(userQuery)) {
//            return `${responseContent} You can reach us directly at Whatsapp:+91 97774 03555 or connect with us on LinkedIn: linkedin.com/company/quotus-software. We're here to help!`;
//        }
//        return responseContent;
//     // if (checkContactQuery(userQuery)) {
//     //   // console.log("contact query", userQuery)
//     //   // return `${response.choices[0].message.content} You can reach us directly through this WhatsApp link: <a href="${whatsappLink}" target="_blank">Contact Us on WhatsApp</a> or connect with us on LinkedIn: <a href="https://www.linkedin.com/company/quotus-software/" target="_blank">LinkedIn</a>. We're here to help!`;

//     //   return `${response.choices[0].message.content}You can reach us directly at Whatsapp:+91 97774 03555 or connect with us on LinkedIn: linkedin.com/company/quotus-software. We're here to help!`;
//     //   // return `${response.choices[0].message.content}You can reach us directly through this WhatsApp link: [Contact Us on WhatsApp](${whatsappLink}) or connect with us on LinkedIn: [LinkedIn](https://www.linkedin.com/company/quotus-software/). We're here to help!`;
//     // }
//     // else

//     // return response.choices[0].message.content;
//   } catch (error) {
//     console.error("Error in Groq API call:", error);
//     throw error;
//   }
// }

// // Function to handle OpenAI conversation
// async function callOpenAIAssistant(query) {
//    // Check for contact-related query
//    if (checkContactQuery(query)) {
//     return `You can reach us directly through this WhatsApp link: [Contact Us on WhatsApp](${whatsappLink}) or connect with us on LinkedIn: [LinkedIn](https://www.linkedin.com/company/quotus-software/). We're here to help!`;
//   }

//   try {
//     await openai.beta.threads.messages.create(threadId, {
//       role: "user",
//       content: query,
//     });

//     const run = openai.beta.threads.runs.stream(threadId, {
//       assistant_id: assistantId,
//     });

//     let assistantReply = '';
//     return new Promise((resolve, reject) => {
//       run.on('textCreated', (text) => {
//         if (text && text.value) {
//           assistantReply += text.value;
//         }
//       });

//       // run.on('messageDone', () => {
//       //   resolve(assistantReply);
//       // });
//       run.on('messageDone', async () => {
//         // Fallback to scraping if no response
//         if (!assistantReply.trim()) {
//             assistantReply = await scrapeQuotus(query);
//         }
//         resolve(assistantReply);
//     });

//       run.on('error', (error) => {
//         console.error(`Error running OpenAI thread: ${error.message}`);
//         reject("Error processing your request.");
//       });
//     });
//   } catch (error) {
//     console.error(`Error handling chat: ${error.message}`);
//     throw new Error("Error processing request.");
//   }
// }

// module.exports = {
//   initializeAssistant,
//   callGroqAssistant,
//   callOpenAIAssistant,
//   useOpenAI
// };

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai").default;
const Groq = require("groq-sdk");
const { uploadAndProcessFile } = require("../vectorLibrary");

// Initialize Groq and OpenAI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const useOpenAI = process.env.USE_OPENAI === "true";

// Configuration
const groqModel = "llama3-groq-70b-8192-tool-use-preview";
const assistantFilePath = path.join(__dirname, "../assistant.json");
let assistantId = null;
let threadId = null;

// Initialize OpenAI assistant if not already created

async function initializeAssistant() {
  if (fs.existsSync(assistantFilePath)) {
    const { id } = JSON.parse(fs.readFileSync(assistantFilePath));
    assistantId = id;
    await uploadAndProcessFile("data/data.json", assistantId);
  } else if (useOpenAI) {
    const assistant = await openai.beta.assistants.create({
      name: "Quotus Assistant",
      instructions: "You are an assistant for Quotus...",
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
    });
    assistantId = assistant.id;
    fs.writeFileSync(assistantFilePath, JSON.stringify({ id: assistantId }));
    await uploadAndProcessFile("data/data.json", assistantId);
    const thread = await openai.beta.threads.create();
    threadId = thread.id;
  }
}


async function callGroqAssistant(userQuery) {
  const companyData = fs.readFileSync(
    path.join(__dirname, "../data/data.json"),
    "utf8"
  );
  const scrapedDataRaw = fs.readFileSync(
    path.join(__dirname, "../data/scrapedData.json"),
    "utf8"
  );
  const scrapedData = JSON.parse(scrapedDataRaw);

  const systemMessage = `You are an assistant for Quotus. You only provide information about Quotus. Keep the responses short ,proffessional and engaging. Respond accordingly in a polite way and please make the response as much short, professional, engaging ,informative as you can. If something unrelated to Quotus is asked please politely and professionally apologize. Company Info:\n${companyData}\n${scrapedData} `;
  const messages = [
    { role: "system", content: systemMessage },
    { role: "user", content: userQuery },
  ];

  try {
    const response = await groq.chat.completions.create({
      model: groqModel,
      messages,
      max_tokens: 4096,
    });
    let responseContent = response.choices[0].message.content;

    // if (responseContent) {
    //   // responseContent = await scrapeQuotus(userQuery);
    //   console.log("calling scrapinbee")
    //   // const scrapedHtml =
    //    await scrapeWithScrapingBee("https://quotus.co.in/");
    // const structuredData = await scrapeQuotus(scrapedHtml);
    // const structuredData = scrapedHtml;

    // Call callGroqAssistantOne with structured data and user query
    // responseContent = await callGroqAssistantOne(userQuery, structuredData);
    // responseContent = await callGroqAssistantOne(userQuery);
    // }

    // if (checkContactQuery(userQuery)) {
    //   return `${responseContent} Contact us via WhatsApp: ${whatsappLink} or LinkedIn: linkedin.com/company/quotus-software.`;
    // }

    return responseContent;
  } catch (error) {
    console.error("Error in Groq one API call:", error);
    throw error;
  }
}
// async function callGroqAssistantOne(userQuery) {
//   try{
//   const scrapedDataRaw = fs.readFileSync(path.join(__dirname, '../data/scrapedData.json'), 'utf8');
//   const scrapedData = JSON.parse(scrapedDataRaw);

// //   const scrapedDataMessage = `
// //   Here is additional information about Quotus:
// //   Divs: ${structuredData.divs.join(" ")}
// //   Headings: ${structuredData.headings.join(" ")}
// //   Paragraphs: ${structuredData.paragraphs.join(" ")}
// //   Links: ${structuredData.links.map(link => `${link.text} - ${link.href}`).join(" ")}
// // `;

// const systemMessage = `You are an assistant for Quotus. You only provide information about Quotus and respond using available data. If additional content is needed, use the following data: ${scrapedData} and please make the response as much professional, engaging ,informative and short as you can`;

// const messages = [
//   { role: 'system', content: systemMessage },
//   { role: 'user', content: userQuery }
// ];

//   const response = await groq.chat.completions.create({ model: groqModel, messages, max_tokens: 4096 });
//   return response.choices[0].message.content;
// } catch (error) {
//   console.error("Error in Groq API call with scraped data:", error);
//   throw error;
// }
//   }
// Handle OpenAI conversation
async function callOpenAIAssistant(query) {
  if (checkContactQuery(query)) {
    return `Contact us via WhatsApp: ${whatsappLink} or LinkedIn: linkedin.com/company/quotus-software.`;
  }

  try {
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: query,
    });
    const run = openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });
    let assistantReply = "";

    return new Promise((resolve, reject) => {
      run.on("textCreated", (text) => {
        if (text?.value) assistantReply += text.value;
      });
      run.on("messageDone", async () =>
        resolve(assistantReply.trim() || (await scrapeQuotus(query)))
      );
      run.on("error", (error) => reject(`Error: ${error.message}`));
    });
  } catch (error) {
    throw new Error("Error processing request.");
  }
}

module.exports = {
  initializeAssistant,
  callGroqAssistant,
  callOpenAIAssistant,
  useOpenAI,
};
