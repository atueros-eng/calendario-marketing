
import React from 'react';
import { Brand } from '../types';

interface BrandSelectorProps {
  brands: Brand[];
  selectedBrandIds: string[];
  onToggleBrand: (brandId: string) => void;
  onToggleAll: () => void;
  onManageBrands: () => void;
}

export const BrandSelector: React.FC<BrandSelectorProps> = ({ 
  brands,
  selectedBrandIds, 
  onToggleBrand, 
  onToggleAll,
  onManageBrands
}) => {
  const allSelected = selectedBrandIds.length === brands.length && brands.length > 0;

  return (
    <div className="w-full lg:w-64 bg-white border-r border-slate-200 p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Marcas</h2>
        <button 
          onClick={onManageBrands}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          title="Gestionar Marcas"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
      
      <button 
        onClick={onToggleAll}
        className="mb-4 text-sm text-indigo-600 font-medium hover:text-indigo-800 text-left"
      >
        {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
      </button>

      <div className="space-y-2">
        {brands.map((brand) => {
          const isSelected = selectedBrandIds.includes(brand.id);
          return (
            <div 
              key={brand.id}
              onClick={() => onToggleBrand(brand.id)}
              className={`
                group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all
                ${isSelected ? 'bg-slate-50' : 'opacity-60 hover:opacity-100'}
              `}
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`w-3 h-3 rounded-full shadow-sm`} 
                  style={{ backgroundColor: brand.hex }}
                />
                <span className={`text-sm font-medium ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                  {brand.name}
                </span>
              </div>
              {isSelected && (
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
