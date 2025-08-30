import { motion } from 'framer-motion';
import { Palette, Play, Star } from 'lucide-react';
import React from 'react';
import { useComboTemplates, useCreateCombo } from '../../hooks/useApi';
import { ComboTemplate } from '../../types/api';
import Button from '../ui/Button';

interface ComboCardProps {
  combo: ComboTemplate;
  onSelect?: (_comboId: string) => void;
  isLoading?: boolean;
}

const ComboCard: React.FC<ComboCardProps> = ({ combo, onSelect, isLoading = false }) => {
  // Map platform names to local logo paths
  const getPlatformLogo = (platformName: string) => {
    const name = platformName.toLowerCase();
    if (name.includes('disney')) return '/logos/disney-plus.svg';
    if (name.includes('hbo')) return '/logos/hbo-max.svg';
    if (name.includes('canva')) return '/logos/canva-pro.svg';
    return null;
  };

  // Get the first available platform logo or fallback to icon
  const getPrimaryLogo = () => {
    if (combo.platforms && combo.platforms.length > 0) {
      for (const platform of combo.platforms) {
        const logo = getPlatformLogo(platform.name);
        if (logo) return { type: 'logo', src: logo, alt: platform.name };
      }
    }

    // Fallback to icon
    const getIcon = (name: string) => {
      if (name.toLowerCase().includes('entretenimiento')) return Play;
      if (name.toLowerCase().includes('creativo')) return Palette;
      if (name.toLowerCase().includes('completo')) return Star;
      return Star; // default
    };

    return { type: 'icon', component: getIcon(combo.name) };
  };

  const primaryDisplay = getPrimaryLogo();

  // Temporary price mapping until backend has prices
  const getPricing = (name: string) => {
    if (name.toLowerCase().includes('entretenimiento')) {
      return { price: '$199/mes', originalPrice: '$398', savings: '50%' };
    }
    if (name.toLowerCase().includes('creativo')) {
      return { price: '$249/mes', originalPrice: '$448', savings: '44%' };
    }
    if (name.toLowerCase().includes('completo')) {
      return { price: '$299/mes', originalPrice: '$597', savings: '50%' };
    }
    return { price: '$0/mes', originalPrice: '$0', savings: '0%' };
  };

  const pricing = getPricing(combo.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow'
    >
      <div className='bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6'>
        {primaryDisplay.type === 'logo' ? (
          <img
            src={primaryDisplay.src}
            alt={primaryDisplay.alt}
            className='w-10 h-10 object-contain'
          />
        ) : (
          (() => {
            const IconComponent = primaryDisplay.component;
            return IconComponent ? <IconComponent size={32} className='text-primary' /> : null;
          })()
        )}
      </div>
      <h3 className='text-xl font-semibold text-gray-900 mb-4 font-code'>{combo.name}</h3>
      <p className='text-gray-600 mb-4'>{combo.description}</p>

      {/* Platforms included */}
      {combo.platforms && combo.platforms.length > 0 && (
        <div className='mb-6'>
          <p className='text-sm text-gray-500 mb-3'>Incluye:</p>
          <div className='flex flex-wrap justify-center gap-3'>
            {combo.platforms.map(platform => {
              const logo = getPlatformLogo(platform.name);
              return (
                <div key={platform.id} className='flex flex-col items-center'>
                  {logo ? (
                    <img src={logo} alt={platform.name} className='w-8 h-8 object-contain mb-1' />
                  ) : (
                    <div className='w-8 h-8 bg-gray-200 rounded flex items-center justify-center mb-1'>
                      <span className='text-xs text-gray-500'>{platform.name.charAt(0)}</span>
                    </div>
                  )}
                  <span className='text-xs text-gray-600 text-center'>{platform.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className='mb-6'>
        <div className='text-3xl font-bold text-primary mb-2'>{pricing.price}</div>
        <div className='text-sm text-gray-500'>
          <span className='line-through'>{pricing.originalPrice}</span>
          <span className='ml-2 text-green-600 font-semibold'>Ahorras {pricing.savings}</span>
        </div>
      </div>
      {onSelect && (
        <Button
          className='w-full'
          onClick={() => onSelect(combo.id)}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Seleccionando...' : 'Seleccionar Plan'}
        </Button>
      )}
    </motion.div>
  );
};

interface CombosGridProps {
  onComboSelect?: (_comboId: string) => void;
  showSelectButton?: boolean;
}

export const CombosGrid: React.FC<CombosGridProps> = ({
  onComboSelect,
  showSelectButton = true,
}) => {
  const { data: combos, isLoading, error } = useComboTemplates();
  const createComboMutation = useCreateCombo();

  const handleComboSelect = async (comboId: string) => {
    if (onComboSelect) {
      onComboSelect(comboId);
    } else {
      // Default behavior: create the combo for the user
      try {
        await createComboMutation.mutateAsync({ comboTemplateId: comboId });
        // Success handled in the mutation hook
      } catch (error) {
        console.error('Failed to create combo:', error);
        // Error handling could show a toast or alert
      }
    }
  };

  if (isLoading) {
    return (
      <div className='grid md:grid-cols-3 gap-8'>
        {[1, 2, 3].map(i => (
          <div key={i} className='bg-gray-100 rounded-lg h-96 animate-pulse' />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <p className='text-red-600 mb-4'>Error al cargar los combos</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  if (!combos || combos.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-600'>No hay combos disponibles en este momento</p>
      </div>
    );
  }

  return (
    <div className='grid md:grid-cols-3 gap-8'>
      {combos.map(combo => (
        <ComboCard
          key={combo.id}
          combo={combo}
          onSelect={showSelectButton ? handleComboSelect : undefined}
          isLoading={createComboMutation.isPending}
        />
      ))}
    </div>
  );
};

export default CombosGrid;
