# n8n Workflow: Profile Management & Rotation

## 📋 Overview

Workflow para gestionar automáticamente el pool de perfiles de streaming,
rotaciones de credenciales y detección de uso anormal.

## ⏰ Multiple Triggers

### Trigger 1: Scheduled Profile Health Check

**Schedule:** Every 4 hours **Purpose:** Verify profile availability and
functionality

### Trigger 2: Profile Usage Alert Webhook

**Webhook:** `POST /webhook/profile-usage-alert` **Purpose:** Handle alerts from
streaming services about suspicious usage

### Trigger 3: Manual Profile Rotation Request

**Webhook:** `POST /webhook/profile-rotation` **Purpose:** Allow manual rotation
triggers from admin panel

## 🔄 Main Workflow Steps

### Step 1: Get Active Profiles Status

```yaml
Node: 'Get Profiles Status'
Type: HTTP Request
Method: GET
URL: 'https://clubplus-api.railway.app/api/v1/profiles/status'
Headers:
  Authorization: 'Bearer {{$credentials.api.token}}'
```

**Expected Response:**

```json
{
  "profiles": [
    {
      "id": "profile-uuid",
      "service": "netflix",
      "status": "active",
      "assignedUsers": 4,
      "maxUsers": 5,
      "lastHealthCheck": "2025-08-12T08:00:00Z",
      "credentialsLastRotated": "2025-08-01T00:00:00Z",
      "suspiciousActivity": false
    }
  ]
}
```

### Step 2: Health Check Each Profile

```yaml
Node: 'Health Check Profile'
Type: HTTP Request (for each profile)
Method: POST
URL: 'https://clubplus-api.railway.app/api/v1/profiles/{{$json.id}}/health-check'
```

**Health Check Process:**

1. Attempt login with current credentials
2. Check profile availability
3. Verify streaming access
4. Check for account warnings/restrictions

### Step 3: Detect Issues Requiring Rotation

```yaml
Node: 'Analyze Profile Health'
Type: Code
Description: Determine if profile needs rotation
```

**Code Logic:**

```javascript
const profile = $json.profile;
const now = new Date();
const lastRotated = new Date(profile.credentialsLastRotated);
const daysSinceRotation = (now - lastRotated) / (1000 * 60 * 60 * 24);

// Rotation triggers
const needsRotation =
  profile.suspiciousActivity ||
  profile.status === 'locked' ||
  profile.status === 'suspended' ||
  daysSinceRotation > 30 || // Rotate every 30 days
  profile.assignedUsers > profile.maxUsers;

return {
  profileId: profile.id,
  needsRotation,
  rotationReason: needsRotation
    ? getRotationReason(profile, daysSinceRotation)
    : null,
  urgency:
    profile.suspiciousActivity || profile.status !== 'active'
      ? 'high'
      : 'normal',
};

function getRotationReason(profile, days) {
  if (profile.suspiciousActivity) return 'suspicious_activity';
  if (profile.status === 'locked') return 'account_locked';
  if (profile.status === 'suspended') return 'account_suspended';
  if (days > 30) return 'scheduled_rotation';
  if (profile.assignedUsers > profile.maxUsers) return 'overcapacity';
  return 'unknown';
}
```

### Step 4: Execute Profile Rotation

```yaml
Node: 'Rotate Profile Credentials'
Type: HTTP Request
Method: POST
URL: 'https://clubplus-api.railway.app/api/v1/profiles/{{$json.profileId}}/rotate'
Body:
  reason: '{{$json.rotationReason}}'
  urgency: '{{$json.urgency}}'
Headers:
  Authorization: 'Bearer {{$credentials.api.token}}'
```

**Rotation Process:**

1. Get new credentials from credential pool
2. Test new credentials
3. Update profile in database
4. Notify affected users
5. Schedule old credentials deactivation (24h delay)

### Step 5: Notify Affected Users

```yaml
Node: 'Notify Users of Credential Change'
Type: HTTP Request
Method: POST
URL: 'https://api.resend.com/emails'
```

