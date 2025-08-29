import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { authService } from '../lib/auth';
import {
  ApiResponse,
  Assignment,
  ComboTemplate,
  CreateComboRequest,
  Platform,
  UserCombo,
} from '../types/api';

// Query Keys - Centralized for consistency
export const queryKeys = {
  // Auth-related
  currentUser: ['currentUser'] as const,

  // Platforms
  platforms: ['platforms'] as const,
  platform: (id: string) => ['platform', id] as const,

  // Combos
  comboTemplates: ['comboTemplates'] as const,
  comboTemplate: (id: string) => ['comboTemplate', id] as const,
  userCombos: ['userCombos'] as const,

  // Assignments
  userAssignments: ['userAssignments'] as const,
};

// ============================================================================
// AUTH HOOKS
// ============================================================================

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: authService.isAuthenticated(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; [key: string]: any }) => authService.updateProfile(data),
    onSuccess: updatedUser => {
      // Update the current user cache
      queryClient.setQueryData(queryKeys.currentUser, updatedUser);
    },
    onError: error => {
      console.error('Failed to update profile:', error);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authService.changePassword(currentPassword, newPassword),
    onError: error => {
      console.error('Failed to change password:', error);
    },
  });
};

// ============================================================================
// PLATFORM HOOKS
// ============================================================================

export const usePlatforms = () => {
  return useQuery({
    queryKey: queryKeys.platforms,
    queryFn: async (): Promise<Platform[]> => {
      const response = await apiClient.get<ApiResponse<Platform[]>>('/platforms');
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - platforms don't change often
  });
};

export const usePlatform = (id: string) => {
  return useQuery({
    queryKey: queryKeys.platform(id),
    queryFn: async (): Promise<Platform> => {
      const response = await apiClient.get<ApiResponse<Platform>>(`/platforms/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// ============================================================================
// COMBO TEMPLATE HOOKS
// ============================================================================

export const useComboTemplates = () => {
  return useQuery({
    queryKey: queryKeys.comboTemplates,
    queryFn: async (): Promise<ComboTemplate[]> => {
      const response = await apiClient.get<ApiResponse<ComboTemplate[]>>('/combo-templates');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useComboTemplate = (id: string) => {
  return useQuery({
    queryKey: queryKeys.comboTemplate(id),
    queryFn: async (): Promise<ComboTemplate> => {
      const response = await apiClient.get<ApiResponse<ComboTemplate>>(`/combo-templates/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// ============================================================================
// USER COMBO HOOKS
// ============================================================================

export const useUserCombos = () => {
  return useQuery({
    queryKey: queryKeys.userCombos,
    queryFn: async (): Promise<UserCombo[]> => {
      const response = await apiClient.get<ApiResponse<UserCombo[]>>('/combos/my-combos');
      return response.data.data;
    },
    enabled: authService.isAuthenticated(),
  });
};

export const useCreateCombo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateComboRequest): Promise<UserCombo> => {
      const response = await apiClient.post<ApiResponse<UserCombo>>('/combos', data);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch user combos
      queryClient.invalidateQueries({ queryKey: queryKeys.userCombos });
      queryClient.invalidateQueries({ queryKey: queryKeys.userAssignments });
    },
    onError: error => {
      console.error('Failed to create combo:', error);
    },
  });
};

export const useCancelCombo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comboId: string): Promise<UserCombo> => {
      const response = await apiClient.patch<ApiResponse<UserCombo>>(`/combos/${comboId}/cancel`);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch user combos
      queryClient.invalidateQueries({ queryKey: queryKeys.userCombos });
      queryClient.invalidateQueries({ queryKey: queryKeys.userAssignments });
    },
    onError: error => {
      console.error('Failed to cancel combo:', error);
    },
  });
};

// ============================================================================
// ASSIGNMENT HOOKS
// ============================================================================

export const useUserAssignments = () => {
  return useQuery({
    queryKey: queryKeys.userAssignments,
    queryFn: async (): Promise<Assignment[]> => {
      const response = await apiClient.get<ApiResponse<Assignment[]>>(
        '/assignments/my-assignments',
      );
      return response.data.data;
    },
    enabled: authService.isAuthenticated(),
  });
};

// ============================================================================
// AUTHENTICATION MUTATIONS (with React Query integration)
// ============================================================================

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: data => {
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // Set user data in cache
      queryClient.setQueryData(queryKeys.currentUser, data.user);

      // Prefetch user data
      queryClient.prefetchQuery({
        queryKey: queryKeys.userCombos,
        queryFn: async () => {
          const response = await apiClient.get<ApiResponse<UserCombo[]>>('/combos/my-combos');
          return response.data.data;
        },
      });
    },
    onError: error => {
      console.error('Login failed:', error);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      authService.register(email, password, name),
    onSuccess: data => {
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // Set user data in cache
      queryClient.setQueryData(queryKeys.currentUser, data.user);
    },
    onError: error => {
      console.error('Registration failed:', error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      // Clear all auth data
      authService.clearAuthData();

      // Clear all cached data
      queryClient.clear();

      // Redirect to login
      window.location.href = '/login';
    },
  });
};
