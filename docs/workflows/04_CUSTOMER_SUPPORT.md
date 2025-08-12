# n8n Workflow: Customer Support Automation

## 📋 Overview

Workflow para automatizar respuestas de soporte, escalación de tickets y
resolución de problemas comunes.

## 📨 Trigger Events

### Trigger 1: New Support Ticket

**Webhook:** `POST /webhook/support-ticket`

**Payload:**

```json
{
  "ticketId": "TKT-12345",
  "userId": "user-uuid",
  "email": "user@example.com",
  "subject": "No puedo acceder a Netflix",
  "message": "Las credenciales no funcionan",
  "category": "login_issue",
  "priority": "medium",
  "timestamp": "2025-08-12T10:30:00Z"
}
```

### Trigger 2: Email Support

**Email:** `support@clubplus.app` **Integration:** IMAP/Email Parser

## 🤖 Automated Response System

### Step 1: Categorize Support Request

```yaml
Node: 'Categorize Request'
Type: Code
Description: AI-powered categorization of support requests
```

**Categories:**

- `login_issue`: Problemas de acceso/credenciales
- `billing_question`: Dudas sobre facturación
- `service_down`: Servicio no disponible
- `account_change`: Cambios de cuenta
- `refund_request`: Solicitudes de reembolso
- `general_inquiry`: Consulta general

**Auto-Categorization Logic:**

```javascript
const categorizeTicket = (subject, message) => {
  const keywords = {
    login_issue: ['credenciales', 'password', 'acceso', 'login', 'no funciona'],
    billing_question: ['factura', 'cobro', 'pago', 'precio', 'billing'],
    service_down: ['no funciona', 'caído', 'error', 'down', 'offline'],
    account_change: ['cambiar', 'actualizar', 'modificar', 'update'],
    refund_request: ['reembolso', 'devolver', 'refund', 'cancelar'],
    general_inquiry: ['información', 'consulta', 'pregunta', 'help'],
  };

  const text = (subject + ' ' + message).toLowerCase();

  for (const [category, keywordList] of Object.entries(keywords)) {
    if (keywordList.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'general_inquiry';
};
```

### Step 2: Auto-Resolution for Common Issues

```yaml
Node: 'Attempt Auto-Resolution'
Type: Switch
Condition: Based on category
```

#### Login Issue Auto-Resolution

```yaml
Node: 'Resolve Login Issue'
Description: Send fresh credentials
```

**Process:**

1. Check user's active subscription
2. Get current profile credentials
3. Test credentials validity
4. Send new credentials if needed

**Auto-Response Email:**

```json
{
  "template_id": "login_issue_resolved",
  "variables": {
    "userName": "{{userName}}",
    "serviceName": "{{serviceName}}",
    "credentials": {
      "email": "{{profileEmail}}",
      "password": "{{profilePassword}}",
      "profileName": "{{profileName}}"
    },
    "supportUrl": "https://clubplus.app/support"
  }
}
```

#### Billing Question Auto-Response

```yaml
Node: 'Handle Billing Question'
Description: Provide billing information
```

**Information Provided:**

- Current subscription status
- Next billing date
- Payment method on file
- Recent transactions
- Cancel/modify links

#### Service Down Auto-Response

```yaml
Node: 'Check Service Status'
Description: Verify if service is actually down
```

**Process:**

1. Check service status dashboard
2. Test profile connectivity
3. If confirmed down: Send status update
4. If working: Troubleshoot user-specific issue

### Step 3: Escalation Decision

```yaml
Node: 'Escalation Decision'
Type: Code
Description: Determine if human intervention needed
```

**Escalation Triggers:**

```javascript
const shouldEscalate = ticket => {
  const escalationTriggers = [
    ticket.priority === 'high',
    ticket.category === 'refund_request',
    ticket.sentiment === 'angry',
    !ticket.autoResolved,
    ticket.previousTickets > 2,
    ticket.message.includes('lawsuit') || ticket.message.includes('legal'),
  ];

  return escalationTriggers.some(trigger => trigger === true);
};
```

### Step 4: Human Agent Assignment

```yaml
Node: 'Assign to Agent'
Type: HTTP Request
Method: POST
URL: 'https://clubplus-api.railway.app/api/v1/tickets/{{ticketId}}/assign'
Body:
  priority: '{{priority}}'
  category: '{{category}}'
  assignmentReason: '{{escalationReason}}'
```

**Assignment Rules:**

- High priority → Senior agent
- Billing issues → Billing specialist
- Technical issues → Technical support
- Refunds → Manager approval required

### Step 5: Customer Notification

```yaml
Node: 'Notify Customer'
Type: HTTP Request
Method: POST
URL: 'https://api.resend.com/emails'
```

