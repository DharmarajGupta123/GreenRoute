import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { EmissionData } from '../types';

interface ComparisonChartProps {
  data: EmissionData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-gray-100 dark:border-slate-700 shadow-lg rounded-lg">
        <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          CO₂: <span className="font-bold text-gray-900 dark:text-gray-200">{payload[0].value} kg</span>
        </p>
      </div>
    );
  }
  return null;
};

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ data }) => {
  // Sort data descending for better visual
  const chartData = [...data].sort((a, b) => b.co2 - a.co2);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 h-[400px]">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Your Environmental Impact (kg CO₂)</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis 
              dataKey="mode" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} // Slate 400
            />
            <YAxis 
              hide={true} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="co2" radius={[6, 6, 0, 0]} barSize={40} isAnimationActive={true} animationDuration={1000}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
        Lower is better. Walking and Biking produce 0 direct emissions.
      </p>
    </div>
  );
};