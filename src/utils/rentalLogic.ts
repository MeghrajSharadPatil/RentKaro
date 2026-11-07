export type UserRole =
  | 'STUDENT'
  | 'COLLEGE_ADMIN'
  | 'PUBLIC_USER'
  | 'BUSINESS_OWNER'
  | 'SUPER_ADMIN';

export type MarketplaceMode =
  | 'COLLEGE_MODE'
  | 'CITY_MODE'
  | 'MULTI_CITY_MODE';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type VerificationMethod =
  | 'COLLEGE_EMAIL'
  | 'ID_CARD_UPLOAD'
  | 'ADMIN_MANUAL';

export type ProductCondition = 'Like New' | 'Good' | 'Fair';

export type RentalCategory =
  | 'Laptops and Electronics'
  | 'Engineering Lab Equipment'
  | 'Scientific Calculators'
  | 'Books and Study Material'
  | 'Cameras and Photography'
  | 'Sports Equipment'
  | 'Projectors and Speakers'
  | 'Event Equipment'
  | 'Musical Instruments'
  | 'Travel Accessories'
  | 'Furniture and Other Items';

export const RENTAL_CATEGORIES: {
  name: RentalCategory;
  shortLabel: string;
  description: string;
  avgDailyPrice: number;
  iconName: string;
}[] = [
  {
    name: 'Laptops and Electronics',
    shortLabel: 'Laptops & Tech',
    description: 'MacBooks, iPads, drawing tablets, monitors & chargers',
    avgDailyPrice: 350,
    iconName: 'Laptop',
  },
  {
    name: 'Engineering Lab Equipment',
    shortLabel: 'Lab Equipment',
    description: 'Arduino kits, Raspberry Pi, oscilloscopes, multimeters & drafters',
    avgDailyPrice: 120,
    iconName: 'Cpu',
  },
  {
    name: 'Scientific Calculators',
    shortLabel: 'Calculators',
    description: 'Casio FX-991EX, FX-991CW, TI-84 graphing calculators for exams',
    avgDailyPrice: 45,
    iconName: 'Calculator',
  },
  {
    name: 'Books and Study Material',
    shortLabel: 'Books & Notes',
    description: 'Semester textbooks, GATE/CAT prep books & handwritten toppers notes',
    avgDailyPrice: 30,
    iconName: 'BookOpen',
  },
  {
    name: 'Cameras and Photography',
    shortLabel: 'Cameras & Gear',
    description: 'Sony Alpha, Canon DSLRs, GoPro, gimbals & ring lights for fests',
    avgDailyPrice: 450,
    iconName: 'Camera',
  },
  {
    name: 'Sports Equipment',
    shortLabel: 'Sports Gear',
    description: 'Badminton rackets, cricket kits, footballs, cycles & skates',
    avgDailyPrice: 80,
    iconName: 'Trophy',
  },
  {
    name: 'Projectors and Speakers',
    shortLabel: 'Audio & Projectors',
    description: 'JBL party speakers, HD projectors & wireless mics for hostel nights',
    avgDailyPrice: 280,
    iconName: 'Speaker',
  },
  {
    name: 'Event Equipment',
    shortLabel: 'Fest & Events',
    description: 'Walkie-talkies, stage lighting, extension boards & ethnic wear',
    avgDailyPrice: 200,
    iconName: 'Sparkles',
  },
  {
    name: 'Musical Instruments',
    shortLabel: 'Instruments',
    description: 'Acoustic guitars, Yamaha keyboards, ukuleles & cajons',
    avgDailyPrice: 150,
    iconName: 'Music',
  },
  {
    name: 'Travel Accessories',
    shortLabel: 'Trek & Travel',
    description: 'Quechua 60L rucksacks, camping tents, sleeping bags & trekking poles',
    avgDailyPrice: 140,
    iconName: 'Compass',
  },
  {
    name: 'Furniture and Other Items',
    shortLabel: 'Hostel & Furniture',
    description: 'Study tables, ergonomic chairs, kettles, induction cooktops & coolers',
    avgDailyPrice: 90,
    iconName: 'Armchair',
  },
];

export interface College {
  id: string;
  name: string;
  shortName: string;
  cityId: string;
  cityName: string;
  state: string;
  emailDomain?: string;
  supportsInstitutionalEmail: boolean;
  campusLandmarks: string[];
  verifiedStudentsCount: number;
  activeListingsCount: number;
}

