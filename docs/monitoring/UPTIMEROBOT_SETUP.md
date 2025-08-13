# UptimeRobot Setup Guide

## 📊 Overview

Configuración completa de UptimeRobot para monitorear la disponibilidad del API
de Club+ y recibir alertas instantáneas cuando hay problemas.

## 🚀 Quick Setup

### 1. Create Account

1. Go to https://uptimerobot.com
2. Click "Sign Up Free"
3. Use email: monitoring@clubplus.app (or your preferred)
4. Verify email and complete setup

### 2. Create API Monitor

**Monitor Configuration:**

```yaml
Monitor Type: HTTP(s)
Friendly Name: 'Club+ API Health'
URL: https://clubplus-api.railway.app/health
Monitoring Interval: 5 minutes (free tier)
```

**Advanced Settings:**

```yaml
HTTP Method: GET
Timeout: 30 seconds
Expected Status Code: 200
Keyword Monitoring: "ok" (optional)
```

### 3. Create Database Monitor

**Monitor Configuration:**

```yaml
Monitor Type: HTTP(s)
Friendly Name: 'Club+ Database Health'
URL: https://clubplus-api.railway.app/health/db
Monitoring Interval: 5 minutes
```

## 🔔 Alert Setup

### Email Alerts

1. Go to "My Settings" → "Alert Contacts"
2. Add contact:
   ```yaml
   Type: E-mail
   Friendly Name: 'Admin Alert'
   E-mail: admin@clubplus.app
   ```

### Slack Integration (Recommended)

1. **In Slack:**
   - Go to your Slack workspace
   - Install "UptimeRobot" app from App Directory
   - Create channel `#alerts-uptime`
   - Get webhook URL from UptimeRobot app settings

2. **In UptimeRobot:**
   ```yaml
   Type: Webhook
   Friendly Name: 'Slack Alerts'
   URL: [Slack webhook URL]
   ```

### SMS Alerts (Critical Only)

```yaml
Type: SMS
Friendly Name: 'Critical SMS'
Phone: +1234567890
Note: Use only for critical monitors
```

## 📈 Monitoring Configuration

### Status Pages

1. **Create Public Status Page:**
   - Go to "Status Pages"
   - Click "Create Status Page"
   - Configure:
     ```yaml
     Title: 'Club+ Service Status'
     URL: clubplus.status-page.io
     Monitors: Select API and Database monitors
     ```

2. **Custom Domain (Optional):**
   - Use: status.clubplus.app
   - Requires DNS CNAME record

### Maintenance Windows

**Scheduled Maintenance Setup:**

```yaml
Type: Weekly
Day: Sunday
Time: 02:00 - 04:00 UTC
Reason: 'Routine maintenance'
Disable Alerts: Yes
```

## ⚙️ Advanced Configuration

### Custom HTTP Headers

If API requires authentication:

```yaml
Header Name: Authorization
Header Value: Bearer your-api-key
```

### Keyword Monitoring

Monitor for specific response content:

```yaml
Keyword: "status":"ok"
Type: Exists
```

### Geographic Monitoring

**Monitoring Locations (Free Tier):**

- US East
- US West
- Europe
- Asia

## 🚨 Alert Rules

### Default Alert Configuration

```yaml
Alert When: Monitor goes DOWN
Alert After: 1 failed check (5 minutes)
Re-Alert: Every 60 minutes while down
```

### Custom Alert Timing

**For Critical Services:**

```yaml
Alert After: Immediately (1 check)
Re-Alert: Every 30 minutes
Recovery Alert: Yes
```

**For Non-Critical:**

```yaml
Alert After: 2 failed checks (10 minutes)
Re-Alert: Every 120 minutes
Recovery Alert: Yes
```

## 📊 Dashboard & Reporting

### Monitor Groups

Create logical groups:

```yaml
Group: "Core API"
Monitors: [API Health, Database Health]

Group: "Frontend"
Monitors: [Frontend Health] (when available)
```

### Reporting

**Monthly Uptime Reports:**

- Automatic email reports
- Include: Uptime %, Response times, Incidents
- Recipients: admin@clubplus.app, ops@clubplus.app

## 🔧 Integration with Other Tools

### Webhook Integration

**Generic Webhook for Custom Processing:**

```yaml
URL: https://n8n.clubplus-workflows.railway.app/webhook/uptime-alert
Method: POST
Custom Headers: Authorization: Bearer webhook-secret
```

**Webhook Payload:**

```json
{
  "alertType": "*alertType*",
  "monitorName": "*monitorFriendlyName*",
  "monitorURL": "*monitorURL*",
  "alertDateTime": "*alertDateTime*",
  "alertDetails": "*alertDetails*"
}
```

### API Integration

**UptimeRobot API for Custom Dashboards:**

```bash
# Get monitor status
curl -X POST https://api.uptimerobot.com/v2/getMonitors \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=YOUR_API_KEY&format=json"
```

## 📋 Monitoring Checklist

### Initial Setup

- [ ] UptimeRobot account created
- [ ] API health monitor configured
- [ ] Database health monitor configured
- [ ] Email alerts configured
- [ ] Slack integration setup
- [ ] Status page created

### Advanced Setup

- [ ] Custom headers configured
- [ ] Maintenance windows scheduled
- [ ] Geographic monitoring enabled
- [ ] Webhook integrations tested
- [ ] Monthly reports configured

### Testing

- [ ] Test alert by pausing monitor
- [ ] Verify email notifications work
- [ ] Confirm Slack notifications work
- [ ] Validate status page updates
- [ ] Test recovery notifications

## 🔄 Maintenance

### Weekly Tasks

- Review uptime statistics
- Check alert delivery logs
- Verify monitor configurations
- Update maintenance schedules

### Monthly Tasks

- Analyze uptime trends
- Review alert thresholds
- Update contact information
- Optimize monitor settings

## 📊 Expected Metrics

### Target SLAs

```yaml
API Uptime: 99.9% (8.76 hours downtime/year)
Response Time: < 500ms average
Recovery Time: < 15 minutes
Alert Response: < 5 minutes
```

### Baseline Performance

```yaml
Typical Response Time: 100-300ms
Peak Usage Hours: 18:00-22:00 local time
Maintenance Window: Sunday 02:00-04:00 UTC
Expected Downtime: < 2 hours/month
```

## 🚨 Troubleshooting

### Common Issues

**False Positives:**

- Check monitor timeout settings
- Verify URL accessibility
- Review expected status codes

**Missing Alerts:**

- Confirm alert contact settings
- Check spam folders for emails
- Test webhook endpoints

**High Response Times:**

- Monitor Railway service metrics
- Check database performance
- Review application logs

### Contact Support

- UptimeRobot Support: https://uptimerobot.com/support
- Documentation: https://uptimerobot.com/docs
- Community: https://community.uptimerobot.com

## 💡 Pro Tips

1. **Use monitor groups** for logical organization
2. **Set realistic alert thresholds** to avoid noise
3. **Create different alert rules** for different service criticalities
4. **Use status pages** for transparent communication
5. **Regularly test your alerts** to ensure they work

---

## 🎯 Success Metrics

After setup, you should see:

- ✅ 99.5%+ uptime within first month
- ✅ < 5 minute alert response time
- ✅ Zero missed critical alerts
- ✅ Public status page operational

**Next Steps:**

- Set up Sentry error tracking
- Configure advanced analytics
- Integrate with incident management tools
