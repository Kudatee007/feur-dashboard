export type VerificationStatus =
  | "pending_review"
  | "under_review"
  | "needs_info"
  | "approved"
  | "rejected";

export type UpdateStatusPayload = {
  status: "approved" | "rejected" | "needs_info" | "under_review";
};

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── Driver Documents ─────────────────────────────────────────────────────────

export interface DriverDocumentItem {
  isSubmitted: boolean;
  url: string;
  type?: string;
}

export interface DriverDocuments {
  validId: DriverDocumentItem;
  profilePhoto: DriverDocumentItem;
  driversLicense: DriverDocumentItem;
  driversInsurance: DriverDocumentItem;
  lassraCard: DriverDocumentItem;
  lasdriCard: DriverDocumentItem;
}

export interface DriverPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  dateOfBirth: string;
  homeAddress: string;
  submittedDate: string;
}

export interface DriverQueueItem {
  driverId: string;
  verificationId: string;
  status: VerificationStatus;
  personalInfo: DriverPersonalInfo;
  documents: DriverDocuments;
}

export interface DriverQueueKpis {
  pendingReview: number;
  underReview: number;
  needsInfo: number;
}

export interface DriverQueueData {
  kpis: DriverQueueKpis;
  queue: DriverQueueItem[];
  pagination: Pagination;
}

// ─── Passenger Documents ─────────────────────────────────────────────────────

export interface PassengerPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  dateOfBirth?: string;
  homeAddress?: string;
  submittedDate: string;
}

export interface PassengerVehicle {
  make: string;
  model: string;
  year: string;
  plateNumber: string;
}

export interface PassengerDocumentsSubmitted {
  validId: boolean;
  profilePhoto: boolean;
  dashboardSteering: boolean;
  frontSeatsInterior: boolean;
  backSeatsInterior: boolean;
  frontViewExterior: boolean;
  backViewExterior: boolean;
  leftSideView: boolean;
  rightSideView: boolean;
  vehicleProofOfOwnership: boolean;
  visReport: boolean;
  thirdPartyInsurance: boolean;
  roadWorthinessCertificate: boolean;
}

export interface PassengerQueueItem {
  passengerId: string;
  verificationId: string;
  status: VerificationStatus;
  personalInfo: PassengerPersonalInfo;
  vehicle: PassengerVehicle;
  documentsSubmitted: PassengerDocumentsSubmitted;
}

export interface PassengerQueueKpis {
  pendingReview: number;
  underReview: number;
  needsInfo: number;
}

export interface PassengerQueueData {
  kpis: PassengerQueueKpis;
  queue: PassengerQueueItem[];
  pagination: Pagination;
}

// ─── Detail types ─────────────────────────────────────────────────────────────

export interface PassengerDocumentDetail {
  isSubmitted: boolean;
  url: string | null;
  type?: string;
}

export interface PassengerDetailData {
  passengerId: string;
  verificationId: string;
  status: VerificationStatus;
  personalInfo: PassengerPersonalInfo;
  vehicle: PassengerVehicle;
  documents: {
    identity: {
      validId: PassengerDocumentDetail;
      profilePhoto: PassengerDocumentDetail;
    };
    interiorPhotos: {
      dashboardSteering: PassengerDocumentDetail;
      frontSeats: PassengerDocumentDetail;
      backSeats: PassengerDocumentDetail;
    };
    exteriorPhotos: {
      frontView: PassengerDocumentDetail;
      backView: PassengerDocumentDetail;
      leftSideView: PassengerDocumentDetail;
      rightSideView: PassengerDocumentDetail;
    };
    vehiclePaperwork: {
      proofOfOwnership: PassengerDocumentDetail;
      visReport: PassengerDocumentDetail;
      thirdPartyInsurance: PassengerDocumentDetail;
      roadWorthinessCertificate: PassengerDocumentDetail;
    };
  };
}