export interface UserRentalHistoryEntry {
  id: string;
  bookingId: string;
  bookingReference: string;
  userId: string;
  userName: string;
  userEmail: string;
  collegeId: string;
  collegeName: string;
  productId: string;
  productTitle: string;
  productCategory: RentalCategory;
  startDate: string;
  endDate: string;
  rentalAmount: number;
  fineIncurred: number;
  finePaid: boolean;
  status: string;
  recordedAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  mobile: string;
  role: UserRole;
  collegeId: string;
  cityId: string;
  collegeRollNumber: string;
  department: string;
  academicYear: string;
  avatarUrl: string;
  verificationStatus: VerificationStatus;
  verificationMethod: VerificationMethod;
  emailVerified: boolean;
  idCardVerified: boolean;
  adminApproved: boolean;
  idCardDocumentName?: string;
  authorizedCollegeIds: string[];
  completedRentals: number;
  onTimeReturns: number;
  averageRating: number;
  reviewCount: number;
  walletEarnings: number;
  wishlistProductIds: string[];
  businessName?: string;
  registeredAt?: string;
}

export interface ProductListing {
  id: string;
  title: string;
  description: string;
  category: RentalCategory;
  photos: string[]; // Supports uploaded Data URLs (data:image/...) or studio vector keys
  brand: string;
  condition: ProductCondition;
  dailyPrice: number;
  securityDeposit: number;
  marketRetailValue: number;
  collegeId: string;
  collegeName: string;
  cityId: string;
  cityName: string;
  pickupLocation: string;
  availableFrom: string;
  availableTo: string;
  ownerId: string;
  ownerName: string;
  ownerRole: UserRole;
  ownerDepartment: string;
  ownerYear: string;
  ownerTrustScore: number;
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  isAvailable: boolean;
  isSeniorToJunior: boolean;
  seniorSalePrice?: number;
  recommendedForSemesters?: string;
  allowGroupRental: boolean;
  maxGroupMembers: number;
  deliveryOptions: ('CAMPUS_PICKUP' | 'NEIGHBORHOOD_PICKUP' | 'CITY_DELIVERY')[];
  rating: number;
  reviewCount: number;
  viewsCount: number;
  createdAt: string;
}

export type BookingStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'PAID_READY_FOR_PICKUP'
  | 'PICKED_UP_ACTIVE'
  | 'COMPLETED_RETURNED'
  | 'REJECTED'
  | 'CANCELLED';

export interface RentalBooking {
  id: string;
  bookingReference: string;
  productId: string;
  productTitle: string;
  productCategory: RentalCategory;
  productPhoto?: string;
  collegeId: string;
  cityId: string;
  renterId: string;
  renterName: string;
  renterEmail?: string;
  ownerId: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyPrice: number;
  rentalSubtotal: number;
  discountAmount: number;
  protectionFee: number;
  securityDeposit: number;
  totalPayable: number;
  groupSize: number;
  perPersonShare: number;
  groupMemberNames: string[];
  pickupLocation: string;
  status: BookingStatus;
  paymentStatus: 'UNPAID' | 'PAID_TEST_RAZORPAY' | 'REFUNDED';
  razorpayOrderId?: string;
  handoverPin: string;
  pickupQrCode: string;
  returnQrCode: string;
  pickupConfirmedAt?: string;
  returnConfirmedAt?: string;
  returnDeadlineAt: string; // ISO timestamp for countdown timer
  fineRatePerHour: number;  // e.g., ₹50/hr late return fine
  fineAmountPaid: number;
  finePaidStatus: 'NONE' | 'UNPAID_FINE' | 'FINE_PAID';
  createdAt: string;
}

export interface CampusComplaint {
  id: string;
  collegeId: string;
  reporterId: string;
  reporterName: string;
  targetListingId?: string;
  targetTitle: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
}

export interface RentalQuote {
  totalDays: number;
  rentalSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  discountedRental: number;
  protectionFee: number;
  securityDeposit: number;
  totalPayable: number;
  groupSize: number;
  perPersonRentalShare: number;
  perPersonTotalWithDeposit: number;
}

