import { ChromaClient } from 'chromadb';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.CHROMA_URL) {
  throw new Error('CHROMA_URL environment variable is not set');
}

async function loadDocuments(): Promise<Document[]> {
  const content = JSON.parse(
    await fs.readFile(
      path.join(process.cwd(), 'data', 'scraped_content.json'),
      'utf-8'
    )
  );

  // Create text splitter instance
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  // Convert content to Documents first
  const docs = content.map((text: string, index: number) => {
    return new Document({
      pageContent: text,
      metadata: { source: 'nopitown.com', id: `doc-${index}` }
    });
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
    const client = new ChromaClient({ path: process.env.CHROMA_URL });
    const embeddings = new OpenAIEmbeddings();
    await client.deleteCollection({ name: "eli_manrique_info" });
    
    // Create or get collection
    const collection = await client.getOrCreateCollection({
      name: "eli_manrique_info",
      metadata: { description: "Information about Eli Manrique from nopitown.com" }
    });

    const documents = await loadDocuments();

    console.log(`Processing ${documents.length} chunks...`);

    // Generate embeddings for all documents at once
    const embeddings_array = await Promise.all(
      documents.map(doc => embeddings.embedQuery(doc.pageContent))
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