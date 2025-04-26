
export type SortField = 'id' | 'english_name' | 'romanji_name';
export type SortDirection = 'asc' | 'desc';

export const sortAnimeList = (
  list: any[],
  field: SortField,
  direction: SortDirection
) => {
  return [...list].sort((a, b) => {
    const aValue = a[field] || '';
    const bValue = b[field] || '';
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return direction === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });
};
