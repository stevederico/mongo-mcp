## Mongo MCP Server

An MCP (Model Context Protocol) server for interacting with MongoDB. Provides tools for querying and inserting documents into a MongoDB database via STDIO transport.

## Features

- MongoDB Query Tool: Query collections with customizable limits.
- MongoDB Insert Tool: Insert documents into collections.
- STDIO Transport: Compatible with MCP clients over standard input/output.

## Prerequisites

- Node.js: v18+ (with ES module support).
- MongoDB: A running instance (local or remote).
- npm: For dependency management.

## Installation

1. Clone the repository:
   
   ```shell
   git clone https://github.com/stevederico/mongo-mcp.git
   ```
   
   ```shell
   cd mongo-mcp
   ```

3. Install dependencies:
   
   ```shell
   npm install
   ```

5. Configure environment variables:
   - Create a .env file in the root directory:
     MONGO_URL=mongodb://localhost:27017
     DB_NAME=myDatabase
   - Replace mongodb://localhost:27017 with your MongoDB connection string and myDatabase with your database name.

## Usage

1. Start the server:

   ```shell
   npm start
   ```
   The server will connect to MongoDB and listen for MCP commands via STDIO.

3. Interact with the server using an MCP client (e.g., via STDIO):
   - Query Example:
     {
       "tool": "mongo_query",
       "args": {
         "collection": "users",
         "query": "{\"name\": \"Alice\"}",
         "limit": 5
       }
     }
   - Insert Example:
     {
       "tool": "mongo_insert",
       "args": {
         "collection": "users",
         "document": "{\"name\": \"Bob\", \"age\": 30}"
       }
     }

## Tools

- mongo_query:
  - Args:
    - collection (string): Target collection name.
    - query (string): JSON-stringified MongoDB query.
    - limit (number, optional): Max results (default: 10).
  - Returns: Array of matching documents as JSON.

- mongo_insert:
  - Args:
    - collection (string): Target collection name.
    - document (string | object): JSON-stringified or raw document to insert.
  - Returns: Inserted document ID.

## Configuration
 ```shell
{
  "mcpServers": {
    "mongo-mcp": {
      "command": "node",
      "args": [
        "/mongo-mcp/index.js"
      ],
      "env": {
        "MONGO_URL": "mongodb://localhost:27017",
        "DB_NAME": "mongomcp"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

- Environment Variables:
  - MONGO_URL: MongoDB connection URI (e.g., mongodb://localhost:27017).
  - DB_NAME: Database name.
- Set these in .env or via system environment variables:
  ```shell
  export MONGO_URL="mongodb://localhost:27017"
  ```
  ```shell
  export DB_NAME="myDatabase"
  ```
  ```shell
  npm start
  ```

## Development

- Run in dev mode:
  ```shell
  npm run dev
  ```
- Modify server.js to add more tools or adjust behavior.

## Dependencies

- @modelcontextprotocol/sdk: MCP server framework.
- mongodb: MongoDB driver for Node.js.
- zod: Schema validation for tool arguments.

## License

MIT License. See LICENSE for details.

## Contributing

Pull requests welcome! Open an issue to discuss changes first.