export interface ReturnTimerAndFineStatus {
  isOverdue: boolean;
  remainingMs: number;
  overdueMs: number;
  overdueHours: number;
  calculatedFine: number;
  outstandingFine: number;
  canReturnWithoutFinePayment: boolean;
  formattedTimer: string;
}

export function calculateReturnTimerAndFine(
  booking: Pick<
    RentalBooking,
    | 'status'
    | 'returnDeadlineAt'
    | 'fineRatePerHour'
    | 'fineAmountPaid'
    | 'finePaidStatus'
    | 'dailyPrice'
  >,
  nowMs: number = Date.now()
): ReturnTimerAndFineStatus {
  if (booking.status === 'COMPLETED_RETURNED' || booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
    return {
      isOverdue: false,
      remainingMs: 0,
      overdueMs: 0,
      overdueHours: 0,
      calculatedFine: booking.fineAmountPaid || 0,
      outstandingFine: 0,
      canReturnWithoutFinePayment: true,
      formattedTimer: 'Returned',
    };
  }

  const deadlineMs = new Date(booking.returnDeadlineAt).getTime();
  if (Number.isNaN(deadlineMs)) {
    return {
      isOverdue: false,
      remainingMs: 86400000,
      overdueMs: 0,
      overdueHours: 0,
      calculatedFine: 0,
      outstandingFine: 0,
      canReturnWithoutFinePayment: true,
      formattedTimer: '24h 00m 00s',
    };
  }

  const diffMs = deadlineMs - nowMs;
  const hourlyRate = Math.max(25, booking.fineRatePerHour || Math.round(booking.dailyPrice * 0.25) || 50);

  if (diffMs >= 0) {
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    const formattedTimer =
      days > 0
        ? `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
        : `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

    return {
      isOverdue: false,
      remainingMs: diffMs,
      overdueMs: 0,
      overdueHours: 0,
      calculatedFine: 0,
      outstandingFine: 0,
      canReturnWithoutFinePayment: true,
      formattedTimer,
    };
  }

  // Overdue state!
  const overdueMs = Math.abs(diffMs);
  const overdueHours = Math.max(1, Math.ceil(overdueMs / (1000 * 60 * 60)));
  const baseLatePenalty = 100; // Minimum ₹100 base late fee once timer expires
  const calculatedFine = baseLatePenalty + overdueHours * hourlyRate;
  const alreadyPaid = booking.finePaidStatus === 'FINE_PAID' ? calculatedFine : booking.fineAmountPaid || 0;
  const outstandingFine = Math.max(0, calculatedFine - alreadyPaid);

  const totalOverdueSec = Math.floor(overdueMs / 1000);
  const oHours = Math.floor(totalOverdueSec / 3600);
  const oMins = Math.floor((totalOverdueSec % 3600) / 60);
  const oSecs = totalOverdueSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return {
    isOverdue: true,
    remainingMs: 0,
    overdueMs,
    overdueHours,
    calculatedFine,
    outstandingFine,
    canReturnWithoutFinePayment: outstandingFine === 0,
    formattedTimer: `OVERDUE by ${pad(oHours)}h ${pad(oMins)}m ${pad(oSecs)}s`,
  };
}

export function calculateRentalDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid rental date format');
  }
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) {
    throw new Error('End date cannot be earlier than start date');
  }
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

export function calculateRentalQuote(
  dailyPrice: number,
  securityDeposit: number,
  startDate: string,
  endDate: string,
  groupSize = 1
): RentalQuote {
  if (dailyPrice <= 0) {
    throw new Error('Daily price must be greater than zero');
  }
  if (securityDeposit < 0) {
    throw new Error('Security deposit cannot be negative');
  }
  const normalizedGroup = Math.max(1, Math.min(6, Math.floor(groupSize)));
  const totalDays = calculateRentalDays(startDate, endDate);
  const rentalSubtotal = dailyPrice * totalDays;

  let discountPercent = 0;
  if (totalDays >= 7) {
    discountPercent = 18;
  } else if (totalDays >= 4) {
    discountPercent = 10;
  }

  const discountAmount = Math.round((rentalSubtotal * discountPercent) / 100);
  const discountedRental = rentalSubtotal - discountAmount;
  const protectionFee = Math.min(250, Math.max(15, Math.round(discountedRental * 0.05)));
  const totalPayable = discountedRental + protectionFee + securityDeposit;

  const perPersonRentalShare = Math.ceil((discountedRental + protectionFee) / normalizedGroup);
  const perPersonTotalWithDeposit = Math.ceil(totalPayable / normalizedGroup);

  return {
    totalDays,
    rentalSubtotal,
    discountPercent,
    discountAmount,
    discountedRental,
    protectionFee,
    securityDeposit,
    totalPayable,
    groupSize: normalizedGroup,
    perPersonRentalShare,
    perPersonTotalWithDeposit,
  };
}

