# Google Analytics 4 Setup

## 📊 Overview

Configuración completa de Google Analytics 4 (GA4) para Club+ MVP, incluyendo
tracking de eventos de negocio, conversiones y análisis de usuario.

## 🚀 Initial Setup

### 1. Create Google Analytics Account

1. Go to <https://analytics.google.com>
2. Click "Start measuring"
3. Create account name: "Club Plus Analytics"
4. Configure data sharing settings
5. Accept terms of service

### 2. Set Up Property

**Property Configuration:**

```yaml
Property Name: Club Plus MVP
Industry Category: Technology/Software
Business Size: Small Business (1-100 employees)
Business Objectives:
  - Get baseline reports
  - Measure customer actions
  - Examine user behavior
```

### 3. Configure Data Streams

**Web Data Stream:**

```yaml
Website URL: https://clubplus.vercel.app
Stream Name: Club Plus Web App
Enhanced Measurement:
  Enable all options - Page views - Scrolls - Outbound clicks - Site search -
  Video engagement - File downloads
```

## 📋 Implementation

### 1. Install GA4 in Frontend

Add to `apps/frontend/package.json`:

```json
{
  "dependencies": {
    "gtag": "^1.0.1",
    "@types/gtag": "^0.0.12"
  }
}
```

### 2. Create Analytics Service

Create `apps/frontend/src/services/analytics.ts`:

```typescript
// Google Analytics service
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

class AnalyticsService {
  private isInitialized = false;
  private measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  initialize() {
    if (!this.measurementId || this.isInitialized) return;

    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    // Configure GA4
    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    this.isInitialized = true;
    console.log('Google Analytics initialized');
  }

  // Track page views
  trackPageView(pagePath: string, pageTitle?: string) {
    if (!this.isInitialized) return;

    window.gtag('config', this.measurementId, {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }

  // Track custom events
  trackEvent(eventName: string, parameters: Record<string, any> = {}) {
    if (!this.isInitialized) return;

    window.gtag('event', eventName, {
      ...parameters,
      timestamp: new Date().toISOString(),
    });
  }

  // Business-specific tracking methods
  trackUserRegistration(userId: string, method: string) {
    this.trackEvent('sign_up', {
      method,
      user_id: userId,
    });
  }

  trackProfilePurchase(userId: string, profileType: string, amount: number) {
    this.trackEvent('purchase', {
      transaction_id: `profile_${Date.now()}`,
      value: amount,
      currency: 'USD',
      user_id: userId,
      items: [
        {
          item_id: profileType,
          item_name: `${profileType} Profile`,
          item_category: 'Digital Services',
          quantity: 1,
          price: amount,
        },
      ],
    });
  }

  trackServiceInteraction(service: string, action: string, userId?: string) {
    this.trackEvent('service_interaction', {
      service_name: service,
      action_type: action,
      user_id: userId,
    });
  }

  trackPaymentAttempt(userId: string, amount: number, success: boolean) {
    this.trackEvent(success ? 'payment_success' : 'payment_failed', {
      user_id: userId,
      value: amount,
      currency: 'USD',
    });
  }

  trackCustomerSupport(userId: string, issueType: string) {
    this.trackEvent('support_ticket', {
      user_id: userId,
      issue_type: issueType,
    });
  }

  // Set user properties
  setUserProperties(userId: string, properties: Record<string, any>) {
    if (!this.isInitialized) return;

    window.gtag('config', this.measurementId, {
      user_id: userId,
      custom_map: properties,
    });
  }
}

export const analytics = new AnalyticsService();
```

### 3. Initialize in App

Update `apps/frontend/src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { analytics } from './services/analytics';

// Initialize Analytics
analytics.initialize();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### 4. Environment Variables

Add to `apps/frontend/.env.example`:

```env
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Add to `apps/frontend/.env.local`:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 📊 Event Tracking Configuration

### 1. Business Events Setup

Create comprehensive event tracking:

```typescript
// apps/frontend/src/hooks/useAnalytics.ts
import { useEffect } from 'react';
import { analytics } from '../services/analytics';

export const useAnalytics = () => {
  useEffect(() => {
    // Track page view on component mount
    analytics.trackPageView(window.location.pathname);
  }, []);

  return {
    trackUserRegistration: analytics.trackUserRegistration.bind(analytics),
    trackProfilePurchase: analytics.trackProfilePurchase.bind(analytics),
    trackServiceInteraction: analytics.trackServiceInteraction.bind(analytics),
    trackPaymentAttempt: analytics.trackPaymentAttempt.bind(analytics),
    trackCustomerSupport: analytics.trackCustomerSupport.bind(analytics),
    trackEvent: analytics.trackEvent.bind(analytics),
  };
};
```

