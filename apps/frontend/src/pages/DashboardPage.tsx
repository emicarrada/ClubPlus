import { motion } from 'framer-motion';
import { Activity, Calendar, TrendingUp, Users } from 'lucide-react';
import React from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Miembros Activos',
      value: '248',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Ingresos del Mes',
      value: '$12,450',
      change: '+8%',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Sesiones Hoy',
      value: '67',
      change: '+15%',
      icon: Activity,
      color: 'bg-primary bg-red-50 text-primary',
    },
    {
      title: 'Clases Programadas',
      value: '24',
      change: '+3%',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'Ana García',
      action: 'Se registró como nuevo miembro',
      time: 'Hace 5 minutos',
    },
    {
      id: 2,
      user: 'Carlos López',
      action: 'Completó sesión de entrenamiento',
      time: 'Hace 12 minutos',
    },
    {
      id: 3,
      user: 'María Rodríguez',
      action: 'Renovó membresía anual',
      time: 'Hace 1 hora',
    },
    {
      id: 4,
      user: 'Juan Pérez',
      action: 'Se inscribió a clase de yoga',
      time: 'Hace 2 horas',
    },
  ];

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900 font-code'>Dashboard</h1>
        <p className='mt-2 text-gray-600'>
          Bienvenido de vuelta, {user?.name}! Aquí tienes un resumen de tu gimnasio.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600 font-medium'>{stat.title}</p>
                    <p className='text-2xl font-bold text-gray-900 mt-1'>{stat.value}</p>
                    <p className='text-sm text-green-600 mt-1'>{stat.change} vs mes anterior</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className='grid lg:grid-cols-3 gap-8'>
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='lg:col-span-2'
        >
          <Card className='p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4 font-code'>
              Actividad Reciente
            </h2>
            <div className='space-y-4'>
              {recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className='flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0'
                >
                  <div className='w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <div className='flex-1'>
                    <p className='text-sm text-gray-900'>
                      <span className='font-medium'>{activity.user}</span> {activity.action}
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className='p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4 font-code'>Acciones Rápidas</h2>
            <div className='space-y-3'>
              <button className='w-full text-left p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors'>
                <p className='text-sm font-medium text-primary'>Registrar Nuevo Miembro</p>
                <p className='text-xs text-red-600 mt-1'>Agregar un nuevo miembro al gimnasio</p>
              </button>
              <button className='w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'>
                <p className='text-sm font-medium text-gray-900'>Programar Clase</p>
                <p className='text-xs text-gray-600 mt-1'>
                  Crear una nueva sesión de entrenamiento
                </p>
              </button>
              <button className='w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'>
                <p className='text-sm font-medium text-gray-900'>Ver Reportes</p>
                <p className='text-xs text-gray-600 mt-1'>Revisar métricas y estadísticas</p>
              </button>
              <button className='w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'>
                <p className='text-sm font-medium text-gray-900'>Gestionar Equipos</p>
                <p className='text-xs text-gray-600 mt-1'>Administrar equipos del gimnasio</p>
              </button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Performance Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className='p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4 font-code'>
            Rendimiento del Mes
          </h2>
          <div className='h-64 bg-gray-50 rounded-lg flex items-center justify-center'>
            <div className='text-center'>
              <TrendingUp size={48} className='text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600'>Gráfico de rendimiento próximamente</p>
              <p className='text-sm text-gray-500 mt-1'>
                Se integrará con datos reales del sistema
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
