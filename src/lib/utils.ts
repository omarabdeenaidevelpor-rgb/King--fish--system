import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type UserRole = 
  | 'GENERAL_MANAGER' 
  | 'RECEIVING_OPERATOR' 
  | 'QUALITY_MANAGER' 
  | 'PRODUCTION_SUPERVISOR' 
  | 'WAREHOUSE_OPERATOR' 
  | 'EXPORT_OPERATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string;
}

export type LotStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED' | 'SHIPPED';

export interface Lot {
  id: string;
  supplier: string;
  source: string;
  weight: number;
  temperature: number;
  receivedAt: Date;
  status: LotStatus;
  qualityPassed: boolean;
  branchId: string;
}

export interface InventoryItem {
  id: string;
  lotId: string;
  productId: string;
  quantity: number;
  location: string;
}

export interface ProcessingEvent {
  id: string;
  lotId: string;
  type: string;
  operator: string;
  timestamp: Date;
  inputWeight: number;
  outputWeight: number;
}