**Notification Templates:**

**Auto-Resolved:**

```json
{
  "template_id": "issue_resolved",
  "subject": "Tu problema ha sido resuelto - Ticket #{{ticketId}}",
  "variables": {
    "ticketId": "{{ticketId}}",
    "resolution": "{{resolutionDetails}}",
    "satisfactionSurvey": "{{surveyUrl}}"
  }
}
```

**Escalated to Human:**

```json
{
  "template_id": "ticket_escalated",
  "subject": "Hemos recibido tu solicitud - Ticket #{{ticketId}}",
  "variables": {
    "ticketId": "{{ticketId}}",
    "expectedResponseTime": "{{responseTime}}",
    "statusUrl": "{{statusUrl}}"
  }
}
```

## 🔄 Follow-up Workflows

### Customer Satisfaction Survey

```yaml
Node: 'Send Satisfaction Survey'
Delay: 24 hours after resolution
Condition: Ticket status = 'resolved'
```

**Survey Questions:**

1. ¿Tu problema fue resuelto satisfactoriamente?
2. ¿Qué tan fácil fue contactar al soporte?
3. ¿Recomendarías nuestro servicio?
4. Comentarios adicionales

### Unresolved Ticket Follow-up

```yaml
Node: 'Follow-up Unresolved'
Schedule: Every 4 hours
Condition: Ticket age > 24 hours AND status = 'open'
```

**Actions:**

1. Escalate priority if > 48 hours
2. Send status update to customer
3. Alert supervisor if > 72 hours

## 📊 Knowledge Base Integration

### Auto-Response from FAQ

```yaml
Node: 'Search Knowledge Base'
Type: HTTP Request
Method: POST
URL: 'https://api.helpdesk.clubplus.app/search'
Body:
  query: '{{ticketMessage}}'
  limit: 3
```

**FAQ Categories:**

- Login troubleshooting
- Billing explanations
- Service availability
- Account management
- Technical requirements

### Dynamic Response Generation

```javascript
const generateResponse = (ticket, faqResults) => {
  if (faqResults.length > 0) {
    const bestMatch = faqResults[0];

    if (bestMatch.confidence > 0.8) {
      return {
        type: 'auto_resolved',
        response: bestMatch.answer,
        sources: faqResults.map(r => r.url),
      };
    }
  }

  return {
    type: 'needs_human',
    reason: 'no_confident_match',
  };
};
```

## 🚨 Urgent Issue Detection

### Priority Escalation Keywords

```yaml
Keywords_High_Priority:
  - 'urgent'
  - 'emergency'
  - 'not working at all'
  - 'refund immediately'
  - 'cancel subscription'
  - 'legal action'
```

### Sentiment Analysis

```yaml
Node: 'Analyze Sentiment'
Type: HTTP Request
Method: POST
URL: 'https://api.sentiment.ai/analyze'
Body:
  text: '{{ticketMessage}}'
```

**Sentiment-Based Actions:**

- **Negative sentiment:** Immediate escalation to senior agent
- **Neutral sentiment:** Standard auto-resolution attempt
- **Positive sentiment:** Standard process

## 📈 Support Analytics

### Daily Support Metrics

```yaml
Node: 'Generate Support Metrics'
Schedule: Daily at 23:00 UTC
```

**Metrics Tracked:**

- Total tickets received
- Auto-resolution rate
- Average response time
- Customer satisfaction score
- Escalation rate by category
- Agent performance metrics

### Weekly Support Report

```yaml
Node: 'Weekly Support Report'
Schedule: Monday at 09:00 UTC
Recipients:
  - support@clubplus.app
  - management@clubplus.app
```

**Report Sections:**

1. Volume trends
2. Common issue patterns
3. Agent performance
4. Customer satisfaction trends
5. Knowledge base effectiveness
6. Recommendations for improvements

## 🔔 Alert Configuration

### Critical Support Alerts

- **Response time SLA breach:** >4 hours for high priority
- **High volume spike:** >50 tickets in 1 hour
- **Low satisfaction scores:** <3.0/5 average in 24h
- **Auto-resolution failure rate:** <70%

### Alert Channels

- **Slack:** #support-alerts
- **Email:** support-manager@clubplus.app
- **SMS:** For critical SLA breaches only

## 🔧 Integration Points

### CRM Integration

- **Platform:** HubSpot/Intercom
- **Sync:** Bidirectional ticket updates
- **Customer history:** Available to agents

### Analytics Integration

- **Platform:** Google Analytics/Mixpanel
- **Events:** Ticket creation, resolution, satisfaction
- **Dashboards:** Real-time support metrics
