# n8n Deployment & Configuration Guide

## 📋 Overview

Guía completa para la configuración y despliegue de n8n en Railway para Club+
MVP workflows.

## 🚀 Railway Deployment Setup

### Step 1: Create n8n Service on Railway

```bash
# Railway CLI commands
railway add --service n8n
railway link
railway variables set N8N_BASIC_AUTH_ACTIVE=true
railway variables set N8N_BASIC_AUTH_USER=admin
railway variables set N8N_BASIC_AUTH_PASSWORD=SecurePassword123!
```

### Step 2: Environment Variables Configuration

```env
# Core n8n Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=SecurePassword123!
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.clubplus-workflows.railway.app

# Database Configuration (PostgreSQL)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=containers-us-west-14.railway.app
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=railway
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=${{Postgres.PGPASSWORD}}

# Security
N8N_ENCRYPTION_KEY=your-very-secure-encryption-key-here-32chars
N8N_USER_MANAGEMENT_JWT_SECRET=jwt-secret-for-user-management

# Email Configuration for n8n notifications
N8N_EMAIL_MODE=smtp
N8N_SMTP_HOST=smtp.resend.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=resend
N8N_SMTP_PASS=your-resend-api-key
N8N_SMTP_SENDER=workflows@clubplus.app

# External API Keys
STRIPE_SECRET_KEY=sk_live_xxx
RESEND_API_KEY=re_xxx
CLUBPLUS_API_TOKEN=api-token-for-internal-calls
CLUBPLUS_API_URL=https://clubplus-api.railway.app

# Monitoring
N8N_METRICS=true
N8N_LOG_LEVEL=info
```

### Step 3: Docker Configuration

```dockerfile
# Dockerfile for n8n deployment
FROM n8nio/n8n:latest

# Install additional packages if needed
USER root
RUN apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    jq

USER node

# Set working directory
WORKDIR /home/node

# Copy custom workflows (will be imported during deployment)
COPY workflows/ /home/node/.n8n/workflows/

# Expose port
EXPOSE 5678

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5678/healthz || exit 1

# Start n8n
CMD ["n8n", "start"]
```

## 🔗 Webhook Endpoints

### Production Webhook URLs

```yaml
User Registration: https://n8n.clubplus-workflows.railway.app/webhook/user-registration
Payment Monitoring: https://n8n.clubplus-workflows.railway.app/webhook/payment-monitoring
Profile Management: https://n8n.clubplus-workflows.railway.app/webhook/profile-management
Support Automation: https://n8n.clubplus-workflows.railway.app/webhook/support-ticket
Emergency Alerts: https://n8n.clubplus-workflows.railway.app/webhook/emergency
```

### Webhook Security

```yaml
Authentication Method: Bearer Token
Header: Authorization: Bearer n8n-webhook-secret-token
IP Whitelist:
  - Railway internal network
  - Stripe webhook IPs
  - Vercel deployment IPs
```

## 🔐 Credentials Management

### Required Credential Sets

```yaml
Stripe:
  Type: API Key
  Secret: STRIPE_SECRET_KEY
  Webhook Secret: STRIPE_WEBHOOK_SECRET

Resend Email:
  Type: API Key
  Key: RESEND_API_KEY

Club+ Internal API:
  Type: Header Auth
  Header: Authorization
  Value: Bearer {{CLUBPLUS_API_TOKEN}}

PostgreSQL Database:
  Type: Database
  Host: containers-us-west-14.railway.app
  Database: railway
  Username: postgres
  Password: { { DB_PASSWORD } }
```

## 📊 Monitoring Setup

### Health Check Endpoint

```yaml
Endpoint: https://n8n.clubplus-workflows.railway.app/healthz
Expected Response: 200 OK
Monitor Frequency: Every 2 minutes
Alert Threshold: 3 consecutive failures
```

### Performance Monitoring

```yaml
Metrics to Track:
  - Workflow execution time
  - Success/failure rates
  - Queue length
  - Memory usage
  - Active connections

Dashboard: Railway internal metrics + custom Grafana
```

### Log Management

```yaml
Log Level: info
Log Format: JSON
Log Destinations:
  - Railway logs (default)
  - External log aggregation (optional)

Important Log Events:
  - Workflow failures
  - Webhook authentication failures
  - API rate limit hits
  - Database connection issues
```

