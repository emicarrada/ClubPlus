# n8n Workflow: User Registration & Payment Processing

## 📋 Overview

Workflow para manejar el registro de usuarios, procesamiento de pagos y
asignación automática de perfiles de streaming.

## 🎯 Trigger Event

**Webhook:** `POST /webhook/user-registration`

**Payload Expected:**

```json
{
  "eventType": "user.registered",
  "timestamp": "2025-08-12T10:30:00Z",
  "data": {
    "userId": "uuid-v4",
    "email": "user@example.com",
    "comboId": "combo-netflix-premium",
    "paymentMethod": "stripe",
    "paymentIntentId": "pi_xxxxx",
    "amount": 1500,
    "currency": "MXN"
  }
}
```

## 🔄 Workflow Steps

### Step 1: Validate Webhook Data

```yaml
Node: 'Validate Input'
Type: Code
Description: Validate incoming webhook payload structure
```

**Code Logic:**

```javascript
// Validate required fields
const requiredFields = ['userId', 'email', 'comboId', 'paymentIntentId'];
const missingFields = requiredFields.filter(field => !$json.data[field]);

if (missingFields.length > 0) {
  throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
}

// Return validated data
return {
  userId: $json.data.userId,
  email: $json.data.email,
  comboId: $json.data.comboId,
  paymentIntentId: $json.data.paymentIntentId,
  amount: $json.data.amount,
  currency: $json.data.currency,
};
```

### Step 2: Verify Payment Status

```yaml
Node: 'Check Payment Status'
Type: HTTP Request
Method: GET
URL: 'https://api.stripe.com/v1/payment_intents/{{$json.paymentIntentId}}'
Headers:
  Authorization: 'Bearer {{$credentials.stripe.secret_key}}'
```

**Success Condition:** `payment_intent.status === 'succeeded'`

### Step 3: Get Available Profile from Pool

```yaml
Node: 'Get Available Profile'
Type: HTTP Request
Method: POST
URL: 'https://clubplus-api.railway.app/api/v1/profiles/assign'
Body:
  comboId: '{{$json.comboId}}'
  userId: '{{$json.userId}}'
Headers:
  Authorization: 'Bearer {{$credentials.api.token}}'
  Content-Type: 'application/json'
```

**Expected Response:**

```json
{
  "profileId": "profile-uuid",
  "credentials": {
    "email": "shared.account@netflix.com",
    "password": "encrypted-password",
    "profileName": "User123"
  },
  "comboDetails": {
    "service": "Netflix Premium",
    "validUntil": "2025-09-12T10:30:00Z"
  }
}
```

### Step 4: Send Welcome Email

```yaml
Node: 'Send Welcome Email'
Type: HTTP Request
Method: POST
URL: 'https://api.resend.com/emails'
Headers:
  Authorization: 'Bearer {{$credentials.resend.api_key}}'
  Content-Type: 'application/json'
```

**Email Template:**

```json
{
  "from": "noreply@clubplus.app",
  "to": "{{$json.email}}",
  "subject": "¡Bienvenido a Club+! Tus credenciales están listas",
  "html": "{{$json.welcomeEmailHtml}}",
  "tags": [
    { "name": "category", "value": "welcome" },
    { "name": "userId", "value": "{{$json.userId}}" }
  ]
}
```

### Step 5: Log Success Event

```yaml
Node: 'Log Success'
Type: HTTP Request
Method: POST
URL: 'https://clubplus-api.railway.app/api/v1/events'
Body:
  eventType: 'user.registration.completed'
  userId: '{{$json.userId}}'
  metadata:
    comboId: '{{$json.comboId}}'
    profileId: '{{$json.profileId}}'
    paymentAmount: '{{$json.amount}}'
```

## ❌ Error Handling

### Payment Failed

```yaml
Node: 'Payment Failed Handler'
Condition: payment_intent.status !== 'succeeded'
Action: Send failure email + log event
```

### No Available Profiles

```yaml
Node: 'No Profiles Handler'
Condition: API returns 404 or empty profiles
Action: Refund payment + notify admin + log event
```

### Email Send Failed

```yaml
Node: 'Email Failed Handler'
Condition: Email service returns error
Action: Log warning + retry after 5 minutes
```

## 📊 Monitoring & Metrics

**Key Metrics to Track:**

- Successful registrations per day
- Payment failure rate
- Profile assignment time
- Email delivery rate
- Error types and frequency

**Webhooks for Monitoring:**

```javascript
// Success webhook to analytics
POST https://analytics.clubplus.app/events
{
  "event": "registration_completed",
  "userId": "{{userId}}",
  "duration": "{{$execution.duration}}",
  "timestamp": "{{$now}}"
}
```

## 🔄 Retry Logic

**Failed Steps Retry Configuration:**

- Payment verification: 3 retries, 30s interval
- Profile assignment: 5 retries, 60s interval
- Email sending: 3 retries, 300s interval

## 🚨 Alert Conditions

**Critical Alerts:**

- No available profiles for > 5 minutes
- Payment verification fails > 10 times in 1 hour
- Email sending fails > 50% in 1 hour

**Alert Channels:**

- Slack: #alerts-critical
- Email: admin@clubplus.app