### 2. Router Integration

For React Router page tracking:

```typescript
// apps/frontend/src/components/AnalyticsProvider.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../services/analytics';

export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView(location.pathname + location.search);
  }, [location]);

  return <>{children}</>;
};
```

## 🎯 Custom Dimensions & Metrics

### 1. Configure Custom Dimensions

In GA4 Admin → Data display → Custom definitions:

**Custom Dimensions:**

```yaml
User Type: user_type (User-scoped)
  - Description: Type of user (free, premium, enterprise)
  - Parameter: user_type

Service Category: service_category (Event-scoped)
  - Description: Category of service accessed
  - Parameter: service_category

Profile Type: profile_type (Event-scoped)
  - Description: Type of profile purchased
  - Parameter: profile_type

Payment Method: payment_method (Event-scoped)
  - Description: Method used for payment
  - Parameter: payment_method
```

### 2. Enhanced Event Parameters

```typescript
// Enhanced tracking with custom dimensions
export const trackEnhancedUserRegistration = (
  userId: string,
  method: string,
  userType: string = 'free',
) => {
  analytics.trackEvent('sign_up', {
    method,
    user_id: userId,
    user_type: userType,
    service_category: 'authentication',
  });
};

export const trackEnhancedProfilePurchase = (
  userId: string,
  profileType: string,
  amount: number,
  paymentMethod: string,
) => {
  analytics.trackEvent('purchase', {
    transaction_id: `profile_${Date.now()}`,
    value: amount,
    currency: 'USD',
    user_id: userId,
    profile_type: profileType,
    payment_method: paymentMethod,
    service_category: 'digital_services',
    items: [
      {
        item_id: profileType,
        item_name: `${profileType} Profile`,
        item_category: 'Digital Services',
        quantity: 1,
        price: amount,
      },
    ],
  });
};
```

## 📈 Conversion Tracking

### 1. Define Key Conversions

In GA4 Admin → Events → Mark as conversion:

**Primary Conversions:**

```yaml
sign_up: User registration completion
purchase: Profile purchase completion
payment_success: Successful payment processing
```

**Secondary Conversions:**

```yaml
service_interaction: Service engagement
support_ticket: Customer support engagement
```

### 2. Enhanced Conversions

For better attribution, implement enhanced conversions:

```typescript
// Enhanced conversion tracking
export const trackConversionWithUserData = (
  conversionEvent: string,
  userId: string,
  userEmail?: string,
  userPhone?: string,
) => {
  analytics.trackEvent(conversionEvent, {
    user_id: userId,
    // Enhanced conversion data (hashed)
    email: userEmail ? btoa(userEmail.toLowerCase()) : undefined,
    phone: userPhone ? btoa(userPhone.replace(/\D/g, '')) : undefined,
  });
};
```

## 📊 Audience Configuration

### 1. Create Custom Audiences

**High-Value Users:**

```yaml
Conditions:
  - purchase (lifetime) >= 1
  - OR payment_success (lifetime) >= 1
Duration: 540 days
```

**Engaged Users:**

```yaml
Conditions:
  - service_interaction (last 30 days) >= 5
  - OR session_duration > 180 seconds (last 30 days)
Duration: 90 days
```

**At-Risk Users:**

```yaml
Conditions:
  - sign_up (lifetime) >= 1
  - AND purchase (lifetime) = 0
  - AND last_activity > 7 days ago
Duration: 180 days
```

## 🔍 Data Analysis Setup

### 1. Custom Reports

**User Acquisition Report:**

```yaml
Dimensions:
  - First user source/medium
  - User type
  - Date
Metrics:
  - New users
  - Conversions
  - Revenue
```

**Service Performance Report:**

```yaml
Dimensions:
  - Service category
  - Profile type
  - Date
Metrics:
  - Service interactions
  - Purchase events
  - Revenue per service
```

### 2. Funnel Analysis

Create conversion funnels:

**Registration Funnel:**

```yaml
Step 1: page_view (landing page)
Step 2: form_start (registration form)
Step 3: sign_up (completion)
```

**Purchase Funnel:**

