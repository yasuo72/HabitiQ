'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, ChevronDown, ChevronUp, 
  Star, CheckCircle, AlertCircle, Bookmark,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

const categoryIcons = {
  'improvement': <ArrowUpRight className="h-4 w-4 text-emerald-500" />,
  'decline': <ArrowDownRight className="h-4 w-4 text-rose-500" />,
  'stable': <Minus className="h-4 w-4 text-amber-500" />,
  'insight': <Lightbulb className="h-4 w-4 text-violet-500" />,
  'recommendation': <Star className="h-4 w-4 text-sky-500" />,
  'achievement': <CheckCircle className="h-4 w-4 text-emerald-500" />,
  'warning': <AlertCircle className="h-4 w-4 text-rose-500" />,
  'important': <Bookmark className="h-4 w-4 text-amber-500" />
};

const categoryColors = {
  'improvement': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'decline': 'bg-rose-50 text-rose-700 border-rose-200',
  'stable': 'bg-amber-50 text-amber-700 border-amber-200',
  'insight': 'bg-violet-50 text-violet-700 border-violet-200',
  'recommendation': 'bg-sky-50 text-sky-700 border-sky-200',
  'achievement': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'warning': 'bg-rose-50 text-rose-700 border-rose-200',
  'important': 'bg-amber-50 text-amber-700 border-amber-200'
};

// Categorize insights and recommendations
const categorizeInsight = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('improve') || lowerText.includes('increase') || lowerText.includes('better')) {
    return 'improvement';
  } else if (lowerText.includes('decrease') || lowerText.includes('reduce') || lowerText.includes('worse')) {
    return 'decline';
  } else if (lowerText.includes('consistent') || lowerText.includes('maintain') || lowerText.includes('stable')) {
    return 'stable';
  } else if (lowerText.includes('try') || lowerText.includes('consider') || lowerText.includes('should')) {
    return 'recommendation';
  } else if (lowerText.includes('achieved') || lowerText.includes('success') || lowerText.includes('accomplishment')) {
    return 'achievement';
  } else if (lowerText.includes('caution') || lowerText.includes('careful') || lowerText.includes('warning')) {
    return 'warning';
  } else if (lowerText.includes('important') || lowerText.includes('critical') || lowerText.includes('key')) {
    return 'important';
  } else {
    return 'insight';
  }
};

const EnhancedInsightsPanel = ({ insights = [], recommendations = [] }) => {
  const [expandedInsights, setExpandedInsights] = useState(false);
  const [expandedRecommendations, setExpandedRecommendations] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const containerRef = useRef(null);

  // Process insights with categories
  const processedInsights = insights.map((insight, index) => ({
    id: `insight-${index}`,
    text: insight,
    category: categorizeInsight(insight),
    type: 'insight'
  }));

  // Process recommendations with categories
  const processedRecommendations = recommendations.map((rec, index) => ({
    id: `recommendation-${index}`,
    text: rec,
    category: categorizeInsight(rec),
    type: 'recommendation'
  }));

  // Combined and filtered items
  const allItems = [...processedInsights, ...processedRecommendations];
  const filteredItems = activeFilter === 'all' 
    ? allItems 
    : activeFilter === 'bookmarked'
      ? allItems.filter(item => bookmarkedItems.includes(item.id))
      : allItems.filter(item => item.category === activeFilter);

  // Toggle bookmark
  const toggleBookmark = (id) => {
    setBookmarkedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };

  // If no data available
  if ((!insights || insights.length === 0) && (!recommendations || recommendations.length === 0)) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4">Insights & Recommendations</h3>
        <div className="h-[200px] flex flex-col items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="text-gray-300 mb-4"
          >
            <Lightbulb size={48} />
          </motion.div>
          <p className="text-gray-500">No insights available yet</p>
          <p className="text-gray-400 text-sm mt-2">Analyze your journal entries to generate insights</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-sm"
      ref={containerRef}
    >
      <h3 className="text-lg font-semibold mb-4">Insights & Recommendations</h3>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            activeFilter === 'all' 
              ? 'bg-violet-100 text-violet-700 border-violet-200' 
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter('bookmarked')}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors flex items-center ${
            activeFilter === 'bookmarked' 
              ? 'bg-amber-100 text-amber-700 border-amber-200' 
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <Bookmark className="h-3 w-3 mr-1" />
          Bookmarked ({bookmarkedItems.length})
        </button>
        {Object.keys(categoryIcons).map(category => {
          const count = allItems.filter(item => item.category === category).length;
          if (count === 0) return null;
          
          return (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors flex items-center ${
                activeFilter === category 
                  ? categoryColors[category]
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{categoryIcons[category]}</span>
              <span className="capitalize">{category}</span>
              <span className="ml-1 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>
      
      {/* Insights and Recommendations */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredItems.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`p-3 rounded-lg border ${categoryColors[item.category]} relative group`}
                >
                  <div className="flex">
                    <div className="mr-3 mt-0.5">
                      {categoryIcons[item.category]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                          {item.type === 'insight' ? 'Insight' : 'Recommendation'}
                        </span>
                        <span className="ml-2 text-xs capitalize px-2 py-0.5 rounded-full bg-white bg-opacity-50">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-sm">{item.text}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleBookmark(item.id)}
                      className={`ml-2 p-1 rounded-full ${
                        bookmarkedItems.includes(item.id)
                          ? 'text-amber-500 bg-amber-50'
                          : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100'
                      } transition-all`}
                    >
                      <Bookmark className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <p className="text-gray-500">No items match the selected filter</p>
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-2 text-violet-600 text-sm hover:underline"
              >
                Show all items
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Summary */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-4 pt-4 border-t border-gray-100"
      >
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total insights: {insights.length}</span>
          <span>Total recommendations: {recommendations.length}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedInsightsPanel;
