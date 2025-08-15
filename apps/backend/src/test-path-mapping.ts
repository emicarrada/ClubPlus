// Test file to verify path mapping works correctly
// This file will be deleted after testing

// Test imports using path mapping
import { logger } from '@/config/logger';
import { ValidationError } from '@/utils/errors';
import { successResponse } from '@/utils/response';

// Test function using path mappings
function testPathMappings() {
  logger.info('Testing path mappings');
  
  try {
    return successResponse('Path mappings work correctly!', 'Test successful');
  } catch (error) {
    throw new ValidationError('Test failed');
  }
}

export { testPathMappings };
