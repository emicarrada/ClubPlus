# n8n Workflow: Payment Monitoring & Subscription Renewals

## 📋 Overview

Workflow automático para monitorear vencimientos de suscripciones, procesar
renovaciones y manejar pagos fallidos.

## ⏰ Trigger Event

**Schedule:** Daily at 08:00 UTC **Type:** Cron Job

## 🔄 Workflow Steps

### Step 1: Get Expiring Subscriptions

```yaml
Node: 'Get Expiring Subscriptions'
Type: HTTP Request
Method: GET
URL: 'https://clubplus-api.railway.app/api/v1/subscriptions/expiring'
Query:
  days_ahead: 3
  status: active
Headers:
  Authorization: 'Bearer {{$credentials.api.token}}'
```

### Step 2: Send Renewal Reminders

```yaml
Node: 'Send Renewal Reminder'
Type: HTTP Request
Method: POST
URL: 'https://api.resend.com/emails'
Body:
  from: 'noreply@clubplus.app'
  to: '{{$json.user.email}}'
  subject: 'Tu suscripción vence en {{$json.daysUntilExpiry}} días'
  template_id: 'renewal_reminder'
  template_data:
    userName: '{{$json.user.name}}'
    serviceName: '{{$json.combo.service}}'
    expiryDate: '{{$json.subscription.expiryDate}}'
    renewUrl: 'https://clubplus.app/renew/{{$json.subscription.id}}'
```

### Step 3: Process Auto-Renewals

```yaml
Node: 'Process Auto-Renewal'
Type: Code
Description: Check if user has auto-renewal enabled
```

**Code Logic:**

```javascript
if ($json.subscription.autoRenew && $json.subscription.paymentMethod) {
  // Attempt to charge the saved payment method
  return {
    shouldRenew: true,
    subscriptionId: $json.subscription.id,
    paymentMethodId: $json.subscription.paymentMethod.id,
    amount: $json.combo.price,
  };
} else {
  return {
    shouldRenew: false,
    subscriptionId: $json.subscription.id,
  };
}
```

### Step 4: Charge Payment Method

```yaml
Node: 'Charge Payment'
Type: HTTP Request
Method: POST
URL: 'https://api.stripe.com/v1/payment_intents'
Headers:
  Authorization: 'Bearer {{$credentials.stripe.secret_key}}'
Body:
  amount: '{{$json.amount}}'
  currency: 'mxn'
  payment_method: '{{$json.paymentMethodId}}'
  confirm: true
```

### Step 5: Update Subscription Status

```yaml
Node: 'Update Subscription'
Type: HTTP Request
Method: PATCH
URL: 'https://clubplus-api.railway.app/api/v1/subscriptions/{{$json.subscriptionId}}'
Body:
  status:
    "{{$json.paymentStatus === 'succeeded' ? 'active' : 'payment_failed'}}"
  nextBillingDate:
    "{{$json.paymentStatus === 'succeeded' ? $now.plus(1, 'month') : null}}"
  paymentIntentId: '{{$json.paymentIntentId}}'
```

## 💳 Payment Failure Handling

### Failed Payment Workflow

```yaml
Node: 'Handle Payment Failure'
Condition: payment_intent.status === 'failed'
```

**Actions:**

1. **Update subscription status to "payment_failed"**
2. **Send payment failure notification**
3. **Start grace period (7 days)**
4. **Schedule retry attempts (3 times over 7 days)**

### Grace Period Management

```yaml
Node: 'Grace Period Check'
Schedule: Daily
Description: Check subscriptions in grace period
```

**Logic:**

```javascript
const gracePeriodEnd = new Date($json.subscription.gracePeriodStart);
gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

if (new Date() > gracePeriodEnd) {
  // Grace period expired - suspend access
  return {
    action: 'suspend',
    subscriptionId: $json.subscription.id,
    reason: 'grace_period_expired',
  };
} else {
  // Still in grace period - send reminder
  return {
    action: 'remind',
    daysLeft: Math.ceil((gracePeriodEnd - new Date()) / (1000 * 60 * 60 * 24)),
  };
}
```

## 📧 Email Templates Integration

### Renewal Reminder Email

```json
{
  "template_id": "renewal_reminder",
  "variables": {
    "user_name": "{{userName}}",
    "service_name": "{{serviceName}}",
    "expiry_date": "{{expiryDate}}",
    "renew_url": "{{renewUrl}}",
    "amount": "{{amount}}"
  }
}
```

### Payment Failed Email

```json
{
  "template_id": "payment_failed",
  "variables": {
    "user_name": "{{userName}}",
    "service_name": "{{serviceName}}",
    "retry_url": "{{retryUrl}}",
    "grace_period_days": 7
  }
}
```

### Subscription Suspended Email

```json
{
  "template_id": "subscription_suspended",
  "variables": {
    "user_name": "{{userName}}",
    "service_name": "{{serviceName}}",
    "reactivate_url": "{{reactivateUrl}}"
  }
}
```

## 📊 Monitoring & Analytics

### Success Metrics

- Successful renewals per day
- Auto-renewal success rate
- Payment failure recovery rate
- Grace period conversion rate

### Alert Conditions

**Critical Alerts:**

- Payment failure rate > 15% in 24 hours
- More than 50 subscriptions expired without renewal
- Stripe API errors > 5 in 1 hour

**Warning Alerts:**

- Grace period subscriptions > 100
- Email delivery rate < 95%
- Renewal reminder delivery failures

## 🔄 Retry Logic

### Payment Retry Schedule

```yaml
Attempt 1: Immediately after failure
Attempt 2: 24 hours after failure
Attempt 3: 72 hours after failure
Final: 7 days after failure (before suspension)
```

### Email Retry Configuration

```yaml
Max Retries: 3
Interval: 15 minutes
Backoff: Exponential
```

## 🚨 Escalation Procedures

### High Payment Failure Rate

1. **Alert admin team immediately**
2. **Check Stripe service status**
3. **Review failed payment patterns**
4. **Consider manual intervention for high-value customers**

### System Outage

1. **Queue all operations**
2. **Send status update to customers if > 2 hours**
3. **Process queued operations when restored**
