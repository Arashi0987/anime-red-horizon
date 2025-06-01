
export type SortField = 'id' | 'english_name' | 'romanji_name' | 'anilist_score';
export type SortDirection = 'asc' | 'desc';

export const sortAnimeList = (
  list: any[],
  field: SortField,
  direction: SortDirection
) => {
  return [...list].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];
    
    // Handle null/undefined values for score
    if (field === 'anilist_score') {
      aValue = aValue || 0;
      bValue = bValue || 0;
    } else if (!aValue) {
      aValue = '';
    }
    
    if (!bValue) {
      bValue = '';
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return direction === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });
};
