import React, { useState, useEffect, useMemo } from 'react';
import { CalendarGrid } from './components/CalendarGrid';
import { CampaignList } from './components/CampaignList';
import { BrandSelector } from './components/BrandSelector';
import { CampaignModal } from './components/CampaignModal';
import { BrandManager } from './components/BrandManager';
import { ShareModal } from './components/ShareModal';
import { Button } from './components/Button';
import { Campaign, CalendarDay, Brand } from './types';
import { DEFAULT_BRANDS, MONTHS } from './constants';
import { generateICS, downloadICSFile } from './services/exportService';

// FIREBASE IMPORTS
import { db } from './services/firebaseConfig';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

const App: React.FC = () => {
  // --- STATE ---
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  // Loading State
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(false);

  // --- FIREBASE SYNC ---

  // 1. Sync Brands
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, "brands"), (snapshot) => {
        const loadedBrands: Brand[] = [];
        snapshot.forEach((doc) => {
          loadedBrands.push(doc.data() as Brand);
        });
        
        // If database is empty, load defaults locally for view, but don't save yet
        if (loadedBrands.length === 0) {
           setBrands(DEFAULT_BRANDS);
           // Auto-select all defaults
           if (selectedBrandIds.length === 0) setSelectedBrandIds(DEFAULT_BRANDS.map(b => b.id));
        } else {
           setBrands(loadedBrands);
           // Auto-select if first load
           if (selectedBrandIds.length === 0) setSelectedBrandIds(loadedBrands.map(b => b.id));
        }
        setLoading(false);
      }, (error: any) => {
        console.error("Firebase Error:", error);
        setFirebaseError(true);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase Config Error", e);
      setFirebaseError(true);
      setLoading(false);
    }
  }, []);

  // 2. Sync Campaigns
  useEffect(() => {
    if (firebaseError) return;
    try {
      const unsubscribe = onSnapshot(collection(db, "campaigns"), (snapshot) => {
        const loadedCampaigns: Campaign[] = [];
        snapshot.forEach((doc) => {
          loadedCampaigns.push(doc.data() as Campaign);
        });
        setCampaigns(loadedCampaigns);
      });
      return () => unsubscribe();
    } catch (e) {
      console.error(e);
    }
  }, [firebaseError]);


  // --- UI STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBrandManagerOpen, setIsBrandManagerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); 
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);


  // --- CALCULATIONS ---

  // Notification Logic
  const urgentCampaigns = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);

    return campaigns.filter(c => {
      if (!c.notify || c.status === 'sent') return false;
      const cDate = new Date(c.date);
      return cDate >= today && cDate <= twoDaysFromNow;
    });
  }, [campaigns]);

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => selectedBrandIds.includes(c.brandId));
  }, [campaigns, selectedBrandIds]);

  // Calendar Logic
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];
    const startDayOfWeek = firstDayOfMonth.getDay(); 
    
    for (let i = startDayOfWeek; i > 0; i--) {
      days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false, isToday: false });
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true, isToday: d.toDateString() === new Date().toDateString() });
    }
    const remainingCells = 42 - days.length; 
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false, isToday: false });
    }
    return days;
  }, [currentDate]);

  // --- HANDLERS (NOW ASYNC WITH FIREBASE) ---

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleToggleBrand = (id: string) => {
    setSelectedBrandIds(prev => prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]);
  };

  const handleToggleAllBrands = () => {
    setSelectedBrandIds(selectedBrandIds.length === brands.length ? [] : brands.map(b => b.id));
  };

  // SAVE BRAND TO FIREBASE
  const handleSaveBrand = async (brand: Brand) => {
    if (firebaseError) return alert("Error de configuración Firebase. Revisa services/firebaseConfig.ts");
    try {
      await setDoc(doc(db, "brands", brand.id), brand);
      if (!selectedBrandIds.includes(brand.id)) {
        setSelectedBrandIds(prev => [...prev, brand.id]);
      }
    } catch (e: any) {
      console.error("Error saving brand", e);
      alert(`No se pudo guardar la marca en la nube.\nError: ${e.message || e}`);
    }
  };

  // DELETE BRAND FROM FIREBASE
  const handleDeleteBrand = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta marca?')) {
      try {
        await deleteDoc(doc(db, "brands", id));
        setSelectedBrandIds(prev => prev.filter(bid => bid !== id));
      } catch (e) {
        console.error("Error deleting brand", e);
      }
    }
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setEditingCampaign(null);
    setIsModalOpen(true);
  };

  const handleCampaignClick = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  // SAVE CAMPAIGN TO FIREBASE
  const handleSaveCampaign = async (campaignOrCampaigns: Campaign | Campaign[]) => {
    if (firebaseError) return alert("Error de configuración Firebase. Revisa services/firebaseConfig.ts");
    
    const list = Array.isArray(campaignOrCampaigns) ? campaignOrCampaigns : [campaignOrCampaigns];
    
    try {
      for (const c of list) {
        await setDoc(doc(db, "campaigns", c.id), c);
      }
    } catch (e: any) {
      console.error("Error saving campaign", e);
      alert(`Error al guardar en la nube:\n${e.message || e}\n\nPosible solución: Revisa las 'Reglas' (Rules) en Firebase Console.`);
    }
  };

  // DELETE CAMPAIGN FROM FIREBASE
  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteDoc(doc(db, "campaigns", id));
      setIsModalOpen(false);
    } catch (e) {
      console.error("Error deleting campaign", e);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID','Brand','Date','Time','Title','Type','Status','Segment'];
    const rows = filteredCampaigns.map(c => {
      const brand = brands.find(b => b.id === c.brandId)?.name || 'Unknown';
      return [c.id, brand, c.date, c.time || '', `"${c.title}"`, c.type, c.status, `"${c.segment || ''}"`].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    link.download = `OmniPlan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSyncGoogle = () => {
    const icsContent = generateICS(filteredCampaigns, brands);
    downloadICSFile(icsContent, 'OmniPlan_GoogleSync.ics');
  };

  // --- BACKUP & RESTORE HANDLERS ---

  const handleBackup = () => {
    const dataStr = JSON.stringify({ campaigns, brands }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OmniPlan_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = async (data: { campaigns: Campaign[], brands: Brand[] }) => {
    if (firebaseError) return alert("Error de configuración Firebase.");
    
    if (!window.confirm("⚠️ ESTO SUBIRÁ DATOS ANTIGUOS A LA NUBE.\n\nSe mezclarán con los actuales. ¿Continuar?")) return;

    setLoading(true);
    try {
        // 1. Restore Brands
        for (const b of data.brands) {
            await setDoc(doc(db, "brands", b.id), b);
        }
        // 2. Restore Campaigns
        for (const c of data.campaigns) {
            await setDoc(doc(db, "campaigns", c.id), c);
        }
        alert("✅ Restauración completada en la nube.");
    } catch (e) {
        console.error("Restore error", e);
        alert("Error al restaurar.");
    } finally {
        setLoading(false);
    }
  };

  // --- RENDER ---

  if (firebaseError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 p-4 text-center">
        <h1 className="text-2xl font-bold text-red-700 mb-2">Falta Configuración</h1>
        <p className="text-red-600 mb-4 max-w-md">
          Has activado el modo "Nube" pero faltan las claves de Firebase en el archivo <code>services/firebaseConfig.ts</code> o son incorrectas.
        </p>
        <div className="bg-white p-4 rounded shadow text-left text-sm font-mono text-slate-600 overflow-x-auto max-w-lg">
           services/firebaseConfig.ts
        </div>
        <p className="mt-4 text-sm text-slate-500">Revisa el archivo services/firebaseConfig.ts</p>
      </div>
    );
  }

  if (loading) {
     return <div className="flex items-center justify-center h-screen text-indigo-600">Cargando OmniPlan Cloud...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10 shadow-sm relative">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-lg">
             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
             </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">OmniPlan Cloud ☁️</h1>
            <p className="text-xs text-green-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              En línea (Sincronizado)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* View Toggles */}
           <div className="bg-slate-100 p-1 rounded-lg flex items-center">
              <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-md ${viewMode === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>📅</button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>📝</button>
           </div>

           <div className="h-8 w-px bg-slate-300 mx-2"></div>

           {/* Notifications */}
           <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
             {urgentCampaigns.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-white"></span>}
           </button>

           {showNotifications && (
              <div className="absolute top-16 right-20 w-80 bg-white shadow-xl rounded-lg border border-slate-200 p-4 z-50">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Notificaciones</h4>
                {urgentCampaigns.map(c => (
                    <div key={c.id} className="p-2 bg-slate-50 rounded mb-1 border border-slate-100 text-xs">
                       <strong>{c.title}</strong> - {c.date}
                    </div>
                ))}
                {urgentCampaigns.length === 0 && <p className="text-xs text-slate-500">Nada urgente.</p>}
              </div>
           )}
           
           <Button variant="secondary" size="sm" onClick={handleExportCSV}>CSV</Button>
           <Button variant="secondary" size="sm" onClick={handleSyncGoogle}>G-Cal</Button>
           
           {/* New Security & Sync Buttons */}
           <Button variant="secondary" size="sm" onClick={handleBackup} className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">💾 Respaldo</Button>
           <Button variant="primary" size="sm" onClick={() => setIsShareModalOpen(true)}>Sincronizar ⇄</Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <BrandSelector 
          brands={brands}
          selectedBrandIds={selectedBrandIds}
          onToggleBrand={handleToggleBrand}
          onToggleAll={handleToggleAllBrands}
          onManageBrands={() => setIsBrandManagerOpen(true)}
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-4">
               <h2 className="text-lg font-semibold text-slate-800 capitalize">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
               <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                 <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded">◀</button>
                 <button onClick={handleToday} className="px-3 py-1 text-xs font-medium">Hoy</button>
                 <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded">▶</button>
               </div>
             </div>
             <Button onClick={() => { setEditingCampaign(null); setSelectedDate(new Date().toISOString().split('T')[0]); setIsModalOpen(true); }}>+ Nueva Campaña</Button>
          </div>

          {viewMode === 'calendar' ? (
            <div className="flex-1 overflow-y-auto">
               <CalendarGrid 
                 currentDate={currentDate}
                 days={calendarDays}
                 campaigns={filteredCampaigns}
                 brands={brands}
                 selectedBrandIds={selectedBrandIds}
                 onDayClick={handleDayClick}
                 onCampaignClick={handleCampaignClick}
               />
            </div>
          ) : (
            <CampaignList campaigns={filteredCampaigns} brands={brands} onEdit={handleCampaignClick} onDelete={handleDeleteCampaign} />
          )}
        </main>
      </div>
      
      {/* Version Footer */}
      <div className="bg-indigo-600 border-t border-indigo-700 py-2 px-4 text-center text-xs text-white font-bold z-20">
        OmniPlan v1.6 • ACTUALIZACIÓN MÓVIL 📱
      </div>

      <CampaignModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCampaign}
        onDelete={handleDeleteCampaign}
        brands={brands}
        initialDate={selectedDate}
        existingCampaign={editingCampaign}
      />

      <BrandManager 
        isOpen={isBrandManagerOpen}
        onClose={() => setIsBrandManagerOpen(false)}
        brands={brands}
        onSaveBrand={handleSaveBrand}
        onDeleteBrand={handleDeleteBrand}
      />
      
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        campaigns={campaigns}
        brands={brands}
        onImport={handleImportBackup}
      />
    </div>
  );
};

export default App;