export function hasDateOverlap(
  existingBookings: Pick<RentalBooking, 'startDate' | 'endDate' | 'status'>[],
  requestedStart: string,
  requestedEnd: string
): boolean {
  const reqStart = new Date(`${requestedStart}T00:00:00Z`).getTime();
  const reqEnd = new Date(`${requestedEnd}T00:00:00Z`).getTime();
  if (Number.isNaN(reqStart) || Number.isNaN(reqEnd) || reqEnd < reqStart) {
    return true;
  }

  const blockingStatuses: BookingStatus[] = [
    'REQUESTED',
    'ACCEPTED',
    'PAID_READY_FOR_PICKUP',
    'PICKED_UP_ACTIVE',
  ];

  return existingBookings.some((b) => {
    if (!blockingStatuses.includes(b.status)) {
      return false;
    }
    const bStart = new Date(`${b.startDate}T00:00:00Z`).getTime();
    const bEnd = new Date(`${b.endDate}T00:00:00Z`).getTime();
    return reqStart <= bEnd && reqEnd >= bStart;
  });
}

export interface SmartPriceSuggestion {
  minDaily: number;
  recommendedDaily: number;
  maxDaily: number;
  recommendedDeposit: number;
  rationale: string;
}

export function suggestSmartRentalPrice(
  category: RentalCategory,
  condition: ProductCondition,
  marketRetailValue: number
): SmartPriceSuggestion {
  const safeRetail = Math.max(300, marketRetailValue || 2500);

  const categoryRateMap: Record<RentalCategory, { dailyRatio: number; depositRatio: number }> = {
    'Laptops and Electronics': { dailyRatio: 0.012, depositRatio: 0.12 },
    'Engineering Lab Equipment': { dailyRatio: 0.025, depositRatio: 0.20 },
    'Scientific Calculators': { dailyRatio: 0.032, depositRatio: 0.25 },
    'Books and Study Material': { dailyRatio: 0.028, depositRatio: 0.22 },
    'Cameras and Photography': { dailyRatio: 0.015, depositRatio: 0.15 },
    'Sports Equipment': { dailyRatio: 0.026, depositRatio: 0.20 },
    'Projectors and Speakers': { dailyRatio: 0.022, depositRatio: 0.18 },
    'Event Equipment': { dailyRatio: 0.025, depositRatio: 0.18 },
    'Musical Instruments': { dailyRatio: 0.020, depositRatio: 0.18 },
    'Travel Accessories': { dailyRatio: 0.024, depositRatio: 0.20 },
    'Furniture and Other Items': { dailyRatio: 0.018, depositRatio: 0.16 },
  };

  const conditionMultiplier: Record<ProductCondition, number> = {
    'Like New': 1.15,
    Good: 1.0,
    Fair: 0.82,
  };

  const { dailyRatio, depositRatio } = categoryRateMap[category] || {
    dailyRatio: 0.02,
    depositRatio: 0.18,
  };
  const condMult = conditionMultiplier[condition] || 1.0;

  const rawDaily = safeRetail * dailyRatio * condMult;
  const recommendedDaily = Math.max(25, Math.round(rawDaily / 5) * 5);
  const minDaily = Math.max(20, Math.round((recommendedDaily * 0.8) / 5) * 5);
  const maxDaily = Math.max(30, Math.round((recommendedDaily * 1.25) / 5) * 5);
  const recommendedDeposit = Math.max(100, Math.round((safeRetail * depositRatio * condMult) / 50) * 50);

  return {
    minDaily,
    recommendedDaily,
    maxDaily,
    recommendedDeposit,
    rationale: `Based on ${category} campus demand, ${condition.toLowerCase()} condition, and ₹${safeRetail.toLocaleString('en-IN')} reference value.`,
  };
}

