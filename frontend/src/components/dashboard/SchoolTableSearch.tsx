'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SchoolTableSearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  value?: string;
}

export default function SchoolTableSearch({ 
  onSearch, 
  placeholder = "Search schools by name...",
  isLoading = false,
  value = ''
}: SchoolTableSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value);

  // Sync with external value prop
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="relative">
      {isLoading ? (
        <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
      ) : (
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      )}
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-10"
        disabled={isLoading}
      />
      {searchTerm && !isLoading && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSearch}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
