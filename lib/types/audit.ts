// Audit and Security Types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  geoLocation?: GeoLocation;
  timestamp: string;
  hash: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface DocumentHash {
  id: string;
  documentType: string;
  documentId: string;
  hash: string;
  algorithm: "sha256" | "sha512";
  createdAt: string;
}

export interface UserSession {
  userId: string;
  userName: string;
  role: string;
  loginTime: string;
  lastActivity: string;
  ipAddress?: string;
}
