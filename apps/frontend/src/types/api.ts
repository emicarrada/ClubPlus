// Club+ API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

// Club+ Combo Types (MVP)
export interface ComboOption {
  id: string;
  name: string;
  description: string;
  platforms: Platform[];
  price: number;
  originalPrice: number;
  savings: number;
  isPopular?: boolean;
}

export interface Platform {
  id: string;
  name: string;
  logo: string;
  category: 'streaming' | 'design' | 'productivity' | 'education';
}

// Predefined Combos for MVP
export type ComboType = 'entertainment' | 'creative' | 'complete';

export const COMBOS: Record<ComboType, ComboOption> = {
  entertainment: {
    id: 'entertainment',
    name: 'Entretenimiento',
    description: 'Lo mejor del streaming en un solo combo',
    platforms: [
      { id: 'disney', name: 'Disney+', logo: '/logos/disney.png', category: 'streaming' },
      { id: 'hbo', name: 'HBO Max', logo: '/logos/hbo.png', category: 'streaming' },
      { id: 'netflix', name: 'Netflix', logo: '/logos/netflix.png', category: 'streaming' },
    ],
    price: 25.99,
    originalPrice: 45.97,
    savings: 43,
  },
  creative: {
    id: 'creative',
    name: 'Creativo',
    description: 'Herramientas profesionales para crear',
    platforms: [
      { id: 'canva', name: 'Canva Pro', logo: '/logos/canva.png', category: 'design' },
      { id: 'adobe', name: 'Adobe Creative', logo: '/logos/adobe.png', category: 'design' },
      { id: 'figma', name: 'Figma', logo: '/logos/figma.png', category: 'design' },
    ],
    price: 35.99,
    originalPrice: 65.97,
    savings: 45,
  },
  complete: {
    id: 'complete',
    name: 'Completo',
    description: 'Todo lo que necesitas en un solo lugar',
    platforms: [
      { id: 'disney', name: 'Disney+', logo: '/logos/disney.png', category: 'streaming' },
      { id: 'canva', name: 'Canva Pro', logo: '/logos/canva.png', category: 'design' },
      { id: 'spotify', name: 'Spotify', logo: '/logos/spotify.png', category: 'streaming' },
      { id: 'notion', name: 'Notion', logo: '/logos/notion.png', category: 'productivity' },
    ],
    price: 49.99,
    originalPrice: 89.96,
    savings: 44,
    isPopular: true,
  },
};
