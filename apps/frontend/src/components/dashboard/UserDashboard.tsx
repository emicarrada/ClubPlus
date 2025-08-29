import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, X, User, Settings } from 'lucide-react';
import { useCurrentUser, useUserCombos, useUserAssignments } from '../../hooks/useApi';
import Button from '../ui/Button';

export const UserDashboard: React.FC = () => {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: combos, isLoading: combosLoading } = useUserCombos();
  const { data: assignments, isLoading: assignmentsLoading } = useUserAssignments();

  const isLoading = userLoading || combosLoading || assignmentsLoading;

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid gap-6'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='bg-white rounded-lg p-6 shadow-sm animate-pulse'>
                <div className='h-6 bg-gray-200 rounded w-1/4 mb-4'></div>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 font-code'>
                ¡Hola, {user?.name || 'Usuario'}! 👋
              </h1>
              <p className='text-gray-600 mt-1'>
                Bienvenido a tu dashboard de Club+
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <Button variant='secondary' size='sm'>
                <Settings size={16} className='mr-2' />
                Configuración
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats Cards */}
        <div className='grid md:grid-cols-3 gap-6 mb-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='bg-white rounded-lg p-6 shadow-sm'
          >
            <div className='flex items-center'>
              <div className='bg-blue-100 p-3 rounded-full'>
                <Check className='h-6 w-6 text-blue-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Combos Activos</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {combos?.filter(c => c.status === 'ACTIVE').length || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className='bg-white rounded-lg p-6 shadow-sm'
          >
            <div className='flex items-center'>
              <div className='bg-green-100 p-3 rounded-full'>
                <User className='h-6 w-6 text-green-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Perfiles Asignados</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {assignments?.length || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='bg-white rounded-lg p-6 shadow-sm'
          >
            <div className='flex items-center'>
              <div className='bg-purple-100 p-3 rounded-full'>
                <Clock className='h-6 w-6 text-purple-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Ahorro Mensual</p>
                <p className='text-2xl font-bold text-gray-900'>$450</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Active Combos */}
        <div className='grid lg:grid-cols-2 gap-6'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='bg-white rounded-lg shadow-sm'
          >
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900 font-code'>
                Mis Combos
              </h2>
            </div>
            <div className='p-6'>
              {combos && combos.length > 0 ? (
                <div className='space-y-4'>
                  {combos.map((combo) => (
                    <div
                      key={combo.id}
                      className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'
                    >
                      <div>
                        <h3 className='font-medium text-gray-900'>
                          {combo.comboTemplate.name}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {combo.comboTemplate.description}
                        </p>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            combo.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : combo.status === 'PAUSED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {combo.status === 'ACTIVE' ? 'Activo' : 
                           combo.status === 'PAUSED' ? 'Pausado' : 'Cancelado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <X className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-600 mb-4'>No tienes combos activos</p>
                  <Button>Ver Combos Disponibles</Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Profile Assignments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='bg-white rounded-lg shadow-sm'
          >
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900 font-code'>
                Mis Perfiles
              </h2>
            </div>
            <div className='p-6'>
              {assignments && assignments.length > 0 ? (
                <div className='space-y-4'>
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'
                    >
                      <div>
                        <h3 className='font-medium text-gray-900'>
                          {assignment.profile.profileName}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          Asignado el {new Date(assignment.assignedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className='px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800'>
                        Asignado
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <User className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-600'>No tienes perfiles asignados</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
