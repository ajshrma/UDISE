'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFilters } from '@/context/FilterContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from '@/lib/api/axios';

// Fetch filter options from backend
const fetchFilterOptions = async (type: string, parentValue?: string) => {
  const params = new URLSearchParams();
  params.append('type', type);
  
  // Map parent value to correct parameter based on type
  if (parentValue) {
    if (type === 'districts') {
      params.append('state', parentValue);
    } else if (type === 'blocks') {
      params.append('district', parentValue);
    } else if (type === 'villages') {
      params.append('block', parentValue);
    }
  }
  
  const response = await axios.get(`/schools/filters?${params.toString()}`);
  return response.data;
};

export default function FilterSystemFixed() {
  const { state, district, block, village, setState, setDistrict, setBlock, setVillage, clearFilters } = useFilters();

  // Fetch states
  const { data: statesData, isLoading: statesLoading } = useQuery({
    queryKey: ['filter-options', 'states'],
    queryFn: () => fetchFilterOptions('states'),
  });

  // Fetch districts when state is selected
  const { data: districtsData, isLoading: districtsLoading } = useQuery({
    queryKey: ['filter-options', 'districts', state],
    queryFn: () => fetchFilterOptions('districts', state),
    enabled: !!state,
  });

  // Fetch blocks when district is selected
  const { data: blocksData, isLoading: blocksLoading } = useQuery({
    queryKey: ['filter-options', 'blocks', district],
    queryFn: () => fetchFilterOptions('blocks', district),
    enabled: !!district,
  });

  // Fetch villages when block is selected
  const { data: villagesData, isLoading: villagesLoading } = useQuery({
    queryKey: ['filter-options', 'villages', block],
    queryFn: () => fetchFilterOptions('blocks', block),
    enabled: !!block,
  });

  // Handle state change
  const handleStateChange = (value: string) => {
    setState(value);
    setDistrict('');
    setBlock('');
    setVillage('');
  };

  // Handle district change
  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setBlock('');
    setVillage('');
  };

  // Handle block change
  const handleBlockChange = (value: string) => {
    setBlock(value);
    setVillage('');
  };

  // Handle village change
  const handleVillageChange = (value: string) => {
    setVillage(value);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setState('');
    setDistrict('');
    setBlock('');
    setVillage('');
    clearFilters();
  };

  const states = statesData?.data || [];
  const districts = districtsData?.data || [];
  const blocks = blocksData?.data || [];
  const villages = villagesData?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Schools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* State Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">State</label>
            <Select value={state} onValueChange={handleStateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {statesLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  states.map((stateOption: any) => (
                    <SelectItem key={stateOption.name} value={stateOption.name}>
                      {stateOption.name} ({stateOption.count})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* District Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">District</label>
            <Select 
              value={district} 
              onValueChange={handleDistrictChange}
              disabled={!state}
            >
              <SelectTrigger>
                <SelectValue placeholder={state ? "Select District" : "Select State first"} />
              </SelectTrigger>
              <SelectContent>
                {districtsLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  districts.map((districtOption: any) => (
                    <SelectItem key={districtOption.name} value={districtOption.name}>
                      {districtOption.name} ({districtOption.count})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Block Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Block</label>
            <Select 
              value={block} 
              onValueChange={handleBlockChange}
              disabled={!district}
            >
              <SelectTrigger>
                <SelectValue placeholder={district ? "Select Block" : "Select District first"} />
              </SelectTrigger>
              <SelectContent>
                {blocksLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  blocks.map((blockOption: any) => (
                    <SelectItem key={blockOption.name} value={blockOption.name}>
                      {blockOption.name} ({blockOption.count})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Village Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Village</label>
            <Select 
              value={village} 
              onValueChange={handleVillageChange}
              disabled={!block}
            >
              <SelectTrigger>
                <SelectValue placeholder={block ? "Select Village" : "Select Block first"} />
              </SelectTrigger>
              <SelectContent>
                {villagesLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  villages.map((villageOption: any) => (
                    <SelectItem key={villageOption.name} value={villageOption.name}>
                      {villageOption.name} ({villageOption.count})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            disabled={!state && !district && !block && !village}
          >
            Clear Filters
          </Button>
        </div>

        {/* Active Filters Display */}
        {(state || district || block || village) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {state && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  State: {state}
                </span>
              )}
              {district && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  District: {district}
                </span>
              )}
              {block && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Block: {block}
                </span>
              )}
              {village && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Village: {village}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