export interface TrustScoreBreakdown {
  score: number;
  badgeLabel: 'Campus Verified Leader' | 'Trusted Campus Member' | 'Verified Student' | 'Verification Pending';
  identityPoints: number;
  rentalHistoryPoints: number;
  reviewPoints: number;
}

export function calculateStudentTrustScore(
  user: Pick<
    UserProfile,
    | 'emailVerified'
    | 'idCardVerified'
    | 'adminApproved'
    | 'completedRentals'
    | 'onTimeReturns'
    | 'averageRating'
    | 'reviewCount'
  >
): TrustScoreBreakdown {
  let identityPoints = 0;
  if (user.emailVerified) identityPoints += 15;
  if (user.idCardVerified) identityPoints += 18;
  if (user.adminApproved) identityPoints += 12;
  identityPoints = Math.min(45, identityPoints);

  const rentalCountPoints = Math.min(20, user.completedRentals * 3);
  const reliabilityRatio =
    user.completedRentals > 0
      ? Math.min(1, user.onTimeReturns / user.completedRentals)
      : 1;
  const rentalHistoryPoints = Math.round(rentalCountPoints + reliabilityRatio * 10);

  const ratingPoints =
    user.reviewCount > 0 ? Math.round(((user.averageRating - 3) / 2) * 18) : 8;
  const volumeBonus = Math.min(7, user.reviewCount);
  const reviewPoints = Math.max(0, Math.min(25, ratingPoints + volumeBonus));

  const score = Math.max(15, Math.min(100, identityPoints + rentalHistoryPoints + reviewPoints));

  let badgeLabel: TrustScoreBreakdown['badgeLabel'] = 'Verification Pending';
  if (score >= 88 && (user.idCardVerified || user.adminApproved)) {
    badgeLabel = 'Campus Verified Leader';
  } else if (score >= 70 && (user.idCardVerified || user.emailVerified)) {
    badgeLabel = 'Trusted Campus Member';
  } else if (user.emailVerified || user.idCardVerified || user.adminApproved) {
    badgeLabel = 'Verified Student';
  }

  return {
    score,
    badgeLabel,
    identityPoints,
    rentalHistoryPoints,
    reviewPoints,
  };
}

export interface DiscoveryFilterOptions {
  selectedCollegeId: string;
  selectedCityId?: string;
  scope: 'same_college' | 'nearby_colleges' | 'city_wide' | 'all_locations';
  category: RentalCategory | 'ALL';
  condition: ProductCondition | 'ALL';
  maxPrice: number;
  onlyAvailable: boolean;
  seniorToJuniorOnly: boolean;
  groupRentalOnly: boolean;
  searchQuery: string;
  sortBy: 'recommended' | 'price_asc' | 'highest_rated' | 'recently_added';
}

export function filterDiscoverableListings(
  listings: ProductListing[],
  filters: DiscoveryFilterOptions,
  marketplaceMode: MarketplaceMode,
  colleges: College[]
): ProductListing[] {
  const selectedCollege = colleges.find((c) => c.id === filters.selectedCollegeId);
  const activeCityId = filters.selectedCityId || selectedCollege?.cityId || 'city-sangli';

  const filtered = listings.filter((item) => {
    if (item.approvalStatus !== 'APPROVED') return false;

    if (marketplaceMode === 'COLLEGE_MODE') {
      if (item.ownerRole === 'BUSINESS_OWNER' || item.ownerRole === 'PUBLIC_USER') {
        return false;
      }
      if (filters.scope === 'same_college') {
        if (item.collegeId !== filters.selectedCollegeId) return false;
      } else if (filters.scope === 'nearby_colleges') {
        if (item.cityId !== activeCityId && item.collegeId !== filters.selectedCollegeId) return false;
      }
      // If 'all_locations' is selected so user can see all campus equipment across participating colleges
    } else if (marketplaceMode === 'CITY_MODE') {
      if (filters.scope === 'same_college') {
        if (item.collegeId !== filters.selectedCollegeId) return false;
      } else if (filters.scope === 'nearby_colleges') {
        if (item.cityId !== activeCityId || item.ownerRole === 'BUSINESS_OWNER') return false;
      } else if (filters.scope === 'city_wide') {
        if (item.cityId !== activeCityId) return false;
      }
    } else if (marketplaceMode === 'MULTI_CITY_MODE') {
      if (filters.scope === 'same_college') {
        if (item.collegeId !== filters.selectedCollegeId) return false;
      } else if (filters.scope === 'nearby_colleges' || filters.scope === 'city_wide') {
        if (item.cityId !== activeCityId) return false;
      }
    }

    if (filters.category !== 'ALL' && item.category !== filters.category) {
      return false;
    }

    if (filters.condition !== 'ALL' && item.condition !== filters.condition) {
      return false;
    }

    if (filters.maxPrice > 0 && item.dailyPrice > filters.maxPrice) {
      return false;
    }

    if (filters.onlyAvailable && !item.isAvailable) {
      return false;
    }

    if (filters.seniorToJuniorOnly && !item.isSeniorToJunior) {
      return false;
    }

    if (filters.groupRentalOnly && !item.allowGroupRental) {
      return false;
    }

    if (filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchBrand = item.brand.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLandmark = item.pickupLocation.toLowerCase().includes(q);
      if (!matchTitle && !matchBrand && !matchCategory && !matchDesc && !matchLandmark) {
        return false;
      }
    }

    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sortBy === 'recommended') {
      const aSame = a.collegeId === filters.selectedCollegeId ? 1 : 0;
      const bSame = b.collegeId === filters.selectedCollegeId ? 1 : 0;
      if (aSame !== bSame) return bSame - aSame;
      return b.rating * b.reviewCount - a.rating * a.reviewCount;
    }
    if (filters.sortBy === 'price_asc') {
      return a.dailyPrice - b.dailyPrice;
    }
    if (filters.sortBy === 'highest_rated') {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    }
    if (filters.sortBy === 'recently_added') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });
}

