import { motion } from 'framer-motion';
import { Edit3, Save, Shield, User } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { user, refreshAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm<PasswordFormData>();

  const newPassword = watch('newPassword');

  React.useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user, resetProfile]);

  const onSubmitProfile = async (_data: ProfileFormData) => {
    try {
      setIsLoadingProfile(true);
      setMessage(null);

      // TODO: Implement profile update API call
      // await authService.updateProfile(data);

      await refreshAuth();
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const onSubmitPassword = async (_data: PasswordFormData) => {
    try {
      setIsLoadingPassword(true);
      setMessage(null);

      // TODO: Implement password change API call
      // await authService.changePassword(data.currentPassword, data.newPassword);

      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      resetPassword();
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Error al cambiar la contraseña' });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      USER: { color: 'bg-blue-100 text-blue-800', text: 'Usuario' },
      ADMIN: { color: 'bg-purple-100 text-purple-800', text: 'Administrador' },
      SUPERADMIN: { color: 'bg-red-100 text-red-800', text: 'Super Admin' },
    };

    return badges[role as keyof typeof badges] || badges.USER;
  };

  if (!user) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900 font-code'>Mi Perfil</h1>
        <p className='mt-2 text-gray-600'>
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className='grid lg:grid-cols-3 gap-8'>
        {/* Profile Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className='p-6 text-center'>
            <div className='w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4'>
              <User size={32} className='text-primary' />
            </div>
            <h2 className='text-xl font-semibold text-gray-900 font-code'>{user.name}</h2>
            <p className='text-gray-600 mt-1'>{user.email}</p>
            <div className='mt-4'>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}
              >
                <Shield size={12} className='mr-1' />
                {roleBadge.text}
              </span>
            </div>
            <div className='mt-6 text-sm text-gray-500'>
              <p>Miembro desde:</p>
              <p className='font-medium'>
                {new Date(user.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='lg:col-span-2'
        >
          <Card className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-lg font-semibold text-gray-900 font-code'>
                Información Personal
              </h2>
              <Button variant='ghost' size='sm' onClick={() => setIsEditing(!isEditing)}>
                <Edit3 size={16} className='mr-2' />
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>

            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className='space-y-6'>
              <div className='grid md:grid-cols-2 gap-6'>
                <div>
                  <Input
                    label='Nombre completo'
                    type='text'
                    {...registerProfile('name', {
                      required: 'El nombre es requerido',
                    })}
                    error={profileErrors.name?.message}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                <div>
                  <Input
                    label='Correo electrónico'
                    type='email'
                    {...registerProfile('email', {
                      required: 'El email es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido',
                      },
                    })}
                    error={profileErrors.email?.message}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                <div className='md:col-span-2'>
                  <Input
                    label='Teléfono'
                    type='tel'
                    {...registerProfile('phone')}
                    error={profileErrors.phone?.message}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder='+52 999 999 9999'
                  />
                </div>
              </div>

              {isEditing && (
                <div className='flex justify-end'>
                  <Button type='submit' variant='primary' isLoading={isLoadingProfile}>
                    <Save size={16} className='mr-2' />
                    Guardar Cambios
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </motion.div>
      </div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className='p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-6 font-code'>Cambiar Contraseña</h2>

          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className='space-y-6'>
            <div className='grid md:grid-cols-3 gap-6'>
              <div>
                <Input
                  label='Contraseña actual'
                  type='password'
                  {...registerPassword('currentPassword', {
                    required: 'La contraseña actual es requerida',
                  })}
                  error={passwordErrors.currentPassword?.message}
                />
              </div>

              <div>
                <Input
                  label='Nueva contraseña'
                  type='password'
                  {...registerPassword('newPassword', {
                    required: 'La nueva contraseña es requerida',
                    minLength: {
                      value: 8,
                      message: 'Mínimo 8 caracteres',
                    },
                  })}
                  error={passwordErrors.newPassword?.message}
                />
              </div>

              <div>
                <Input
                  label='Confirmar contraseña'
                  type='password'
                  {...registerPassword('confirmPassword', {
                    required: 'Confirma la nueva contraseña',
                    validate: value => value === newPassword || 'Las contraseñas no coinciden',
                  })}
                  error={passwordErrors.confirmPassword?.message}
                />
              </div>
            </div>

            <div className='flex justify-end'>
              <Button type='submit' variant='primary' isLoading={isLoadingPassword}>
                Cambiar Contraseña
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
