import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.CHROMA_DB_URL) {
  throw new Error('CHROMA_DB_URL environment variable is not set');
}

async function loadDocuments(): Promise<Document[]> {
  const content = JSON.parse(
    await fs.readFile(
      path.join(process.cwd(), 'data', 'scraped_content.json'),
      'utf-8'
    )
  );

  // Convert content to Documents first
  const docs = content.map((text: string, index: number) => {
    return new Document({
      pageContent: text,
      metadata: { source: 'nopitown.com', id: `doc-${index}` }
    });
  });

    // Create text splitter instance
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

  // Split documents into chunks
  const splitDocs = await textSplitter.splitDocuments(docs);
  
  // Reassign IDs to ensure uniqueness across all chunks
  return splitDocs.map((doc, index) => {
    doc.metadata.id = `doc-${index}`;
    return doc;
  });
}

async function main() {
  try {
    const client = new ChromaClient({ path: process.env.CHROMA_DB_URL });
    const embeddings = new OpenAIEmbeddings();
    const embeddingFunction = new OpenAIEmbeddingFunction({
      openai_api_key: process.env.OPENAI_API_KEY || "",
    });

    // Remove existing collection if it exists
    try {
      const existingCollection = await client.getCollection({ name: "documents", embeddingFunction});

      if (existingCollection) {
        await client.deleteCollection({ name: "documents" });
        console.log("Existing collection deleted");
      }
    } catch (error) {
      console.log("Collection does not exist, creating new one");
    }

    
    // Create or get collection
    const collection = await client.getOrCreateCollection({
      name: "documents",
      metadata: { description: `Information about Foo developer from ${process.env.WEB_URL}` }
    });

    const documents = await loadDocuments();

    console.log(`Processing ${documents.length} chunks...`);

    // Generate embeddings for all documents at once
    const embeddings_array = await embeddings.embedDocuments(
      documents.map(doc => doc.pageContent)
    );

    // Add all documents to collection in one batch
    await collection.add({
      ids: documents.map(doc => doc.metadata.id),
      embeddings: embeddings_array,
      metadatas: documents.map(doc => doc.metadata),
      documents: documents.map(doc => doc.pageContent)
    });

    console.log(`Content ingested successfully! Processed ${documents.length} chunks.`);
  } catch (error) {
    console.error('Error ingesting content:', error);
  }
}

main(); 