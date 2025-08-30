import { motion } from 'framer-motion';
import { Check, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError('');

      await registerUser(data.email, data.password, data.name);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Register error:', err);
      setError(
        err.response?.data?.error?.message || 'Error al crear la cuenta. Intenta nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = {
    hasLength: password?.length >= 8,
    hasUpper: /[A-Z]/.test(password || ''),
    hasLower: /[a-z]/.test(password || ''),
    hasNumber: /\d/.test(password || ''),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password || ''),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='space-y-6'
    >
      <div>
        <h2 className='text-2xl font-bold text-gray-900 text-center font-code'>Crear Cuenta</h2>
        <p className='mt-2 text-sm text-gray-600 text-center'>
          ¿Ya tienes cuenta?{' '}
          <Link
            to='/login'
            className='font-medium text-primary hover:text-red-500 transition-colors'
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm'
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div>
          <Input
            label='Nombre completo'
            type='text'
            {...register('name', {
              required: 'El nombre es requerido',
              minLength: {
                value: 2,
                message: 'El nombre debe tener al menos 2 caracteres',
              },
            })}
            error={errors.name?.message}
            placeholder='Tu nombre completo'
          />
        </div>

        <div>
          <Input
            label='Correo electrónico'
            type='email'
            {...register('email', {
              required: 'El correo electrónico es requerido',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Ingresa un correo electrónico válido',
              },
            })}
            error={errors.email?.message}
            placeholder='tu@email.com'
          />
        </div>

        <div>
          <div className='relative'>
            <Input
              label='Contraseña'
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'La contraseña es requerida',
                minLength: {
                  value: 8,
                  message: 'La contraseña debe tener al menos 8 caracteres',
                },
                validate: {
                  hasUpper: value => /[A-Z]/.test(value) || 'Debe contener al menos una mayúscula',
                  hasNumber: value => /\d/.test(value) || 'Debe contener al menos un número',
                },
              })}
              error={errors.password?.message}
              placeholder='••••••••'
            />
            <button
              type='button'
              className='absolute inset-y-0 right-0 top-6 pr-3 flex items-center'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className='h-5 w-5 text-gray-400' />
              ) : (
                <Eye className='h-5 w-5 text-gray-400' />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className='mt-2 space-y-1'>
              <p className='text-xs text-gray-600 font-medium'>Seguridad de la contraseña:</p>
              <div className='space-y-1'>
                {[
                  { check: passwordStrength.hasLength, text: 'Al menos 8 caracteres' },
                  { check: passwordStrength.hasUpper, text: 'Una letra mayúscula' },
                  { check: passwordStrength.hasLower, text: 'Una letra minúscula' },
                  { check: passwordStrength.hasNumber, text: 'Un número' },
                  { check: passwordStrength.hasSpecial, text: 'Un carácter especial' },
                ].map((item, index) => (
                  <div key={index} className='flex items-center space-x-2'>
                    <Check
                      size={12}
                      className={`${item.check ? 'text-green-500' : 'text-gray-300'}`}
                    />
                    <span className={`text-xs ${item.check ? 'text-green-600' : 'text-gray-500'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className='relative'>
            <Input
              label='Confirmar contraseña'
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: value => value === password || 'Las contraseñas no coinciden',
              })}
              error={errors.confirmPassword?.message}
              placeholder='••••••••'
            />
            <button
              type='button'
              className='absolute inset-y-0 right-0 top-6 pr-3 flex items-center'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className='h-5 w-5 text-gray-400' />
              ) : (
                <Eye className='h-5 w-5 text-gray-400' />
              )}
            </button>
          </div>
        </div>

        <div className='flex items-start'>
          <div className='flex items-center h-5'>
            <input
              id='terms'
              type='checkbox'
              {...register('terms', {
                required: 'Debes aceptar los términos y condiciones',
              })}
              className='focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded'
            />
          </div>
          <div className='ml-3 text-sm'>
            <label htmlFor='terms' className='font-medium text-gray-700'>
              Acepto los{' '}
              <Link to='/terms' className='text-primary hover:text-red-500 transition-colors'>
                términos y condiciones
              </Link>{' '}
              y la{' '}
              <Link to='/privacy' className='text-primary hover:text-red-500 transition-colors'>
                política de privacidad
              </Link>
            </label>
            {errors.terms && <p className='mt-1 text-sm text-red-600'>{errors.terms.message}</p>}
          </div>
        </div>

        <Button type='submit' variant='primary' size='lg' isLoading={isLoading} className='w-full'>
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>
      </form>

      <div className='mt-6'>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-gray-500'>O continúa con</span>
          </div>
        </div>

        <div className='mt-6'>
          <Button
            variant='secondary'
            size='lg'
            className='w-full'
            onClick={() => {
              // TODO: Implement Google OAuth
              console.warn('Google OAuth not implemented yet');
            }}
          >
            <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='currentColor'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='currentColor'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='currentColor'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            Google
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
