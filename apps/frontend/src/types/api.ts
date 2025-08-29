// Club+ API Types - Updated for real backend integration
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
}

// Club+ Backend Models (aligned with Prisma schema)
export interface Platform {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ComboTemplate {
  id: string;
  name: string;
  description?: string;
  price?: number;
  isActive: boolean;
  createdAt: string;
  platforms?: Platform[];
}

export interface ComboOption {
  id: string;
  name: string;
  description: string;
  platforms: Platform[];
  price: number;
  originalPrice: number;
  savings: string;
  isPopular?: boolean;
}

// User-related types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
}

export interface UserCombo {
  id: string;
  userId: string;
  comboTemplateId: string;
  status: 'ACTIVE' | 'CANCELLED' | 'PAUSED';
  createdAt: string;
  comboTemplate: ComboTemplate;
}

// Assignment types
export interface Assignment {
  id: string;
  userId: string;
  profileId: string;
  comboId: string;
  assignedAt: string;
  profile: Profile;
}

export interface Profile {
  id: string;
  accountId: string;
  profileName: string;
  avatarUrl?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'BLOCKED';
  createdAt: string;
}

// API request types
export interface CreateComboRequest {
  comboTemplateId: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

// Predefined Combos for MVP (matching backend seed data)
export type ComboType = 'entertainment' | 'creative' | 'complete';

export const COMBO_PRESETS: Record<ComboType, Omit<ComboOption, 'id' | 'platforms'>> = {
  entertainment: {
    name: 'Combo Entretenimiento',
    description: 'Disney+ + HBO Max - Todo el entretenimiento que necesitas',
    price: 199,
    originalPrice: 398,
    savings: '50%',
    isPopular: true,
  },
  creative: {
    name: 'Combo Creativo', 
    description: 'Disney+ + Canva Pro - Entretenimiento y creatividad',
    price: 249,
    originalPrice: 448,
    savings: '44%',
  },
  complete: {
    name: 'Combo Completo',
    description: 'Disney+ + HBO Max + Canva Pro - La experiencia completa',
    price: 299,
    originalPrice: 597,
    savings: '50%',
    isPopular: true,
  },
};
