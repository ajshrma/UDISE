'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFilters } from '@/context/FilterContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
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

export default function FilterSystemSimple() {
  const { setState, setDistrict, setBlock, setVillage, clearFilters } = useFilters();
  
  // Simple single select state
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');

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

  // Simple select functions
  const selectState = (stateName: string) => {
    setSelectedState(stateName);
    setState(stateName);
    // Clear dependent selections
    setSelectedDistrict('');
    setSelectedBlock('');
    setSelectedVillage('');
    setDistrict('');
    setBlock('');
    setVillage('');
  };

  const selectDistrict = (districtName: string) => {
    setSelectedDistrict(districtName);
    setDistrict(districtName);
    // Clear dependent selections
    setSelectedBlock('');
    setSelectedVillage('');
    setBlock('');
    setVillage('');
  };

  const selectBlock = (blockName: string) => {
    setSelectedBlock(blockName);
    setBlock(blockName);
    // Clear dependent selections
    setSelectedVillage('');
    setVillage('');
  };

  const selectVillage = (villageName: string) => {
    setSelectedVillage(villageName);
    setVillage(villageName);
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
        <CardTitle>Filter Schools (Simple Single Select)</CardTitle>
        <p className="text-sm text-gray-600">
          Click to select one option at each level. Each level filters the next level.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* States */}
          <div className="space-y-2">
            <label className="text-sm font-medium">States</label>
            <div className="flex flex-wrap gap-2">
              {statesLoading ? (
                <div className="text-sm text-gray-500">Loading states...</div>
              ) : (
                states.map((stateOption: any) => (
                  <Button
                    key={stateOption.name}
                    variant={selectedState === stateOption.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => selectState(stateOption.name)}
                    className="text-xs"
                  >
                    {stateOption.name} ({stateOption.count})
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Districts */}
          {selectedState && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Districts</label>
              <div className="flex flex-wrap gap-2">
                {districtsLoading ? (
                  <div className="text-sm text-gray-500">Loading districts...</div>
                ) : (
                  districts.map((districtOption: any) => (
                    <Button
                      key={districtOption.name}
                      variant={selectedDistrict === districtOption.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => selectDistrict(districtOption.name)}
                      className="text-xs"
                    >
                      {districtOption.name} ({districtOption.count})
                    </Button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Blocks */}
          {selectedDistrict && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Blocks</label>
              <div className="flex flex-wrap gap-2">
                {blocksLoading ? (
                  <div className="text-sm text-gray-500">Loading blocks...</div>
                ) : (
                  blocks.map((blockOption: any) => (
                    <Button
                      key={blockOption.name}
                      variant={selectedBlock === blockOption.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => selectBlock(blockOption.name)}
                      className="text-xs"
                    >
                      {blockOption.name} ({blockOption.count})
                    </Button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Villages */}
          {selectedBlock && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Villages</label>
              <div className="flex flex-wrap gap-2">
                {villagesLoading ? (
                  <div className="text-sm text-gray-500">Loading villages...</div>
                ) : (
                  villages.map((villageOption: any) => (
                    <Button
                      key={villageOption.name}
                      variant={selectedVillage === villageOption.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => selectVillage(villageOption.name)}
                      className="text-xs"
                    >
                      {villageOption.name} ({villageOption.count})
                    </Button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              disabled={!selectedState && !selectedDistrict && !selectedBlock && !selectedVillage}
            >
              Clear All Filters
            </Button>
          </div>

          {/* Active Filters Display */}
          {(selectedState || selectedDistrict || selectedBlock || selectedVillage) && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
