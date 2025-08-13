# Cifrado y Gestión de Claves 🔐

## Descripción General

Este documento especifica la implementación completa del sistema de cifrado y
gestión de claves para Club+, cubriendo cifrado de datos en reposo, en tránsito,
y la gestión segura de claves criptográficas.

## Arquitectura Criptográfica

### 🏗️ Modelo de Capas

```
┌─────────────────────────────────────────┐
│           Application Layer             │
│        (Application-level crypto)       │
├─────────────────────────────────────────┤
│          Transport Layer                │
│           (TLS 1.3)                     │
├─────────────────────────────────────────┤
│          Network Layer                  │
│        (IPSec, VPN)                     │
├─────────────────────────────────────────┤
│          Storage Layer                  │
│    (Database encryption, File crypto)   │
└─────────────────────────────────────────┘
```

### Principios de Diseño

- **Defense in Depth**: Múltiples capas de cifrado
- **Key Separation**: Separación de claves por función
- **Crypto Agility**: Capacidad de actualizar algoritmos
- **Zero Trust**: No confiar en ninguna capa individual
- **Performance Balance**: Balance entre seguridad y rendimiento

## Estándares Criptográficos

### 🔒 Algoritmos Aprobados

#### Cifrado Simétrico

```yaml
Primary:
  algorithm: AES-256-GCM
  key_size: 256 bits
  iv_size: 96 bits
  tag_size: 128 bits
  usage: Bulk data encryption

Secondary:
  algorithm: ChaCha20-Poly1305
  key_size: 256 bits
  nonce_size: 96 bits
  usage: Mobile/IoT devices, high-performance scenarios
```

#### Cifrado Asimétrico

```yaml
RSA:
  key_size: 4096 bits
  padding: OAEP with SHA-256
  usage: Key exchange, legacy systems

ECDSA:
  curve: P-384
  hash: SHA-384
  usage: Digital signatures

ECDH:
  curve: P-384
  usage: Key agreement

Post-Quantum (Future):
  algorithm: CRYSTALS-Kyber-1024
  usage: Quantum-resistant key exchange
  status: Evaluation phase
```

#### Funciones Hash

```yaml
Primary:
  algorithm: SHA-256
  output_size: 256 bits
  usage: General hashing, HMAC

Strong:
  algorithm: SHA-3-256
  output_size: 256 bits
  usage: Critical security functions

Password Hashing:
  algorithm: Argon2id
  memory: 64 MB
  time: 3 iterations
  parallelism: 4 threads
  salt_size: 128 bits
```

### 🔑 Gestión de Claves

#### Jerarquía de Claves

```yaml
Key Hierarchy:
  Root Key (HSM):
    - Stored in Hardware Security Module
    - Used to derive Master Keys
    - Rotation: Every 3 years
    - Access: Dual control required

  Master Keys:
    - Derived from Root Key
    - One per service/environment
    - Rotation: Every 12 months
    - Storage: HSM or Key Vault

  Data Encryption Keys (DEKs):
    - Used for actual data encryption
    - Encrypted by Master Keys (envelope encryption)
    - Rotation: Every 90 days
    - Storage: Encrypted in database

  Session Keys:
    - Used for temporary encryption
    - Generated per session
    - Rotation: Every session
    - Storage: Memory only
```

## Cifrado de Datos en Reposo

### 🗄️ Database Encryption

#### PostgreSQL Configuration

```sql
-- Enable Transparent Data Encryption
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/server.crt';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/server.key';
ALTER SYSTEM SET ssl_ca_file = '/etc/ssl/certs/ca.crt';

-- Column-level encryption for PII
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name TEXT,
    last_name TEXT,
    ssn BYTEA, -- Encrypted field
    phone BYTEA, -- Encrypted field
    created_at TIMESTAMP DEFAULT NOW()
);

-- Encryption functions
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT, key_id TEXT)
RETURNS BYTEA AS $$
BEGIN
    -- Use pgcrypto for encryption
    RETURN pgp_sym_encrypt(data, get_encryption_key(key_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data BYTEA, key_id TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, get_encryption_key(key_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Application-Level Encryption

```typescript
import crypto from 'crypto';

