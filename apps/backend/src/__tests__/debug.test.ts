/**
 * Debug test para ver qué IDs estamos generando
 */

import { createTestUser } from './helpers/authHelper';

describe('Debug ID Generation', () => {
  test('should show user ID format', async () => {
    const user = await createTestUser();
    console.log('Generated User ID:', user.id);
    console.log('ID Type:', typeof user.id);
    console.log('ID Length:', user.id.length);
    
    // Test if it matches UUID pattern
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    console.log('Is UUID format:', uuidPattern.test(user.id));
  });
});
