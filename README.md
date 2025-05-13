# spaceship.dev-unofficial MCP Server

An unofficial MCP server for interacting with the Spaceship.dev domain management API

This is a TypeScript-based MCP server that provides access to the Spaceship.dev domain management API. It demonstrates core MCP concepts by providing:

- Resources representing domains with URIs and metadata
- Tools for domain management, DNS records, contacts, and more
- Error handling and asynchronous operation monitoring

## Features

### Resources
- List and access domains via `spaceship://domains/{domain}` URIs
- Each domain has information about status, expiration, and other metadata
- JSON mime type for structured data access

### Tools
- `get_domains` - Get a list of domains
  - Takes optional `take` and `skip` parameters for pagination
  - Returns domain information in JSON format

- `check_domain_availability` - Check if a domain is available for registration
  - Takes a `domain` parameter
  - Returns availability status and pricing information

- `get_domain_info` - Get detailed information about a domain
  - Takes a `domain` parameter
  - Returns comprehensive domain information

- `register_domain` - Register a new domain
  - Takes `domain` and `contactId` parameters
  - Returns an operation ID for tracking the asynchronous registration process

- `get_dns_records` - Get DNS records for a domain
  - Takes a `domain` parameter
  - Returns all DNS records associated with the domain

- `get_contact` - Get contact information
  - Takes a `contactId` parameter
  - Returns contact details

- `get_async_operation` - Get status of an asynchronous operation
  - Takes an `operationId` parameter
  - Returns the current status and result of the operation

## Configuration

The server requires the following environment variables:

- `SPACESHIP_API_KEY` - Your Spaceship.dev API key
- `SPACESHIP_API_SECRET` - Your Spaceship.dev API secret
- `SPACESHIP_API_URL` (optional) - The Spaceship.dev API URL (defaults to https://api.spaceship.com)

You can obtain your API key and secret from the [Spaceship.dev API Manager](https://www.spaceship.com/application/api-manager/).

## Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "spaceship.dev-unofficial": {
      "command": "/path/to/spaceship.dev-unofficial/build/index.js",
      "env": {
        "SPACESHIP_API_KEY": "your-api-key",
        "SPACESHIP_API_SECRET": "your-api-secret"
      }
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

## Usage Examples

Here are some examples of how to use the Spaceship.dev MCP server with Claude:

### Checking Domain Availability

```
Can you check if example.com is available for registration using the spaceship.dev-unofficial MCP server?
```

### Getting Domain Information

```
Please get information about my domain example.com using the spaceship.dev-unofficial MCP server.
```

### Listing DNS Records

```
Show me the DNS records for example.com using the spaceship.dev-unofficial MCP server.
```

## Limitations

This is an unofficial implementation of the Spaceship.dev API and may not support all features. It is provided as-is without warranty.

## License

MIT
