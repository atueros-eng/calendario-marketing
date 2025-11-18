
import React from 'react';
import { Brand, Campaign, CalendarDay } from '../types';
import { DAYS_OF_WEEK, CAMPAIGN_TYPES, STATUS_CONFIG, CHANNELS } from '../constants';

interface CalendarGridProps {
  currentDate: Date;
  days: CalendarDay[];
  campaigns: Campaign[];
  brands: Brand[];
  selectedBrandIds: string[];
  onDayClick: (dateStr: string) => void;
  onCampaignClick: (campaign: Campaign) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  campaigns,
  brands,
  selectedBrandIds,
  onDayClick,
  onCampaignClick,
}) => {
  
  const getCampaignsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return campaigns.filter(c => c.date === dateStr && selectedBrandIds.includes(c.brandId));
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-white">
      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Cells */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6">
        {days.map((day, index) => {
          const dayCampaigns = getCampaignsForDate(day.date);
          const dateStr = day.date.toISOString().split('T')[0];

          return (
            <div
              key={index}
              onClick={(e) => {
                // Only trigger day click if not clicking a campaign
                if (e.target === e.currentTarget) {
                  onDayClick(dateStr);
                }
              }}
              className={`
                min-h-[100px] p-2 border-b border-r border-slate-100 relative transition-colors hover:bg-slate-50 cursor-pointer
                ${!day.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white'}
                ${day.isToday ? 'bg-indigo-50/30' : ''}
              `}
            >
              {/* Date Number */}
              <div className="flex justify-between items-start">
                <span className={`
                  text-sm font-medium rounded-full w-7 h-7 flex items-center justify-center
                  ${day.isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'}
                `}>
                  {day.date.getDate()}
                </span>
                
                <button 
                  onClick={() => onDayClick(dateStr)}
                  className="opacity-0 group-hover:opacity-100 hover:bg-slate-200 rounded p-1 transition-all text-slate-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Campaigns List */}
              <div className="mt-2 space-y-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                {dayCampaigns.map(campaign => {
                  const brand = brands.find(b => b.id === campaign.brandId);
                  if (!brand) return null;
                  
                  const typeInfo = CAMPAIGN_TYPES[campaign.type || 'launch'];
                  const statusInfo = STATUS_CONFIG[campaign.status || 'planned'];
                  const isBlast = campaign.tactics?.isBlast;
                  const hasCoupon = !!campaign.tactics?.coupon;
                  
                  // Get unique channels from touchpoints
                  const touchpoints = campaign.touchpoints || [];
                  
                  return (
                    <div
                      key={campaign.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCampaignClick(campaign);
                      }}
                      className={`
                        group flex flex-col px-1.5 py-1 rounded text-xs cursor-pointer 
                        hover:brightness-95 transition-all shadow-sm border-l-[3px] bg-white overflow-hidden relative
                        ${campaign.status === 'sent' ? 'opacity-75' : ''}
                        ${isBlast ? 'ring-1 ring-red-200' : ''}
                      `}
                      style={{ borderLeftColor: brand.hex }}
                      title={`${brand.name} - ${typeInfo.label} (${statusInfo.label})`}
                    >
                       {/* Header Line: Time, Status, Type, Title */}
                       <div className="flex items-center gap-1.5 mb-0.5">
                         <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusInfo.dot}`} />
                         {campaign.time && <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 rounded">{campaign.time}</span>}
                         <span role="img" aria-label={typeInfo.label}>{typeInfo.icon}</span>
                         <span className={`truncate font-medium text-slate-700 flex-1 ${campaign.status === 'sent' ? 'line-through text-slate-400' : ''}`}>
                            {campaign.title}
                         </span>
                       </div>

                       {/* Bottom Line: Tactics & Channels */}
                       {(isBlast || hasCoupon || touchpoints.length > 0) && (
                         <div className="flex items-center gap-1 pl-3 opacity-80">
                            {isBlast && <span title="Bomba" className="text-[10px]">💥</span>}
                            {hasCoupon && <span title="Cupón" className="text-[10px]">🎟️</span>}
                            
                            {/* Touchpoint Icons (max 3) */}
                            {touchpoints.slice(0, 3).map((tp, i) => (
                              <span key={i} className="text-[10px]" title={`${tp.name} (${CHANNELS[tp.channel]?.label})`}>
                                {CHANNELS[tp.channel]?.icon}
                              </span>
                            ))}
                            {touchpoints.length > 3 && <span className="text-[9px] text-slate-400">+{touchpoints.length - 3}</span>}
                         </div>
                       )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
