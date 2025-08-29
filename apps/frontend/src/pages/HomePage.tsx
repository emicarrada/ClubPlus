import { motion } from 'framer-motion';
import { ArrowRight, Dumbbell, TrendingUp, Users } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Dumbbell,
      title: 'Gestión de Equipos',
      description: 'Administra y monitorea todos los equipos de tu gimnasio',
    },
    {
      icon: Users,
      title: 'Membresías',
      description: 'Sistema completo de gestión de miembros y pagos',
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Reportes detallados y métricas de rendimiento',
    },
  ];

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <header className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-primary font-code'>Club+</h1>
            </div>
            <div className='flex items-center space-x-4'>
              <Link to='/login'>
                <Button variant='ghost'>Iniciar Sesión</Button>
              </Link>
              <Link to='/register'>
                <Button variant='primary'>Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-8'>
              La plataforma <span className='text-primary font-code'>definitiva</span>
              <br />
              para tu gimnasio
            </h1>
            <p className='text-xl text-gray-600 mb-12 max-w-3xl mx-auto'>
              Gestiona tu gimnasio de manera eficiente con nuestra plataforma integral. Desde
              membresías hasta equipos, todo en un solo lugar.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link to='/register'>
                <Button size='lg' className='w-full sm:w-auto'>
                  Empezar Gratis
                  <ArrowRight size={20} className='ml-2' />
                </Button>
              </Link>
              <Link to='/login'>
                <Button variant='secondary' size='lg' className='w-full sm:w-auto'>
                  Ver Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Todo lo que necesitas
            </h2>
            <p className='text-xl text-gray-600'>
              Funcionalidades diseñadas específicamente para gimnasios modernos
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className='text-center'
                >
                  <div className='bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <Icon size={32} className='text-primary' />
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-4 font-code'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-600'>{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20'>
        <div className='max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-8'>
              ¿Listo para transformar tu gimnasio?
            </h2>
            <p className='text-xl text-gray-600 mb-12'>
              Únete a cientos de gimnasios que ya confían en Club+ para gestionar su negocio.
            </p>
            <Link to='/register'>
              <Button size='lg'>
                Comenzar Ahora
                <ArrowRight size={20} className='ml-2' />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <h3 className='text-xl font-bold mb-4 font-code'>Club+</h3>
            <p className='text-gray-400'>© 2024 Club+. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
