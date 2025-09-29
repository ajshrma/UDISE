'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface FilterState {
  state: string;
  district: string;
  block: string;
  village: string;
}

interface FilterContextType {
  state: string;
  district: string;
  block: string;
  village: string;
  setState: (state: string) => void;
  setDistrict: (district: string) => void;
  setBlock: (block: string) => void;
  setVillage: (village: string) => void;
  clearFilters: () => void;
  clearState: () => void;
  clearDistrict: () => void;
  clearBlock: () => void;
  clearVillage: () => void;
  getActiveFilters: () => Record<string, string>;
}

const FilterContext = createContext<FilterContextType | null>(null);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<FilterState>({
    state: '',
    district: '',
    block: '',
    village: '',
  });

  const setState = (state: string) => {
    setFilters({ state, district: '', block: '', village: '' });
  };

  const setDistrict = (district: string) => {
    setFilters(prev => ({ ...prev, district, block: '', village: '' }));
  };

  const setBlock = (block: string) => {
    setFilters(prev => ({ ...prev, block, village: '' }));
  };

  const setVillage = (village: string) => {
    setFilters(prev => ({ ...prev, village }));
  };

  const clearFilters = () => {
    setFilters({ state: '', district: '', block: '', village: '' });
  };

  const clearState = () => {
    setFilters({ state: '', district: '', block: '', village: '' });
  };

  const clearDistrict = () => {
    setFilters(prev => ({ ...prev, district: '', block: '', village: '' }));
  };

  const clearBlock = () => {
    setFilters(prev => ({ ...prev, block: '', village: '' }));
  };

  const clearVillage = () => {
    setFilters(prev => ({ ...prev, village: '' }));
  };

  const getActiveFilters = () => {
    const activeFilters: Record<string, string> = {};
    if (filters.state) activeFilters.state = filters.state;
    if (filters.district) activeFilters.district = filters.district;
    if (filters.block) activeFilters.block = filters.block;
    if (filters.village) activeFilters.village = filters.village;
    return activeFilters;
  };

  return (
    <FilterContext.Provider
      value={{
        state: filters.state,
        district: filters.district,
        block: filters.block,
        village: filters.village,
        setState,
        setDistrict,
        setBlock,
        setVillage,
        clearFilters,
        clearState,
        clearDistrict,
        clearBlock,
        clearVillage,
        getActiveFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

