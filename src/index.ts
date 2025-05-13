#!/usr/bin/env node

/**
 * Spaceship.dev API MCP Server
 * 
 * This MCP server provides tools and resources for interacting with the Spaceship.dev
 * domain management API. It allows users to:
 * - List domains
 * - Check domain availability
 * - Register domains
 * - Manage DNS records
 * - Manage contacts
 * - Monitor asynchronous operations
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";

/**
 * Configuration for the Spaceship API client
 */
interface SpaceshipConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
}

/**
 * Domain information type
 */
interface Domain {
  id: string;
  name: string;
  status: string;
  expiresAt: string;
  autoRenew: boolean;
}

/**
 * DNS Record type
 */
interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
}

/**
 * Contact information type
 */
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Spaceship API client class
 */
class SpaceshipClient {
  private axiosInstance: AxiosInstance;
  private config: SpaceshipConfig;

  constructor(config: SpaceshipConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'X-Api-Key': config.apiKey,
        'X-Api-Secret': config.apiSecret,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get a list of domains
   */
  async getDomains(take: number = 10, skip: number = 0): Promise<Domain[]> {
    try {
      const response = await this.axiosInstance.get('/domains', {
        params: { take, skip }
      });
      return response.data.domains;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Spaceship API error: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Check domain availability
   */
  async checkDomainAvailability(domain: string): Promise<{ available: boolean; price?: number }> {
    try {
      const response = await this.axiosInstance.get(`/domains/availability/${domain}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Spaceship API error: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get domain information
   */
  async getDomainInfo(domain: string): Promise<Domain> {
    try {
      const response = await this.axiosInstance.get(`/domains/${domain}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Spaceship API error: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Register a domain
   */
  async registerDomain(domain: string, contactId: string): Promise<{ operationId: string }> {
    try {
      const response = await this.axiosInstance.post('/domains', {
        domain,
        contactId,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Spaceship API error: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get DNS records for a domain
   */
  async getDnsRecords(domain: string): Promise<DnsRecord[]> {
    try {
      const response = await this.axiosInstance.get(`/domains/${domain}/dns`);
      return response.data.records;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Spaceship API error: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Update DNS records for a domain
   */
  async updateDnsRecords(domain: string, records: DnsRecord[]): Promise<{ operationId: string }> {
    try {
      const response = await this.axiosInstance.put(`/domains/${domain}/dns`, {
        records,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Spaceship API error: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get contact information
   */
  async getContact(contactId: string): Promise<Contact> {
    try {
      const response = await this.axiosInstance.get(`/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Spaceship API error: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get async operation status
   */
  async getAsyncOperation(operationId: string): Promise<{ status: string; result?: any }> {
    try {
      const response = await this.axiosInstance.get(`/operations/${operationId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Spaceship API error: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }
}

// Create a Spaceship API client
// Note: In a real implementation, these values would be provided via environment variables
const spaceshipClient = new SpaceshipClient({
  apiKey: process.env.SPACESHIP_API_KEY || '',
  apiSecret: process.env.SPACESHIP_API_SECRET || '',
  baseUrl: process.env.SPACESHIP_API_URL || 'https://api.spaceship.com',
});

// Create an MCP server
const server = new Server(
  {
    name: "spaceship.dev-unofficial",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * Handler for listing domains as resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const domains = await spaceshipClient.getDomains();
    
    return {
      resources: domains.map(domain => ({
        uri: `spaceship://domains/${domain.name}`,
        mimeType: "application/json",
        name: domain.name,
        description: `Domain: ${domain.name} (Status: ${domain.status}, Expires: ${domain.expiresAt})`,
      }))
    };
  } catch (error) {
    console.error("Error listing domains:", error);
    return { resources: [] };
  }
});

/**
 * Handler for reading domain information
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  
  // Handle different resource types
  if (url.protocol === 'spaceship:') {
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    if (pathParts[0] === 'domains') {
      const domainName = pathParts[1];
      
      try {
        const domainInfo = await spaceshipClient.getDomainInfo(domainName);
        
        return {
          contents: [{
            uri: request.params.uri,
            mimeType: "application/json",
            text: JSON.stringify(domainInfo, null, 2)
          }]
        };
      } catch (error) {
        console.error(`Error fetching domain info for ${domainName}:`, error);
        throw new McpError(ErrorCode.InvalidRequest, `Domain ${domainName} not found`);
      }
    }
  }
  
  throw new McpError(ErrorCode.InvalidRequest, `Unsupported resource URI: ${request.params.uri}`);
});

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_domains",
        description: "Get a list of domains",
        inputSchema: {
          type: "object",
          properties: {
            take: {
              type: "number",
              description: "Number of domains to retrieve (default: 10)",
            },
            skip: {
              type: "number",
              description: "Number of domains to skip (default: 0)",
            },
          },
        }
      },
      {
        name: "check_domain_availability",
        description: "Check if a domain is available for registration",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "Domain name to check",
            },
          },
          required: ["domain"]
        }
      },
      {
        name: "get_domain_info",
        description: "Get information about a domain",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "Domain name",
            },
          },
          required: ["domain"]
        }
      },
      {
        name: "register_domain",
        description: "Register a new domain",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "Domain name to register",
            },
            contactId: {
              type: "string",
              description: "Contact ID to use for registration",
            },
          },
          required: ["domain", "contactId"]
        }
      },
      {
        name: "get_dns_records",
        description: "Get DNS records for a domain",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "Domain name",
            },
          },
          required: ["domain"]
        }
      },
      {
        name: "get_contact",
        description: "Get contact information",
        inputSchema: {
          type: "object",
          properties: {
            contactId: {
              type: "string",
              description: "Contact ID",
            },
          },
          required: ["contactId"]
        }
      },
      {
        name: "get_async_operation",
        description: "Get status of an asynchronous operation",
        inputSchema: {
          type: "object",
          properties: {
            operationId: {
              type: "string",
              description: "Operation ID",
            },
          },
          required: ["operationId"]
        }
      }
    ]
  };
});

/**
 * Handler for tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "get_domains": {
      const take = Number(request.params.arguments?.take) || 10;
      const skip = Number(request.params.arguments?.skip) || 0;
      
      try {
        const domains = await spaceshipClient.getDomains(take, skip);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(domains, null, 2)
          }]
        };
      } catch (error) {
        console.error("Error getting domains:", error);
        throw error;
      }
    }
    
    case "check_domain_availability": {
      const domain = String(request.params.arguments?.domain);
      
      if (!domain) {
        throw new McpError(ErrorCode.InvalidParams, "Domain name is required");
      }
      
      try {
        const availability = await spaceshipClient.checkDomainAvailability(domain);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(availability, null, 2)
          }]
        };
      } catch (error) {
        console.error(`Error checking availability for ${domain}:`, error);
        throw error;
      }
    }
    
    case "get_domain_info": {
      const domain = String(request.params.arguments?.domain);
      
      if (!domain) {
        throw new McpError(ErrorCode.InvalidParams, "Domain name is required");
      }
      
      try {
        const domainInfo = await spaceshipClient.getDomainInfo(domain);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(domainInfo, null, 2)
          }]
        };
      } catch (error) {
        console.error(`Error getting info for ${domain}:`, error);
        throw error;
      }
    }
    
    case "register_domain": {
      const domain = String(request.params.arguments?.domain);
      const contactId = String(request.params.arguments?.contactId);
      
      if (!domain || !contactId) {
        throw new McpError(ErrorCode.InvalidParams, "Domain name and contact ID are required");
      }
      
      try {
        const result = await spaceshipClient.registerDomain(domain, contactId);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        console.error(`Error registering domain ${domain}:`, error);
        throw error;
      }
    }
    
    case "get_dns_records": {
      const domain = String(request.params.arguments?.domain);
      
      if (!domain) {
        throw new McpError(ErrorCode.InvalidParams, "Domain name is required");
      }
      
      try {
        const records = await spaceshipClient.getDnsRecords(domain);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(records, null, 2)
          }]
        };
      } catch (error) {
        console.error(`Error getting DNS records for ${domain}:`, error);
        throw error;
      }
    }
    
    case "get_contact": {
      const contactId = String(request.params.arguments?.contactId);
      
      if (!contactId) {
        throw new McpError(ErrorCode.InvalidParams, "Contact ID is required");
      }
      
      try {
        const contact = await spaceshipClient.getContact(contactId);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(contact, null, 2)
          }]
        };
      } catch (error) {
        console.error(`Error getting contact ${contactId}:`, error);
        throw error;
      }
    }
    
    case "get_async_operation": {
      const operationId = String(request.params.arguments?.operationId);
      
      if (!operationId) {
        throw new McpError(ErrorCode.InvalidParams, "Operation ID is required");
      }
      
      try {
        const operation = await spaceshipClient.getAsyncOperation(operationId);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(operation, null, 2)
          }]
        };
      } catch (error) {
        console.error(`Error getting operation ${operationId}:`, error);
        throw error;
      }
    }
    
    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  }
});

/**
 * Start the server using stdio transport
 */
async function main() {
  // Check if API credentials are provided
  if (!process.env.SPACESHIP_API_KEY || !process.env.SPACESHIP_API_SECRET) {
    console.warn("Warning: SPACESHIP_API_KEY and/or SPACESHIP_API_SECRET environment variables are not set.");
    console.warn("The server will start, but API calls will fail until these are provided.");
  }
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Spaceship.dev MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
