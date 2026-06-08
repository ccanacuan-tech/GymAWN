/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Gym {
  id: number;
  name: string;
  subdomain: string;
  address: string;
  phone: string;
  email: string;
  planType: 'Básico' | 'Profesional' | 'Enterprise';
  status: 'Activo' | 'Suspendido';
  createdAt: string;
}

export interface Client {
  id: number;
  gymId: number;
  name: string;
  email: string;
  phone: string;
  planId: number;
  status: 'Activo' | 'Vencido' | 'Congelado';
  membershipStart: string;
  membershipEnd: string;
  imc: number;
  weight: number; // kg
  height: number; // cm
  bloodType: string;
  qrCode: string;
  avatarUrl?: string;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  durationMonths: number;
  benefits: string[];
}

export interface ClassSession {
  id: number;
  gymId: number;
  className: string;
  trainerName: string;
  scheduleTime: string;
  roomName: string;
  maxCapacity: number;
  currentReservations: number;
}

export interface ProductInventory {
  id: number;
  gymId: number;
  name: string;
  category: 'Suplementos' | 'Ropa Deportiva' | 'Accesorios' | 'Equipos';
  stock: number;
  minStock: number;
  price: number;
  supplier: string;
}

export interface BackupFile {
  id: string;
  filename: string;
  createdAt: string;
  sizeKb: number;
  tablesCount: number;
  status: 'Completado' | 'Fallido';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  service: 'API' | 'Database' | 'Backup' | 'Auth' | 'Security';
  message: string;
}

export interface ServerMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  responseTimeMs: number;
  apiSuccessRate: number;
}
