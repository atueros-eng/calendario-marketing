
import React, { useState } from 'react';
import { Brand } from '../types';
import { BRAND_COLORS } from '../constants';
import { Button } from './Button';

interface BrandManagerProps {
  isOpen: boolean;
  onClose: () => void;
  brands: Brand[];
  onSaveBrand: (brand: Brand) => void;
  onDeleteBrand: (id: string) => void;
}

export const BrandManager: React.FC<BrandManagerProps> = ({
  isOpen,
  onClose,
  brands,
  onSaveBrand,
  onDeleteBrand
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [colorObj, setColorObj] = useState(BRAND_COLORS[0]);

  if (!isOpen) return null;

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setName(brand.name);
    setIndustry(brand.industry);
    const foundColor = BRAND_COLORS.find(c => c.name === brand.color) || BRAND_COLORS[0];
    setColorObj(foundColor);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setIndustry('');
    setColorObj(BRAND_COLORS[0]);
  };

  const handleSave = () => {
    if (!name) return alert("Por favor ingresa el Nombre de la marca.");

    const newBrand: Brand = {
      id: editingId || crypto.randomUUID(),
      name,
      industry,
      color: colorObj.name,
      hex: colorObj.hex
    };

    onSaveBrand(newBrand);
    handleCancelEdit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Gestionar Marcas</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Editor Form */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            <h4 className="text-sm font-bold text-slate-700 mb-3">
              {editingId ? 'Editar Marca' : 'Agregar Nueva Marca'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">
                    Nombre <span className="text-red-500">*</span>
                 </label>
                 <input 
                   type="text" 
                   value={name}
                   onChange={e => setName(e.target.value)}
                   className="w-full rounded border-slate-300 text-sm p-2"
                   placeholder="Ej. Nike"
                 />
               </div>
               <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">Industria <span className="text-slate-400 font-normal">(Opcional)</span></label>
                 <input 
                   type="text" 
                   value={industry}
                   onChange={e => setIndustry(e.target.value)}
                   className="w-full rounded border-slate-300 text-sm p-2"
                   placeholder="Ej. Deportes"
                 />
               </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-2">Color Identificativo</label>
              <div className="flex flex-wrap gap-2">
                {BRAND_COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setColorObj(c)}
                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${colorObj.name === c.name ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {editingId && <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancelar</Button>}
              <Button size="sm" onClick={handleSave}>
                {editingId ? 'Actualizar' : 'Agregar'}
              </Button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2">
             {brands.map(brand => (
               <div key={brand.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 group">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brand.hex }}>
                      {brand.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{brand.name}</p>
                      <p className="text-xs text-slate-500">{brand.industry}</p>
                    </div>
                 </div>
                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(brand)}
                      className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded"
                    >
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onDeleteBrand(brand.id)}
                      className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                 </div>
               </div>
             ))}
          </div>

        </div>
      </div>
    </div>
  );
};
