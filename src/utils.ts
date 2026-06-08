/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Gym, Client, Plan, ClassSession, ProductInventory, BackupFile, LogEntry, ServerMetrics } from './types';

export const mockPlanes: Plan[] = [
  { id: 1, name: 'Plan Mensual Fuerza', price: 35.0, durationMonths: 1, benefits: ['Acceso ilimitado a sala de pesas', '1 cita con nutriólogo'] },
  { id: 2, name: 'Fuerza VIP Anual', price: 320.0, durationMonths: 12, benefits: ['Acceso total de 1 año', 'Casillero privado', 'Toallas gratis', 'Todas las clases'] },
  { id: 3, name: 'Yoga Básico Mensual', price: 45.0, durationMonths: 1, benefits: ['2 clases por semana de Hatha Yoga', 'Meditación guiada'] },
  { id: 4, name: 'Yogui Premium Ilimitado', price: 80.0, durationMonths: 1, benefits: ['Clases ilimitadas', 'Acceso a Kundalini, Ashtanga, Pilates y Taichi'] },
];

export const mockGyms: Gym[] = [
  {
    id: 1,
    name: 'Mega Power Gym',
    subdomain: 'megapower',
    address: 'Av. Fitness Centro 102',
    phone: '+34 600 111 222',
    email: 'contacto@megapower.com',
    planType: 'Profesional',
    status: 'Activo',
    createdAt: '2026-01-10',
  },
  {
    id: 2,
    name: 'Yoga & Zen Studio',
    subdomain: 'yogazen',
    address: 'Calle Silencio Interior 45',
    phone: '+34 600 333 444',
    email: 'admin@yogazen.com',
    planType: 'Básico',
    status: 'Activo',
    createdAt: '2026-03-15',
  },
];

export const mockClients: Client[] = [
  {
    id: 1,
    gymId: 1,
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '654789012',
    planId: 1,
    status: 'Activo',
    membershipStart: '2026-06-01',
    membershipEnd: '2026-07-01',
    weight: 82.5,
    height: 178,
    imc: 26.04,
    bloodType: 'O+',
    qrCode: 'CLIENT_QR_1',
  },
  {
    id: 2,
    gymId: 1,
    name: 'María Rodríguez',
    email: 'maria.rod@email.com',
    phone: '698741235',
    planId: 2,
    status: 'Activo',
    membershipStart: '2026-01-15',
    membershipEnd: '2027-01-15',
    weight: 59.0,
    height: 165,
    imc: 21.67,
    bloodType: 'A-',
    qrCode: 'CLIENT_QR_2',
  },
  {
    id: 3,
    gymId: 1,
    name: 'Lucas Martínez',
    email: 'lucas.m@email.com',
    phone: '612547896',
    planId: 1,
    status: 'Vencido',
    membershipStart: '2026-05-01',
    membershipEnd: '2026-06-01',
    weight: 91.0,
    height: 180,
    imc: 28.09,
    bloodType: 'B+',
    qrCode: 'CLIENT_QR_3',
  },
  {
    id: 4,
    gymId: 2,
    name: 'Sofía Alcaraz',
    email: 'sofia.yoga@email.com',
    phone: '674125896',
    planId: 3,
    status: 'Activo',
    membershipStart: '2026-06-01',
    membershipEnd: '2026-07-01',
    weight: 54.0,
    height: 168,
    imc: 19.13,
    bloodType: 'O-',
    qrCode: 'CLIENT_QR_4',
  },
];

export const mockClasses: ClassSession[] = [
  {
    id: 1,
    gymId: 1,
    className: 'Bootcamp de Alta Fuerza',
    trainerName: 'Marlon Brando',
    scheduleTime: 'Lunes a Viernes 19:00',
    roomName: 'Zona de Crossfit',
    maxCapacity: 15,
    currentReservations: 8,
  },
  {
    id: 2,
    gymId: 1,
    className: 'Spinning Pro',
    trainerName: 'Laura Ortiz',
    scheduleTime: 'Martes y Jueves 08:30',
    roomName: 'Sala de Spinning 2',
    maxCapacity: 25,
    currentReservations: 20,
  },
  {
    id: 3,
    gymId: 2,
    className: 'Meditación de Luna Llena',
    trainerName: 'Swami Ananda',
    scheduleTime: 'Miércoles 20:00',
    roomName: 'Salón del Viento',
    maxCapacity: 30,
    currentReservations: 28,
  },
];

export const mockProducts: ProductInventory[] = [
  {
    id: 1,
    gymId: 1,
    name: 'Proteína de Suero 1kg de Vainilla',
    category: 'Suplementos',
    stock: 12,
    minStock: 5,
    price: 49.9,
    supplier: 'NutriNutrition Corp',
  },
  {
    id: 2,
    gymId: 1,
    name: 'Creatina Monohidrato Puro 300g',
    category: 'Suplementos',
    stock: 3,
    minStock: 5,
    price: 25.0,
    supplier: 'NutriNutrition Corp',
  },
  {
    id: 3,
    gymId: 1,
    name: 'Toalla de Microfibra Gym',
    category: 'Ropa Deportiva',
    stock: 30,
    minStock: 10,
    price: 8.5,
    supplier: 'Textiles Deportivos S.A.',
  },
  {
    id: 4,
    gymId: 2,
    name: 'Mat de Yoga Ecológico 1.5m',
    category: 'Accesorios',
    stock: 8,
    minStock: 4,
    price: 32.0,
    supplier: 'BudaEstilos S.L.',
  },
];

export const initialBackups: BackupFile[] = [
  {
    id: 'back-0',
    filename: 'respaldo_20260607_143022.zip',
    createdAt: '2026-06-07 14:30:22',
    sizeKb: 124.5,
    tablesCount: 8,
    status: 'Completado',
  },
  {
    id: 'back-1',
    filename: 'respaldo_20260606_143001.zip',
    createdAt: '2026-06-06 14:30:01',
    sizeKb: 123.8,
    tablesCount: 8,
    status: 'Completado',
  },
];

export const initialLogs: LogEntry[] = [
  { id: 'log-0', timestamp: '2026-06-08 00:01:10', level: 'info', service: 'Security', message: 'Variables de sesión forzadas a SameSite=Strict.' },
  { id: 'log-1', timestamp: '2026-06-08 00:01:12', level: 'success', service: 'Database', message: 'Conexión exitosa a mysql://gym_user@localhost:3306/gym_saas_db.' },
  { id: 'log-2', timestamp: '2026-06-08 00:03:45', level: 'info', service: 'API', message: 'Petición GET /api.php/clientes procesada para Gym ID: 1.' },
  { id: 'log-3', timestamp: '2026-06-08 00:10:00', level: 'success', service: 'Backup', message: 'Respaldo automático programado completado sin advertencias.' },
];

export function generateMetrics(): ServerMetrics {
  return {
    cpuUsage: Math.floor(Math.random() * 15) + 5, // 5% - 20%
    memoryUsage: parseFloat((14.5 + Math.random() * 2).toFixed(2)), // 14.5mb - 16.5mb
    diskUsage: 12.3, // GB left
    activeConnections: Math.floor(Math.random() * 5) + 3,
    responseTimeMs: Math.floor(Math.random() * 8) + 12, // 12ms - 20ms
    apiSuccessRate: 100.0,
  };
}

export function formatTime(date: Date = new Date()): string {
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
