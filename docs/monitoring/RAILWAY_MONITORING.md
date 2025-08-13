# Railway Monitoring & Logging

## 📊 Overview

Configuración completa del sistema de monitoring y logging nativo de Railway
para Club+ MVP, incluyendo métricas, logs y alertas.

## 🚀 Railway Built-in Monitoring

### Metrics Available

Railway provides comprehensive metrics out of the box:

**Application Metrics:**

```yaml
CPU Usage: Percentage utilization
Memory Usage: RAM consumption in MB
Network I/O: Incoming/outgoing traffic
Response Time: HTTP request latency
Request Volume: Requests per second
Error Rate: 4xx/5xx error percentage
```

**Database Metrics:**

```yaml
Connection Count: Active database connections
Query Performance: Slow query detection
Storage Usage: Database size and growth
Backup Status: Automatic backup health
```

## 📈 Setting Up Monitoring

### 1. Access Railway Dashboard

1. Go to https://railway.app/dashboard
2. Select "Club+ Backend" project
3. Navigate to "Metrics" tab
4. Pin important metrics to main dashboard

### 2. Key Metrics to Monitor

**Critical Metrics:**

```yaml
Priority 1:
  - CPU Usage > 80%
  - Memory Usage > 90%
  - Error Rate > 5%
  - Response Time > 1000ms

Priority 2:
  - Request Volume (trends)
  - Database Connections > 80% of pool
  - Storage Usage > 80%
```

### 3. Setting Up Alerts

Railway allows webhook notifications for critical events:

**Environment Variables for Webhooks:**

```env
RAILWAY_WEBHOOK_URL=https://n8n.clubplus-workflows.railway.app/webhook/railway-alert
```

**Alert Configuration:**

```yaml
Service Down: Immediate webhook
High CPU: 5 minutes sustained > 80%
High Memory: 5 minutes sustained > 90%
High Error Rate: 1 minute > 5% errors
Database Issues: Connection failures
```

## 🔍 Log Management

### 1. Structured Logging Setup

Create `apps/backend/src/config/logger.ts`:

```typescript
import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    isProduction
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
  ),
  defaultMeta: {
    service: 'clubplus-backend',
    version: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown',
    environment: process.env.RAILWAY_ENVIRONMENT || 'development',
  },
  transports: [new winston.transports.Console()],
});

// Add file transport for production if needed
if (isProduction) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  );
}
```

### 2. Request Logging Middleware

Create middleware for request logging:

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      userId: req.user?.id || null,
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};
```

### 3. Application Event Logging

```typescript
// Log important business events
export const logBusinessEvent = (event: string, data: any) => {
  logger.info('Business Event', {
    event,
    data,
    timestamp: new Date().toISOString(),
  });
};

// Usage examples:
logBusinessEvent('user.registered', { userId: user.id, email: user.email });
logBusinessEvent('payment.processed', { userId, amount, currency });
logBusinessEvent('profile.assigned', { userId, profileId, service });
```

## 📊 Custom Metrics

### 1. Business Metrics Tracking

Create custom metrics collection:

```typescript
// apps/backend/src/utils/metrics.ts
class MetricsCollector {
  private metrics: Map<string, number> = new Map();

  increment(metric: string, value: number = 1) {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + value);

    logger.info('Metric Update', {
      metric,
      value: current + value,
      increment: value,
    });
  }

  gauge(metric: string, value: number) {
    this.metrics.set(metric, value);

    logger.info('Metric Gauge', {
      metric,
      value,
    });
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}

export const metrics = new MetricsCollector();

// Usage examples:
metrics.increment('user.registrations');
metrics.increment('payments.processed', 1);
metrics.increment('payments.failed', 1);
metrics.gauge('active.profiles', profileCount);
```

### 2. Performance Monitoring

```typescript
// Performance tracking middleware
export const performanceMonitor = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds

    logger.info('Performance Metric', {
      endpoint: `${req.method} ${req.route?.path || req.path}`,
      duration: `${duration.toFixed(2)}ms`,
      statusCode: res.statusCode,
    });

    // Alert on slow requests
    if (duration > 1000) {
      logger.warn('Slow Request Detected', {
        endpoint: `${req.method} ${req.route?.path || req.path}`,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
      });
    }
  });

  next();
};
```

## 🔔 Alert Configuration

### 1. Railway Environment Variables

Set up webhook endpoints for alerts:

```env
# Railway webhook configuration
ALERTS_WEBHOOK_URL=https://n8n.clubplus-workflows.railway.app/webhook/railway-alert
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
ADMIN_EMAIL=admin@clubplus.app
```

### 2. Custom Alert System

Create alert service:

```typescript
// apps/backend/src/services/alertService.ts
import axios from 'axios';
import { logger } from '../config/logger';

