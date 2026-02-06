// Case Management Types
export interface Case {
  id: string;
  caseNumber: string;
  registrationDate: string;
  railwayZone: string;
  railwayPost: string;
  jurisdiction: string;
  sectionsOfLaw: string[];
  incidentLocation: string;
  raidStartTime: string;
  raidEndTime: string;
  officersInvolved: string[];
  status: "draft" | "active" | "forwarded" | "closed";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccusedProfile {
  id: string;
  caseId: string;
  name: string;
  fatherName: string;
  age: number;
  gender: "male" | "female" | "other";
  dateOfBirth?: string;
  phone: string;
  address: string;
  state: string;
  district: string;
  photo?: string;
  proofDocument?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArrestMemo {
  id: string;
  caseId: string;
  accusedId: string;
  arrestDate: string;
  arrestTime: string;
  arrestLocation: string;
  gdNumber: string;
  policeStation: string;
  arrestingOfficer: string;
  vehicleDetails?: string;
  courtDetails: string;
  witnesses: string[];
  injuryDetails?: string;
  officerSignature?: string;
  accusedSignature?: string;
  witnessSignatures?: string[];
  bnssCompliant: boolean;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeizureMemo {
  id: string;
  caseId: string;
  accusedId: string;
  seizureDate: string;
  seizureTime: string;
  seizureLocation: string;
  items: SeizedItem[];
  witnesses: string[];
  seizingOfficer: string;
  officerSignature?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeizedItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  remarks: string;
  photos: string[];
  barcode?: string;
  qrCode?: string;
}

export interface PersonalSearchMemo {
  id: string;
  caseId: string;
  accusedId: string;
  searchDate: string;
  searchTime: string;
  searchLocation: string;
  itemsFound: SearchedItem[];
  isNilSearch: boolean;
  witnesses: string[];
  searchingOfficer: string;
  officerSignature?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchedItem {
  id: string;
  description: string;
  quantity: number;
  remarks: string;
}

export interface MedicalInspectionMemo {
  id: string;
  caseId: string;
  accusedId: string;
  arrestReference: string;
  injuryDetails: string;
  doctorName: string;
  medicalInstitution: string;
  examinationDate: string;
  examinationTime: string;
  medicalCertificate?: string;
  doctorSignature?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BNSSArrestChecklist {
  id: string;
  caseId: string;
  accusedId: string;
  grounds: ChecklistItem[];
  officerName: string;
  officerSignature?: string;
  attestationDate: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  description: string;
  checked: boolean;
  mandatory: boolean;
}

export interface CourtForwardingReport {
  id: string;
  caseId: string;
  narrative: string;
  prosecutionSummary: string;
  attachedMemos: string[];
  forwardingOfficer: string;
  officerSignature?: string;
  forwardingDate: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccusedChallan {
  id: string;
  caseId: string;
  accusedIds: string[];
  sections: string[];
  enclosures: string[];
  escortOfficers: string[];
  qrCode: string;
  challanNumber: string;
  challanDate: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Railway zones and sections
export const RAILWAY_ZONES = [
  "Central Railway",
  "Eastern Railway",
  "Northern Railway",
  "North Eastern Railway",
  "Northeast Frontier Railway",
  "Southern Railway",
  "South Central Railway",
  "South Eastern Railway",
  "Western Railway",
  "East Coast Railway",
  "East Central Railway",
  "North Central Railway",
  "North Western Railway",
  "South East Central Railway",
  "South Western Railway",
  "West Central Railway",
  "Konkan Railway",
  "Metro Railway Kolkata",
];

export const SECTIONS_OF_LAW = [
  "Section 145(b) - Ticketless Travel",
  "Section 155(i)b - Travelling without valid ticket",
  "Section 137 - Trespass on railway property",
  "Section 147 - Drunkenness or nuisance",
  "Section 154 - Throwing of objects",
  "Section 156 - Entering upon works",
  "Section 160 - Obstruction of railway servant",
  "Other - Specify",
];

export const USER_ROLES = {
  FIELD_OFFICER: "field_officer",
  SI_SUPERVISOR: "si_supervisor",
  COURT_CELL_ADMIN: "court_cell_admin",
  SYSTEM_ADMIN: "system_admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