export function canUserAccessCollegeAdminData(
  user: Pick<UserProfile, 'role' | 'collegeId'>,
  targetCollegeId: string
): boolean {
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role === 'COLLEGE_ADMIN' && user.collegeId === targetCollegeId) {
    return true;
  }
  return false;
}

export function verifyQrHandoverCode(
  booking: Pick<
    RentalBooking,
    | 'handoverPin'
    | 'pickupQrCode'
    | 'returnQrCode'
    | 'status'
    | 'returnDeadlineAt'
    | 'fineRatePerHour'
    | 'fineAmountPaid'
    | 'finePaidStatus'
    | 'dailyPrice'
  >,
  scannedInput: string,
  stage: 'PICKUP' | 'RETURN',
  nowMs: number = Date.now()
): { valid: boolean; nextStatus?: BookingStatus; error?: string; requiredFine?: number } {
  const clean = scannedInput.trim().toUpperCase();
  if (!clean) {
    return { valid: false, error: 'Please enter the handover PIN or scan the booking QR token.' };
  }

  if (stage === 'PICKUP') {
    if (booking.status !== 'ACCEPTED' && booking.status !== 'PAID_READY_FOR_PICKUP') {
      return {
        valid: false,
        error: 'Booking must be accepted before confirming campus pickup handover.',
      };
    }
    const matchesPin = clean === booking.handoverPin.toUpperCase();
    const matchesQr = clean === booking.pickupQrCode.toUpperCase();
    if (!matchesPin && !matchesQr) {
      return { valid: false, error: 'Invalid Pickup QR token or Handover PIN.' };
    }
    return { valid: true, nextStatus: 'PICKED_UP_ACTIVE' };
  }

  if (stage === 'RETURN') {
    if (booking.status !== 'PICKED_UP_ACTIVE') {
      return {
        valid: false,
        error: 'Product must be in Picked Up (Active) state before confirming return.',
      };
    }

    const timerCheck = calculateReturnTimerAndFine(booking, nowMs);
    if (!timerCheck.canReturnWithoutFinePayment) {
      return {
        valid: false,
        requiredFine: timerCheck.outstandingFine,
        error: `Return timer expired! Please pay the overdue fine of ₹${timerCheck.outstandingFine} before completing return.`,
      };
    }

    const matchesPin = clean === booking.handoverPin.toUpperCase();
    const matchesQr = clean === booking.returnQrCode.toUpperCase();
    if (!matchesPin && !matchesQr) {
      return { valid: false, error: 'Invalid Return QR token or Handover PIN.' };
    }
    return { valid: true, nextStatus: 'COMPLETED_RETURNED' };
  }

  return { valid: false, error: 'Unsupported handover stage.' };
}
