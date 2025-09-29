'use client';

import { useState, useEffect } from 'react';
import { useFilters } from '@/context/FilterContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for demonstration
const mockStates = [
  'Madhya Pradesh',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Gujarat',
  'Rajasthan',
  'West Bengal',
];

const mockDistricts: Record<string, string[]> = {
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol'],
};

const mockBlocks: Record<string, string[]> = {
  'Bhopal': ['Block A', 'Block B', 'Block C'],
  'Indore': ['Block X', 'Block Y', 'Block Z'],
  'Mumbai': ['Block 1', 'Block 2', 'Block 3'],
  'Pune': ['Block P1', 'Block P2', 'Block P3'],
  'Bangalore': ['Block B1', 'Block B2', 'Block B3'],
  'Chennai': ['Block C1', 'Block C2', 'Block C3'],
};

const mockVillages: Record<string, string[]> = {
  'Block A': ['Village 1', 'Village 2', 'Village 3'],
  'Block B': ['Village 4', 'Village 5', 'Village 6'],
  'Block C': ['Village 7', 'Village 8', 'Village 9'],
  'Block X': ['Village X1', 'Village X2', 'Village X3'],
  'Block Y': ['Village Y1', 'Village Y2', 'Village Y3'],
  'Block Z': ['Village Z1', 'Village Z2', 'Village Z3'],
};

export default function FilterSystem() {
  const {
    filters,
    setState,
    setDistrict,
    setBlock,
    setVillage,
    clearFilters,
    getActiveFilters,
  } = useFilters();

  const { state, district, block, village } = filters;

  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
  const [availableVillages, setAvailableVillages] = useState<string[]>([]);

  // Update available districts when state changes
  useEffect(() => {
    if (state) {
      setAvailableDistricts(mockDistricts[state] || []);
    } else {
      setAvailableDistricts([]);
    }
  }, [state]);

  // Update available blocks when district changes
  useEffect(() => {
    if (district) {
      setAvailableBlocks(mockBlocks[district] || []);
    } else {
      setAvailableBlocks([]);
    }
  }, [district]);

  // Update available villages when block changes
  useEffect(() => {
    if (block) {
      setAvailableVillages(mockVillages[block] || []);
    } else {
      setAvailableVillages([]);
    }
  }, [block]);

  const handleClearFilters = () => {
    clearFilters();
    setAvailableDistricts([]);
    setAvailableBlocks([]);
    setAvailableVillages([]);
  };

  const activeFilters = getActiveFilters();
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Filter Schools</span>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* State Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">State</label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {mockStates.map((stateOption) => (
                  <SelectItem key={stateOption} value={stateOption}>
                    {stateOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">District</label>
            <Select 
              value={district} 
              onValueChange={setDistrict}
              disabled={!state}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {availableDistricts.map((districtOption) => (
                  <SelectItem key={districtOption} value={districtOption}>
                    {districtOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Block Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Block</label>
            <Select 
              value={block} 
              onValueChange={setBlock}
              disabled={!district}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Block" />
              </SelectTrigger>
              <SelectContent>
                {availableBlocks.map((blockOption) => (
                  <SelectItem key={blockOption} value={blockOption}>
                    {blockOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Village Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Village</label>
            <Select 
              value={village} 
              onValueChange={setVillage}
              disabled={!block}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Village" />
              </SelectTrigger>
              <SelectContent>
                {availableVillages.map((villageOption) => (
                  <SelectItem key={villageOption} value={villageOption}>
                    {villageOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([key, value]) => (
                <span
                  key={key}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

