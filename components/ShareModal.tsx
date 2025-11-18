
import React, { useState, useEffect } from 'react';
import { Campaign, Brand } from '../types';
import { Button } from './Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  brands: Brand[];
  onImport: (data: { campaigns: Campaign[], brands: Brand[] }) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  brands,
  onImport
}) => {
  const [code, setCode] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [activeTab, setActiveTab] = useState<'share' | 'receive'>('share');

  // Generate Code on Open
  useEffect(() => {
    if (isOpen && campaigns.length > 0) {
      try {
        const data = JSON.stringify({ campaigns, brands });
        // Simple Base64 encoding of the JSON string
        const encoded = btoa(unescape(encodeURIComponent(data)));
        setCode(encoded);
      } catch (e) {
        console.error("Error creating code", e);
      }
    }
  }, [isOpen, campaigns, brands]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess('¡Código copiado al portapapeles!');
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err) {
      setCopySuccess('Error. Cópialo manualmente.');
    }
  };

  // Backup File Logic
  const handleDownloadBackup = () => {
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.campaigns && parsed.brands) {
          onImport(parsed);
          onClose();
        } else {
          alert("Archivo inválido: No tiene el formato correcto.");
        }
      } catch (err) {
        alert("Error al leer el archivo. Asegúrate que sea un JSON válido.");
      }
    };
    reader.readAsText(file);
  };

  const handleManualImport = () => {
    try {
      if (!manualCode) return;
      const jsonString = decodeURIComponent(escape(window.atob(manualCode)));
      const parsed = JSON.parse(jsonString);

      if (!parsed.campaigns || !parsed.brands) {
        throw new Error("Formato inválido");
      }

      onImport(parsed);
      onClose();
    } catch (e) {
      alert("El código es inválido o está incompleto.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
          <h3 className="text-lg font-bold text-indigo-900">Sincronizar / Compartir</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'share' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-indigo-500'}`}
          >
            📤 Enviar (Yo tengo los datos)
          </button>
          <button 
             onClick={() => setActiveTab('receive')}
             className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'receive' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-indigo-500'}`}
          >
            📥 Recibir (Mi jefe me los pasó)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          {activeTab === 'share' ? (
            <div className="space-y-6">
              {/* Option A: Code */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-700">Opción A: Copiar Código (Rápido)</h4>
                <p className="text-xs text-slate-500">Copia este código y envíalo por WhatsApp/Slack.</p>
                <div className="relative">
                  <textarea 
                    readOnly
                    value={code}
                    className="w-full h-20 p-3 bg-slate-50 border border-slate-300 rounded-lg text-[10px] font-mono text-slate-500 break-all focus:ring-0 outline-none resize-none"
                  />
                </div>
                {copySuccess && (
                  <div className="p-2 bg-green-100 text-green-700 text-xs rounded font-bold text-center">
                    {copySuccess}
                  </div>
                )}
                <Button onClick={handleCopyCode} className="w-full">
                  Copiar Código
                </Button>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-bold text-slate-700 mb-2">Opción B: Descargar Archivo (Seguro)</h4>
                <Button variant="secondary" onClick={handleDownloadBackup} className="w-full">
                  Descargar Respaldo (.json)
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
               {/* Option A: Paste Code */}
               <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-700">Opción A: Pegar Código</h4>
                  <textarea 
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Pega aquí el código largo que recibiste..."
                    className="w-full h-24 p-3 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <Button onClick={handleManualImport} className="w-full">
                    Cargar desde Código
                  </Button>
               </div>

               <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Opción B: Subir Archivo</h4>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="text-xs text-slate-500">Clic para subir archivo .json</p>
                    </div>
                    <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
                  </label>
               </div>
            </div>
          )}

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
};
