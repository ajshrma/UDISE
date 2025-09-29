'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Mock data for charts
const mockData = {
  managementType: [
    { name: 'Government', value: 45, count: 450 },
    { name: 'Private Unaided', value: 35, count: 350 },
    { name: 'Aided', value: 20, count: 200 },
  ],
  location: [
    { name: 'Rural', value: 60, count: 600 },
    { name: 'Urban', value: 40, count: 400 },
  ],
  schoolType: [
    { name: 'Co-Ed', value: 70, count: 700 },
    { name: 'Girls', value: 20, count: 200 },
    { name: 'Boys', value: 10, count: 100 },
  ],
};

const COLORS = {
  management: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
  location: ['#8884D8', '#82CA9D'],
  schoolType: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { count: number } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-blue-600">{`Count: ${payload[0].payload.count}`}</p>
        <p className="text-green-600">{`Percentage: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

export default function DistributionCharts() {
  // In a real app, this would use the filter context
  const activeFilters = {};

  // In a real app, this would fetch data based on active filters
  const data = mockData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Management Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Management Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.managementType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.managementType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.management[index % COLORS.management.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Location Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.location}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* School Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">School Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.schoolType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.schoolType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.schoolType[index % COLORS.schoolType.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Display */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Filter Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Charts are showing data for: {Object.entries(activeFilters).map(([key, value]) => `${key}: ${value}`).join(', ')}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

