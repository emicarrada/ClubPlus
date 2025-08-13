# Sentry Error Tracking Integration

## 📊 Overview

Configuración completa de Sentry.io para error tracking, performance monitoring
y release tracking en Club+ MVP.

## 🚀 Account Setup

### 1. Create Sentry Account

1. Go to https://sentry.io/signup/
2. Choose "Developer" plan (free)
3. Create organization: "clubplus"
4. Create first project

### 2. Project Configuration

**Backend Project:**

```yaml
Project Name: clubplus-backend
Platform: Node.js
Language: JavaScript
Framework: Express
```

**Frontend Project:**

```yaml
Project Name: clubplus-frontend
Platform: React
Language: TypeScript
Framework: React + Vite
```

## 🔧 Backend Integration

### 1. Install Sentry SDK

```bash
cd apps/backend
npm install @sentry/node @sentry/profiling-node
```

### 2. Environment Variables

Add to Railway environment:

```env
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### 3. Backend Configuration

Create `apps/backend/src/config/sentry.ts`:

```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
    release: process.env.SENTRY_RELEASE,

    // Performance monitoring
    tracesSampleRate: parseFloat(
      process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1',
    ),

    // Profiling
    profilesSampleRate: 0.1,

    integrations: [
      new ProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: undefined }),
    ],

    // Error filtering
    beforeSend(event) {
      // Filter out non-critical errors
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'ValidationError') {
          return null; // Don't send validation errors
        }
      }
      return event;
    },
  });
};
```

### 4. Express Integration

Update `apps/backend/src/index.ts`:

```typescript
import { initSentry } from './config/sentry';

// Initialize Sentry FIRST
initSentry();

import express from 'express';
import * as Sentry from '@sentry/node';

const app = express();

// Sentry request handler (must be first)
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Your routes here...

// Sentry error handler (must be before other error handlers)
app.use(Sentry.Handlers.errorHandler());

// Your error handlers...
```

## 🌐 Frontend Integration

### 1. Install Sentry SDK

```bash
cd apps/frontend
npm install @sentry/react @sentry/vite-plugin
```

### 2. Environment Variables

Add to `.env.production`:

```env
VITE_SENTRY_DSN=https://your-frontend-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=production
```

### 3. Vite Configuration

Update `apps/frontend/vite.config.ts`:

```typescript
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'clubplus',
      project: 'clubplus-frontend',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  build: {
    sourcemap: true, // Required for Sentry
  },
});
```

### 4. React Integration

Create `apps/frontend/src/lib/sentry.ts`:

```typescript
import * as Sentry from '@sentry/react';

export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',

    // Performance monitoring
    tracesSampleRate: 0.1,

    // Session tracking
    autoSessionTracking: true,

    // React integration
    integrations: [
      new Sentry.BrowserIntegration(),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Replay sampling
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};
```

Update `apps/frontend/src/main.tsx`:

```typescript
import { initSentry } from './lib/sentry';

// Initialize Sentry
initSentry();

// Rest of your app...
```

## 📊 Advanced Configuration

### Custom Error Handling

```typescript
// Backend custom error tracking
import * as Sentry from '@sentry/node';

export const trackError = (error: Error, context?: any) => {
  Sentry.withScope(scope => {
    if (context) {
      scope.setContext('additional', context);
    }
    scope.setTag('section', 'payment-processing');
    Sentry.captureException(error);
  });
};

// Usage example
try {
  await processPayment(paymentData);
} catch (error) {
  trackError(error, {
    userId: user.id,
    paymentAmount: paymentData.amount,
  });
  throw error;
}
```

### Performance Monitoring

```typescript
// Track custom performance metrics
import * as Sentry from '@sentry/node';

const transaction = Sentry.startTransaction({
  op: 'payment',
  name: 'Process Payment',
});

try {
  const result = await processPayment(data);
  transaction.setStatus('ok');
  return result;
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### User Context

```typescript
// Set user context for better error tracking
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});
```

## 🚨 Alert Configuration

### Issue Alerts

Create alerts in Sentry dashboard:

1. **High Error Rate Alert:**

   ```yaml
   Condition: Error count > 50 in 1 hour
   Action: Send to Slack #alerts-errors
   ```

2. **New Error Type Alert:**

   ```yaml
   Condition: New issue is created
   Action: Email to dev-team@clubplus.app
   ```

3. **Performance Degradation:**
   ```yaml
   Condition: P95 response time > 2 seconds
   Action: Send to Slack #alerts-performance
   ```

### Slack Integration

1. Install Sentry app in Slack
2. Connect to #alerts-errors channel
3. Configure alert rules
4. Test notifications

## 📈 Dashboard Setup

### Key Metrics to Track

**Error Metrics:**

- Error rate (errors per minute)
- Unique errors (new vs recurring)
- Error distribution by endpoint
- User impact (users affected)

**Performance Metrics:**

- Response time percentiles (P50, P95, P99)
- Throughput (requests per minute)
- Apdex score
- Slow transactions

### Custom Dashboards

Create dashboards for:

1. **Operations Dashboard:** Real-time errors and performance
2. **Business Dashboard:** User-impacting errors and conversion impacts
3. **Engineering Dashboard:** Error trends and fix rates

## 🔄 Release Tracking

### Deployment Integration

Add to CI/CD pipeline:

```bash
# Create release in Sentry
curl https://sentry.io/api/0/organizations/clubplus/releases/ \
  -X POST \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "$RELEASE_VERSION",
    "projects": ["clubplus-backend", "clubplus-frontend"]
  }'

# Associate commits with release
curl https://sentry.io/api/0/organizations/clubplus/releases/$RELEASE_VERSION/set-commits/ \
  -X PUT \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "auto": true
  }'
```

### Deploy Notifications

```bash
# Mark deploy as finished
curl https://sentry.io/api/0/organizations/clubplus/releases/$RELEASE_VERSION/deploys/ \
  -X POST \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "environment": "production"
  }'
```

## 🛠️ Development Workflow

### Local Development

```env
# .env.local
SENTRY_DSN=https://dev-dsn@sentry.io/dev-project-id
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=1.0
```

### Testing

```typescript
// Test Sentry integration
import * as Sentry from '@sentry/node';

// Test error capture
Sentry.captureException(new Error('Test error'));

// Test performance monitoring
const transaction = Sentry.startTransaction({
  op: 'test',
  name: 'Test Transaction',
});
transaction.finish();
```

## 📋 Maintenance Checklist

### Daily Tasks

- [ ] Review new errors
- [ ] Check error trends
- [ ] Verify alert delivery
- [ ] Monitor performance metrics

### Weekly Tasks

- [ ] Review and resolve recurring errors
- [ ] Update error filters
- [ ] Check release impact
- [ ] Optimize sampling rates

### Monthly Tasks

- [ ] Review error budgets
- [ ] Update alerting thresholds
- [ ] Performance optimization review
- [ ] Team training on Sentry features

## 💰 Cost Management

### Free Tier Limits

```yaml
Errors: 5,000/month
Performance: 10,000 transactions/month
Replays: 1,000/month
Projects: 1 project
Team Members: 1 user
```

### Usage Optimization

- Filter out non-critical errors
- Adjust sampling rates based on usage
- Use error grouping to reduce noise
- Set up proper release tracking

## 🚨 Troubleshooting

### Common Issues

**Sentry not capturing errors:**

- Check DSN configuration
- Verify Sentry initialization order
- Test with manual error capture

**High bill from Sentry:**

- Review sampling rates
- Implement proper error filtering
- Check for error loops

**Missing source maps:**

- Verify build configuration
- Check file upload permissions
- Test source map generation

## 📊 Success Metrics

### Targets

```yaml
Error Detection Time: < 5 minutes
Error Resolution Time: < 24 hours (P1), < 1 week (P2)
Error Rate: < 1% of total requests
Performance Budget: P95 < 1 second
User Impact: < 5% of users affected by errors
```

---

## 🔗 Resources

- **Sentry Documentation:** https://docs.sentry.io/
- **Node.js Integration:** https://docs.sentry.io/platforms/node/
- **React Integration:**
  https://docs.sentry.io/platforms/javascript/guides/react/
- **Performance Monitoring:** https://docs.sentry.io/product/performance/
