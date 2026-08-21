import { useState } from 'react';
import { X } from 'lucide-react';
import {
  FIELD_INPUT_CLASS,
  LABEL_CLASS,
  filterCategories,
  type CategoryOption,
} from './form';

function CategoryOptions({
  available,
  search,
  selectedIds,
  onSelect,
}: {
  available: CategoryOption[];
  search: string;
  selectedIds: string[];
  onSelect: (id: string) => void;
}) {
  if (available.length === 0) {
    return (
      <div className='p-3 text-sm text-gray-500 text-center'>
        Loading categories...
      </div>
    );
  }

  const filtered = filterCategories(available, search, selectedIds);

  if (filtered.length === 0) {
    return (
      <div className='p-3 text-sm text-gray-500 text-center'>
        No categories found.
      </div>
    );
  }

  return (
    <>
      {filtered.map(cat => (
        <button
          key={cat._id}
          type='button'
          onClick={() => onSelect(cat._id)}
          className='w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors'
        >
          {cat.name}
        </button>
      ))}
    </>
  );
}

export function CategoryPicker({
  selectedIds,
  available,
  onChange,
}: {
  selectedIds: string[];
  available: CategoryOption[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const selected = available.filter(cat => selectedIds.includes(cat._id));

  const removeCategory = (id: string) => {
    onChange(selectedIds.filter(selectedId => selectedId !== id));
  };

  const addCategory = (id: string) => {
    onChange([...selectedIds, id]);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div>
      <label className={LABEL_CLASS}>Categories (Select multiple)</label>
      <div className='flex flex-col gap-2'>
        {selected.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {selected.map(cat => (
              <span
                key={cat._id}
                className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              >
                {cat.name}
                <button
                  type='button'
                  onClick={() => removeCategory(cat._id)}
                  className='hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors focus:outline-hidden'
                >
                  <X className='w-3 h-3' />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className='relative'>
          <input
            type='text'
            placeholder='Search and select categories...'
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            className={FIELD_INPUT_CLASS}
          />

          {isOpen && (
            <div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
              <CategoryOptions
                available={available}
                search={search}
                selectedIds={selectedIds}
                onSelect={addCategory}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
