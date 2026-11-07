import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRentalDays,
  calculateRentalQuote,
  hasDateOverlap,
  suggestSmartRentalPrice,
  calculateStudentTrustScore,
  canUserAccessCollegeAdminData,
  verifyQrHandoverCode,
  filterDiscoverableListings,
  calculateReturnTimerAndFine,
  type ProductListing,
  type College,
} from './rentalLogic';

test('calculateRentalDays computes inclusive day count and rejects reversed dates', () => {
  assert.equal(calculateRentalDays('2026-11-05', '2026-11-05'), 1);
  assert.equal(calculateRentalDays('2026-11-05', '2026-11-08'), 4);
  assert.throws(() => calculateRentalDays('2026-11-10', '2026-11-05'), /End date cannot be earlier/);
});

test('calculateRentalQuote applies multi-day discount and group rental split accurately', () => {
  const quote = calculateRentalQuote(400, 1000, '2026-11-05', '2026-11-08', 4);
  assert.equal(quote.totalDays, 4);
  assert.equal(quote.rentalSubtotal, 1600);
  assert.equal(quote.discountPercent, 10);
  assert.equal(quote.discountAmount, 160);
  assert.equal(quote.discountedRental, 1440);
  assert.equal(quote.groupSize, 4);
  assert.ok(quote.perPersonRentalShare > 0);
  assert.ok(quote.totalPayable > quote.discountedRental);
});

test('hasDateOverlap detects overlapping active bookings and ignores cancelled/rejected bookings', () => {
  const existing = [
    { startDate: '2026-11-10', endDate: '2026-11-14', status: 'ACCEPTED' as const },
    { startDate: '2026-11-20', endDate: '2026-11-22', status: 'CANCELLED' as const },
  ];

  assert.equal(hasDateOverlap(existing, '2026-11-12', '2026-11-16'), true);
  assert.equal(hasDateOverlap(existing, '2026-11-15', '2026-11-18'), false);
  assert.equal(hasDateOverlap(existing, '2026-11-20', '2026-11-22'), false);
});

test('suggestSmartRentalPrice returns bounded recommendations based on category and condition', () => {
  const suggestion = suggestSmartRentalPrice('Cameras and Photography', 'Like New', 65000);
  assert.ok(suggestion.recommendedDaily >= suggestion.minDaily);
  assert.ok(suggestion.maxDaily >= suggestion.recommendedDaily);
  assert.ok(suggestion.recommendedDeposit >= 1000);
});

test('calculateStudentTrustScore computes score from verified credentials, rentals, and reviews', () => {
  const verifiedLeader = calculateStudentTrustScore({
    emailVerified: true,
    idCardVerified: true,
    adminApproved: true,
    completedRentals: 8,
    onTimeReturns: 8,
    averageRating: 4.9,
    reviewCount: 7,
  });
  assert.ok(verifiedLeader.score >= 88);
  assert.equal(verifiedLeader.badgeLabel, 'Campus Verified Leader');
});

test('canUserAccessCollegeAdminData strictly isolates college administrators to their own college', () => {
  const adcetAdmin = { role: 'COLLEGE_ADMIN' as const, collegeId: 'col-adcet' };
  const superAdmin = { role: 'SUPER_ADMIN' as const, collegeId: 'col-adcet' };

  assert.equal(canUserAccessCollegeAdminData(adcetAdmin, 'col-adcet'), true);
  assert.equal(canUserAccessCollegeAdminData(adcetAdmin, 'col-coep'), false);
  assert.equal(canUserAccessCollegeAdminData(superAdmin, 'col-coep'), true);
});

test('calculateReturnTimerAndFine computes active countdown and overdue fine accurately', () => {
  const now = new Date('2026-11-05T12:00:00Z').getTime();

  // 1. Not overdue yet (2 hours remaining)
  const activeBooking = {
    status: 'PICKED_UP_ACTIVE' as const,
    returnDeadlineAt: '2026-11-05T14:00:00Z',
    fineRatePerHour: 50,
    fineAmountPaid: 0,
    finePaidStatus: 'NONE' as const,
    dailyPrice: 200,
  };
  const timerActive = calculateReturnTimerAndFine(activeBooking, now);
  assert.equal(timerActive.isOverdue, false);
  assert.equal(timerActive.outstandingFine, 0);
  assert.equal(timerActive.canReturnWithoutFinePayment, true);
  assert.equal(timerActive.formattedTimer, '02h 00m 00s');

  // 2. Overdue by 3 hours (base ₹100 + 3 * ₹50 = ₹250 fine)
  const overdueBooking = {
    ...activeBooking,
    returnDeadlineAt: '2026-11-05T09:00:00Z',
  };
  const timerOverdue = calculateReturnTimerAndFine(overdueBooking, now);
  assert.equal(timerOverdue.isOverdue, true);
  assert.equal(timerOverdue.overdueHours, 3);
  assert.equal(timerOverdue.calculatedFine, 250);
  assert.equal(timerOverdue.outstandingFine, 250);
  assert.equal(timerOverdue.canReturnWithoutFinePayment, false);
});

