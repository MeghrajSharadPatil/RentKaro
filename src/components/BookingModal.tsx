import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  QrCode,
  Sparkles,
  Clock,
  Upload,
} from 'lucide-react';
import {
  calculateRentalQuote,
  hasDateOverlap,
  type ProductListing,
  type RentalBooking,
  type College,
  type UserProfile,
} from '../utils/rentalLogic';
import { ProductVisual, BookingQrGraphic } from './ProductVisual';

interface BookingModalProps {
  product: ProductListing;
  college: College;
  currentUser: UserProfile;
  existingBookings: RentalBooking[];
  onClose: () => void;
  onSubmitBooking: (payload: {
    productId: string;
    renterId: string;
    startDate: string;
    endDate: string;
    groupSize: number;
    groupMemberNames: string[];
    pickupLocation: string;
    returnTimerHours: number;
    renterItemPhotoDataUrl?: string;
  }) => Promise<RentalBooking | null>;
  onNavigateDashboard: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  product,
  college,
  currentUser,
  existingBookings,
  onClose,
  onSubmitBooking,
  onNavigateDashboard,
}) => {
  const [startDate, setStartDate] = useState('2026-11-20');
  const [endDate, setEndDate] = useState('2026-11-23');
  const [groupSize, setGroupSize] = useState(1);
  const [coRenterInput, setCoRenterInput] = useState('Devansh S., Kriti P.');
  const [pickupLocation, setPickupLocation] = useState(product.pickupLocation);
  const [returnTimerHours, setReturnTimerHours] = useState<number>(24);
  const [renterItemPhotoDataUrl, setRenterItemPhotoDataUrl] =
    useState<string>('');
  const [renterPhotoName, setRenterPhotoName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] =
    useState<RentalBooking | null>(null);

  const productBookings = useMemo(
    () => existingBookings.filter((b) => b.productId === product.id),
    [existingBookings, product.id]
  );

  const isOverlapping = useMemo(
    () => hasDateOverlap(productBookings, startDate, endDate),
    [productBookings, startDate, endDate]
  );

  const quoteResult = useMemo(() => {
    try {
      return {
        quote: calculateRentalQuote(
          product.dailyPrice,
          product.securityDeposit,
          startDate,
          endDate,
          groupSize
        ),
        error: null,
      };
    } catch (err) {
      return { quote: null, error: (err as Error).message };
    }
  }, [product.dailyPrice, product.securityDeposit, startDate, endDate, groupSize]);

  const handleRenterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRenterPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRenterItemPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (quoteResult.error || !quoteResult.quote) {
      setErrorMsg(quoteResult.error || 'Please select valid rental dates.');
      return;
    }

    if (isOverlapping) {
      setErrorMsg(
        'These dates overlap with an existing booking for this product. Please pick different dates.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const extraMembers =
        groupSize > 1
          ? coRenterInput
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
      const groupMemberNames = [currentUser.fullName, ...extraMembers].slice(
        0,
        groupSize
      );

      const created = await onSubmitBooking({
        productId: product.id,
        renterId: currentUser.id,
        startDate,
        endDate,
        groupSize,
        groupMemberNames,
        pickupLocation,
        returnTimerHours,
        renterItemPhotoDataUrl: renterItemPhotoDataUrl || undefined,
      });

      if (created) {
        setConfirmedBooking(created);
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Could not submit booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const landmarks = Array.from(
    new Set([product.pickupLocation, ...(college?.campusLandmarks || [])])
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {product.collegeName} · {product.category} · Condition: {product.condition}
            </p>
            <h2
              id="booking-modal-title"
              className="text-lg font-bold text-[#17172B] mt-0.5"
            >
              {confirmedBooking
                ? `Rental Active & Logged in History (${confirmedBooking.bookingReference})`
                : product.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking dialog"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBooking ? (
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-xl bg-[#E6F4EA] border border-[#22A861]/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1F9D55] shrink-0 mt-0.5" />
              <div className="text-sm text-[#17172B]">
                <p className="font-bold">
                  Rental Recorded in User Database & Return Countdown Timer Started!
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Reference{' '}
                  <span className="font-mono font-bold">
                    {confirmedBooking.bookingReference}
                  </span>{' '}
                  · Campus Pickup at{' '}
                  <span className="font-semibold">
                    {confirmedBooking.pickupLocation}
                  </span>
                  . Late returns after timer expiry incur a fine of ₹{confirmedBooking.fineRatePerHour}/hour.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-[#17172B] mb-2 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#1F9D55]" />
                  <span>Campus Return QR Token</span>
                </p>
                <BookingQrGraphic code={confirmedBooking.returnQrCode} />
                <p className="mt-2 text-xs text-slate-500">
                  6-Digit Handover PIN:{' '}
                  <span className="font-mono font-bold text-[#17172B]">
                    {confirmedBooking.handoverPin}
                  </span>
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <h3 className="font-bold text-[#17172B]">
                  Return Timer & Fine Policy
                </h3>
                <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside">
                  <li>
                    Your rental is stored in the <strong>Registered User Rental History Database</strong> and synced to the Excel sheet.
                  </li>
                  <li>
                    A live <strong>Return Countdown Timer</strong> is now ticking on your Student Dashboard.
                  </li>
                  <li>
                    If the item is not returned before the timer hits 00:00:00, an automatic overdue fine (₹100 base + ₹{confirmedBooking.fineRatePerHour}/hr) is applied and must be paid before return.
                  </li>
                </ol>

                <div className="pt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateDashboard();
                    }}
                    className="rentbase-btn-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
                  >
                    View Return Timer in Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <ProductVisual
                  photoKey={
                    renterItemPhotoDataUrl || product.photos[0] || product.id
                  }
                  category={product.category}
                  title={product.title}
                  className="w-full h-44 rounded-xl border border-slate-200/80"
                />

                {/* Option to upload photo of the item being rented */}
                <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#17172B] flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5 text-[#1F9D55]" />
                      <span>Upload Item Photo</span>
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {renterPhotoName || 'Attach photo of item you want to rent'}
                    </p>
                  </div>
                  <label
                    htmlFor="booking-item-photo-upload"
                    className="px-3 py-1.5 rounded-lg bg-[#17172B] text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer shrink-0"
                  >
                    Upload Photo
                  </label>
                  <input
                    id="booking-item-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleRenterPhotoUpload}
                    className="hidden"
                  />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.description}
                </p>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#17172B]">
                      Owner: {product.ownerName}
                    </span>
                    <span className="text-xs font-semibold text-[#1F9D55] inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Trust {product.ownerTrustScore}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {product.ownerDepartment} · {product.ownerYear} ·{' '}
                    {product.collegeName}
                  </p>
                </div>

                {product.isSeniorToJunior && (
                  <div className="p-3.5 rounded-xl bg-[#F4FBF7] border border-[#22A861]/30 text-xs space-y-1">
                    <p className="font-bold text-[#197A42] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Senior-to-Junior Academic Share</span>
                    </p>
                    <p className="text-slate-600">
                      Recommended for: {product.recommendedForSemesters}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="booking-start-date"
                      className="block text-xs font-semibold text-[#17172B] mb-1"
                    >
                      <Calendar className="w-3.5 h-3.5 inline mr-1 text-[#1F9D55]" />
                      Pickup Date
                    </label>
                    <input
                      id="booking-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="booking-end-date"
                      className="block text-xs font-semibold text-[#17172B] mb-1"
                    >
                      <Calendar className="w-3.5 h-3.5 inline mr-1 text-[#1F9D55]" />
                      Return Date
                    </label>
                    <input
                      id="booking-end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Return Countdown Timer Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="booking-pickup-landmark"
                      className="block text-xs font-semibold text-[#17172B] mb-1"
                    >
                      <MapPin className="w-3.5 h-3.5 inline mr-1 text-[#1F9D55]" />
                      Campus Pickup Landmark
                    </label>
                    <select
                      id="booking-pickup-landmark"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none bg-white"
                    >
                      {landmarks.map((lm) => (
                        <option key={lm} value={lm}>
                          {lm} ({product.collegeName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="booking-return-timer"
                      className="block text-xs font-semibold text-[#17172B] mb-1"
                    >
                      <Clock className="w-3.5 h-3.5 inline mr-1 text-[#1F9D55]" />
                      Return Countdown Timer Window
                    </label>
                    <select
                      id="booking-return-timer"
                      value={returnTimerHours}
                      onChange={(e) =>
                        setReturnTimerHours(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none bg-white font-mono"
                    >
                      <option value={24}>24 Hours Return Timer</option>
                      <option value={48}>48 Hours Return Timer</option>
                      <option value={72}>72 Hours Return Timer</option>
                      <option value={1}>1 Hour Express Return Timer</option>
                    </select>
                  </div>
                </div>

                {product.allowGroupRental && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="booking-group-size"
                        className="text-xs font-bold text-[#17172B] flex items-center gap-1.5"
                      >
                        <Users className="w-4 h-4 text-[#6C4CF1]" />
                        <span>Group Rental Cost-Split</span>
                      </label>
                      <select
                        id="booking-group-size"
                        value={groupSize}
                        onChange={(e) => setGroupSize(Number(e.target.value))}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white font-mono"
                      >
                        {Array.from(
                          { length: product.maxGroupMembers },
                          (_, i) => i + 1
                        ).map((num) => (
                          <option key={num} value={num}>
                            {num === 1
                              ? 'Solo Rental (1 Student)'
                              : `Split among ${num} Students`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {groupSize > 1 && (
                      <div>
                        <label
                          htmlFor="booking-co-renters"
                          className="block text-[11px] font-medium text-slate-600 mb-1"
                        >
                          Co-Renter Student Names (comma-separated)
                        </label>
                        <input
                          id="booking-co-renters"
                          type="text"
                          value={coRenterInput}
                          onChange={(e) => setCoRenterInput(e.target.value)}
                          placeholder="e.g. Rohan M., Priya S."
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    )}
                  </div>
                )}

                {quoteResult.quote && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>
                        Daily Rental (₹{product.dailyPrice}/day ×{' '}
                        {quoteResult.quote.totalDays}{' '}
                        {quoteResult.quote.totalDays === 1 ? 'day' : 'days'})
                      </span>
                      <span className="font-mono font-semibold text-[#17172B] tabular-nums">
                        ₹{quoteResult.quote.rentalSubtotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {quoteResult.quote.discountAmount > 0 && (
                      <div className="flex justify-between text-[#1F9D55] font-medium">
                        <span>
                          Multi-Day Campus Discount ({quoteResult.quote.discountPercent}% off)
                        </span>
                        <span className="font-mono tabular-nums">
                          - ₹{quoteResult.quote.discountAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>Campus Damage & Trust Protection Fee (5%)</span>
                      <span className="font-mono tabular-nums">
                        ₹{quoteResult.quote.protectionFee.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Refundable Security Deposit</span>
                      <span className="font-mono font-semibold text-[#17172B] tabular-nums">
                        ₹{quoteResult.quote.securityDeposit.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm font-bold text-[#17172B]">
                      <span>Total Payable (Incl. Refundable Deposit)</span>
                      <span className="font-mono text-base tabular-nums">
                        ₹{quoteResult.quote.totalPayable.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}

                {(isOverlapping || errorMsg || quoteResult.error) && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      {errorMsg ||
                        quoteResult.error ||
                        'Selected dates overlap with an existing active booking.'}
                    </span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      submitting || isOverlapping || Boolean(quoteResult.error)
                    }
                    className="rentbase-btn-primary disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {submitting
                      ? 'Starting Rental & Timer...'
                      : 'Confirm Rental & Start Return Timer'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
