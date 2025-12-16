import express from 'express';
import cors from 'cors';
import { ChainhookClient } from './src/chainhooks/client';
import chainhookSpec from './src/chainhooks/fungible-token.chainhook.json';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Chainhook client
const chainhookClient = new ChainhookClient({
  baseUrl: 'http://localhost:20456'
});

// Webhook endpoint for receiving Chainhook events
app.post('/api/chainhook/fungible-token', (req, res) => {
  console.log('Received Chainhook payload:', JSON.stringify(req.body, null, 2));
  
  try {
    // Process the webhook payload
    chainhookClient.processWebhookPayload(req.body);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to manually register the chainhook
app.post('/api/register-chainhook', async (req, res) => {
  try {
    const success = await chainhookClient.registerChainhook(chainhookSpec);
    if (success) {
      res.json({ success: true, message: 'Chainhook registered successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to register chainhook' });
    }
  } catch (error) {
    console.error('Error registering chainhook:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// API endpoint to list registered chainhooks
app.get('/api/chainhooks', async (req, res) => {
  try {
    const chainhooks = await chainhookClient.listChainhooks();
    res.json(chainhooks);
  } catch (error) {
    console.error('Error listing chainhooks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint to simulate a chainhook event
app.post('/api/test-event', (req, res) => {
  const testPayload = {
    apply: [
      {
        block_identifier: {
          index: 1000,
          hash: '0x1234567890abcdef'
        },
        parent_block_identifier: {
          index: 999,
          hash: '0x0123456789abcdef'
        },
        timestamp: Math.floor(Date.now() / 1000),
        transactions: [
          {
            transaction_identifier: {
              hash: '0xtest-transaction-hash'
            },
            operations: [],
            events: [
              {
                event_index: 0,
                event_type: 'ft_event',
                ft_event: {
                  asset_identifier: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fungible-token::token',
                  action: 'transfer',
                  sender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
                  recipient: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
                  amount: '1000000'
                }
              }
            ],
            metadata: {
              success: true,
              result: '(ok true)'
            }
          }
        ],
        metadata: {}
      }
    ]
  };

  console.log('Simulating chainhook event:', JSON.stringify(testPayload, null, 2));
  
  try {
    chainhookClient.processWebhookPayload(testPayload);
    res.json({ success: true, message: 'Test event processed' });
  } catch (error) {
    console.error('Error processing test event:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Chainhook webhook server running on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  POST /api/chainhook/fungible-token - Webhook endpoint');
  console.log('  POST /api/register-chainhook - Register chainhook');
  console.log('  GET  /api/chainhooks - List chainhooks');
  console.log('  POST /api/test-event - Simulate a test event');
  console.log('  GET  /health - Health check');
});

export default app;