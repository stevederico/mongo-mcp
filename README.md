## Mongo MCP Server

An MCP (Model Context Protocol) server for interacting with MongoDB. Provides tools for querying, inserting, updating, deleting, and aggregating documents via STDIO transport.

## Features

- **Query** documents with customizable filters and limits
- **Insert** single documents into collections
- **Update** documents matching a filter
- **Delete** documents matching a filter
- **Aggregate** with full pipeline support
- **List** all collections in the database
- **Count** documents with optional filters
- STDIO Transport compatible with MCP clients

## Prerequisites

- Node.js v18+
- MongoDB instance (local or remote)

## Installation

1. Clone the repository:

   ```shell
   git clone https://github.com/stevederico/mongo-mcp.git
   cd mongo-mcp
   ```

2. Install dependencies:

   ```shell
   npm install
   ```

3. Configure environment variables — create a `.env` file in the root directory:

   ```
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=myDatabase
   ```

## Configuration

Add to your MCP client config (e.g. Claude Desktop):

```json
{
  "mcpServers": {
    "mongo-mcp": {
      "command": "node",
      "args": ["/path/to/mongo-mcp/index.js"],
      "env": {
        "MONGO_URL": "mongodb://localhost:27017",
        "DB_NAME": "myDatabase"
      }
    }
  }
}
```

## Tools

### mongo_query

Run a find query against a collection.

| Arg | Type | Required | Description |
|-----|------|----------|-------------|
| `collection` | string | yes | Target collection name |
| `query` | string | yes | JSON-stringified MongoDB query |
| `limit` | number | no | Max results (default: 10) |

### mongo_insert

Insert a single document into a collection.

| Arg | Type | Required | Description |
|-----|------|----------|-------------|
| `collection` | string | yes | Target collection name |
| `document` | string \| object | yes | Document to insert (JSON string or object) |

### mongo_update

Update documents matching a filter.

| Arg | Type | Required | Description |
|-----|------|----------|-------------|
| `collection` | string | yes | Target collection name |
| `filter` | string | yes | JSON-stringified filter |
| `update` | string | yes | JSON-stringified update operation |

### mongo_delete

Delete documents matching a filter.

| Arg | Type | Required | Description |
|-----|------|----------|-------------|
| `collection` | string | yes | Target collection name |
| `filter` | string | yes | JSON-stringified filter |

### mongo_aggregate

Run an aggregation pipeline on a collection.

| Arg | Type | Required | Description |
|-----|------|----------|-------------|
| `collection` | string | yes | Target collection name |
| `pipeline` | string | yes | JSON-stringified array of pipeline stages |

### mongo_list_collections

List all collection names in the connected database. No arguments.

### mongo_count

Count documents in a collection with an optional filter.

| Arg | Type | Required | Description |
|-----|------|----------|-------------|
| `collection` | string | yes | Target collection name |
| `filter` | string | no | JSON-stringified filter (default: all documents) |

## Dependencies

- `@modelcontextprotocol/sdk` — MCP server framework
- `mongodb` — MongoDB driver for Node.js
- `zod` — Schema validation for tool arguments

## License

MIT License. See LICENSE for details.

## Contributing

Pull requests welcome! Open an issue to discuss changes first.
