
import { Brand } from './types';

export const DEFAULT_BRANDS: Brand[] = [
  { id: 'b1', name: 'Lumina Tech', color: 'blue', hex: '#3b82f6', industry: 'Tecnología' },
  { id: 'b2', name: 'Verde Vida', color: 'green', hex: '#22c55e', industry: 'Alimentación Saludable' },
  { id: 'b3', name: 'Solaris Moda', color: 'orange', hex: '#f97316', industry: 'Moda' },
  { id: 'b4', name: 'Aqua Pure', color: 'cyan', hex: '#06b6d4', industry: 'Bebidas' },
  { id: 'b5', name: 'Zen Spa', color: 'teal', hex: '#14b8a6', industry: 'Bienestar' },
  { id: 'b6', name: 'Rojo Motor', color: 'red', hex: '#ef4444', industry: 'Automotriz' },
  { id: 'b7', name: 'Nova Bank', color: 'indigo', hex: '#6366f1', industry: 'Finanzas' },
  { id: 'b8', name: 'Dulce Hogar', color: 'pink', hex: '#ec4899', industry: 'Decoración' },
  { id: 'b9', name: 'Urban Fit', color: 'lime', hex: '#84cc16', industry: 'Fitness' },
  { id: 'b10', name: 'Cafe Aroma', color: 'amber', hex: '#f59e0b', industry: 'Cafetería' },
  { id: 'b11', name: 'Pet Amigo', color: 'yellow', hex: '#eab308', industry: 'Mascotas' },
  { id: 'b12', name: 'Sky Travel', color: 'sky', hex: '#0ea5e9', industry: 'Turismo' },
  { id: 'b13', name: 'Violet Cosmetics', color: 'violet', hex: '#8b5cf6', industry: 'Belleza' },
  { id: 'b14', name: 'Gamer Pro', color: 'purple', hex: '#a855f7', industry: 'Gaming' },
];

export const BRAND_COLORS = [
  { name: 'blue', hex: '#3b82f6', label: 'Azul' },
  { name: 'green', hex: '#22c55e', label: 'Verde' },
  { name: 'orange', hex: '#f97316', label: 'Naranja' },
  { name: 'cyan', hex: '#06b6d4', label: 'Cian' },
  { name: 'teal', hex: '#14b8a6', label: 'Verde Azulado' },
  { name: 'red', hex: '#ef4444', label: 'Rojo' },
  { name: 'indigo', hex: '#6366f1', label: 'Indigo' },
  { name: 'pink', hex: '#ec4899', label: 'Rosa' },
  { name: 'lime', hex: '#84cc16', label: 'Lima' },
  { name: 'amber', hex: '#f59e0b', label: 'Ámbar' },
  { name: 'yellow', hex: '#eab308', label: 'Amarillo' },
  { name: 'sky', hex: '#0ea5e9', label: 'Cielo' },
  { name: 'violet', hex: '#8b5cf6', label: 'Violeta' },
  { name: 'purple', hex: '#a855f7', label: 'Púrpura' },
  { name: 'gray', hex: '#64748b', label: 'Gris' },
  { name: 'stone', hex: '#78716c', label: 'Piedra' },
];

export const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const CAMPAIGN_TYPES = {
  new_arrival: { label: 'Nuevos Ingresos', icon: '✨', description: 'Entrada de stock reciente' },
  launch: { label: 'Lanzamiento', icon: '🚀', description: 'Frecuencia Mensual' },
  promotion: { label: 'Promoción', icon: '🏷️', description: 'A demanda / Ofertas' },
  informative: { label: 'Informativo', icon: '📢', description: 'Semanal / Mensual' },
  cyber: { label: 'Cyber Event', icon: '⚡', description: 'Eventos Masivos Digitales' },
};

export const STATUS_CONFIG = {
  planned: { label: 'Programada', color: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400' },
  sent: { label: 'Enviada', color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  rescheduled: { label: 'Cambio de Fecha', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
};

export const CHANNELS = {
  none: { label: 'Sin definir', icon: '⚪' },
  email: { label: 'Email Marketing', icon: '📧' },
  sms: { label: 'SMS', icon: '📱' },
  whatsapp: { label: 'WhatsApp', icon: '💬' },
  social: { label: 'Redes Sociales', icon: '📸' },
  push: { label: 'App Push', icon: '🔔' },
};
