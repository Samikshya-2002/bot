const OpenAI = require("openai").default; // Ensure correct import
const fs = require("fs");
const path = require("path");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 1. Upload and process the company info file
async function uploadAndProcessFile(filePath,assistantId) {
  

  // Log the current working directory
  console.log("Current working directory:", process.cwd());
  
  // Log the file path
  console.log("Checking file at path:", filePath);

  // Read the file to ensure it exists before uploading
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  else {
    console.log(`File exists at the specified path. ${filePath}`)  // Add this line for debugging
  }

  // Check if the file is readable
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    console.log(`File is readable: ${filePath}`);
  } catch (error) {
    console.error(`File is not readable: ${filePath}`, error.message);
  }
 
try {
  
  const fileStream = fs.createReadStream(filePath);
  // Check the file stream for readiness
 fileStream.on('error', (err) => {
  console.error('Error reading the file stream:', err.message);
});

fileStream.on('open', async () => {
  console.log('File stream opened, proceeding with the upload...');
});

  const fileResponse = await openai.files.create({
    file: fileStream,
    purpose: "assistants", // Adjust purpose if necessary
  });
  const fileId = fileResponse.id;
  console.log(`File uploaded successfully with ID: ${fileId}`);
  

  // Create a vector store for the uploaded file
  const vectorStoreResponse = await openai.beta.vectorStores.create({
    name: "Company Info Store",
  });

  console.log("vector store response",vectorStoreResponse)

  // Upload the file to the vector store and poll for processing
  const fileBatchResponse = await openai.beta.vectorStores.fileBatches.createAndPoll(
    vectorStoreResponse.id,
    {file_ids:[fileId]}
    
  );
  console.log("THE")

//update the assistant with the vector store
  await openai.beta.assistants.update(assistantId, {
    tool_resources: { file_search: { vector_store_ids: [vectorStoreResponse.id] } },
  });

  
  console.log(`Vector Store created with ID: ${vectorStoreResponse.id}`);

  console.log(`File ${filePath} uploaded and stored in vector store ID: ${vectorStoreResponse.id}`);
  
} catch (error) {
  console.error(`Error in the uploading file: ${error.message}`);
}
}

// 2. Search through files using file search
async function searchFiles(query, assistantId, threadId) {
  try {
    const searchResponse = await openai.beta.assistants.search({
      // const searchResponse = await openai.beta.threads.runs.tools.create({
      assistant_id: assistantId,
      thread_id: threadId,
      query: query,
      tool: "file_search",
    });
    console.log('File search results:', searchResponse.results);

    return searchResponse.results;
  } catch (error) {
    console.error(`Error searching files: ${error.message}`);
    return [];
  }
}

module.exports = {
  uploadAndProcessFile,
  searchFiles,
};
