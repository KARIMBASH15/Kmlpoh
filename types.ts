
export enum TransactionType {
  IN = 'IN', // سند استلام (من مورد)
  OUT = 'OUT' // سند صرف (لعميل)
}

export enum EntityType {
  SUPPLIER = 'SUPPLIER',
  CUSTOMER = 'CUSTOMER'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  ISSUER = 'ISSUER'
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  phone: string;
  email?: string;
}

export interface Material {
  id: string;
  name: string;
  sku: string;
  unit: string;
  category: string;
  minQuantity: number;
}

export interface DocumentItem {
  materialId: string;
  quantity: number;
}

export interface Document {
  id: string;
  type: TransactionType;
  entityId: string;
  date: string;
  referenceNo: string;
  notes: string;
  items: DocumentItem[];
}

export interface Transaction {
  id: string;
  materialId: string;
  quantity: number;
  type: TransactionType;
  date: string;
}

export interface MaterialReport extends Material {
  currentStock: number;
  totalIn: number;
  totalOut: number;
  lastMovement: string | null;
}
