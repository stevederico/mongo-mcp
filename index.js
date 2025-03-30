import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MongoClient } from "mongodb";

// MongoDB connection URI - update this with your actual connection string
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let db;

const databaseName = "MY_DATABASE_NAME"

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    db = client.db(databaseName);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
connectToMongo();

// Ensure MongoDB connection is closed on app termination
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});

const server = new McpServer({
  name: "mongo-mcp",
  version: "1.0.0"
});

const toolHandlers = new Map();

// Add MongoDB query tool
toolHandlers.set(
  "mongo_query",
  async ({ collection, query, limit = 10 }) => {
    try {
      if (!db) {
        return { content: [{ type: "text", text: "Database not connected" }] };
      }
      
      const coll = db.collection(collection);
      const results = await coll.find(JSON.parse(query)).limit(limit).toArray();
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(results, null, 2)
        }]
      };
    } catch (err) {
      return {
        content: [{ 
          type: "text", 
          text: `Error executing MongoDB query: ${err.message}`
        }]
      };
    }
  }
);

// Add MongoDB insert tool
toolHandlers.set(
  "mongo_insert",
  async ({ collection, document }) => {
    try {
      if (!db) {
        return { content: [{ type: "text", text: "Database not connected" }] };
      }
      
      const coll = db.collection(collection);
      const doc = typeof document === 'string' ? JSON.parse(document) : document;
      const result = await coll.insertOne(doc);
      
      return {
        content: [{ 
          type: "text", 
          text: `Document inserted with ID: ${result.insertedId}`
        }]
      };
    } catch (err) {
      return {
        content: [{ 
          type: "text", 
          text: `Error inserting document: ${err.message}`
        }]
      };
    }
  }
);

// Register all tools


server.tool(
  "mongo_query", 
  { 
    collection: z.string(), 
    query: z.string(), 
    limit: z.number().optional()
  }, 
  toolHandlers.get("mongo_query")
);
server.tool(
  "mongo_insert", 
  { 
    collection: z.string(), 
    document: z.union([z.string(), z.record(z.any())])
  }, 
  toolHandlers.get("mongo_insert")
);

// Setup STDIO transport and connect
const transport = new StdioServerTransport();
await server.connect(transport);
console.log("✅ MCP Server ready with STDIO transport");