export class AlertService {
  async sendCriticalAlert(message: string, data: any = {}) {
    const alert = {
      level: 'CRITICAL',
      service: 'clubplus-backend',
      message,
      data,
      timestamp: new Date().toISOString(),
      environment: process.env.RAILWAY_ENVIRONMENT,
    };

    logger.error('CRITICAL ALERT', alert);

    // Send to Slack
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await axios.post(process.env.SLACK_WEBHOOK_URL, {
          text: `🚨 CRITICAL ALERT: ${message}`,
          attachments: [
            {
              color: 'danger',
              fields: Object.entries(data).map(([key, value]) => ({
                title: key,
                value: String(value),
                short: true,
              })),
            },
          ],
        });
      } catch (error) {
        logger.error('Failed to send Slack alert', error);
      }
    }

    // Send to n8n webhook
    if (process.env.ALERTS_WEBHOOK_URL) {
      try {
        await axios.post(process.env.ALERTS_WEBHOOK_URL, alert);
      } catch (error) {
        logger.error('Failed to send webhook alert', error);
      }
    }
  }

  async sendWarningAlert(message: string, data: any = {}) {
    const alert = {
      level: 'WARNING',
      service: 'clubplus-backend',
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    logger.warn('WARNING ALERT', alert);

    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await axios.post(process.env.SLACK_WEBHOOK_URL, {
          text: `⚠️ WARNING: ${message}`,
          attachments: [
            {
              color: 'warning',
              text: JSON.stringify(data, null, 2),
            },
          ],
        });
      } catch (error) {
        logger.error('Failed to send Slack warning', error);
      }
    }
  }
}

export const alertService = new AlertService();
```

### 3. Health Check Integration

Enhanced health check with monitoring:

```typescript
// apps/backend/src/routes/health.ts
import { Router } from 'express';
import { metrics } from '../utils/metrics';
import { alertService } from '../services/alertService';

const router = Router();

router.get('/health', async (req, res) => {
  const startTime = Date.now();

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;

    // Check external services
    const externalChecks = await Promise.allSettled([
      // Add checks for external services when available
    ]);

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown',
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`,
      },
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
      },
      metrics: metrics.getMetrics(),
    };

    // Alert on slow database
    if (dbResponseTime > 1000) {
      alertService.sendWarningAlert('Slow database response', {
        responseTime: `${dbResponseTime}ms`,
      });
    }

    res.json(health);
  } catch (error) {
    logger.error('Health check failed', error);

    alertService.sendCriticalAlert('Health check failed', {
      error: error.message,
    });

    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

export default router;
```

## 📊 Log Analysis

### 1. Log Queries in Railway

Common log queries to save in Railway dashboard:

```bash
# Error logs
level:error

# Slow requests
"Slow Request Detected"

# Payment related logs
"payment" OR "Payment"

# User authentication issues
"auth" OR "login" OR "token"

# Database issues
"database" OR "prisma" OR "connection"
```

### 2. Log Retention

Railway automatically retains logs:

```yaml
Hobby Plan: 7 days
Pro Plan: 30 days
Enterprise: Custom retention
```

For longer retention, consider log forwarding to external services.

## 🔧 Environment-Specific Configuration

### Development

```env
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
PERFORMANCE_MONITORING=true
ALERTS_ENABLED=false
```

### Staging

```env
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
PERFORMANCE_MONITORING=true
ALERTS_ENABLED=true
```

### Production

```env
LOG_LEVEL=warn
ENABLE_REQUEST_LOGGING=true
PERFORMANCE_MONITORING=true
ALERTS_ENABLED=true
```

## 📋 Monitoring Checklist

### Daily Monitoring Tasks

- [ ] Check Railway dashboard for anomalies
- [ ] Review error logs from last 24 hours
- [ ] Verify all services are responding
- [ ] Check resource utilization trends

### Weekly Tasks

- [ ] Analyze performance trends
- [ ] Review and clean up old logs
- [ ] Update alert thresholds if needed
- [ ] Check database performance metrics

### Monthly Tasks

- [ ] Resource utilization analysis
- [ ] Log retention policy review
- [ ] Performance optimization opportunities
- [ ] Alert effectiveness review

## 🚨 Common Alerts to Watch

### Critical Issues

```yaml
Service Restart: Unexpected app restarts
Database Down: Connection failures
High Error Rate: > 5% of requests failing
Memory Leak: Continuously increasing memory usage
```

### Performance Issues

```yaml
High CPU: > 80% for extended periods
High Memory: > 90% usage
Slow Database: Query times > 1 second
High Response Time: API responses > 2 seconds
```

## 💡 Best Practices

1. **Structured Logging:** Always use consistent log formats
2. **Correlation IDs:** Track requests across services
3. **Sensitive Data:** Never log passwords or personal info
4. **Log Levels:** Use appropriate levels (debug, info, warn, error)
5. **Monitoring Fatigue:** Tune alerts to avoid noise
6. **Documentation:** Keep runbooks updated for common issues

---

## 🔗 Resources

- **Railway Docs:** https://docs.railway.app/reference/metrics
- **Winston Logging:** https://github.com/winstonjs/winston
- **Express Logging:** https://expressjs.com/en/resources/middleware/morgan.html
