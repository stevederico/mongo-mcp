import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";

// Parse .env file manually
function loadEnv() {
  try {
    const envContent = readFileSync(".env", "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const idx = trimmed.indexOf("=");
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (key) {
        process.env[key] = value;
      }
    });
  } catch (err) {
    console.error("No .env file found, relying on system environment variables");
  }
}
loadEnv();

const connectionURL = process.env.MONGO_URL;
const databaseName = process.env.DB_NAME;

if (!connectionURL || !databaseName) {
  console.error("Error: MONGO_URL and DB_NAME must be set in .env or system environment");
  console.error("Example .env:");
  console.error("MONGO_URL=mongodb://localhost:27017");
  console.error("DB_NAME=myDatabaseName");
  process.exit(1);
}

const client = new MongoClient(connectionURL);
let db;

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    db = client.db(databaseName);
    console.error("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

// Graceful shutdown on SIGINT and SIGTERM
async function shutdown() {
  await client.close();
  console.error("MongoDB connection closed");
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const server = new McpServer({
  name: "mongo-mcp",
  version: "1.2.0",
});

// --- Tool: mongo_query ---
server.tool(
  "mongo_query",
  "Run a find query against a MongoDB collection. Returns matching documents as JSON.",
  { collection: z.string(), query: z.string(), limit: z.number().optional() },
  async ({ collection, query, limit = 10 }) => {
    try {
      if (!db) {
        return { content: [{ type: "text", text: "Database not connected" }] };
      }
      const results = await db.collection(collection).find(JSON.parse(query)).limit(limit).toArray();
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error executing MongoDB query: ${err.message}` }],
      };
    }
  }
);

// --- Tool: mongo_insert ---
server.tool(
  "mongo_insert",
  "Insert a single document into a MongoDB collection. Returns the inserted document ID.",
  { collection: z.string(), document: z.union([z.string(), z.record(z.any())]) },
  async ({ collection, document }) => {
    try {
      if (!db) {
        return { content: [{ type: "text", text: "Database not connected" }] };
      }
      const doc = typeof document === "string" ? JSON.parse(document) : document;
      const result = await db.collection(collection).insertOne(doc);
      return {
        content: [{ type: "text", text: `Document inserted with ID: ${result.insertedId}` }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error inserting document: ${err.message}` }],
      };
    }
  }
);

// --- Tool: mongo_update ---
server.tool(
  "mongo_update",
  "Update documents in a MongoDB collection matching a filter. Returns the count of modified documents.",
  {
    collection: z.string(),
    filter: z.string(),
    update: z.string(),
  },
  async ({ collection, filter, update }) => {
    try {
      if (!db) {
        return { content: [{ type: "text", text: "Database not connected" }] };
      }
      const result = await db
        .collection(collection)
        .updateMany(JSON.parse(filter), JSON.parse(update));
      return {
        content: [
          {
            type: "text",
            text: `Matched ${result.matchedCount}, modified ${result.modifiedCount} document(s)`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error updating documents: ${err.message}` }],
      };
    }
  }
);

// --- Tool: mongo_delete ---
server.tool(
  "mongo_delete",
  "Delete documents from a MongoDB collection matching a filter. Returns the count of deleted documents.",
  {
    collection: z.string(),
    filter: z.string(),
  },
  async ({ collection, filter }) => {
    try {
      if (!db) {
        return { content: [{ type: "text", text: "Database not connected" }] };
      }
      const result = await db.collection(collection).deleteMany(JSON.parse(filter));
      return {
        content: [{ type: "text", text: `Deleted ${result.deletedCount} document(s)` }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error deleting documents: ${err.message}` }],
      };
    }
  }
);

// --- Tool: mongo_aggregate ---
server.tool(
  "mongo_aggregate",
  "Run an aggregation pipeline on a MongoDB collection. Pass the pipeline as a JSON array of stages.",
  {
    collection: z.string(),
    pipeline: z.string(),
  },
  async ({ collection, pipeline }) => {
    try {
      if (!db) {
        return { content: [{ type: "text", text: "Database not connected" }] };
      }
      const results = await db
        .collection(collection)
        .aggregate(JSON.parse(pipeline))
        .toArray();
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error running aggregation: ${err.message}` }],
      };
    }
  }
);

// --- Tool: mongo_list_collections ---
server.tool(
  "mongo_list_collections",
  "List all collection names in the connected MongoDB database.",
  {},
  async () => {
    try {
      if (!db) {
        return { content: [{ type: "text", text: "Database not connected" }] };
      }
      const collections = await db.listCollections().toArray();
      const names = collections.map((c) => c.name);
      return {
        content: [{ type: "text", text: JSON.stringify(names, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error listing collections: ${err.message}` }],
      };
    }
  }
);

// --- Tool: mongo_count ---
server.tool(
  "mongo_count",
  "Count documents in a MongoDB collection matching an optional filter.",
  {
    collection: z.string(),
    filter: z.string().optional(),
  },
  async ({ collection, filter }) => {
    try {
      if (!db) {
        return { content: [{ type: "text", text: "Database not connected" }] };
      }
      const parsedFilter = filter ? JSON.parse(filter) : {};
      const count = await db.collection(collection).countDocuments(parsedFilter);
      return {
        content: [{ type: "text", text: `Count: ${count}` }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error counting documents: ${err.message}` }],
      };
    }
  }
);

// Wait for MongoDB, then start MCP server
await connectToMongo();
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("MCP Server ready with STDIO transport");
