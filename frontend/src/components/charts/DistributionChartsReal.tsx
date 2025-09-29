'use client';

import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFilters } from '@/context/FilterContext';
import axios from '@/lib/api/axios';
import ChartsSkeleton from './ChartsSkeleton';

// Fetch distribution data from backend
const fetchDistributionData = async (filters: Record<string, string> = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  
  const response = await axios.get(`/schools/distribution?${params.toString()}`);
  return response.data;
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
      </div>
    );
  }
  return null;
};

export default function DistributionChartsReal() {
  const { state, district, block, village } = useFilters();
  
  // Build filter object from context
  const filters = {
    ...(state && { state }),
    ...(district && { district }),
    ...(block && { block }),
    ...(village && { village }),
  };

  const { data: distributionData, isLoading, error } = useQuery({
    queryKey: ['distribution', state, district, block, village],
    queryFn: () => fetchDistributionData(filters),
  });

  if (isLoading) {
    return <ChartsSkeleton />;
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-red-600">
              Failed to load distribution data
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = distributionData?.data || {
    managementTypeDistribution: [],
    locationDistribution: [],
    schoolTypeDistribution: [],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Management Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Management Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.managementTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent as number * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {data.managementTypeDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS.management[index % COLORS.management.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Location Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Location Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.locationDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent as number * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  animationBegin={200}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {data.locationDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS.location[index % COLORS.location.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* School Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>School Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.schoolTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent as number * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  animationBegin={400}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {data.schoolTypeDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS.schoolType[index % COLORS.schoolType.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
