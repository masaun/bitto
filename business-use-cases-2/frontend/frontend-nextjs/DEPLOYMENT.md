# Deployment Guide - Stacks Contracts Next.js Frontend

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the official Next.js deployment platform.

**Setup:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Configuration:**

Create `vercel.json`:

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": [
    "NEXT_PUBLIC_STACKS_NETWORK",
    "NEXT_PUBLIC_APP_NAME",
    "STACKS_API_URL"
  ]
}
```

### 2. Docker Deployment

**Dockerfile:**

```dockerfile
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

**Build and run:**

```bash
docker build -t stacks-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_STACKS_NETWORK=testnet stacks-frontend
```

### 3. Self-Hosted (Linux/Ubuntu)

**Prerequisites:**
- Node.js 18+
- npm or yarn
- Linux server with SSH access

**Setup:**

```bash
# SSH into server
ssh user@your-server.com

# Clone repository
git clone <repo-url>
cd business-use-cases-2/frontend-nextjs

# Install dependencies
npm install

# Build
npm run build

# Install PM2 for process management
npm i -g pm2

# Start with PM2
pm2 start npm --name "stacks-frontend" -- start

# Save PM2 config
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

### 4. AWS Deployment

**Using Amplify:**

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

**Using EC2 + Load Balancer:**

1. Create EC2 instance (Ubuntu)
2. Set up Node.js and npm
3. Clone repository
4. Run: `npm install && npm run build && npm start`
5. Configure security groups
6. Add to load balancer

### 5. Google Cloud Run

**Deployment:**

```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash

# Authenticate
gcloud auth login

# Set project
gcloud config set project PROJECT_ID

# Build and deploy
gcloud run deploy stacks-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_STACKS_NETWORK=testnet
```

## Environment Variables

For all deployments, set these environment variables:

```
NEXT_PUBLIC_STACKS_NETWORK=testnet          # or mainnet
NEXT_PUBLIC_APP_NAME=Stacks Contracts       # App name
STACKS_API_URL=https://api.testnet.hiro.so  # API endpoint
NODE_ENV=production                          # Node environment
```

Contract addresses:

```
NEXT_PUBLIC_AUCTION_HOUSE_ADDRESS=STX...
NEXT_PUBLIC_TREASURY_MANAGER_ADDRESS=STX...
# ... add all 2400+ contract addresses
```

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install
        working-directory: business-use-cases-2/frontend-nextjs
        run: npm ci
      
      - name: Build
        working-directory: business-use-cases-2/frontend-nextjs
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: business-use-cases-2/frontend-nextjs
```

## Monitoring & Logs

### Vercel
- Dashboard: https://vercel.com/dashboard
- Real-time logs available in dashboard

### Self-Hosted with PM2
```bash
# View logs
pm2 logs stacks-frontend

# Monitor
pm2 monit

# View status
pm2 status
```

### Docker
```bash
# View logs
docker logs container-id

# Stream logs
docker logs -f container-id
```

## Performance Optimization for Production

### Build Optimization

```bash
# Analyze bundle
npm run build -- --analyze

# Production build
npm run build

# Start production server
npm start
```

### Caching Headers

Add to `next.config.js`:

```javascript
const nextConfig = {
  headers: async () => [{
    source: '/api/:path*',
    headers: [
      { key: 'Cache-Control', value: 'public, max-age=60' }
    ]
  }]
}
```

### CDN Configuration

Configure CDN (CloudFlare, Akamai, etc.) to cache:
- Static assets: 1 year
- HTML pages: 1 hour
- API routes: No cache

## SSL/HTTPS

### Let's Encrypt (Free)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

### Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Scaling Considerations

For high traffic:
1. Use Vercel auto-scaling or Kubernetes
2. Implement database caching
3. Use CDN for static assets
4. Monitor performance metrics
5. Set up alerts for errors

## Health Checks

Implement health endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date() });
}
```

Monitor with:
```bash
while true; do curl https://your-domain.com/api/health; sleep 60; done
```

## Rollback Procedures

### Vercel
One-click rollback available in Deployments tab

### Self-Hosted
```bash
# Revert to previous version
git checkout previous-commit
npm run build
pm2 restart stacks-frontend
```

### Docker
```bash
docker run -p 3000:3000 stacks-frontend:previous-version
```

## Support

For deployment issues:
- Check logs: `npm run dev` locally first
- Verify environment variables are set
- Check network connectivity to Stacks API
- Reference [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
