/**
 * House Rental System — Core TypeScript Types & Enums
 * Based on PROJECT_BRIEF.md Data Model & Business States
 */

/* =========================================================================
   1. User & Roles
   ========================================================================= */

export type UserRole = "visitor" | "tenant" | "landlord" | "admin";

export type UserStatus = "active" | "suspended" | "pending_verification";

export type LandlordVerificationStatus =
  | "not_submitted"
  | "pending"
  | "verified"
  | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface LandlordProfile {
  id: string;
  userId: string;
  verificationStatus: LandlordVerificationStatus;
  identityCardNumber?: string;
  businessName?: string;
  address?: string;
  taxNumber?: string;
  verifiedAt?: string;
  responseRate?: number; // e.g. 98%
  responseTime?: string; // e.g. "Trong vòng 1 giờ"
}

export interface TenantProfile {
  id: string;
  userId: string;
  idCardNumber?: string;
  dateOfBirth?: string;
  occupation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

/* =========================================================================
   2. Property & Room
   ========================================================================= */

export type PropertyType =
  | "apartment"
  | "house"
  | "boarding_house"
  | "studio"
  | "villa";

export type PropertyStatus = "active" | "inactive" | "archived";

export interface Property {
  id: string;
  landlordId: string;
  name: string;
  type: PropertyType;
  address: string;
  ward: string;
  district: string;
  city: string;
  status: PropertyStatus;
  totalRooms: number;
  availableRooms: number;
  images: string[];
  amenities: string[];
  description: string;
  createdAt: string;
}

export type RoomStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "maintenance"
  | "inactive";

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  area: number; // m²
  basePrice: number; // VND / month
  deposit: number; // VND
  status: RoomStatus;
  currentTenantId?: string;
  amenities: string[];
  images: string[];
  description?: string;
}

/* =========================================================================
   3. Listings & Discovery
   ========================================================================= */

export type ListingStatus =
  | "draft"
  | "pending"
  | "active"
  | "rejected"
  | "rented"
  | "hidden";

export type ModerationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested";

export interface Listing {
  id: string;
  landlordId: string;
  propertyId: string;
  roomId?: string;
  title: string;
  slug: string;
  description: string;
  propertyType: PropertyType;
  rentPrice: number; // VND / month
  deposit: number; // VND
  area: number; // m²
  bedrooms: number;
  bathrooms: number;
  address: string;
  ward: string;
  district: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  images: string[];
  status: ListingStatus;
  moderationStatus: ModerationStatus;
  moderationNotes?: string;
  isFeatured?: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFilterParams {
  query?: string;
  city?: string;
  district?: string;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  amenities?: string[];
  sortBy?: "newest" | "price_asc" | "price_desc" | "area_desc";
}

/* =========================================================================
   4. Viewing Requests & Favorites
   ========================================================================= */

export type ViewingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed";

export interface ViewingRequest {
  id: string;
  listingId: string;
  tenantId: string;
  landlordId: string;
  preferredDate: string; // DD/MM/YYYY
  preferredTimeSlot: string; // e.g. "09:00 - 10:00"
  status: ViewingStatus;
  tenantNote?: string;
  landlordNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

/* =========================================================================
   5. Contracts & Invoices
   ========================================================================= */

export type ContractStatus =
  | "draft"
  | "pending"
  | "active"
  | "expired"
  | "terminated";

export interface Contract {
  id: string;
  contractNumber: string;
  propertyId: string;
  roomId?: string;
  landlordId: string;
  tenantId: string;
  startDate: string; // DD/MM/YYYY
  endDate: string; // DD/MM/YYYY
  monthlyRent: number;
  deposit: number;
  billingCycle: "monthly" | "quarterly" | "yearly";
  paymentDueDay: number; // e.g. 5th of each month
  status: ContractStatus;
  terms: string;
  createdAt: string;
}

export type InvoiceStatus =
  | "draft"
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export type InvoiceLineItemType =
  | "rent"
  | "electricity"
  | "water"
  | "internet"
  | "service"
  | "other";

export interface InvoiceLineItem {
  id: string;
  description: string;
  type: InvoiceLineItemType;
  amount: number;
  oldReading?: number;
  newReading?: number;
  unitPrice?: number;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string; // DD/MM/YYYY
  paymentMethod: "cash" | "bank_transfer";
  referenceCode?: string;
  note?: string;
  recordedBy: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  contractId: string;
  landlordId: string;
  tenantId: string;
  billingPeriod: string; // e.g. "11/2026"
  dueDate: string; // DD/MM/YYYY
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  paymentRecords: PaymentRecord[];
  createdAt: string;
}

/* =========================================================================
   6. Issue & Maintenance Reports
   ========================================================================= */

export type IssueStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "resolved"
  | "rejected";

export type IssueUrgency = "low" | "medium" | "high" | "critical";

export interface IssueReport {
  id: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  roomId?: string;
  title: string;
  description: string;
  category: "plumbing" | "electrical" | "appliance" | "structural" | "other";
  urgency: IssueUrgency;
  status: IssueStatus;
  images: string[];
  landlordNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

/* =========================================================================
   7. Notifications & Admin Operations
   ========================================================================= */

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "viewing" | "contract" | "invoice" | "issue" | "system";
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: "listing" | "contract" | "invoice" | "user" | "verification";
  entityId: string;
  details: string;
  timestamp: string;
}
