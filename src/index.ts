import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();

async function queryRAG(question: string) {
  const client = new ChromaClient({ path: process.env.CHROMA_DB_URL || ""});
  const embeddings = new OpenAIEmbeddings();
  const model = new ChatOpenAI({ modelName: 'gpt-4' });

  const embeddingFunction = new OpenAIEmbeddingFunction({
    openai_api_key: process.env.OPENAI_API_KEY || "",
  });

  // Get collection
  const collection = await client.getCollection({
    name: "documents",
    embeddingFunction,
  });

  // Generate embedding for the question
  const questionEmbedding = await embeddings.embedQuery(question);

  // Query similar documents
  const results = await collection.query({
    queryEmbeddings: [questionEmbedding],
    nResults: 3
  });

  // Construct prompt with context
  const context = results.documents?.[0]?.join('\n') || '';
  console.log('Context:', context);
  const prompt = `
    Based on the following context about Eli Manrique, please answer the question.
    
    Context:
    ${context}
    
    Question: ${question}
    
    Answer:`;

  // Get response from OpenAI
  const response = await model.invoke(prompt);
  return response.content;
}

// Example usage
async function main() {
  try {
    // Replace with your question
    const question = "What did Eli Manrique do in Able.co?";
    const answer = await queryRAG(question);
    
    console.log("\n"+'Answer:', answer);
  } catch (error) {
    console.error('Error querying RAG:', error);
  }
}

main(); 