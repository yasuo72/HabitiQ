'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  Smile, Meh, Frown, FrownOpen,
  PieChart as ChartPie, BarChart3, Calendar, ArrowLeft, ArrowRight
} from 'lucide-react';

const moodColors = {
  'very happy': '#10b981', // emerald-500
  'happy': '#34d399',      // emerald-400
  'neutral': '#a3a3a3',    // gray-400
  'sad': '#fb923c',        // orange-400
  'very sad': '#f87171',   // red-400
  'anxious': '#a78bfa',    // violet-400
  'energetic': '#60a5fa',  // blue-400
  'tired': '#94a3b8',      // slate-400
  'stressed': '#f43f5e',   // rose-500
  'calm': '#22d3ee',       // cyan-400
};

const moodIcons = {
  'very happy': <Smile className="w-5 h-5" />,
  'happy': <Smile className="w-5 h-5" />,
  'neutral': <Meh className="w-5 h-5" />,
  'sad': <Frown className="w-5 h-5" />,
  'very sad': <FrownOpen className="w-5 h-5" />,
  'anxious': <Meh className="w-5 h-5" />,
  'energetic': <Smile className="w-5 h-5" />,
  'tired': <Frown className="w-5 h-5" />,
  'stressed': <FrownOpen className="w-5 h-5" />,
  'calm': <Smile className="w-5 h-5" />,
};

