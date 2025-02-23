import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  Heart,
  Scale,
  Moon,
  Target,
  Dumbbell,
  Apple,
  Timer
} from 'lucide-react';

const sleepData = [
  { date: 'Mon', hours: 7.5 },
  { date: 'Tue', hours: 6.8 },
  { date: 'Wed', hours: 8.2 },
  { date: 'Thu', hours: 7.1 },
  { date: 'Fri', hours: 7.9 },
  { date: 'Sat', hours: 8.5 },
  { date: 'Sun', hours: 7.8 },
];

const heartRateData = [
  { time: '6am', rate: 72 },
  { time: '9am', rate: 78 },
  { time: '12pm', rate: 75 },
  { time: '3pm', rate: 82 },
  { time: '6pm', rate: 79 },
  { time: '9pm', rate: 73 },
];

const activityData = [
  { name: 'Walking', minutes: 45 },
  { name: 'Running', minutes: 30 },
  { name: 'Cycling', minutes: 60 },
  { name: 'Gym', minutes: 50 },
];

const nutritionData = [
  { name: 'Proteins', value: 30 },
  { name: 'Carbs', value: 45 },
  { name: 'Fats', value: 25 },
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B'];

interface MetricCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: string | number;
  unit: string;
  trend: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, title, value, unit, trend }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-indigo-100 rounded-lg">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
      <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-baseline">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      <span className="ml-1 text-gray-500">{unit}</span>
    </div>
  </div>
);

const HealthSummary = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Health Summary</h1>
          <p className="mt-2 text-gray-600">Your health metrics and activity overview</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Heart}
            title="Average Heart Rate"
            value="75"
            unit="bpm"
            trend={2.5}
          />
          <MetricCard
            icon={Scale}
            title="Weight"
            value="68.5"
            unit="kg"
            trend={-1.2}
          />
          <MetricCard
            icon={Moon}
            title="Sleep Duration"
            value="7.5"
            unit="hours"
            trend={5}
          />
          <MetricCard
            icon={Target}
            title="Daily Steps"
            value="8,234"
            unit="steps"
            trend={12}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sleep Pattern */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Sleep Pattern</h2>
              <Moon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#4F46E5"
                    fill="#EEF2FF"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Heart Rate</h2>
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={heartRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#4F46E5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Activity Distribution</h2>
              <Dumbbell className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Nutrition Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Nutrition Breakdown</h2>
              <Apple className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nutritionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {nutritionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-6 mt-4">
                {nutritionData.map((item, index) => (
                  <div key={item.name} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthSummary;