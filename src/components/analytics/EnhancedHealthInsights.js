'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, ReferenceLine, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  BarChart3 as ChartBarIcon,
  LineChart as ChartLineIcon,
  PieChart as PieChartIcon,
  RefreshCw as ArrowPathIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  LineChart as PresentationChartLineIcon
} from 'lucide-react';

const chartAnimations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 }
};

const EnhancedHealthInsights = ({ chartData }) => {
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('week');
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['sleep', 'quality', 'mentalScore', 'exercise']);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);

  // Filter data based on time range
  const getFilteredData = () => {
    if (!chartData || chartData.length === 0) return [];
    
    const now = new Date();
    let filterDate = new Date();
    
    switch(timeRange) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      default:
        filterDate.setDate(now.getDate() - 7);
    }
    
    return chartData.filter(item => {
      const itemDate = item.rawTimestamp ? new Date(item.rawTimestamp) : new Date();
      return itemDate >= filterDate;
    });
  };

  const filteredData = getFilteredData();

  // Simulate data refresh
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Toggle metric selection
  const toggleMetric = (metric) => {
    if (selectedMetrics.includes(metric)) {
      if (selectedMetrics.length > 1) {
        setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
      }
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg"
        >
          <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((item, index) => (
              <p key={index} className="text-sm flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                <span className="font-medium text-gray-600">
                  {item.name}:
                </span>{' '}
                <span className="ml-1 font-semibold">
                  {item.name === 'Sleep' 
                    ? `${item.value} hrs`
                    : item.name === 'Exercise'
                      ? `${item.value} min`
                      : `${item.value}%`
                  }
                </span>
              </p>
            ))}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Generate radar data
  const generateRadarData = () => {
    if (!filteredData || filteredData.length === 0) return [];
    
    // Get the latest data point
    const latest = filteredData[filteredData.length - 1];
    
    return [
      { subject: 'Sleep', A: latest.hours, fullMark: 10 },
      { subject: 'Sleep Quality', A: latest.quality / 10, fullMark: 10 },
      { subject: 'Mental Health', A: latest.mentalScore / 10, fullMark: 10 },
      { subject: 'Exercise', A: Math.min(10, latest.exercise / 6), fullMark: 10 },
    ];
  };

  // If no data available
  if (!chartData || chartData.length === 0) {
    return (
      <motion.div 
        {...chartAnimations}
        className="bg-white p-6 rounded-lg shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4">Health Trends</h3>
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
            <PresentationChartLineIcon size={64} />
          </motion.div>
          <p className="text-gray-500">No health data available</p>
          <p className="text-gray-400 text-sm mt-2">Start journaling to see your health trends</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      {...chartAnimations}
      className="bg-white p-6 rounded-lg shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Health Trends</h3>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          {/* Chart type selector */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-md ${chartType === 'line' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Line Chart"
            >
              <ChartLineIcon size={16} />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-md ${chartType === 'area' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Area Chart"
            >
              <PieChartIcon size={16} />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-md ${chartType === 'bar' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Bar Chart"
            >
              <ChartBarIcon size={16} />
            </button>
            <button
              onClick={() => setChartType('radar')}
              className={`p-1.5 rounded-md ${chartType === 'radar' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Radar Chart"
            >
              <PresentationChartLineIcon size={16} />
            </button>
          </div>
          
          {/* Time range selector */}
          <div className="bg-gray-100 rounded-lg p-1 flex text-xs">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-2 py-1.5 rounded-md ${timeRange === 'week' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-2 py-1.5 rounded-md ${timeRange === 'month' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-2 py-1.5 rounded-md ${timeRange === 'quarter' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              Quarter
            </button>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-1">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
              title={isZoomed ? "Zoom Out" : "Zoom In"}
            >
              {isZoomed ? <ZoomOutIcon size={16} /> : <ZoomInIcon size={16} />}
            </button>
            <button
              onClick={refreshData}
              className={`p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 ${isLoading ? 'animate-spin' : ''}`}
              title="Refresh Data"
            >
              <ArrowPathIcon size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Metric toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => toggleMetric('sleep')}
          className={`px-2 py-1 text-xs rounded-full ${
            selectedMetrics.includes('sleep') 
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}
        >
          Sleep
        </button>
        <button
          onClick={() => toggleMetric('quality')}
          className={`px-2 py-1 text-xs rounded-full ${
            selectedMetrics.includes('quality') 
              ? 'bg-violet-100 text-violet-700 border border-violet-200' 
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}
        >
          Sleep Quality
        </button>
        <button
          onClick={() => toggleMetric('mentalScore')}
          className={`px-2 py-1 text-xs rounded-full ${
            selectedMetrics.includes('mentalScore') 
              ? 'bg-amber-100 text-amber-700 border border-amber-200' 
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}
        >
          Mental Health
        </button>
        <button
          onClick={() => toggleMetric('exercise')}
          className={`px-2 py-1 text-xs rounded-full ${
            selectedMetrics.includes('exercise') 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}
        >
          Exercise
        </button>
      </div>
      
      {/* Chart container */}
      <motion.div 
        className={`${isZoomed ? 'h-[450px]' : 'h-[300px]'} transition-all duration-300`}
        animate={{ height: isZoomed ? 450 : 300 }}
        ref={chartRef}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${chartType}-${timeRange}-${selectedMetrics.join('-')}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
                  }}
                  className="w-12 h-12 border-4 border-gray-200 border-t-violet-500 rounded-full"
                />
              </div>
            ) : chartType === 'line' ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={filteredData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                  />
                  <YAxis 
                    yAxisId="hours"
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    domain={[0, 12]}
                    label={{ 
                      value: 'Hours / Minutes', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fontSize: '12px' }
                    }}
                  />
                  <YAxis 
                    yAxisId="score"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    label={{ 
                      value: 'Score %', 
                      angle: 90, 
                      position: 'insideRight',
                      style: { fontSize: '12px' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedMetrics.includes('sleep') && (
                    <Line 
                      yAxisId="hours"
                      type="monotone" 
                      dataKey="hours" 
                      name="Sleep"
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  )}
                  {selectedMetrics.includes('quality') && (
                    <Line 
                      yAxisId="score"
                      type="monotone" 
                      dataKey="quality" 
                      name="Sleep Quality"
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  )}
                  {selectedMetrics.includes('mentalScore') && (
                    <Line 
                      yAxisId="score"
                      type="monotone" 
                      dataKey="mentalScore" 
                      name="Mental Health"
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  )}
                  {selectedMetrics.includes('exercise') && (
                    <Line 
                      yAxisId="hours"
                      type="monotone" 
                      dataKey="exercise" 
                      name="Exercise"
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  )}
                  <ReferenceLine y={8} yAxisId="hours" stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Ideal Sleep', position: 'insideBottomRight', fill: '#10b981', fontSize: 10 }} />
                  <ReferenceLine y={30} yAxisId="hours" stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Target Exercise', position: 'insideBottomRight', fill: '#3b82f6', fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : chartType === 'area' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                  />
                  <YAxis 
                    yAxisId="hours"
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    domain={[0, 12]}
                    label={{ 
                      value: 'Hours / Minutes', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fontSize: '12px' }
                    }}
                  />
                  <YAxis 
                    yAxisId="score"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    label={{ 
                      value: 'Score %', 
                      angle: 90, 
                      position: 'insideRight',
                      style: { fontSize: '12px' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedMetrics.includes('sleep') && (
                    <Area 
                      yAxisId="hours"
                      type="monotone" 
                      dataKey="hours" 
                      name="Sleep"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.2}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  )}
                  {selectedMetrics.includes('quality') && (
                    <Area 
                      yAxisId="score"
                      type="monotone" 
                      dataKey="quality" 
                      name="Sleep Quality"
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.2}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  )}
                  {selectedMetrics.includes('mentalScore') && (
                    <Area 
                      yAxisId="score"
                      type="monotone" 
                      dataKey="mentalScore" 
                      name="Mental Health"
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.2}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  )}
                  {selectedMetrics.includes('exercise') && (
                    <Area 
                      yAxisId="hours"
                      type="monotone" 
                      dataKey="exercise" 
                      name="Exercise"
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.2}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : chartType === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                  />
                  <YAxis 
                    yAxisId="hours"
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    domain={[0, 12]}
                    label={{ 
                      value: 'Hours / Minutes', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fontSize: '12px' }
                    }}
                  />
                  <YAxis 
                    yAxisId="score"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    label={{ 
                      value: 'Score %', 
                      angle: 90, 
                      position: 'insideRight',
                      style: { fontSize: '12px' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedMetrics.includes('sleep') && (
                    <Bar 
                      yAxisId="hours"
                      dataKey="hours" 
                      name="Sleep"
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  )}
                  {selectedMetrics.includes('quality') && (
                    <Bar 
                      yAxisId="score"
                      dataKey="quality" 
                      name="Sleep Quality"
                      fill="#8b5cf6" 
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  )}
                  {selectedMetrics.includes('mentalScore') && (
                    <Bar 
                      yAxisId="score"
                      dataKey="mentalScore" 
                      name="Mental Health"
                      fill="#f59e0b" 
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  )}
                  {selectedMetrics.includes('exercise') && (
                    <Bar 
                      yAxisId="hours"
                      dataKey="exercise" 
                      name="Exercise"
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={generateRadarData()}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar
                    name="Current Health Metrics"
                    dataKey="A"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.5}
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
      
      {/* Chart insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-4 text-sm text-gray-600"
      >
        <p>
          {filteredData.length > 1 
            ? `Showing data for the last ${
                timeRange === 'week' ? '7 days' : 
                timeRange === 'month' ? 'month' : 
                'quarter'
              } (${filteredData.length} data points)`
            : 'Limited data available. Add more journal entries for better insights.'}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedHealthInsights;
