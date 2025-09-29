'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFilters } from '@/context/FilterContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from '@/lib/api/axios';

// Fetch filter options from backend
const fetchFilterOptions = async (type: string, parentValue?: string) => {
  const params = new URLSearchParams();
  params.append('type', type);
  
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

export default function FilterSystemDropdowns() {
  const { state, district, block, village, setState, setDistrict, setBlock, setVillage, clearFilters } = useFilters();
  
  // Local state for dropdowns
  const [selectedState, setSelectedState] = useState(state || '');
  const [selectedDistrict, setSelectedDistrict] = useState(district || '');
  const [selectedBlock, setSelectedBlock] = useState(block || '');
  const [selectedVillage, setSelectedVillage] = useState(village || '');

  // Sync local state with context
  useEffect(() => {
    setSelectedState(state || '');
    setSelectedDistrict(district || '');
    setSelectedBlock(block || '');
    setSelectedVillage(village || '');
  }, [state, district, block, village]);

  // Fetch states
  const { data: statesData, isLoading: statesLoading } = useQuery({
    queryKey: ['filter-options', 'states'],
    queryFn: () => fetchFilterOptions('states'),
  });

  // Fetch districts when state is selected
  const { data: districtsData, isLoading: districtsLoading } = useQuery({
    queryKey: ['filter-options', 'districts', selectedState],
    queryFn: () => fetchFilterOptions('districts', selectedState),
    enabled: !!selectedState,
  });

  // Fetch blocks when district is selected
  const { data: blocksData, isLoading: blocksLoading } = useQuery({
    queryKey: ['filter-options', 'blocks', selectedDistrict],
    queryFn: () => fetchFilterOptions('blocks', selectedDistrict),
    enabled: !!selectedDistrict,
  });

  // Fetch villages when block is selected
  const { data: villagesData, isLoading: villagesLoading } = useQuery({
    queryKey: ['filter-options', 'villages', selectedBlock],
    queryFn: () => fetchFilterOptions('villages', selectedBlock),
    enabled: !!selectedBlock,
  });

  // Handle state selection
  const handleStateChange = (value: string) => {
    if (value === '__clear__') {
      // Clear state and all dependent selections
      setSelectedState('');
      setState('');
      setSelectedDistrict('');
      setSelectedBlock('');
      setSelectedVillage('');
      setDistrict('');
      setBlock('');
      setVillage('');
    } else {
      setSelectedState(value);
      setState(value);
      
      // Clear dependent selections
      setSelectedDistrict('');
      setSelectedBlock('');
      setSelectedVillage('');
      setDistrict('');
      setBlock('');
      setVillage('');
    }
  };

  // Handle district selection
  const handleDistrictChange = (value: string) => {
    if (value === '__clear__') {
      // Clear district and dependent selections
      setSelectedDistrict('');
      setDistrict('');
      setSelectedBlock('');
      setSelectedVillage('');
      setBlock('');
      setVillage('');
    } else {
      setSelectedDistrict(value);
      setDistrict(value);
      
      // Clear dependent selections
      setSelectedBlock('');
      setSelectedVillage('');
      setBlock('');
      setVillage('');
    }
  };

  // Handle block selection
  const handleBlockChange = (value: string) => {
    if (value === '__clear__') {
      // Clear block and dependent selections
      setSelectedBlock('');
      setBlock('');
      setSelectedVillage('');
      setVillage('');
    } else {
      setSelectedBlock(value);
      setBlock(value);
      
      // Clear dependent selections
      setSelectedVillage('');
      setVillage('');
    }
  };

  // Handle village selection
  const handleVillageChange = (value: string) => {
    if (value === '__clear__') {
      // Clear village
      setSelectedVillage('');
      setVillage('');
    } else {
      setSelectedVillage(value);
      setVillage(value);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedBlock('');
    setSelectedVillage('');
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
        <p className="text-sm text-gray-600">
          Select filters hierarchically: State → District → Block → Village
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Horizontal Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* State Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Select value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {statesLoading ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">Loading states...</div>
                  ) : (
                    <>
                      <SelectItem value="__clear__">Clear State</SelectItem>
                      {states.map((stateOption: any) => (
                        <SelectItem key={stateOption.name} value={stateOption.name}>
                          {stateOption.name} ({stateOption.count})
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* District Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium">District</label>
              <Select 
                value={selectedDistrict} 
                onValueChange={handleDistrictChange}
                disabled={!selectedState}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedState ? "Select district" : "Select state first"} />
                </SelectTrigger>
                <SelectContent>
                  {districtsLoading ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">Loading districts...</div>
                  ) : (
                    <>
                      <SelectItem value="__clear__">Clear District</SelectItem>
                      {districts.map((districtOption: any) => (
                        <SelectItem key={districtOption.name} value={districtOption.name}>
                          {districtOption.name} ({districtOption.count})
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Block Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Block</label>
              <Select 
                value={selectedBlock} 
                onValueChange={handleBlockChange}
                disabled={!selectedDistrict}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedDistrict ? "Select block" : "Select district first"} />
                </SelectTrigger>
                <SelectContent>
                  {blocksLoading ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">Loading blocks...</div>
                  ) : (
                    <>
                      <SelectItem value="__clear__">Clear Block</SelectItem>
                      {blocks.map((blockOption: any) => (
                        <SelectItem key={blockOption.name} value={blockOption.name}>
                          {blockOption.name} ({blockOption.count})
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Village Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Village</label>
              <Select 
                value={selectedVillage} 
                onValueChange={handleVillageChange}
                disabled={!selectedBlock}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedBlock ? "Select village" : "Select block first"} />
                </SelectTrigger>
                <SelectContent>
                  {villagesLoading ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">Loading villages...</div>
                  ) : (
                    <>
                      <SelectItem value="__clear__">Clear Village</SelectItem>
                      {villages.map((villageOption: any) => (
                        <SelectItem key={villageOption.name} value={villageOption.name}>
                          {villageOption.name} ({villageOption.count})
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button and Active Filters */}
          <div className="flex justify-between items-center">
            <div className="flex-1">
              {(selectedState || selectedDistrict || selectedBlock || selectedVillage) && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  {selectedState && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      State: {selectedState}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => {
                          setSelectedState('');
                          setState('');
                          setSelectedDistrict('');
                          setSelectedBlock('');
                          setSelectedVillage('');
                          setDistrict('');
                          setBlock('');
                          setVillage('');
                        }}
                      />
                    </Badge>
                  )}
                  {selectedDistrict && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      District: {selectedDistrict}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => {
                          setSelectedDistrict('');
                          setDistrict('');
                          setSelectedBlock('');
                          setSelectedVillage('');
                          setBlock('');
                          setVillage('');
                        }}
                      />
                    </Badge>
                  )}
                  {selectedBlock && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Block: {selectedBlock}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => {
                          setSelectedBlock('');
                          setBlock('');
                          setSelectedVillage('');
                          setVillage('');
                        }}
                      />
                    </Badge>
                  )}
                  {selectedVillage && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Village: {selectedVillage}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => {
                          setSelectedVillage('');
                          setVillage('');
                        }}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              disabled={!selectedState && !selectedDistrict && !selectedBlock && !selectedVillage}
              className="ml-4"
            >
              Clear All Filters
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
