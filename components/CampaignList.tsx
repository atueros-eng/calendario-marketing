
import React from 'react';
import { Campaign, Brand } from '../types';
import { CAMPAIGN_TYPES, STATUS_CONFIG, CHANNELS } from '../constants';
import { Button } from './Button';

interface CampaignListProps {
  campaigns: Campaign[];
  brands: Brand[];
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({ campaigns, brands, onEdit, onDelete }) => {
  // Sort by date and time
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const dateA = new Date(a.date + (a.time ? 'T' + a.time : ''));
    const dateB = new Date(b.date + (b.time ? 'T' + b.time : ''));
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Marca</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Campaña</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Segmento</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Táctica / Canales</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estatus</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedCampaigns.map((campaign) => {
              const brand = brands.find(b => b.id === campaign.brandId);
              const typeInfo = CAMPAIGN_TYPES[campaign.type || 'launch'];
              const statusInfo = STATUS_CONFIG[campaign.status || 'planned'];
              
              return (
                <tr key={campaign.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                    {campaign.date}
                    {campaign.time && (
                      <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                        {campaign.time}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brand?.hex }} />
                      <span className="text-sm font-bold text-slate-700">{brand?.name || 'Marca Desconocida'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">{campaign.title}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {campaign.segment ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {campaign.segment}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">General</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {/* Tactics Badges */}
                      <div className="flex gap-1">
                        {campaign.tactics?.isBlast && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                            💥 BOMBA
                          </span>
                        )}
                        {campaign.tactics?.coupon && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                            🎟️ {campaign.tactics.coupon}
                          </span>
                        )}
                      </div>
                      {/* Touchpoints */}
                      <div className="flex items-center gap-1 mt-1">
                        {campaign.touchpoints && campaign.touchpoints.length > 0 ? (
                          campaign.touchpoints.map((tp, i) => (
                             <div key={i} className="relative group/tp" title={`${tp.name} (${CHANNELS[tp.channel]?.label})`}>
                               <span className="text-base cursor-help">{CHANNELS[tp.channel]?.icon}</span>
                             </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(campaign)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                      <button onClick={() => onDelete(campaign.id)} className="text-red-600 hover:text-red-900">Borrar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sortedCampaigns.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  No hay campañas registradas. Crea una nueva para comenzar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