const EnhancedMoodTracker = ({ moodData }) => {
  const [chartType, setChartType] = useState('bar');
  const [viewMode, setViewMode] = useState('weekly');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [highlightedMood, setHighlightedMood] = useState(null);

  // Process data for different view modes
  const processData = () => {
    if (!moodData || moodData.length === 0) return [];

    // Sort by date
    const sortedData = [...moodData].sort((a, b) => {
      return new Date(a.rawTimestamp || 0) - new Date(b.rawTimestamp || 0);
    });

    if (viewMode === 'weekly') {
      // Get data for current week
      const weeks = [];
      let currentWeekData = [];
      let weekStartDate = null;

      sortedData.forEach((item, index) => {
        const itemDate = new Date(item.rawTimestamp || new Date());
        
        if (index === 0 || !weekStartDate) {
          weekStartDate = new Date(itemDate);
          weekStartDate.setDate(itemDate.getDate() - itemDate.getDay()); // Start of week (Sunday)
          currentWeekData = [];
        }
        
        const itemWeekStart = new Date(itemDate);
        itemWeekStart.setDate(itemDate.getDate() - itemDate.getDay());
        
        if (itemWeekStart.getTime() === weekStartDate.getTime()) {
          currentWeekData.push(item);
        } else {
          weeks.push({
            startDate: weekStartDate,
            data: currentWeekData
          });
          weekStartDate = itemWeekStart;
          currentWeekData = [item];
        }
        
        // Handle last item
        if (index === sortedData.length - 1) {
          weeks.push({
            startDate: weekStartDate,
            data: currentWeekData
          });
        }
      });

      // Ensure we don't go out of bounds
      const safeCurrentWeek = Math.min(Math.max(0, currentWeek), weeks.length - 1);
      if (safeCurrentWeek !== currentWeek) {
        setCurrentWeek(safeCurrentWeek);
      }

      return weeks[safeCurrentWeek]?.data || [];
    } else {
      // Aggregate data for summary view
      const moodCounts = {};
      
      sortedData.forEach(item => {
        const mood = item.mood.toLowerCase();
        if (!moodCounts[mood]) {
          moodCounts[mood] = 0;
        }
        moodCounts[mood]++;
      });
      
      return Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        count,
        percentage: Math.round((count / sortedData.length) * 100)
      }));
    }
  };

  const processedData = processData();
  
  // Get week date range for display
  const getWeekDateRange = () => {
    if (!moodData || moodData.length === 0 || viewMode !== 'weekly') return '';
    
    const sortedData = [...moodData].sort((a, b) => {
      return new Date(a.rawTimestamp || 0) - new Date(b.rawTimestamp || 0);
    });
    
    // Group by weeks
    const weeks = [];
    let currentWeekData = [];
    let weekStartDate = null;

    sortedData.forEach((item, index) => {
      const itemDate = new Date(item.rawTimestamp || new Date());
      
      if (index === 0 || !weekStartDate) {
        weekStartDate = new Date(itemDate);
        weekStartDate.setDate(itemDate.getDate() - itemDate.getDay()); // Start of week (Sunday)
        currentWeekData = [];
      }
      
      const itemWeekStart = new Date(itemDate);
      itemWeekStart.setDate(itemDate.getDate() - itemDate.getDay());
      
      if (itemWeekStart.getTime() === weekStartDate.getTime()) {
        currentWeekData.push(item);
      } else {
        weeks.push({
          startDate: weekStartDate,
          data: currentWeekData
        });
        weekStartDate = itemWeekStart;
        currentWeekData = [item];
      }
      
      // Handle last item
      if (index === sortedData.length - 1) {
        weeks.push({
          startDate: weekStartDate,
          data: currentWeekData
        });
      }
    });

    if (weeks.length === 0 || currentWeek >= weeks.length) return '';
    
    const weekStart = weeks[currentWeek].startDate;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm"
        >
          <p className="text-sm font-medium">{data.date}</p>
          <div className="flex items-center mt-1">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: moodColors[data.mood] }}></span>
            <span className="capitalize text-sm">{data.mood}</span>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm"
        >
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: data.fill }}></span>
            <span className="capitalize text-sm font-medium">{data.mood}</span>
          </div>
          <p className="text-sm mt-1">{data.count} entries ({data.percentage}%)</p>
        </motion.div>
      );
    }
    return null;
  };

  // If no data available
  if (!moodData || moodData.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4">Mood Tracker</h3>
        <div className="h-[300px] flex flex-col items-center justify-center">
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
            <Meh size={64} />
          </motion.div>
          <p className="text-gray-500">No mood data available</p>
          <p className="text-gray-400 text-sm mt-2">Start journaling to track your mood</p>
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
    >
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Mood Tracker</h3>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          {/* Chart type selector */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-md ${chartType === 'bar' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Bar Chart"
            >
              <BarChart3 size={16} />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`p-1.5 rounded-md ${chartType === 'pie' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Pie Chart"
            >
              <ChartPie size={16} />
            </button>
          </div>
          
          {/* View mode selector */}
          <div className="bg-gray-100 rounded-lg p-1 flex text-xs">
            <button
              onClick={() => {
                setViewMode('weekly');
                setCurrentWeek(0);
              }}
              className={`px-2 py-1.5 rounded-md ${viewMode === 'weekly' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('summary')}
              className={`px-2 py-1.5 rounded-md ${viewMode === 'summary' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              Summary
            </button>
          </div>
        </div>
      </div>
      
      {/* Week navigation for weekly view */}
      {viewMode === 'weekly' && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentWeek(prev => Math.max(0, prev - 1))}
            disabled={currentWeek === 0}
            className={`p-1 rounded-full ${currentWeek === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={14} className="mr-1" />
            <span>{getWeekDateRange()}</span>
          </div>
          
          <button
            onClick={() => setCurrentWeek(prev => prev + 1)}
            disabled={processedData.length === 0}
            className={`p-1 rounded-full ${processedData.length === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      )}
      
      {/* Chart container */}
      <div className="h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${chartType}-${viewMode}-${currentWeek}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {viewMode === 'weekly' && chartType === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                  />
                  <YAxis 
                    hide
                    domain={[0, 1]}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="#8884d8" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {processedData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={moodColors[entry.mood] || '#a3a3a3'} 
                        opacity={highlightedMood === entry.mood || !highlightedMood ? 1 : 0.3}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : viewMode === 'summary' && chartType === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    domain={[0, 'dataMax']}
                  />
                  <YAxis 
                    type="category"
                    dataKey="mood" 
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    width={80}
                    tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    name="Entries"
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {processedData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={moodColors[entry.mood] || '#a3a3a3'} 
                        opacity={highlightedMood === entry.mood || !highlightedMood ? 1 : 0.3}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedData.map(item => ({
                      ...item,
                      fill: moodColors[item.mood] || '#a3a3a3'
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={viewMode === 'summary' ? 40 : 0}
                    dataKey="count"
                    nameKey="mood"
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    onMouseEnter={(_, index) => setHighlightedMood(processedData[index].mood)}
                    onMouseLeave={() => setHighlightedMood(null)}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, mood }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                      return percent > 0.05 ? (
                        <text
                          x={x}
                          y={y}
                          fill={moodColors[mood] || '#a3a3a3'}
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontSize={12}
                          fontWeight="medium"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      ) : null;
                    }}
                  >
                    {processedData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={moodColors[entry.mood] || '#a3a3a3'} 
                        opacity={highlightedMood === entry.mood || !highlightedMood ? 1 : 0.6}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Mood legend */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {Object.entries(moodColors)
          .filter(([mood]) => {
            // Only show moods that are in the data
            return processedData.some(item => item.mood === mood);
          })
          .map(([mood, color]) => (
            <motion.button
              key={mood}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-2 py-1 rounded-full text-xs flex items-center ${
                highlightedMood === mood ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{ 
                backgroundColor: color + '33', // Add transparency
                color: color,
                borderColor: color,
                boxShadow: highlightedMood === mood ? `0 0 0 2px ${color}` : 'none'
              }}
              onClick={() => setHighlightedMood(prev => prev === mood ? null : mood)}
            >
              <span className="mr-1">{moodIcons[mood]}</span>
              <span className="capitalize">{mood}</span>
            </motion.button>
          ))}
      </div>
      
      {/* Insights */}
      {viewMode === 'summary' && processedData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600"
        >
          <p className="font-medium">Mood Insights:</p>
          <p className="mt-1">
            {(() => {
              // Find predominant mood
              const predominantMood = [...processedData].sort((a, b) => b.count - a.count)[0];
              const positiveCount = processedData
                .filter(item => ['very happy', 'happy', 'calm', 'energetic'].includes(item.mood))
                .reduce((sum, item) => sum + item.count, 0);
              const negativeCount = processedData
                .filter(item => ['very sad', 'sad', 'anxious', 'stressed'].includes(item.mood))
                .reduce((sum, item) => sum + item.count, 0);
              const totalCount = processedData.reduce((sum, item) => sum + item.count, 0);
              
              const positivePercentage = Math.round((positiveCount / totalCount) * 100);
              
              if (positivePercentage > 60) {
                return `Your mood has been predominantly positive (${positivePercentage}%), with "${predominantMood.mood}" being your most frequent mood.`;
              } else if (positivePercentage < 40) {
                return `You've experienced more challenging moods lately, with "${predominantMood.mood}" being your most frequent mood. Consider activities that boost your wellbeing.`;
              } else {
                return `Your mood has been balanced between positive and challenging states, with "${predominantMood.mood}" appearing most frequently.`;
              }
            })()}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EnhancedMoodTracker;
