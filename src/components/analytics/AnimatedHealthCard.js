'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';

const AnimatedHealthCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend = 'stable', 
  color = 'violet',
  unit = '', 
  subtitle,
  change,
  details
}) => {
  const [showInfo, setShowInfo] = useState(false);

  // Define color schemes
  const colorSchemes = {
    violet: {
      bg: 'from-violet-500 to-violet-600',
      text: 'text-violet-100',
      icon: 'text-violet-200',
      hover: 'hover:from-violet-600 hover:to-violet-700'
    },
    sky: {
      bg: 'from-sky-500 to-sky-600',
      text: 'text-sky-100',
      icon: 'text-sky-200',
      hover: 'hover:from-sky-600 hover:to-sky-700'
    },
    emerald: {
      bg: 'from-emerald-500 to-emerald-600',
      text: 'text-emerald-100',
      icon: 'text-emerald-200',
      hover: 'hover:from-emerald-600 hover:to-emerald-700'
    },
    amber: {
      bg: 'from-amber-500 to-amber-600',
      text: 'text-amber-100',
      icon: 'text-amber-200',
      hover: 'hover:from-amber-600 hover:to-amber-700'
    },
    rose: {
      bg: 'from-rose-500 to-rose-600',
      text: 'text-rose-100',
      icon: 'text-rose-200',
      hover: 'hover:from-rose-600 hover:to-rose-700'
    }
  };

  const colorScheme = colorSchemes[color] || colorSchemes.violet;

  // Trend icon
  const TrendIcon = trend === 'improving' ? ArrowUpRight : trend === 'declining' ? ArrowDownRight : Minus;
  const trendColor = trend === 'improving' ? 'text-green-300' : trend === 'declining' ? 'text-red-300' : 'text-gray-300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={`relative bg-gradient-to-br ${colorScheme.bg} ${colorScheme.hover} rounded-xl p-6 text-white shadow-lg transition-all duration-300 overflow-hidden`}
    >
      {/* Background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <motion.div 
          className="w-full h-full rounded-full bg-white"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center">
            <p className={`${colorScheme.text} flex items-center`}>
              {title}
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
              >
                <Info size={14} />
              </button>
            </p>
          </div>
          
          <div className="flex items-baseline">
            <motion.h3 
              className="text-2xl font-bold"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {value}{unit}
            </motion.h3>
            {change && (
              <motion.span 
                className={`ml-2 text-sm ${change > 0 ? 'text-green-300' : change < 0 ? 'text-red-300' : 'text-gray-300'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {change > 0 ? '+' : ''}{change}%
              </motion.span>
            )}
          </div>
          
          {subtitle && (
            <motion.p 
              className={`text-sm ${colorScheme.text} mt-1`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {subtitle}
            </motion.p>
          )}
          
          <motion.p 
            className={`text-xs ${colorScheme.text} mt-0.5 flex items-center`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <TrendIcon className={`h-3 w-3 mr-1 ${trendColor}`} />
            Trend: {trend}
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, rotate: -10 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`h-10 w-10 ${colorScheme.icon} rounded-full bg-white bg-opacity-20 flex items-center justify-center`}
        >
          <Icon className="h-6 w-6" />
        </motion.div>
      </div>

      {/* Info panel */}
      {showInfo && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 pt-4 border-t border-white border-opacity-20"
        >
          <p className={`text-sm ${colorScheme.text}`}>
            {details || `This shows your ${title.toLowerCase()} metrics over time. The trend indicates whether your ${title.toLowerCase()} is improving, stable, or declining based on recent data.`}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnimatedHealthCard;
