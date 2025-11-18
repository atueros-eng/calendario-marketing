
import { Campaign, Brand } from '../types';
import { CHANNELS, CAMPAIGN_TYPES } from '../constants';

export const generateICS = (campaigns: Campaign[], brands: Brand[]) => {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OmniPlan//Marketing Calendar//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  campaigns.forEach(campaign => {
    const brand = brands.find(b => b.id === campaign.brandId);
    const brandName = brand ? brand.name : 'Marca';
    const typeLabel = CAMPAIGN_TYPES[campaign.type]?.label || 'Campaña';
    
    let startDate, endDate;

    if (campaign.time) {
      // If time is set, create a 1-hour event at that specific time
      // Format: YYYYMMDDTHHMMSS
      const timeStr = campaign.time.replace(/:/g, '') + '00';
      const dateStr = campaign.date.replace(/-/g, '');
      startDate = `${dateStr}T${timeStr}`;
      
      // End date = Start date + 1 hour
      const startObj = new Date(`${campaign.date}T${campaign.time}:00`);
      startObj.setHours(startObj.getHours() + 1);
      
      // Format end date
      const endYear = startObj.getFullYear();
      const endMonth = String(startObj.getMonth() + 1).padStart(2, '0');
      const endDay = String(startObj.getDate()).padStart(2, '0');
      const endHour = String(startObj.getHours()).padStart(2, '0');
      const endMin = String(startObj.getMinutes()).padStart(2, '0');
      const endSec = String(startObj.getSeconds()).padStart(2, '0');
      
      endDate = `${endYear}${endMonth}${endDay}T${endHour}${endMin}${endSec}`;
    } else {
      // If no time, all day event
      startDate = campaign.date.replace(/-/g, '');
      // Events are all day, so end date is next day
      const endDateObj = new Date(campaign.date);
      endDateObj.setDate(endDateObj.getDate() + 1);
      endDate = endDateObj.toISOString().split('T')[0].replace(/-/g, '');
    }

    // Description Builder
    let description = `Marca: ${brandName}\\nTipo: ${typeLabel}\\n`;
    if (campaign.description) description += `Detalle: ${campaign.description}\\n`;
    if (campaign.tactics.callToAction) description += `CTA: ${campaign.tactics.callToAction}\\n`;
    if (campaign.tactics.coupon) description += `Cupón: ${campaign.tactics.coupon}\\n`;
    if (campaign.tactics.isBlast) description += `💥 ES BOMBA 💥\\n`;
    
    if (campaign.touchpoints && campaign.touchpoints.length > 0) {
      description += `\\nCanales/Toques:\\n`;
      campaign.touchpoints.forEach(tp => {
        const channel = CHANNELS[tp.channel]?.label || tp.channel;
        description += `- [${channel}] ${tp.name}\\n`;
      });
    }

    const event = [
      'BEGIN:VEVENT',
      `UID:${campaign.id}@omniplan.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      // Use generic VALUE=DATE for all-day, or standard DTSTART for timed
      campaign.time ? `DTSTART:${startDate}` : `DTSTART;VALUE=DATE:${startDate}`,
      campaign.time ? `DTEND:${endDate}` : `DTEND;VALUE=DATE:${endDate}`,
      `SUMMARY:[${brandName}] ${campaign.title} ${campaign.tactics.isBlast ? '💥' : ''}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT', // Show as "Free" (Available) so it doesn't block agenda, or OPAQUE for "Busy"
      'END:VEVENT'
    ];

    icsContent = [...icsContent, ...event];
  });

  icsContent.push('END:VCALENDAR');

  return icsContent.join('\r\n');
};

export const downloadICSFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
