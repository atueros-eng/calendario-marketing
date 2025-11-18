
import React, { useState, useEffect } from 'react';
import { Brand, Campaign, CampaignType, CampaignStatus, TouchpointChannel, CampaignTouchpoint } from '../types';
import { CAMPAIGN_TYPES, STATUS_CONFIG, CHANNELS } from '../constants';
import { Button } from './Button';
import { generateCampaignIdeas } from '../services/geminiService';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: Campaign | Campaign[]) => void;
  onDelete?: (campaignId: string) => void;
  brands: Brand[];
  initialDate?: string;
  existingCampaign?: Campaign | null;
}

type RecurrenceType = 'none' | 'weekly' | 'monthly';

export const CampaignModal: React.FC<CampaignModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  brands,
  initialDate,
  existingCampaign,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brandId, setBrandId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState(''); // New Time State
  const [type, setType] = useState<CampaignType>('launch');
  const [status, setStatus] = useState<CampaignStatus>('planned');
  
  // Tactics
  const [callToAction, setCallToAction] = useState('');
  const [isBlast, setIsBlast] = useState(false);
  const [coupon, setCoupon] = useState('');

  // Audience
  const [segment, setSegment] = useState('');

  // Multiple Touchpoints State
  const [touchpoints, setTouchpoints] = useState<CampaignTouchpoint[]>([]);
  
  // Temporary state for adding a new touchpoint
  const [newTpChannel, setNewTpChannel] = useState<TouchpointChannel>('email');
  const [newTpName, setNewTpName] = useState('');
  const [newTpSegment, setNewTpSegment] = useState('');

  // Notification State
  const [notify, setNotify] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');

  // Recurrence State
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [repeatCount, setRepeatCount] = useState<number>(3);

  // Copy Mode State
  const [isCopyMode, setIsCopyMode] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<{title: string, description: string}[]>([]);

  useEffect(() => {
    if (isOpen) {
      setIsCopyMode(false); // Reset copy mode on open
      if (existingCampaign) {
        setTitle(existingCampaign.title);
        setDescription(existingCampaign.description);
        setBrandId(existingCampaign.brandId);
        setDate(existingCampaign.date);
        setTime(existingCampaign.time || ''); // Load time
        setType(existingCampaign.type || 'launch');
        setStatus(existingCampaign.status || 'planned');
        
        // Tactics
        setCallToAction(existingCampaign.tactics?.callToAction || '');
        setIsBlast(existingCampaign.tactics?.isBlast || false);
        setCoupon(existingCampaign.tactics?.coupon || '');
        
        // Audience & Touchpoints
        setSegment(existingCampaign.segment || '');
        setTouchpoints(existingCampaign.touchpoints || []);

        setNotify(existingCampaign.notify || false);
        setNotifyEmail(existingCampaign.notifyEmail || '');
        setRecurrence('none'); 
      } else {
        setTitle('');
        setDescription('');
        setBrandId(brands.length > 0 ? brands[0].id : '');
        setDate(initialDate || new Date().toISOString().split('T')[0]);
        setTime(''); // Default empty time
        setType('launch');
        setStatus('planned');
        
        setCallToAction('');
        setIsBlast(false);
        setCoupon('');
        
        setSegment('');
        setTouchpoints([]);

        setNotify(false);
        setNotifyEmail('');
        setRecurrence('none');
        setRepeatCount(3);
      }
      setSuggestions([]);
      setNewTpName('');
      setNewTpChannel('email');
      setNewTpSegment('');
    }
  }, [isOpen, existingCampaign, initialDate, brands]);

  if (!isOpen) return null;

  const handleAddTouchpoint = () => {
    const newTp: CampaignTouchpoint = {
      id: crypto.randomUUID(),
      channel: newTpChannel,
      name: newTpName || CHANNELS[newTpChannel].label,
      // FIX: Send empty string instead of undefined for Firestore compatibility
      segment: newTpSegment || '' 
    };
    setTouchpoints([...touchpoints, newTp]);
    setNewTpName('');
    setNewTpSegment('');
  };

  const handleRemoveTouchpoint = (id: string) => {
    setTouchpoints(touchpoints.filter(tp => tp.id !== id));
  };

  const handleSave = () => {
    // Validation
    if (!brandId) return alert("Por favor selecciona una Marca.");
    if (!date) return alert("Por favor selecciona una Fecha.");
    if (!title) return alert("Por favor escribe un Título.");

    const baseCampaign: Omit<Campaign, 'id' | 'date'> = {
      brandId,
      title,
      description,
      status,
      // FIX: Send empty string instead of undefined for Firestore compatibility
      time: time || '', 
      type,
      tactics: {
        callToAction,
        isBlast,
        coupon
      },
      segment,
      touchpoints,
      notify,
      // FIX: Send empty string instead of undefined for Firestore compatibility
      notifyEmail: notify ? notifyEmail : '' 
    };

    // Determine if we are creating a NEW campaign (Copy Mode OR No Existing Campaign)
    // or updating an EXISTING one.
    const isCreatingNew = !existingCampaign || isCopyMode;

    if (isCreatingNew && recurrence !== 'none') {
      // Save recurring (Multiple New Campaigns)
      const campaignsToSave: Campaign[] = [];
      const startDate = new Date(date);
      
      for (let i = 0; i < repeatCount; i++) {
        const nextDate = new Date(startDate);
        
        if (recurrence === 'weekly') {
          nextDate.setDate(startDate.getDate() + (i * 7));
        } else if (recurrence === 'monthly') {
          nextDate.setMonth(startDate.getMonth() + i);
        }

        campaignsToSave.push({
          ...baseCampaign,
          id: crypto.randomUUID(),
          date: nextDate.toISOString().split('T')[0],
        });
      }
      onSave(campaignsToSave);
    } else {
      // Save Single (Update existing OR Create single new)
      onSave({
        ...baseCampaign,
        id: (existingCampaign && !isCopyMode) ? existingCampaign.id : crypto.randomUUID(),
        date,
      });
    }

    onClose();
  };

  const handleDuplicate = () => {
    // Switch to Copy Mode
    setIsCopyMode(true);
    setTitle(`${title} (Copia)`);
    setStatus('planned');
    // Now the user can edit the form (date, brand, etc.) and hit "Guardar"
  };

  const handleGenerateIdeas = async () => {
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return;
    
    setIsGenerating(true);
    try {
      const monthName = new Date(date).toLocaleString('es-ES', { month: 'long' });
      const ideas = await generateCampaignIdeas(brand.name, brand.industry, monthName, type);
      setSuggestions(ideas);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = (s: {title: string, description: string}) => {
    setTitle(s.title);
    setDescription(s.description);
  };

  const getModalTitle = () => {
    if (isCopyMode) return 'Nueva Campaña (Copia)';
    return existingCampaign ? 'Editar Campaña' : 'Nueva Campaña';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {getModalTitle()}
            {isCopyMode && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">Modo Duplicación</span>}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Configuration */}
            <div className="space-y-5">
               {/* Brand Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Marca <span className="text-red-500">*</span>
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  {brands.length === 0 && <option value="">Crea una marca primero</option>}
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Date, Time & Status Row */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-24 rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                      title="Hora de lanzamiento (opcional)"
                    />
                  </div>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estatus</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                    className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

               {/* Type Selection */}
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Comunicación</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(CAMPAIGN_TYPES) as CampaignType[]).map((t) => {
                    const typeInfo = CAMPAIGN_TYPES[t];
                    const isSelected = type === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`
                          flex flex-col items-start p-2 border rounded-lg text-left transition-all
                          ${isSelected 
                            ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{typeInfo.icon}</span>
                          <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 leading-tight">
                          {typeInfo.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="checkbox" 
                    id="notify"
                    checked={notify}
                    onChange={(e) => setNotify(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="notify" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                    Notificar 2 días antes
                  </label>
                </div>
                {notify && (
                  <input 
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="w-full rounded border-slate-300 p-1.5 text-sm"
                  />
                )}
              </div>
            </div>

            {/* Right Column: Content & Tactics */}
            <div className="space-y-5">
               {/* AI Helper */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-lg border border-indigo-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Asistente Gemini
                  </span>
                  <button
                    onClick={handleGenerateIdeas}
                    disabled={isGenerating}
                    className="text-xs bg-white text-indigo-600 border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-50 disabled:opacity-50 shadow-sm"
                  >
                    {isGenerating ? 'Pensando...' : `Sugerir Ideas`}
                  </button>
                </div>
                
                {suggestions.length > 0 && (
                  <div className="space-y-2 mt-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                    {suggestions.map((s, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => applySuggestion(s)}
                        className="bg-white p-2 rounded border border-indigo-100 text-xs cursor-pointer hover:border-indigo-400 hover:shadow-sm transition-all"
                      >
                        <p className="font-bold text-slate-800 mb-0.5">{s.title}</p>
                        <p className="text-slate-500 line-clamp-2">{s.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título de la campaña..."
                    className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Segmento Global <span className="text-slate-400 font-normal text-xs">(Opcional)</span></label>
                   <input 
                    type="text"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    placeholder="Ej. Clientes Activos, Toda la Base..."
                    className="w-full rounded-lg border-slate-300 border p-2 text-sm bg-yellow-50/50 focus:ring-2 focus:ring-indigo-500"
                   />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción <span className="text-slate-400 font-normal text-xs">(Opcional)</span></label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* TACTICS & TOUCHPOINTS */}
              <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-white">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 mb-2">
                  Táctica (Opcional)
                </h4>
                
                {/* Row 1: Blast and Coupon */}
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-red-50 px-3 py-1.5 rounded-md border border-red-100 hover:bg-red-100 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={isBlast}
                        onChange={(e) => setIsBlast(e.target.checked)}
                        className="text-red-600 focus:ring-red-500 rounded"
                      />
                      <span className="text-sm font-bold text-red-700">💥 Es Bomba</span>
                    </label>

                    <div className="flex-1">
                       <input 
                         type="text"
                         value={coupon}
                         onChange={(e) => setCoupon(e.target.value)}
                         placeholder="Código Cupón"
                         className="w-full border-slate-300 rounded text-sm p-1.5"
                       />
                    </div>
                </div>
                <div>
                  <input 
                    type="text"
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    placeholder="Llamado a la acción (CTA)"
                    className="w-full border-slate-300 rounded text-sm p-1.5"
                  />
                </div>
              </div>

              {/* MULTIPLE SENDS MANAGER */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Envíos / Toques (Opcional)
                 </h4>
                 
                 {/* List of added touchpoints */}
                 <div className="space-y-2 mb-3">
                   {touchpoints.map((tp) => (
                     <div key={tp.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2">
                           <span className="text-lg">{CHANNELS[tp.channel]?.icon}</span>
                           <div className="flex flex-col">
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-bold text-slate-700">{tp.name}</span>
                               {tp.segment && (
                                 <span className="text-[9px] bg-yellow-100 text-yellow-800 px-1.5 rounded-full border border-yellow-200">
                                   {tp.segment}
                                 </span>
                               )}
                             </div>
                             <span className="text-[10px] text-slate-400 uppercase">{CHANNELS[tp.channel]?.label}</span>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveTouchpoint(tp.id)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                     </div>
                   ))}
                   {touchpoints.length === 0 && (
                     <p className="text-xs text-slate-400 italic text-center py-2">No hay envíos configurados.</p>
                   )}
                 </div>

                 {/* Add new touchpoint */}
                 <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">Canal</label>
                      <select
                        value={newTpChannel}
                        onChange={(e) => setNewTpChannel(e.target.value as TouchpointChannel)}
                        className="w-full border-slate-300 rounded text-sm p-1.5 h-9"
                      >
                        {Object.entries(CHANNELS).filter(([k]) => k !== 'none').map(([k, v]) => (
                          <option key={k} value={k}>{v.icon} {v.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">Etiqueta</label>
                      <input 
                        type="text"
                        value={newTpName}
                        onChange={(e) => setNewTpName(e.target.value)}
                        placeholder="Nombre"
                        className="w-full border-slate-300 rounded text-sm p-1.5 h-9"
                      />
                    </div>
                    <div className="col-span-4">
                       <label className="block text-[10px] font-medium text-slate-500 mb-1">Segmento</label>
                       <div className="flex gap-1">
                        <input 
                          type="text"
                          value={newTpSegment}
                          onChange={(e) => setNewTpSegment(e.target.value)}
                          placeholder="Ej. VIPs"
                          className="w-full border-slate-300 rounded text-sm p-1.5 h-9"
                        />
                        <Button 
                          onClick={handleAddTouchpoint}
                          size="sm"
                          variant="secondary"
                          className="h-9 px-2"
                        >
                          +
                        </Button>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Recurrence (Only new or Copy Mode) */}
              {(!existingCampaign || isCopyMode) && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Repetir Campaña</span>
                   <div className="flex gap-2">
                     <select 
                      value={recurrence} 
                      onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                      className="rounded border-slate-300 text-sm p-1.5 w-32"
                     >
                       <option value="none">No</option>
                       <option value="weekly">Semanal</option>
                       <option value="monthly">Mensual</option>
                     </select>
                     {recurrence !== 'none' && (
                        <input 
                          type="number" 
                          min={2} 
                          max={52} 
                          value={repeatCount}
                          onChange={(e) => setRepeatCount(parseInt(e.target.value) || 2)}
                          className="w-16 rounded border-slate-300 p-1.5 text-center text-sm"
                        />
                     )}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium ml-2">
             <span className="text-red-500">*</span> Campos obligatorios
          </span>
          <div className="flex items-center gap-2">
            {/* Hide Delete button if we are in Copy Mode */}
            {existingCampaign && onDelete && !isCopyMode ? (
                <Button variant="danger" size="sm" onClick={() => onDelete(existingCampaign.id)}>
                Eliminar
                </Button>
            ) : <div></div>}
            
            <div className="flex gap-2">
                {/* Hide Duplicate button if we are already in Copy Mode */}
                {existingCampaign && !isCopyMode && (
                   <Button variant="secondary" onClick={handleDuplicate} title="Crear una copia nueva con estos datos">
                     📑 Duplicar
                   </Button>
                )}
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave}>
                  {recurrence !== 'none' 
                     ? `Guardar ${repeatCount} Campañas` 
                     : (isCopyMode ? 'Guardar Copia' : 'Guardar')
                  }
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
