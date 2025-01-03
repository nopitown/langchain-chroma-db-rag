# LangChain + ChromaDB Experiment

My playground project for learning how to use LangChain with ChromaDB. This is mainly for educational purposes and experimenting with vector databases.

## What's Inside 🔍

- Basic document processing with LangChain
- Playing around with ChromaDB as a vector store
- Some web scraping stuff
- Docker setup (because who wants to install everything locally?)

## If You Want to Try It 🛠️

You'll need:
- Node.js (v18+)
- Docker + Docker Compose
- Some TypeScript knowledge

## Quick Start

1. Get the code:
```bash
git clone <your-repo-url>
cd langchain-chroma-db
```

2. Install stuff:
```bash
npm install
```

3. Set up your env:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Fire up ChromaDB:
```bash
docker-compose up -d
```

## Running Things 🏃‍♂️

Build it:
```bash
npm run build
```

Ingest some docs:
```bash
npm run ingest
```

Run it:
```bash
npm start
```

## Project Structure

```
├── src/
│   ├── index.ts        # Main stuff
│   ├── ingest.ts       # Document processing
│   └── scraper.ts      # Web scraping
├── data/               # Where the docs live
├── docker-compose.yml  # Docker config
└── .env               # Your settings
```

Feel free to mess around with the code and learn from it! 🧪 