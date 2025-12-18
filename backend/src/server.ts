import Fastify from 'fastify';
import { ChainhooksClient, CHAINHOOKS_BASE_URL } from '@hirosystems/chainhooks-client';
import { config } from 'dotenv';

// Load environment variables
config();

const PORT = Number(process.env.PORT) || 3000;
const HIRO_API_KEY = process.env.HIRO_API_KEY;
const CHAINHOOK_UUID = process.env.CHAINHOOK_UUID;
const USE_TESTNET = process.env.USE_TESTNET === 'true';

// Validate required environment variables
if (!HIRO_API_KEY) {
  console.error('Error: HIRO_API_KEY is required');
  process.exit(1);
}

if (!CHAINHOOK_UUID) {
  console.error('Error: CHAINHOOK_UUID is required');
  process.exit(1);
}

// Initialize Fastify server
const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Initialize Chainhooks client
const chainhooksClient = new ChainhooksClient({
  baseUrl: USE_TESTNET ? CHAINHOOKS_BASE_URL.testnet : CHAINHOOKS_BASE_URL.mainnet,
  apiKey: HIRO_API_KEY,
});

// Store the consumer secret (in production, use a secure secret manager)
let consumerSecret: string | null = null;

/**
 * Initialize or rotate the consumer secret
 */
async function initializeSecret() {
  try {
    server.log.info('Initializing consumer secret...');
    const response = await chainhooksClient.rotateConsumerSecret(CHAINHOOK_UUID!);
    consumerSecret = response.secret;
    server.log.info('Consumer secret initialized successfully');
    return consumerSecret;
  } catch (error) {
    server.log.error('Failed to initialize consumer secret:', error);
    throw error;
  }
}

/**
 * Validate the authorization header against the consumer secret
 */
function validateAuthHeader(authHeader: string | undefined): boolean {
  if (!authHeader) {
    return false;
  }
  return authHeader === `Bearer ${consumerSecret}`;
}

// Health check endpoint
server.get('/health', async (request, reply) => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    secretConfigured: !!consumerSecret
  };
});

// Webhook endpoint for Chainhooks events
server.post('/webhook', async (request, reply) => {
  // Check if secret is available
  if (!consumerSecret) {
    server.log.warn('Webhook request received but consumer secret is unavailable');
    reply.code(503).send({ error: 'consumer secret unavailable' });
    return;
  }

  // Validate authorization header
  const authHeader = request.headers.authorization;
  if (!validateAuthHeader(authHeader)) {
    server.log.warn('Webhook request received with invalid authorization');
    reply.code(401).send({ error: 'invalid consumer secret' });
    return;
  }

  // Process the webhook event
  const event = request.body as any;
  server.log.info(`Received chainhook event: ${event.chainhook?.uuid}`);
  
  // TODO: Add your custom webhook processing logic here
  // Example: Process Stacks blockchain events, NFT mints, token transfers, etc.
  
  // Log event details for debugging
  if (event.apply && event.apply.length > 0) {
    server.log.info(`Processing ${event.apply.length} apply events`);
  }
  if (event.rollback && event.rollback.length > 0) {
    server.log.info(`Processing ${event.rollback.length} rollback events`);
  }

  // Return 204 No Content to acknowledge receipt
  reply.code(204).send();
});

// Admin endpoint to manually rotate the secret (protect this in production!)
server.post('/admin/rotate-secret', async (request, reply) => {
  try {
    // In production, add authentication/authorization here
    const newSecret = await initializeSecret();
    return { 
      message: 'Secret rotated successfully',
      // Don't return the actual secret in production!
      secretPreview: `${newSecret.substring(0, 8)}...` 
    };
  } catch (error) {
    server.log.error('Failed to rotate secret:', error);
    reply.code(500).send({ error: 'Failed to rotate secret' });
  }
});

// Get current secret status (for debugging - remove in production)
server.get('/admin/secret-status', async (request, reply) => {
  return {
    configured: !!consumerSecret,
    secretPreview: consumerSecret ? `${consumerSecret.substring(0, 8)}...` : null,
    chainhookUuid: CHAINHOOK_UUID,
    environment: USE_TESTNET ? 'testnet' : 'mainnet'
  };
});

// Graceful shutdown handler
async function gracefulShutdown() {
  server.log.info('Received shutdown signal, closing server...');
  await server.close();
  server.log.info('Server closed successfully');
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
async function start() {
  try {
    // Initialize the consumer secret on startup
    await initializeSecret();

    // Start listening
    await server.listen({ 
      port: PORT, 
      host: '0.0.0.0' // Listen on all interfaces
    });
    
    server.log.info(`Server listening on port ${PORT}`);
    server.log.info(`Environment: ${USE_TESTNET ? 'testnet' : 'mainnet'}`);
    server.log.info(`Chainhook UUID: ${CHAINHOOK_UUID}`);
  } catch (err) {
    server.log.error('Error starting server:', err);
    process.exit(1);
  }
}

start();
