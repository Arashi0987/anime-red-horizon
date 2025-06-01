
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortField, SortDirection } from '@/utils/sorting';

interface SortControlsProps {
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
  sortField: SortField;
  sortDirection: SortDirection;
}

export function SortControls({
  onSortFieldChange,
  onSortDirectionChange,
  sortField,
  sortDirection,
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <Select value={sortField} onValueChange={(value: SortField) => onSortFieldChange(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="id">Anilist ID</SelectItem>
          <SelectItem value="english_name">English Name</SelectItem>
          <SelectItem value="romanji_name">Romanji Name</SelectItem>
          <SelectItem value="anilist_score">Score</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={sortDirection} onValueChange={(value: SortDirection) => onSortDirectionChange(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Order..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