class DatabaseCrypto {
  private keyVault: KeyVault;

  constructor(keyVault: KeyVault) {
    this.keyVault = keyVault;
  }

  async encryptField(data: string, keyId: string): Promise<string> {
    const key = await this.keyVault.getKey(keyId);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', key);

    cipher.setAAD(Buffer.from(keyId, 'utf8'));

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex'),
      keyId,
    });
  }

  async decryptField(encryptedData: string, keyId: string): Promise<string> {
    const { iv, encrypted, authTag } = JSON.parse(encryptedData);
    const key = await this.keyVault.getKey(keyId);

    const decipher = crypto.createDecipher('aes-256-gcm', key);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    decipher.setAAD(Buffer.from(keyId, 'utf8'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### 📁 File Storage Encryption

#### S3 Bucket Configuration

```yaml
S3 Encryption Configuration:
  default_encryption:
    method: SSE-KMS
    kms_key: 'arn:aws:kms:us-west-2:123456789:key/club-plus-s3-key'

  bucket_key: enabled
  versioning: enabled

  lifecycle_policy:
    - transition_to_ia: 30_days
    - transition_to_glacier: 90_days
    - expire_versions: 365_days
```

#### Client-Side Encryption

```typescript
class FileEncryption {
  async encryptFile(file: Buffer, keyId: string): Promise<EncryptedFile> {
    const key = await this.keyVault.getDataKey(keyId);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipher('aes-256-cbc', key);
    const encrypted = Buffer.concat([cipher.update(file), cipher.final()]);

    return {
      data: encrypted,
      metadata: {
        iv: iv.toString('base64'),
        keyId,
        algorithm: 'aes-256-cbc',
        size: file.length,
      },
    };
  }

  async decryptFile(encryptedFile: EncryptedFile): Promise<Buffer> {
    const { data, metadata } = encryptedFile;
    const key = await this.keyVault.getDataKey(metadata.keyId);
    const iv = Buffer.from(metadata.iv, 'base64');

    const decipher = crypto.createDecipher(metadata.algorithm, key);
    decipher.setIV(iv);

    return Buffer.concat([decipher.update(data), decipher.final()]);
  }
}
```

## Cifrado de Datos en Tránsito

### 🌐 TLS Configuration

#### Nginx SSL Configuration

```nginx
# SSL Configuration
ssl_protocols TLSv1.3 TLSv1.2;
ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
ssl_prefer_server_ciphers on;
ssl_ecdh_curve secp384r1;

# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Certificate configuration
ssl_certificate /etc/ssl/certs/clubplus.crt;
ssl_certificate_key /etc/ssl/private/clubplus.key;
ssl_trusted_certificate /etc/ssl/certs/ca-chain.crt;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;

# Session configuration
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 24h;
ssl_session_tickets off;
```

#### API Client TLS Configuration

```typescript
import https from 'https';
import tls from 'tls';

const tlsOptions: https.RequestOptions = {
  secureProtocol: 'TLSv1_3_method',
  ciphers: [
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-CHACHA20-POLY1305',
    'ECDHE-RSA-CHACHA20-POLY1305',
  ].join(':'),
  honorCipherOrder: true,
  checkServerIdentity: (hostname: string, cert: any) => {
    return tls.checkServerIdentity(hostname, cert);
  },
};
```

### 🔗 API Encryption

#### Request/Response Encryption

```typescript
class APIEncryption {
  async encryptRequest(
    payload: any,
    recipientPublicKey: string,
  ): Promise<string> {
    // Generate ephemeral key pair
    const ephemeralKeyPair = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp384r1',
    });

    // Perform ECDH
    const sharedSecret = crypto.diffieHellman({
      privateKey: ephemeralKeyPair.privateKey,
      publicKey: recipientPublicKey,
    });

    // Derive encryption key
    const derivedKey = crypto.pbkdf2Sync(
      sharedSecret,
      'salt',
      10000,
      32,
      'sha256',
    );

    // Encrypt payload
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', derivedKey);
    cipher.setIV(iv);

    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(payload), 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      ephemeralPublicKey: ephemeralKeyPair.publicKey.export({
        type: 'spki',
        format: 'pem',
      }),
      iv: iv.toString('base64'),
      encrypted: encrypted.toString('base64'),
      authTag: authTag.toString('base64'),
    });
  }
}
```

## Hardware Security Modules (HSM)

### 🏭 HSM Architecture

#### AWS CloudHSM Configuration

```yaml
CloudHSM Cluster:
  cluster_id: 'cluster-abc123def456'
  hsms:
    - hsm_id: 'hsm-123456789'
      availability_zone: 'us-west-2a'
      state: 'ACTIVE'
    - hsm_id: 'hsm-987654321'
      availability_zone: 'us-west-2b'
      state: 'ACTIVE'

Security Configuration:
  authentication: two_factor
  network_isolation: vpc_private_subnets
  backup_policy: automated_daily
  monitoring: cloudwatch_enabled
```

#### Key Generation and Storage

```python
import boto3
from cloudhsm_mgmt_util import CryptoUser

class HSMKeyManager:
    def __init__(self, cluster_id: str):
        self.cluster_id = cluster_id
        self.client = boto3.client('cloudhsmv2')

    def generate_master_key(self, key_label: str) -> str:
        """Generate a new AES-256 master key in HSM"""
        response = self.client.create_key({
            'ClusterId': self.cluster_id,
            'KeySpec': 'AES_256',
            'Usage': 'ENCRYPT_DECRYPT',
            'Label': key_label,
            'Exportable': False  # Key cannot leave HSM
        })
        return response['KeyId']

    def encrypt_data_key(self, master_key_id: str, data_key: bytes) -> bytes:
        """Encrypt a data encryption key using HSM master key"""
        response = self.client.encrypt({
            'ClusterId': self.cluster_id,
            'KeyId': master_key_id,
            'Plaintext': data_key
        })
        return response['CiphertextBlob']
```

### 🔐 Key Lifecycle Management

#### Automated Key Rotation

```typescript
class KeyRotationService {
  private hsm: HSMKeyManager;
  private keyStore: KeyStore;

  async rotateDataKeys(): Promise<void> {
    const keysToRotate = await this.keyStore.getKeysForRotation();

    for (const keyId of keysToRotate) {
      await this.rotateKey(keyId);
    }
  }

  private async rotateKey(keyId: string): Promise<void> {
    // Generate new key
    const newKeyId = await this.hsm.generateMasterKey(`${keyId}-${Date.now()}`);

    // Re-encrypt all data with new key
    await this.reencryptData(keyId, newKeyId);

    // Update key references
    await this.keyStore.updateKeyReference(keyId, newKeyId);

    // Schedule old key for deletion (after grace period)
    await this.scheduleKeyDeletion(keyId, 30); // 30 days
  }

  private async reencryptData(
    oldKeyId: string,
    newKeyId: string,
  ): Promise<void> {
    // Implementation would re-encrypt all data using the old key
    // This is a complex operation that needs to be done carefully
    // to avoid data loss
  }
}
```

## Implementación de APIs

### 🔌 Crypto Service API

#### Key Management Endpoints

```yaml
POST /api/crypto/keys:
  description: Generate new encryption key
  request:
    key_type: string # "data", "session", "master"
    algorithm: string # "aes-256", "rsa-4096"
    usage: string # "encrypt", "sign", "both"
  response:
    key_id: string
    public_key: string (if asymmetric)
    created_at: timestamp

GET /api/crypto/keys/{key_id}:
  description: Get key information (not the key itself)
  response:
    key_id: string
    key_type: string
    algorithm: string
    status: string
    created_at: timestamp
    expires_at: timestamp

POST /api/crypto/encrypt:
  description: Encrypt data
  request:
    data: string
    key_id: string
    algorithm: string (optional)
  response:
    encrypted_data: string
    iv: string
    auth_tag: string (for authenticated encryption)

POST /api/crypto/decrypt:
  description: Decrypt data
  request:
    encrypted_data: string
    key_id: string
    iv: string
    auth_tag: string (if authenticated)
  response:
    data: string
```

### 🛡️ Crypto Middleware

#### Express.js Middleware

```typescript
import { Request, Response, NextFunction } from 'express';

interface CryptoRequest extends Request {
  crypto: {
    encrypt: (data: string, keyId?: string) => Promise<string>;
    decrypt: (encryptedData: string, keyId?: string) => Promise<string>;
  };
}

export const cryptoMiddleware = (cryptoService: CryptoService) => {
  return (req: CryptoRequest, res: Response, next: NextFunction) => {
    req.crypto = {
      encrypt: async (data: string, keyId?: string) => {
        const effectiveKeyId = keyId || (await cryptoService.getDefaultKeyId());
        return await cryptoService.encrypt(data, effectiveKeyId);
      },

      decrypt: async (encryptedData: string, keyId?: string) => {
        const metadata = JSON.parse(encryptedData);
        const effectiveKeyId = keyId || metadata.keyId;
        return await cryptoService.decrypt(encryptedData, effectiveKeyId);
      },
    };

    next();
  };
};
```

## Monitoreo y Auditoría

### 📊 Métricas Criptográficas

#### Key Usage Metrics

```yaml
Tracked Metrics:
  - key_generation_rate
  - key_rotation_success_rate
  - encryption_operations_per_second
  - decryption_operations_per_second
  - key_access_violations
  - hsm_availability
  - certificate_expiry_warnings

Alerts:
  key_rotation_failed:
    threshold: 1 failure
    severity: high

  hsm_unavailable:
    threshold: 30 seconds
    severity: critical

  unusual_key_access:
    threshold: access outside normal hours
    severity: medium
```

#### Crypto Audit Events

```json
{
  "timestamp": "2025-08-13T10:00:00Z",
  "event_type": "crypto_operation",
  "operation": "encrypt",
  "key_id": "key_123456",
  "algorithm": "aes-256-gcm",
  "data_size": 1024,
  "user_id": "user_789",
  "application": "api-server",
  "success": true,
  "execution_time_ms": 15
}
```

### 🔍 Compliance Reporting

#### Crypto Compliance Dashboard

```yaml
Compliance Reports:
  FIPS_140_2:
    hsm_compliance: validated
    algorithms_approved: all
    key_storage: level_3

  Common_Criteria:
    evaluation_level: EAL4+
    certificate_status: valid
    expiry_date: '2026-08-13'

  PCI_DSS:
    crypto_requirements: compliant
    key_management: compliant
    data_encryption: compliant
```

## Configuración por Entorno

### 🏗️ Development

```yaml
Environment: development
Encryption:
  algorithms: reduced_set
  key_rotation: disabled
  hsm_required: false

Key Storage:
  provider: local_vault
  backup: disabled
```

### 🧪 Staging

```yaml
Environment: staging
Encryption:
  algorithms: production_algorithms
  key_rotation: monthly
  hsm_required: true

Key Storage:
  provider: aws_kms
  backup: enabled
```

### 🚀 Production

```yaml
Environment: production
Encryption:
  algorithms: approved_algorithms_only
  key_rotation: automated
  hsm_required: true

Key Storage:
  provider: cloudhsm
  backup: multi_region
  compliance: fips_140_2_level_3
```

## Disaster Recovery

### 🔄 Key Backup and Recovery

#### Backup Strategy

```yaml
Backup Configuration:
  frequency: continuous_replication
  retention: 7_years
  encryption: aes_256_gcm
  storage: multi_region_s3

Recovery Procedures:
  rto: 1_hour # Recovery Time Objective
  rpo: 15_minutes # Recovery Point Objective
  testing: monthly_drills
```

#### Emergency Key Recovery

```yaml
Emergency Procedures:
  key_escrow:
    trustees: 3_of_5_threshold
    activation: emergency_authorization
    duration: 72_hours_maximum

  master_key_recovery:
    backup_location: secure_facility
    access_control: dual_control_required
    verification: cryptographic_checksum
```

---

**Responsable**: Crypto Team + Security Architecture  
**Última actualización**: 13 de agosto de 2025  
**Versión**: 1.0  
**Próxima revisión**: 13 de octubre de 2025
