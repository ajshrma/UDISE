'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import axios from '@/lib/api/axios';

interface HierarchicalSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  level: 'states' | 'districts' | 'blocks' | 'villages';
  parentState?: string;
  parentDistrict?: string;
  parentBlock?: string;
  disabled?: boolean;
}

interface FilterOption {
  name: string;
  count: number;
}

export function HierarchicalSelect({
  value,
  onValueChange,
  placeholder,
  level,
  parentState,
  parentDistrict,
  parentBlock,
  disabled = false,
}: HierarchicalSelectProps) {
  const [open, setOpen] = useState(false);

  // Build query parameters based on level
  const getQueryParams = () => {
    const params: Record<string, string> = { type: level };
    if (parentState) params.state = parentState;
    if (parentDistrict) params.district = parentDistrict;
    if (parentBlock) params.block = parentBlock;
    return params;
  };

  // Fetch filter options
  const { data: options = [], isLoading } = useQuery({
    queryKey: ['filters', level, parentState, parentDistrict, parentBlock],
    queryFn: async () => {
      const params = getQueryParams();
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`/schools/filters?${queryString}`);
      return response.data.data || [];
    },
    enabled: !disabled,
  });

  const selectedOption = options.find((option: FilterOption) => option.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading}
        >
          {selectedOption ? selectedOption.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${level}...`} />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Loading...' : `No ${level} found.`}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option: FilterOption) => (
                <CommandItem
                  key={option.name}
                  value={option.name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex justify-between w-full">
                    <span>{option.name}</span>
                    <span className="text-muted-foreground text-sm">
                      ({option.count})
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