## 🔄 Workflow Import Process

### Workflow JSON Exports

Each workflow should be exported as JSON and stored in:

```
/workflows/
├── user_registration_flow.json
├── payment_monitoring_flow.json
├── profile_management_flow.json
└── support_automation_flow.json
```

### Import Command

```bash
# Import all workflows on deployment
n8n import:workflow --separate --input=/home/node/.n8n/workflows/
```

## 🚨 Error Handling & Alerts

### Global Error Handling

```yaml
Error Webhook: https://n8n.clubplus-workflows.railway.app/webhook/workflow-error
Payload:
  workflowId: string
  executionId: string
  error: object
  timestamp: string
  retryAttempt: number
```

### Alert Configuration

```yaml
Critical Alerts:
  - Workflow execution failure rate > 5%
  - Database connection lost
  - Webhook authentication failures
  - Queue processing delays > 10 minutes

Alert Channels:
  - Slack: #alerts-workflows
  - Email: ops@clubplus.app
  - PagerDuty: For critical production issues
```

## 🔒 Security Best Practices

### Access Control

```yaml
Basic Auth: Enabled for n8n UI
IP Restrictions: Railway internal + admin IPs only
Webhook Authentication: Bearer token validation
Database Access: Encrypted connections only
```

### Data Privacy

```yaml
Sensitive Data Handling:
  - Never log user passwords or payment info
  - Encrypt sensitive data in workflow variables
  - Use secure credential storage
  - Regular access audit trails

Compliance:
  - GDPR compliant data processing
  - PCI DSS for payment data
  - Regular security assessments
```

## 📈 Scaling Configuration

### Resource Allocation

```yaml
Railway Service:
  Memory: 512MB (can scale to 1GB)
  CPU: Shared (can upgrade to dedicated)
  Storage: 1GB for workflow data

Database:
  PostgreSQL: Shared (can scale to dedicated)
  Connection Pool: 10 concurrent connections
```

### Performance Optimization

```yaml
Workflow Settings:
  Max Execution Time: 300 seconds
  Queue Size: 100 jobs
  Concurrent Executions: 10
  Retry Policy: 3 attempts with exponential backoff

Database Optimization:
  Connection pooling enabled
  Query timeout: 30 seconds
  Index on execution tables
```

## 🔧 Development vs Production

### Development Environment

```yaml
URL: https://n8n-dev.clubplus-workflows.railway.app
Database: Separate dev database
API Endpoints: Staging API endpoints
Email: Test mode (no actual emails sent)
Stripe: Test mode keys
```

### Production Environment

```yaml
URL: https://n8n.clubplus-workflows.railway.app
Database: Production database
API Endpoints: Production API endpoints
Email: Live email sending
Stripe: Live payment processing
Monitoring: Full monitoring enabled
```

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Webhook endpoints tested
- [ ] Credentials validated
- [ ] Database connectivity verified
- [ ] Email service tested
- [ ] Stripe integration tested

### Post-Deployment

- [ ] Health check responding
- [ ] All workflows imported successfully
- [ ] Webhook endpoints accessible
- [ ] Test executions successful
- [ ] Monitoring alerts configured
- [ ] Backup strategy verified

### Go-Live Validation

- [ ] End-to-end user registration flow
- [ ] Payment processing workflow
- [ ] Profile management automation
- [ ] Support ticket automation
- [ ] Error handling working
- [ ] Performance metrics within targets

## 📞 Support & Maintenance

### Regular Maintenance Tasks

```yaml
Daily:
  - Check workflow execution logs
  - Monitor performance metrics
  - Verify webhook availability

Weekly:
  - Review failed executions
  - Update workflow documentation
  - Performance optimization review

Monthly:
  - Security audit
  - Credential rotation
  - Backup verification
  - Cost optimization review
```

### Emergency Procedures

```yaml
Workflow System Down:
  1. Check Railway service status 2. Verify database connectivity 3. Restart n8n
  service if needed 4. Enable fallback manual processes 5. Communicate to
  affected systems

High Error Rate:
  1. Identify failing workflow 2. Disable problematic workflow 3. Investigate
  root cause 4. Deploy fix 5. Re-enable with monitoring
```
