import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Globe2,
  GraduationCap,
  Users,
  AlertTriangle,
  X,
  FileCheck2,
  Lock,
  LogIn,
  PlusCircle,
} from 'lucide-react';
import {
  canUserAccessCollegeAdminData,
  type College,
  type UserProfile,
  type ProductListing,
  type RentalBooking,
  type CampusComplaint,
  type MarketplaceMode,
  type VerificationMethod,
  type UserRole,
} from '../utils/rentalLogic';

interface CollegeAdminViewProps {
  currentUser: UserProfile;
  colleges: College[];
  users: UserProfile[];
  products: ProductListing[];
  bookings: RentalBooking[];
  complaints: CampusComplaint[];
  marketplaceMode: MarketplaceMode;
  onVerifyUser: (
    userId: string,
    status: 'VERIFIED' | 'REJECTED'
  ) => Promise<void>;
  onModerateListing: (
    listingId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => Promise<void>;
  onResolveComplaint: (complaintId: string) => Promise<void>;
  onSwitchMarketplaceMode: (mode: MarketplaceMode) => Promise<void>;
  onQuickSwitchAdminRole?: (targetUser: UserProfile) => void;
}

export const CollegeAdminView: React.FC<CollegeAdminViewProps> = ({
  currentUser,
  colleges,
  users,
  products,
  bookings,
  complaints,
  marketplaceMode,
  onVerifyUser,
  onModerateListing,
  onResolveComplaint,
  onSwitchMarketplaceMode,
  onQuickSwitchAdminRole,
}) => {
  const [adminSelectedCollegeId, setAdminSelectedCollegeId] = useState(
    currentUser.collegeId
  );

  // Enforce strict college-level data isolation
  const effectiveCollegeId =
    currentUser.role === 'SUPER_ADMIN'
      ? adminSelectedCollegeId
      : currentUser.collegeId;

  const assignedCollege =
    colleges.find((c) => c.id === effectiveCollegeId) || colleges[0];

  const isAuthorized = canUserAccessCollegeAdminData(
    currentUser,
    effectiveCollegeId
  );

  const collegeStudents = users.filter(
    (u) => u.collegeId === effectiveCollegeId && u.role === 'STUDENT'
  );
  const collegeListings = products.filter(
    (p) => p.collegeId === effectiveCollegeId
  );
  const collegeBookings = bookings.filter(
    (b) => b.collegeId === effectiveCollegeId
  );
  const collegeComplaints = complaints.filter(
    (c) => c.collegeId === effectiveCollegeId
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header & Isolation Notice */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#1F9D55] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>
              Role-Based Data Isolation Active · Assigned Campus:{' '}
              {assignedCollege.name}
            </span>
          </p>
          <h1 className="text-2xl font-extrabold text-[#17172B]">
            College Administrator & Governance Console
          </h1>
          <p className="text-xs text-slate-600">
            Logged in as <strong>{currentUser.fullName}</strong> ({currentUser.role.replace('_', ' ')}). Verify student ID cards, approve campus listings, and monitor bookings.
          </p>
        </div>

        {currentUser.role === 'SUPER_ADMIN' && (
          <div>
            <label
              htmlFor="super-admin-college-scope"
              className="block text-[11px] font-semibold text-slate-500 mb-1"
            >
              Super Admin: Inspect Participating College
            </label>
            <select
              id="super-admin-college-scope"
              value={adminSelectedCollegeId}
              onChange={(e) => setAdminSelectedCollegeId(e.target.value)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50"
            >
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.cityName})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* City Expansion Mode Architecture Switcher (Mode 1, Mode 2, Mode 3) */}
      <div className="bg-[#17172B] text-white rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-[#2CC06E]">
              Scalable Multi-Tier Architecture · Coexisting Campus & City Operations
            </p>
            <h2 className="text-lg font-bold mt-0.5">
              Marketplace Expansion Mode Control (Zero-Rebuild Switch)
            </h2>
          </div>
          <span className="font-mono text-xs px-3 py-1 rounded-lg bg-white/10 text-emerald-300 w-fit">
            Active: {marketplaceMode}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => onSwitchMarketplaceMode('COLLEGE_MODE')}
            className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
              marketplaceMode === 'COLLEGE_MODE'
                ? 'bg-[#1F9D55]/20 border-[#2CC06E] text-white'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2CC06E]">
                MODE 1 · COLLEGE MODE
              </span>
              <GraduationCap className="w-4 h-4 text-[#2CC06E]" />
            </div>
            <p className="text-sm font-bold mt-1">Campus-Only Community</p>
            <p className="text-xs text-slate-300 mt-1">
              Only verified students, college-specific listings, campus landmark pickup, and college admin moderation.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSwitchMarketplaceMode('CITY_MODE')}
            className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
              marketplaceMode === 'CITY_MODE'
                ? 'bg-[#1F9D55]/20 border-[#2CC06E] text-white'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2CC06E]">
                MODE 2 · CITY MODE
              </span>
              <Building2 className="w-4 h-4 text-[#2CC06E]" />
            </div>
            <p className="text-sm font-bold mt-1">
              {assignedCollege.cityName} City-Wide Expansion
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Unlocks nearby colleges, city residents, verified local rental businesses, and doorstep delivery options.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSwitchMarketplaceMode('MULTI_CITY_MODE')}
            className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
              marketplaceMode === 'MULTI_CITY_MODE'
                ? 'bg-[#1F9D55]/20 border-[#2CC06E] text-white'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2CC06E]">
                MODE 3 · MULTI-CITY MODE
              </span>
              <Globe2 className="w-4 h-4 text-[#2CC06E]" />
            </div>
            <p className="text-sm font-bold mt-1">
              All-India Multi-Campus Network
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Global search across Ashta/Sangli, Mumbai, Pune, Goa & partner cities with regional administrator controls.
            </p>
          </button>
        </div>
      </div>

      {!isAuthorized ? (
        <div className="p-6 rounded-2xl bg-amber-50/90 border border-amber-200 text-sm text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-bold text-[#17172B]">
              Role-Based Access Control Active: Currently Signed in as {currentUser.fullName} ({currentUser.role})
            </p>
            <p className="text-xs text-slate-600">
              College student accounts cannot access the College Administrator verification and listing moderation queues. Please sign in with an authorized Administrator account to manage {assignedCollege.shortName}.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* 4 College Admin KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">
                Total Students ({assignedCollege.shortName})
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#17172B] font-mono tabular-nums">
                {collegeStudents.length} Accounts ({assignedCollege.verifiedStudentsCount} Campus Total)
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">College Product Listings</p>
              <p className="mt-1 text-2xl font-extrabold text-[#17172B] font-mono tabular-nums">
                {collegeListings.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">Campus Bookings</p>
              <p className="mt-1 text-2xl font-extrabold text-[#1F9D55] font-mono tabular-nums">
                {collegeBookings.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">Open Campus Complaints</p>
              <p className="mt-1 text-2xl font-extrabold text-amber-700 font-mono tabular-nums">
                {collegeComplaints.filter((c) => c.status === 'OPEN').length}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Identity & Registration Verification Queue */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#17172B]">
                    Student Identity & Roll Verification
                  </h2>
                  <p className="text-xs text-slate-500">
                    Supports Institutional Email, College ID Card Upload & Manual Admin Approval
                  </p>
                </div>
                <Users className="w-5 h-5 text-[#1F9D55]" />
              </div>

              <div className="space-y-3">
                {collegeStudents.map((stu) => (
                  <div
                    key={stu.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-[#17172B]">
                        {stu.fullName}{' '}
                        <span className="font-mono text-xs text-slate-500">
                          ({stu.collegeRollNumber})
                        </span>
                      </p>
                      <p className="text-xs text-slate-600">
                        {stu.department} · {stu.academicYear} · {stu.email}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-[#1F9D55]" />
                        <span>
                          Method: {stu.verificationMethod.replace(/_/g, ' ')} · Doc:{' '}
                          {stu.idCardDocumentName || 'Verified Domain'} · Status:{' '}
                          <strong
                            className={
                              stu.verificationStatus === 'VERIFIED'
                                ? 'text-[#1F9D55]'
                                : 'text-amber-700'
                            }
                          >
                            {stu.verificationStatus}
                          </strong>
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {stu.verificationStatus !== 'VERIFIED' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onVerifyUser(stu.id, 'VERIFIED')}
                            className="px-3 py-1.5 rounded-lg bg-[#1F9D55] text-white text-xs font-semibold hover:bg-[#198B4A] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve ID</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onVerifyUser(stu.id, 'REJECTED')}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-[#1F9D55] inline-flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Listing Approval & Moderation */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#17172B]">
                    Campus Product Listings Review
                  </h2>
                  <p className="text-xs text-slate-500">
                    Approve new student gear or remove prohibited items
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {collegeListings.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">
                        {item.category} · Owner: {item.ownerName} ·{' '}
                        <span
                          className={
                            item.approvalStatus === 'APPROVED'
                              ? 'font-bold text-[#1F9D55]'
                              : item.approvalStatus === 'PENDING'
                              ? 'font-bold text-amber-700'
                              : 'font-bold text-red-600'
                          }
                        >
                          {item.approvalStatus}
                        </span>
                      </p>
                      <p className="text-sm font-bold text-[#17172B] truncate">
                        {item.title}
                      </p>
                      <p className="text-xs font-mono text-slate-600">
                        ₹{item.dailyPrice}/day · Deposit ₹{item.securityDeposit} · Pickup:{' '}
                        {item.pickupLocation}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.approvalStatus !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() =>
                            onModerateListing(item.id, 'APPROVED')
                          }
                          className="px-3 py-1.5 rounded-lg bg-[#1F9D55] text-white text-xs font-semibold hover:bg-[#198B4A] cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {item.approvalStatus !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() =>
                            onModerateListing(item.id, 'REJECTED')
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Complaints & Rental Activity Monitor */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-[#17172B] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>
                Campus Complaints & Pickup Dispute Log ({collegeComplaints.length})
              </span>
            </h2>
            {collegeComplaints.length === 0 ? (
              <p className="text-xs text-slate-500">
                Zero active complaints for {assignedCollege.shortName}.
              </p>
            ) : (
              <div className="space-y-2.5">
                {collegeComplaints.map((cmp) => (
                  <div
                    key={cmp.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#17172B]">
                        {cmp.targetTitle} · Reported by {cmp.reporterName}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {cmp.reason}
                      </p>
                    </div>
                    {cmp.status === 'OPEN' ? (
                      <button
                        type="button"
                        onClick={() => onResolveComplaint(cmp.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#17172B] text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer shrink-0"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-[#1F9D55] shrink-0">
                        Resolved
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

interface AuthAndRoleModalProps {
  colleges: College[];
  users: UserProfile[];
  currentUser: UserProfile;
  onSignInUser: (payload: {
    email: string;
    password?: string;
    fullName?: string;
    collegeId?: string;
  }) => Promise<UserProfile | null>;
  onRegisterUser: (payload: Record<string, unknown>) => Promise<UserProfile | null>;
  onClose: () => void;
}

export const AuthAndRoleModal: React.FC<AuthAndRoleModalProps> = ({
  colleges,
  users,
  currentUser,
  onSignInUser,
  onRegisterUser,
  onClose,
}) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');

  // Sign In state - zero demo pre-fills
  const [signInEmail, setSignInEmail] = useState('');
  const [signInName, setSignInName] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInCollegeId, setSignInCollegeId] = useState(
    colleges[0]?.id || 'col-adcet'
  );

  // Registration state - zero demo pre-fills
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [collegeId, setCollegeId] = useState(colleges[0]?.id || 'col-adcet');
  const [collegeRollNumber, setCollegeRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('1st Year');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [verificationMethod, setVerificationMethod] =
    useState<VerificationMethod>('ID_CARD_UPLOAD');
  const [idCardDocumentName, setIdCardDocumentName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedCol =
    colleges.find((c) => c.id === collegeId) || colleges[0];

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!signInEmail.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    setSubmitting(true);
    try {
      const signedIn = await onSignInUser({
        email: signInEmail,
        password: signInPassword,
        fullName: signInName,
        collegeId: signInCollegeId,
      });
      if (signedIn) {
        onClose();
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Sign in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!fullName.trim() || !email.trim() || !collegeRollNumber.trim()) {
      setErrorMsg(
        'Please provide your Full Name, Email, and College Roll Number / ID.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const created = await onRegisterUser({
        fullName,
        email,
        mobile,
        password,
        role,
        collegeId,
        collegeRollNumber,
        department,
        academicYear,
        verificationMethod,
        idCardDocumentName,
      });
      if (created) {
        onClose();
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <p className="text-xs font-semibold text-[#1F9D55]">
              Campus Sign In & Registration
            </p>
            <h2
              id="auth-modal-title"
              className="text-lg font-bold text-[#17172B]"
            >
              {tab === 'signin'
                ? 'Sign In to RentKaro'
                : 'New Student Registration'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close registration modal"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs - Only Sign In and Sign Up */}
        <div className="px-6 pt-4 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setTab('signin')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer inline-flex items-center gap-1.5 ${
              tab === 'signin'
                ? 'bg-[#17172B] text-white'
                : 'bg-slate-100 text-slate-600 hover:text-[#17172B]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer ${
              tab === 'register'
                ? 'bg-[#17172B] text-white'
                : 'bg-slate-100 text-slate-600 hover:text-[#17172B]'
            }`}
          >
            Sign Up (New Student)
          </button>
        </div>

        {tab === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-xs font-semibold text-[#17172B] mb-1"
                >
                  Registered Email Address *
                </label>
                <input
                  id="signin-email"
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="signin-name"
                  className="block text-xs font-semibold text-[#17172B] mb-1"
                >
                  User Full Name *
                </label>
                <input
                  id="signin-name"
                  type="text"
                  required
                  value={signInName}
                  onChange={(e) => setSignInName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label
                  htmlFor="signin-password"
                  className="block text-xs font-semibold text-[#17172B] mb-1"
                >
                  Password *
                </label>
                <input
                  id="signin-password"
                  type="password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label
                  htmlFor="signin-college"
                  className="block text-xs font-semibold text-[#17172B] mb-1"
                >
                  Campus Marketplace
                </label>
                <select
                  id="signin-college"
                  value={signInCollegeId}
                  onChange={(e) => setSignInCollegeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                >
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTab('register')}
                className="text-xs font-semibold text-[#1F9D55] hover:underline cursor-pointer"
              >
                New student? Create campus account →
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rentbase-btn-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl cursor-pointer"
                >
                  {submitting ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </div>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="reg-fullname"
                  className="block text-xs font-semibold text-[#17172B] mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="reg-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-[#17172B] mb-1"
                >
                  Registered Email Address *
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-mobile"
                  className="block text-xs font-semibold text-[#17172B] mb-1"
                >
                  Mobile Number *
                </label>
                <input
                  id="reg-mobile"
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-semibold text-[#17172B] mb-1"
                >
                  Password *
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-college"
                  className="block text-xs font-semibold text-[#17172B] mb-1"
                >
                  Select College *
                </label>
                <select
                  id="reg-college"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                >
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="reg-roll"
                  className="block text-xs font-semibold text-[#17172B] mb-1"
                >
                  College ID / Roll Number *
                </label>
                <input
                  id="reg-roll"
                  type="text"
                  required
                  value={collegeRollNumber}
                  onChange={(e) => setCollegeRollNumber(e.target.value)}
                  placeholder="Enter college roll number / ID"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-dept"
                  className="block text-xs font-semibold text-[#17172B] mb-1"
                >
                  Department *
                </label>
                <input
                  id="reg-dept"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Enter department (e.g. Computer Science)"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-year"
                  className="block text-xs font-semibold text-[#17172B] mb-1"
                >
                  Academic Year & Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    id="reg-year"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year (Senior)">4th Year (Senior)</option>
                    <option value="M.Tech / PhD">M.Tech / PhD</option>
                  </select>
                  <select
                    aria-label="Account role type"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="BUSINESS_OWNER">Rental Business</option>
                    <option value="PUBLIC_USER">City Resident</option>
                  </select>
                </div>
              </div>
            </div>

            {/* College Verification Method Selector */}
            <div className="p-4 rounded-xl bg-[#F4FBF7] border border-[#22A861]/30 space-y-2.5">
              <p className="text-xs font-bold text-[#17172B]">
                College Verification Method (Supports Indian Colleges With or Without Institutional Email)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setVerificationMethod('ID_CARD_UPLOAD')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer ${
                    verificationMethod === 'ID_CARD_UPLOAD'
                      ? 'bg-white border-[#1F9D55] font-bold text-[#17172B]'
                      : 'bg-white/60 border-slate-200 text-slate-600'
                  }`}
                >
                  1. College ID Card Upload
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMethod('COLLEGE_EMAIL')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer ${
                    verificationMethod === 'COLLEGE_EMAIL'
                      ? 'bg-white border-[#1F9D55] font-bold text-[#17172B]'
                      : 'bg-white/60 border-slate-200 text-slate-600'
                  }`}
                >
                  2. Institutional Email ({selectedCol.emailDomain || 'Optional'})
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMethod('ADMIN_MANUAL')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer ${
                    verificationMethod === 'ADMIN_MANUAL'
                      ? 'bg-white border-[#1F9D55] font-bold text-[#17172B]'
                      : 'bg-white/60 border-slate-200 text-slate-600'
                  }`}
                >
                  3. Manual Admin Approval
                </button>
              </div>

              {verificationMethod === 'ID_CARD_UPLOAD' && (
                <div>
                  <label
                    htmlFor="reg-id-doc"
                    className="block text-[11px] font-medium text-slate-600 mb-1"
                  >
                    Uploaded Smart Card / Bonafide Certificate Filename
                  </label>
                  <input
                    id="reg-id-doc"
                    type="text"
                    value={idCardDocumentName}
                    onChange={(e) => setIdCardDocumentName(e.target.value)}
                    placeholder="e.g. Student_ID_Card.pdf"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rentbase-btn-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl cursor-pointer"
              >
                {submitting
                  ? 'Registering...'
                  : 'Complete Campus Registration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface AddCollegeModalProps {
  onClose: () => void;
  onAddCollege: (payload: {
    name: string;
    shortName: string;
    cityName: string;
    state: string;
    emailDomain: string;
    landmarksInput: string;
  }) => Promise<void>;
}

export const AddCollegeModal: React.FC<AddCollegeModalProps> = ({
  onClose,
  onAddCollege,
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [cityName, setCityName] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [emailDomain, setEmailDomain] = useState('');
  const [landmarksInput, setLandmarksInput] = useState(
    'Main Campus Gate, Central Library Desk, Student Activity Center (SAC), Hostel Block Plaza'
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const applyQuickCollegePreset = (preset: {
    name: string;
    shortName: string;
    cityName: string;
    state: string;
    emailDomain: string;
    landmarks: string;
  }) => {
    setName(preset.name);
    setShortName(preset.shortName);
    setCityName(preset.cityName);
    setState(preset.state);
    setEmailDomain(preset.emailDomain);
    setLandmarksInput(preset.landmarks);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim() || !shortName.trim() || !cityName.trim()) {
      setErrorMsg(
        'Please enter the College Full Name, Short Name, and City.'
      );
      return;
    }
    setSubmitting(true);
    try {
      await onAddCollege({
        name,
        shortName,
        cityName,
        state,
        emailDomain,
        landmarksInput,
      });
      onClose();
    } catch (err) {
      setErrorMsg((err as Error).message || 'Could not add college.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-college-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <p className="text-xs font-semibold text-[#1F9D55]">
              Expand Campus Network · Instant Starter Equipment Provisioning
            </p>
            <h2
              id="add-college-modal-title"
              className="text-lg font-bold text-[#17172B]"
            >
              Add Participating College & View Campus Equipment
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add college modal"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick 1-Click Presets */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-500">
              Quick Fill Popular College Presets (or type any college below):
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  applyQuickCollegePreset({
                    name: 'Walchand College of Engineering, Sangli',
                    shortName: 'WCE Sangli',
                    cityName: 'Ashta / Sangli',
                    state: 'Maharashtra',
                    emailDomain: 'walchandsangli.ac.in',
                    landmarks:
                      'WCE Central Library Portico, Ajit Gulabchand Reading Hall, Cyber Hostel Gate, Main Quadrangle',
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-[#F4FBF7] border border-[#22A861]/30 text-xs font-semibold text-[#197A42] hover:bg-emerald-100/60 cursor-pointer"
              >
                + Walchand (WCE Sangli)
              </button>
              <button
                type="button"
                onClick={() =>
                  applyQuickCollegePreset({
                    name: 'KIT College of Engineering, Kolhapur',
                    shortName: 'KIT Kolhapur',
                    cityName: 'Kolhapur',
                    state: 'Maharashtra',
                    emailDomain: 'kitcoek.in',
                    landmarks:
                      'KIT Central Library Foyer, Idea Lab Entrance, Main Admin Porch, Hostel Block A',
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-[#F4FBF7] border border-[#22A861]/30 text-xs font-semibold text-[#197A42] hover:bg-emerald-100/60 cursor-pointer"
              >
                + KIT Kolhapur
              </button>
              <button
                type="button"
                onClick={() =>
                  applyQuickCollegePreset({
                    name: 'RIT — Rajarambapu Institute of Technology, Islampur',
                    shortName: 'RIT Islampur',
                    cityName: 'Ashta / Sangli',
                    state: 'Maharashtra',
                    emailDomain: 'ritindia.edu',
                    landmarks:
                      'RIT Digital Library Plaza, Innovation Center Gate, Student Plaza, Boys Hostel Gate',
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-[#F4FBF7] border border-[#22A861]/30 text-xs font-semibold text-[#197A42] hover:bg-emerald-100/60 cursor-pointer"
              >
                + RIT Islampur
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label
                htmlFor="new-col-name"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                College Full Name *
              </label>
              <input
                id="new-col-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Walchand College of Engineering, Sangli"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label
                htmlFor="new-col-short"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                College Short Name *
              </label>
              <input
                id="new-col-short"
                type="text"
                required
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. WCE Sangli"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label
                htmlFor="new-col-city"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                City / Region *
              </label>
              <input
                id="new-col-city"
                type="text"
                required
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g. Ashta / Sangli"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label
                htmlFor="new-col-state"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                State
              </label>
              <input
                id="new-col-state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label
                htmlFor="new-col-domain"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                Institutional Email Domain (Optional)
              </label>
              <input
                id="new-col-domain"
                type="text"
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value)}
                placeholder="e.g. wce.ac.in (leave blank if none)"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="new-col-landmarks"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                Campus Pickup Landmarks (comma-separated)
              </label>
              <input
                id="new-col-landmarks"
                type="text"
                value={landmarksInput}
                onChange={(e) => setLandmarksInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            Adding this college automatically provisions a dedicated campus marketplace with starter engineering lab kits, scientific calculators, and DSLR photography equipment so students can start renting immediately.
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rentbase-btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Adding College...'
                  : 'Add College & View Equipment'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
