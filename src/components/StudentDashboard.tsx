import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  QrCode,
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  Heart,
  Bell,
  PlusCircle,
  ArrowUpRight,
  Package,
  Clock,
  AlertTriangle,
  Database,
} from 'lucide-react';
import {
  calculateStudentTrustScore,
  calculateReturnTimerAndFine,
  type UserProfile,
  type College,
  type ProductListing,
  type RentalBooking,
  type UserRentalHistoryEntry,
} from '../utils/rentalLogic';
import { ProductVisual, BookingQrGraphic } from './ProductVisual';

interface StudentDashboardProps {
  currentUser: UserProfile;
  selectedCollege: College;
  colleges: College[];
  users: UserProfile[];
  products: ProductListing[];
  bookings: RentalBooking[];
  rentalHistory: UserRentalHistoryEntry[];
  onBookingAction: (
    bookingId: string,
    action:
      | 'ACCEPT'
      | 'REJECT'
      | 'CANCEL'
      | 'PAY_RAZORPAY_TEST'
      | 'QR_PICKUP'
      | 'QR_RETURN'
      | 'SIMULATE_OVERDUE'
      | 'PAY_OVERDUE_FINE',
    scannedCode?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  onOpenListModal: () => void;
  onSelectProductForBooking: (product: ProductListing) => void;
  onToggleWishlist: (productId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  selectedCollege,
  colleges,
  users,
  products,
  bookings,
  rentalHistory,
  onBookingAction,
  onOpenListModal,
  onSelectProductForBooking,
  onToggleWishlist,
}) => {
  const [activeTab, setActiveTab] = useState<
    'bookings' | 'history_db' | 'qr_handover' | 'listings' | 'wishlist'
  >('bookings');
  const [selectedQrBookingId, setSelectedQrBookingId] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [historyFilterEmail, setHistoryFilterEmail] = useState<string>('ALL');
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Live 1-second ticker for Return Countdown Timers
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const trustBreakdown = useMemo(
    () => calculateStudentTrustScore(currentUser),
    [currentUser]
  );

  const myOutgoingRentals = useMemo(
    () => bookings.filter((b) => b.renterId === currentUser.id),
    [bookings, currentUser.id]
  );

  const myIncomingOwnerRequests = useMemo(
    () => bookings.filter((b) => b.ownerId === currentUser.id),
    [bookings, currentUser.id]
  );

  const myListedProducts = useMemo(
    () => products.filter((p) => p.ownerId === currentUser.id),
    [products, currentUser.id]
  );

  const myWishlistProducts = useMemo(
    () =>
      products.filter((p) => currentUser.wishlistProductIds.includes(p.id)),
    [products, currentUser.wishlistProductIds]
  );

  const activeRentalsCount = useMemo(
    () =>
      [...myOutgoingRentals, ...myIncomingOwnerRequests].filter(
        (b) =>
          b.status === 'PAID_READY_FOR_PICKUP' ||
          b.status === 'PICKED_UP_ACTIVE' ||
          b.status === 'ACCEPTED'
      ).length,
    [myOutgoingRentals, myIncomingOwnerRequests]
  );

  const overdueRentalsCount = useMemo(
    () =>
      myOutgoingRentals.filter((b) => {
        const t = calculateReturnTimerAndFine(b, nowMs);
        return t.isOverdue && !t.canReturnWithoutFinePayment;
      }).length,
    [myOutgoingRentals, nowMs]
  );

  const allUserBookings = useMemo(
    () => [...myOutgoingRentals, ...myIncomingOwnerRequests],
    [myOutgoingRentals, myIncomingOwnerRequests]
  );

  const activeQrBooking =
    allUserBookings.find((b) => b.id === selectedQrBookingId) ||
    allUserBookings[0] ||
    null;

  const myRentalHistory = useMemo(() => {
    return rentalHistory.filter(
      (h) =>
        h.userId === currentUser.id ||
        h.userEmail.toLowerCase() === currentUser.email.toLowerCase()
    );
  }, [rentalHistory, currentUser.id, currentUser.email]);

  const handleActionClick = async (
    bookingId: string,
    action:
      | 'ACCEPT'
      | 'REJECT'
      | 'CANCEL'
      | 'PAY_RAZORPAY_TEST'
      | 'QR_PICKUP'
      | 'QR_RETURN'
      | 'SIMULATE_OVERDUE'
      | 'PAY_OVERDUE_FINE',
    code?: string
  ) => {
    setFeedbackBanner(null);
    const result = await onBookingAction(bookingId, action, code);
    if (result.ok) {
      const actionLabels: Record<typeof action, string> = {
        ACCEPT: 'Booking accepted! Renter notified to complete payment.',
        REJECT: 'Booking request declined.',
        CANCEL: 'Booking cancelled and dates released.',
        PAY_RAZORPAY_TEST:
          'Razorpay Test Payment completed! Campus Pickup QR code unlocked.',
        QR_PICKUP:
          'Campus Pickup QR verified! Return Countdown Timer is now running.',
        QR_RETURN:
          'Campus Return QR verified! Rental completed, deposit released & history database updated.',
        SIMULATE_OVERDUE:
          'Return timer expired for demonstration! Overdue fine has been calculated and must be paid before returning.',
        PAY_OVERDUE_FINE:
          'Overdue fine paid successfully and logged in the User Rental History Database! You can now complete the item return.',
      };
      setFeedbackBanner({ type: 'success', text: actionLabels[action] });
      setPinInput('');
    } else {
      setFeedbackBanner({
        type: 'error',
        text: result.error || 'Could not update booking status.',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Personalized Welcome & Student Trust Score Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-2">
          <p className="text-xs font-semibold text-[#1F9D55]">
            Unified Student & Product Owner Account · {selectedCollege.name}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17172B]">
            Welcome back, {currentUser.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Email:{' '}
            <span className="font-mono font-semibold text-[#17172B]">
              {currentUser.email}
            </span>{' '}
            · Roll/ID:{' '}
            <span className="font-mono font-semibold text-[#17172B]">
              {currentUser.collegeRollNumber}
            </span>{' '}
            · {currentUser.department}
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onOpenListModal}
              className="rentbase-btn-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List & Upload Item Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history_db')}
              className="px-4 py-2.5 rounded-xl bg-[#17172B] text-white text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Database className="w-4 h-4 text-[#2CC06E]" />
              <span>My Rental History ({myRentalHistory.length})</span>
            </button>
          </div>
        </div>

        {/* Student Trust Score Breakdown Card */}
        <div className="lg:col-span-5 bg-[#F4FBF7] rounded-xl p-4 border border-[#22A861]/25 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1F9D55]" />
              <div>
                <p className="text-xs font-bold text-[#17172B]">
                  Student Trust Score
                </p>
                <p className="text-[11px] text-[#197A42] font-medium">
                  {trustBreakdown.badgeLabel}
                </p>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-[#17172B] font-mono tabular-nums">
              {trustBreakdown.score}/100
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-900/10 text-[11px]">
            <div>
              <p className="text-slate-500">Verified ID</p>
              <p className="font-mono font-bold text-[#17172B] tabular-nums">
                {trustBreakdown.identityPoints}/45 pts
              </p>
            </div>
            <div>
              <p className="text-slate-500">On-Time Rentals</p>
              <p className="font-mono font-bold text-[#17172B] tabular-nums">
                {trustBreakdown.rentalHistoryPoints}/30 pts
              </p>
            </div>
            <div>
              <p className="text-slate-500">Peer Reviews</p>
              <p className="font-mono font-bold text-[#17172B] tabular-nums">
                {trustBreakdown.reviewPoints}/25 pts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Metric Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Active Return Timers</p>
          <p className="mt-1 text-2xl font-extrabold text-[#17172B] font-mono tabular-nums">
            {activeRentalsCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Live Countdown Active
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Overdue Items / Fines</p>
          <p
            className={`mt-1 text-2xl font-extrabold font-mono tabular-nums ${
              overdueRentalsCount > 0 ? 'text-red-600' : 'text-[#17172B]'
            }`}
          >
            {overdueRentalsCount}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            {overdueRentalsCount > 0 ? 'Fine Payment Needed' : 'All On Schedule'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">My Listed Products</p>
          <p className="mt-1 text-2xl font-extrabold text-[#17172B] font-mono tabular-nums">
            {myListedProducts.length}
          </p>
          <p className="text-[11px] text-[#1F9D55] mt-0.5">
            Earning on Campus
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Total Earnings</p>
          <p className="mt-1 text-2xl font-extrabold text-[#1F9D55] font-mono tabular-nums">
            ₹{currentUser.walletEarnings.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Direct UPI / Bank
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500">My Rental History</p>
          <p className="mt-1 text-2xl font-extrabold text-[#17172B] font-mono tabular-nums">
            {myRentalHistory.length}
          </p>
          <p className="text-[11px] text-[#1F9D55] mt-0.5">
            Items Rented by You
          </p>
        </div>
      </div>

      {feedbackBanner && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
            feedbackBanner.type === 'success'
              ? 'bg-[#E6F4EA] border-[#22A861]/30 text-[#17172B]'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <span>{feedbackBanner.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-xs underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Segmented Dashboard Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'bookings'
              ? 'bg-white text-[#17172B] shadow-xs'
              : 'text-slate-600 hover:text-[#17172B]'
          }`}
        >
          Return Timers, Fines & Bookings ({allUserBookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history_db')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'history_db'
              ? 'bg-white text-[#17172B] shadow-xs'
              : 'text-slate-600 hover:text-[#17172B]'
          }`}
        >
          My Rental History ({myRentalHistory.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('qr_handover')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'qr_handover'
              ? 'bg-white text-[#17172B] shadow-xs'
              : 'text-slate-600 hover:text-[#17172B]'
          }`}
        >
          Campus Pickup & QR Handover
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'listings'
              ? 'bg-white text-[#17172B] shadow-xs'
              : 'text-slate-600 hover:text-[#17172B]'
          }`}
        >
          My Listed Products ({myListedProducts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'wishlist'
              ? 'bg-white text-[#17172B] shadow-xs'
              : 'text-slate-600 hover:text-[#17172B]'
          }`}
        >
          Wishlist & Reminders ({myWishlistProducts.length})
        </button>
      </div>

      {/* TAB 1: RETURN TIMERS, OVERDUE FINES & BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Outgoing Rentals as Customer with Live Return Countdown Timer & Fine Payment */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#17172B]">
                  Items I’m Renting · Live Return Countdown & Fine Tracker
                </h2>
                <p className="text-xs text-slate-500">
                  Return before timer expires to avoid overdue fines
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-[#17172B]">
                {myOutgoingRentals.length} Total
              </span>
            </div>

            {myOutgoingRentals.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  You haven’t rented any campus items yet
                </p>
                <p className="text-xs text-slate-500">
                  Browse products from students in {selectedCollege.shortName}.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOutgoingRentals.map((bk) => {
                  const timerInfo = calculateReturnTimerAndFine(bk, nowMs);
                  return (
                    <div
                      key={bk.id}
                      className={`p-4 rounded-xl border space-y-3 ${
                        timerInfo.isOverdue &&
                        !timerInfo.canReturnWithoutFinePayment
                          ? 'bg-red-50/60 border-red-300'
                          : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-slate-500 font-mono">
                            {bk.bookingReference} · Owner: {bk.ownerName}
                          </p>
                          <h3 className="text-sm font-bold text-[#17172B] mt-0.5">
                            {bk.productTitle}
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-[#17172B] font-mono tabular-nums shrink-0">
                          Rental ₹{bk.rentalSubtotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* LIVE RETURN COUNTDOWN TIMER & OVERDUE FINE BOX */}
                      <div
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          bk.status === 'COMPLETED_RETURNED'
                            ? 'bg-[#E6F4EA] border-[#22A861]/30 text-[#197A42]'
                            : timerInfo.isOverdue &&
                              !timerInfo.canReturnWithoutFinePayment
                            ? 'bg-red-100/90 border-red-300 text-red-900'
                            : timerInfo.isOverdue &&
                              timerInfo.canReturnWithoutFinePayment
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-white border-slate-200 text-[#17172B]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {timerInfo.isOverdue &&
                          !timerInfo.canReturnWithoutFinePayment ? (
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-[#1F9D55] shrink-0" />
                          )}
                          <div>
                            <p className="text-[11px] font-semibold">
                              {bk.status === 'COMPLETED_RETURNED'
                                ? 'Item Returned & Completed'
                                : timerInfo.isOverdue
                                ? 'Return Deadline Passed — Late Fine Applicable'
                                : 'Return Countdown Timer (Fine ₹' +
                                  bk.fineRatePerHour +
                                  '/hr if late)'}
                            </p>
                            <p className="font-mono text-sm font-extrabold tabular-nums">
                              {timerInfo.formattedTimer}
                            </p>
                          </div>
                        </div>

                        {timerInfo.isOverdue && (
                          <div className="text-right">
                            <p className="text-[11px] font-semibold">
                              {timerInfo.canReturnWithoutFinePayment
                                ? `Fine Paid: ₹${bk.fineAmountPaid}`
                                : `Overdue Fine Due: ₹${timerInfo.outstandingFine}`}
                            </p>
                            <p className="text-[10px] opacity-80">
                              ₹100 base + {timerInfo.overdueHours}h × ₹
                              {bk.fineRatePerHour}/hr
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
                        <span>
                          {bk.startDate} to {bk.endDate} ({bk.totalDays}d)
                        </span>
                        <span>·</span>
                        <span>Pickup: {bk.pickupLocation}</span>
                        <span>·</span>
                        <span className="font-semibold text-[#1F9D55]">
                          {bk.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-slate-500">
                          PIN: <strong className="text-[#17172B]">{bk.handoverPin}</strong>
                        </span>

                        <div className="flex flex-wrap gap-2">
                          {/* If Overdue and Fine is unpaid -> Show Pay Overdue Fine Button */}
                          {bk.status === 'PICKED_UP_ACTIVE' &&
                            timerInfo.isOverdue &&
                            !timerInfo.canReturnWithoutFinePayment && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleActionClick(bk.id, 'PAY_OVERDUE_FINE')
                                }
                                className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>
                                  Pay Overdue Fine (₹{timerInfo.outstandingFine})
                                </span>
                              </button>
                            )}

                          {/* Button to simulate timer expiry on an active on-time rental */}
                          {bk.status === 'PICKED_UP_ACTIVE' &&
                            !timerInfo.isOverdue && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleActionClick(bk.id, 'SIMULATE_OVERDUE')
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 text-[11px] font-semibold cursor-pointer"
                              >
                                Test Timer Expiry (Simulate Overdue)
                              </button>
                            )}

                          {/* Return Item Button */}
                          {bk.status === 'PICKED_UP_ACTIVE' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleActionClick(
                                  bk.id,
                                  'QR_RETURN',
                                  bk.returnQrCode
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-[#1F9D55] text-white text-xs font-semibold hover:bg-[#198B4A] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Return Item Now</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedQrBookingId(bk.id);
                              setActiveTab('qr_handover');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-[#17172B] hover:bg-slate-100 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#1F9D55]" />
                            <span>QR</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Incoming Requests on My Products (Owner View) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#17172B]">
                  Incoming Requests on My Products (Owner View)
                </h2>
                <p className="text-xs text-slate-500">
                  Accept requests, verify campus QR handover, and confirm return
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-[#1F9D55]">
                {myIncomingOwnerRequests.length} Total
              </span>
            </div>

            {myIncomingOwnerRequests.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  No incoming rental requests yet
                </p>
                <p className="text-xs text-slate-500">
                  List calculators, lab kits, cameras, or books to start earning.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myIncomingOwnerRequests.map((bk) => {
                  const timerInfo = calculateReturnTimerAndFine(bk, nowMs);
                  return (
                    <div
                      key={bk.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-slate-500 font-mono">
                            {bk.bookingReference} · Renter: {bk.renterName}
                          </p>
                          <h3 className="text-sm font-bold text-[#17172B] mt-0.5">
                            {bk.productTitle}
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-[#1F9D55] font-mono tabular-nums shrink-0">
                          ₹{bk.rentalSubtotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
                        <span>
                          <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                          {bk.startDate} to {bk.endDate} ({bk.totalDays}d)
                        </span>
                        <span>·</span>
                        <span>
                          <MapPin className="w-3.5 h-3.5 inline mr-1 text-[#1F9D55]" />
                          {bk.pickupLocation}
                        </span>
                        <span>·</span>
                        <span className="font-mono font-semibold text-[#17172B]">
                          Timer: {timerInfo.formattedTimer}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-slate-500">
                          Handover PIN:{' '}
                          <strong className="text-[#17172B]">
                            {bk.handoverPin}
                          </strong>
                        </span>

                        <div className="flex flex-wrap gap-2">
                          {bk.status === 'REQUESTED' && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleActionClick(bk.id, 'ACCEPT')
                                }
                                className="px-3 py-1.5 rounded-lg bg-[#1F9D55] text-white text-xs font-semibold hover:bg-[#198B4A] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accept Request</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleActionClick(bk.id, 'REJECT')
                                }
                                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {(bk.status === 'ACCEPTED' ||
                            bk.status === 'PAID_READY_FOR_PICKUP') && (
                            <button
                              type="button"
                              onClick={() =>
                                handleActionClick(
                                  bk.id,
                                  'QR_PICKUP',
                                  bk.pickupQrCode
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-[#17172B] text-white text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Confirm QR Handover</span>
                            </button>
                          )}

                          {bk.status === 'PICKED_UP_ACTIVE' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleActionClick(
                                  bk.id,
                                  'QR_RETURN',
                                  bk.returnQrCode
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-[#1F9D55] text-white text-xs font-semibold hover:bg-[#198B4A] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Confirm QR Return & Release Deposit</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY RENTAL HISTORY DATABASE */}
      {activeTab === 'history_db' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold text-[#1F9D55] flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  <span>
                    Personal Rental History Log · {currentUser.fullName}
                  </span>
                </p>
                <h2 className="text-lg font-extrabold text-[#17172B] mt-0.5">
                  Items You Have Rented, Dates & Return Timer Fines
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3 font-semibold">Booking Ref</th>
                    <th className="py-2.5 px-3 font-semibold">Student Name</th>
                    <th className="py-2.5 px-3 font-semibold">College</th>
                    <th className="py-2.5 px-3 font-semibold">
                      Item Rented
                    </th>
                    <th className="py-2.5 px-3 font-semibold">Dates</th>
                    <th className="py-2.5 px-3 font-semibold text-right">
                      Rental Fee
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-right">
                      Late Fine
                    </th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myRentalHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#17172B]">
                        {h.bookingReference}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#17172B]">
                        {h.userName}
                      </td>
                      <td className="py-2.5 px-3">{h.collegeName}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#17172B]">
                        {h.productTitle}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {h.startDate} → {h.endDate}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right tabular-nums">
                        ₹{h.rentalAmount.toLocaleString('en-IN')}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-mono font-bold text-right tabular-nums ${
                          h.fineIncurred > 0 && !h.finePaid
                            ? 'text-red-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {h.fineIncurred > 0
                          ? `₹${h.fineIncurred} (${h.finePaid ? 'PAID' : 'DUE'})`
                          : '₹0'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#1F9D55]">
                        {h.status.replace(/_/g, ' ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CAMPUS PICKUP & QR HANDOVER TERMINAL */}
      {activeTab === 'qr_handover' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            {activeQrBooking ? (
              <>
                <p className="text-xs font-bold text-[#1F9D55] mb-1">
                  Booking {activeQrBooking.bookingReference} ·{' '}
                  {activeQrBooking.status.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-slate-600 mb-3">
                  Campus Landmark: <strong>{activeQrBooking.pickupLocation}</strong>
                </p>
                <BookingQrGraphic
                  code={
                    activeQrBooking.status === 'PICKED_UP_ACTIVE'
                      ? activeQrBooking.returnQrCode
                      : activeQrBooking.pickupQrCode
                  }
                  size={168}
                />
                <p className="mt-3 text-xs text-slate-600">
                  6-Digit Backup Handover PIN:{' '}
                  <span className="font-mono font-bold text-[#17172B] text-sm">
                    {activeQrBooking.handoverPin}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-500">
                No active bookings available for QR handover yet.
              </p>
            )}
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-[#17172B]">
              Campus Landmark QR Handover & Return Verification
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Meet at the agreed campus landmark and verify the booking QR code or 6-digit PIN below. Note: If the return countdown timer has expired, any overdue fine must be paid before the return QR can complete.
            </p>

            <div>
              <label
                htmlFor="qr-booking-selector"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                Select Booking Reference
              </label>
              <select
                id="qr-booking-selector"
                value={activeQrBooking?.id || ''}
                onChange={(e) => setSelectedQrBookingId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white font-mono"
              >
                {allUserBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bookingReference} — {b.productTitle.slice(0, 38)}... (
                    {b.status.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </div>

            {activeQrBooking && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label
                  htmlFor="qr-pin-verify-input"
                  className="block text-xs font-semibold text-[#17172B]"
                >
                  Enter 6-Digit Handover PIN or Scan QR String (Hint:{' '}
                  <span className="font-mono text-[#1F9D55]">
                    {activeQrBooking.handoverPin}
                  </span>
                  )
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    id="qr-pin-verify-input"
                    type="text"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder={`Enter PIN (${activeQrBooking.handoverPin}) or QR token`}
                    className="flex-1 min-w-[200px] px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleActionClick(
                        activeQrBooking.id,
                        'QR_PICKUP',
                        pinInput || activeQrBooking.handoverPin
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-[#17172B] text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Verify Pickup Handover
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleActionClick(
                        activeQrBooking.id,
                        'QR_RETURN',
                        pinInput || activeQrBooking.handoverPin
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-[#1F9D55] text-white text-xs font-semibold hover:bg-[#198B4A] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Verify Return & Complete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MY LISTED PRODUCTS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#17172B]">
              My Listed Campus Products ({myListedProducts.length})
            </h2>
            <button
              type="button"
              onClick={onOpenListModal}
              className="rentbase-btn-primary text-white text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Product & Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {myListedProducts.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <ProductVisual
                    photoKey={item.photos[0] || item.id}
                    category={item.category}
                    title={item.title}
                    className="w-full h-40"
                  />
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-slate-500">
                      {item.category} · Approval:{' '}
                      <span
                        className={
                          item.approvalStatus === 'APPROVED'
                            ? 'font-bold text-[#1F9D55]'
                            : 'font-bold text-amber-700'
                        }
                      >
                        {item.approvalStatus}
                      </span>
                    </p>
                    <h3 className="text-sm font-bold text-[#17172B]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pickup: {item.pickupLocation}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-mono text-sm font-extrabold text-[#17172B] tabular-nums">
                    ₹{item.dailyPrice}/day
                  </span>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    {item.viewsCount} campus views
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: WISHLIST & RENTAL REMINDERS */}
      {activeTab === 'wishlist' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-base font-bold text-[#17172B] flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Saved Campus Wishlist ({myWishlistProducts.length})</span>
            </h2>
            {myWishlistProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
                <Package className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">
                  Your wishlist is empty
                </p>
                <p className="text-xs text-slate-500">
                  Save cameras, calculators, or textbooks while exploring to book them before exams or fests.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myWishlistProducts.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs text-slate-500">
                        {item.collegeName} · {item.category}
                      </p>
                      <h3 className="text-sm font-bold text-[#17172B]">
                        {item.title}
                      </h3>
                      <p className="text-xs font-mono font-bold text-[#1F9D55] mt-0.5">
                        ₹{item.dailyPrice}/day · Deposit ₹{item.securityDeposit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectProductForBooking(item)}
                        className="rentbase-btn-primary text-white text-xs font-semibold px-3.5 py-2 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Book Now</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleWishlist(item.id)}
                        className="px-2.5 py-2 text-xs text-slate-500 hover:text-rose-600 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-base font-bold text-[#17172B] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1F9D55]" />
              <span>Automated Return Timer & Fine Alerts</span>
            </h2>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F4FBF7] border border-[#22A861]/25">
                <p className="font-bold text-[#17172B]">
                  Active Timer Reminder · Sony Alpha A7 IV
                </p>
                <p className="text-slate-600 mt-0.5">
                  Return at <strong>Student Activity Center (SAC), ADCET</strong> before countdown reaches 00:00:00 to avoid the ₹60/hr late penalty.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="font-bold text-red-900">
                  Overdue Alert · Raspberry Pi 5 Lab Kit
                </p>
                <p className="text-red-800 mt-0.5">
                  Return timer expired! Please settle the overdue fine in your Bookings tab to complete QR return at <strong>Central Library Foyer</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