```yaml
Step 1: page_view (pricing page)
Step 2: begin_checkout
Step 3: add_payment_info
Step 4: purchase
```

## 🔐 Privacy & Compliance

### 1. Cookie Consent Integration

```typescript
// apps/frontend/src/components/CookieConsent.tsx
import { useState, useEffect } from 'react';
import { analytics } from '../services/analytics';

export const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowConsent(true);
    } else if (consent === 'accepted') {
      analytics.initialize();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    analytics.initialize();
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <p className="text-sm">
          We use cookies and analytics to improve your experience.
          By continuing, you agree to our use of analytics cookies.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-blue-600 rounded hover:bg-blue-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 2. Data Retention Settings

Configure in GA4 Admin → Data Settings → Data Retention:

```yaml
User data retention: 14 months
Event data retention: 14 months
Reset on new activity: Enabled
```

### 3. IP Anonymization

GA4 automatically anonymizes IP addresses, but ensure compliance:

```typescript
// Additional privacy configuration
window.gtag('config', measurementId, {
  anonymize_ip: true,
  allow_google_signals: false, // Disable if required by privacy policy
});
```

## 📊 Dashboard Setup

### 1. Key Metrics Dashboard

Create custom dashboard with:

**Overview Cards:**

```yaml
Total Users: Last 30 days vs previous 30 days
New Registrations: Daily count with trend
Revenue: Total and trend
Conversion Rate: Registration to purchase
```

**Charts:**

```yaml
User Acquisition: Source/medium breakdown
Service Usage: Most popular services
Revenue Trends: Daily revenue over time
Funnel Performance: Registration and purchase funnels
```

### 2. Real-time Monitoring

Set up real-time reports for:

```yaml
Active users on site Current popular pages Live conversion events Geographic
distribution
```

## 🔔 Alerts & Notifications

### 1. Intelligence Alerts

Configure automatic alerts:

**Traffic Anomalies:**

```yaml
Significant decrease in sessions: -20% week over week
Significant increase in bounce rate: +25% week over week
```

**Conversion Anomalies:**

```yaml
Significant decrease in conversions: -15% day over day
Significant decrease in revenue: -20% day over day
```

### 2. Custom Alerts Integration

Connect GA4 to external alerting:

```typescript
// Webhook integration for GA4 alerts
export const setupAnalyticsAlerts = () => {
  // This would typically be done via GA4 Intelligence API
  // or third-party tools like Zapier

  const alertEndpoint =
    'https://n8n.clubplus-workflows.railway.app/webhook/ga4-alert';

  // Configure alerts to send to webhook
  // Implementation depends on chosen integration method
};
```

## 📋 Implementation Checklist

### Initial Setup

- [ ] Create Google Analytics 4 account
- [ ] Configure property and data stream
- [ ] Install tracking code in frontend
- [ ] Set up environment variables
- [ ] Test basic tracking

### Event Configuration

- [ ] Implement custom event tracking
- [ ] Set up conversion events
- [ ] Configure custom dimensions
- [ ] Test event firing
- [ ] Validate data in GA4

### Privacy & Compliance

- [ ] Implement cookie consent
- [ ] Configure data retention
- [ ] Update privacy policy
- [ ] Test consent flow
- [ ] Verify IP anonymization

### Reporting Setup

- [ ] Create custom dashboards
- [ ] Set up conversion funnels
- [ ] Configure audience segments
- [ ] Set up intelligence alerts
- [ ] Train team on reporting

### Integration

- [ ] Connect to other tools (if needed)
- [ ] Set up data exports
- [ ] Configure API access
- [ ] Document processes
- [ ] Create monitoring procedures

## 💡 Best Practices

1. **Data Quality:** Always validate tracking implementation
2. **Privacy First:** Implement proper consent mechanisms
3. **Performance:** Load analytics asynchronously
4. **Segmentation:** Create meaningful user segments
5. **Regular Review:** Monitor and optimize tracking regularly
6. **Documentation:** Keep tracking plans updated
7. **Testing:** Test tracking in all environments

---

## 🔗 Resources

- **GA4 Documentation:**
  <https://developers.google.com/analytics/devguides/collection/ga4>
- **React Integration:** <https://github.com/react-ga/react-ga4>
- **Privacy Guidelines:** <https://support.google.com/analytics/answer/9019185>
- **Measurement Protocol:**
  <https://developers.google.com/analytics/devguides/collection/protocol/ga4>