test('verifyQrHandoverCode blocks overdue return until fine is paid and succeeds once paid', () => {
  const now = new Date('2026-11-05T12:00:00Z').getTime();
  const overdueBooking = {
    handoverPin: '482910',
    pickupQrCode: 'RK-PICKUP-BK101-482910',
    returnQrCode: 'RK-RETURN-BK101-482910',
    status: 'PICKED_UP_ACTIVE' as const,
    returnDeadlineAt: '2026-11-05T09:00:00Z', // 3 hours overdue
    fineRatePerHour: 50,
    fineAmountPaid: 0,
    finePaidStatus: 'UNPAID_FINE' as const,
    dailyPrice: 200,
  };

  // Blocked when fine is unpaid
  const blockedReturn = verifyQrHandoverCode(overdueBooking, '482910', 'RETURN', now);
  assert.equal(blockedReturn.valid, false);
  assert.equal(blockedReturn.requiredFine, 250);

  // Succeeds once finePaidStatus is FINE_PAID
  const paidReturn = verifyQrHandoverCode(
    { ...overdueBooking, finePaidStatus: 'FINE_PAID', fineAmountPaid: 250 },
    '482910',
    'RETURN',
    now
  );
  assert.equal(paidReturn.valid, true);
  assert.equal(paidReturn.nextStatus, 'COMPLETED_RETURNED');
});

test('filterDiscoverableListings enforces COLLEGE_MODE vs CITY_MODE vs MULTI_CITY_MODE isolation for ADCET', () => {
  const colleges: College[] = [
    {
      id: 'col-adcet',
      name: 'ADCET — Annasaheb Dange College of Engineering & Technology',
      shortName: 'ADCET Ashta',
      cityId: 'city-sangli',
      cityName: 'Ashta / Sangli',
      state: 'Maharashtra',
      supportsInstitutionalEmail: true,
      campusLandmarks: ['Central Library Foyer'],
      verifiedStudentsCount: 1420,
      activeListingsCount: 118,
    },
    {
      id: 'col-coep',
      name: 'COEP Technological University',
      shortName: 'COEP Pune',
      cityId: 'city-pune',
      cityName: 'Pune',
      state: 'Maharashtra',
      supportsInstitutionalEmail: true,
      campusLandmarks: ['Boat Club'],
      verifiedStudentsCount: 910,
      activeListingsCount: 64,
    },
  ];

  const baseListing: Omit<ProductListing, 'id' | 'title' | 'collegeId' | 'cityId' | 'ownerRole'> = {
    description: 'Test listing',
    category: 'Cameras and Photography',
    photos: [],
    brand: 'Sony',
    condition: 'Like New',
    dailyPrice: 400,
    securityDeposit: 2000,
    marketRetailValue: 50000,
    collegeName: 'ADCET Ashta',
    cityName: 'Ashta / Sangli',
    pickupLocation: 'Central Library Foyer',
    availableFrom: '2026-11-01',
    availableTo: '2026-12-31',
    ownerId: 'u1',
    ownerName: 'Aarav',
    ownerDepartment: 'CSE',
    ownerYear: '3rd Year',
    ownerTrustScore: 95,
    approvalStatus: 'APPROVED',
    isAvailable: true,
    isSeniorToJunior: false,
    allowGroupRental: true,
    maxGroupMembers: 4,
    deliveryOptions: ['CAMPUS_PICKUP'],
    rating: 4.9,
    reviewCount: 12,
    viewsCount: 100,
    createdAt: '2026-11-01T10:00:00Z',
  };

  const sampleListings: ProductListing[] = [
    { ...baseListing, id: 'p1', title: 'ADCET Student Camera', collegeId: 'col-adcet', cityId: 'city-sangli', ownerRole: 'STUDENT' },
    { ...baseListing, id: 'p2', title: 'Sangli Business Camera', collegeId: 'col-adcet', cityId: 'city-sangli', ownerRole: 'BUSINESS_OWNER' },
    { ...baseListing, id: 'p3', title: 'COEP Student Camera', collegeId: 'col-coep', cityId: 'city-pune', ownerRole: 'STUDENT' },
  ];

  const collegeModeResults = filterDiscoverableListings(
    sampleListings,
    {
      selectedCollegeId: 'col-adcet',
      scope: 'same_college',
      category: 'ALL',
      condition: 'ALL',
      maxPrice: 0,
      onlyAvailable: false,
      seniorToJuniorOnly: false,
      groupRentalOnly: false,
      searchQuery: '',
      sortBy: 'recommended',
    },
    'COLLEGE_MODE',
    colleges
  );
  assert.equal(collegeModeResults.length, 1);
  assert.equal(collegeModeResults[0].id, 'p1');
});
