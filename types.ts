
export interface Brand {
  id: string;
  name: string;
  color: string; // Tailwind class for text/bg
  hex: string; // Actual hex code for borders/accents
  industry: string;
}

export type CampaignType = 'new_arrival' | 'launch' | 'promotion' | 'informative' | 'cyber';

export type CampaignStatus = 'planned' | 'sent' | 'rescheduled';

export type TouchpointChannel = 'email' | 'sms' | 'whatsapp' | 'social' | 'push' | 'none';

export interface CampaignTouchpoint {
  id: string;
  channel: TouchpointChannel;
  name: string; // e.g. "Teaser", "Reminder", "Last Call"
  time?: string; // Optional specific time for the touchpoint
  segment?: string; // Optional specific segment override
}

export interface Campaign {
  id: string;
  brandId: string;
  title: string;
  description: string;
  date: string; // ISO Date string YYYY-MM-DD
  time?: string; // HH:mm string (24h)
  status: CampaignStatus;
  type: CampaignType;
  
  // Tactical Details
  tactics: {
    callToAction: string; // "Llamado"
    isBlast: boolean;     // "Bomba"
    coupon: string;       // "Cupón"
  };

  // Audience Data (Global for the campaign)
  segment: string;

  // Multiple Sends/Touchpoints
  touchpoints: CampaignTouchpoint[];
  
  // Notification settings
  notify: boolean;
  notifyEmail?: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}