**Email Template:**

```json
{
  "from": "noreply@clubplus.app",
  "to": "{{$json.user.email}}",
  "subject": "Actualización de credenciales - {{$json.service}}",
  "template_id": "credentials_updated",
  "template_data": {
    "userName": "{{$json.user.name}}",
    "serviceName": "{{$json.service}}",
    "newCredentials": {
      "email": "{{$json.newCredentials.email}}",
      "password": "{{$json.newCredentials.password}}",
      "profileName": "{{$json.newCredentials.profileName}}"
    },
    "effectiveDate": "{{$json.effectiveDate}}",
    "reason": "{{$json.rotationReason}}"
  }
}
```

## 🚨 Emergency Profile Rotation

### Trigger: Suspicious Activity Alert

```yaml
Node: "Emergency Rotation Trigger"
Webhook: POST /webhook/profile-emergency
Payload:
  profileId: string
  alertType: "simultaneous_streams" | "unusual_location" | "password_change"
  severity: "low" | "medium" | "high"
```

### Emergency Actions

**High Severity:**

1. Immediately suspend profile
2. Rotate credentials within 15 minutes
3. Send urgent notification to users
4. Alert admin team via Slack

**Medium Severity:**

1. Mark for priority rotation
2. Execute rotation within 2 hours
3. Send standard notification

**Low Severity:**

1. Add to rotation queue
2. Execute in next scheduled rotation cycle

## 📊 Profile Pool Management

### Monitor Pool Health

```yaml
Node: 'Check Pool Capacity'
Schedule: Every 2 hours
Description: Ensure adequate profile availability
```

**Capacity Checks:**

- Available profiles per service > 10% of total demand
- New profile addition if capacity < threshold
- Alert if unable to meet demand

### Credential Pool Replenishment

```yaml
Node: 'Replenish Credential Pool'
Condition: Available credentials < 20
```

**Replenishment Process:**

1. Generate request for new credentials
2. Notify credential procurement team
3. Test new credentials before adding to pool
4. Update pool capacity metrics

## 🔐 Security Monitoring

### Detect Unusual Patterns

```javascript
// Monitor for patterns that suggest credential compromise
const checkPatterns = profile => {
  const alerts = [];

  // Multiple simultaneous streams from different IPs
  if (profile.activeStreams > profile.maxStreams) {
    alerts.push('simultaneous_streams_exceeded');
  }

  // Geographic inconsistency
  if (profile.lastKnownLocations.length > 3) {
    alerts.push('multiple_geographic_locations');
  }

  // Unusual usage hours
  if (profile.usagePattern.isUnusual) {
    alerts.push('unusual_usage_pattern');
  }

  return alerts;
};
```

### Auto-Response to Security Events

```yaml
Node: 'Security Auto-Response'
Triggers:
  - simultaneous_streams_exceeded: Immediate rotation
  - multiple_geographic_locations: 2-hour delayed rotation
  - unusual_usage_pattern: Flag for manual review
```

## 📈 Analytics & Reporting

### Daily Profile Report

```yaml
Node: 'Generate Daily Report'
Schedule: Daily at 09:00 UTC
```

**Report Contents:**

- Total profiles by service
- Rotation events in last 24h
- Health check success rate
- Security alerts summary
- Pool capacity status

### Weekly Pool Optimization

```yaml
Node: 'Optimize Profile Pool'
Schedule: Weekly on Sunday
```

**Optimization Tasks:**

1. Analyze usage patterns
2. Adjust pool sizes per service
3. Identify underperforming profiles
4. Generate capacity planning report

## 🔔 Alert Configuration

### Critical Alerts

- Profile pool below 5% capacity
- More than 3 emergency rotations in 1 hour
- Health check failure rate > 20%

### Warning Alerts

- Profile rotation rate > normal baseline
- Credential pool needs replenishment
- Geographic pattern anomalies detected

### Alert Channels

- Slack: #alerts-profiles
- Email: ops@clubplus.app
- SMS: For critical issues only
