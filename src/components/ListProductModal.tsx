import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  MapPin,
  Users,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import {
  RENTAL_CATEGORIES,
  suggestSmartRentalPrice,
  type RentalCategory,
  type ProductCondition,
  type College,
  type UserProfile,
  type ProductListing,
} from '../utils/rentalLogic';

interface ListProductModalProps {
  colleges: College[];
  selectedCollegeId: string;
  currentUser: UserProfile;
  onClose: () => void;
  onCreateListing: (payload: Record<string, unknown>) => Promise<ProductListing | null>;
}

export const ListProductModal: React.FC<ListProductModalProps> = ({
  colleges,
  selectedCollegeId,
  currentUser,
  onClose,
  onCreateListing,
}) => {
  const activeCollege =
    colleges.find((c) => c.id === selectedCollegeId) || colleges[0];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RentalCategory>(
    'Engineering Lab Equipment'
  );
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState<ProductCondition>('Like New');
  const [marketRetailValue, setMarketRetailValue] = useState<number>(8500);
  const [dailyPrice, setDailyPrice] = useState<number>(180);
  const [securityDeposit, setSecurityDeposit] = useState<number>(1200);
  const [collegeId, setCollegeId] = useState<string>(activeCollege.id);
  const [pickupLocation, setPickupLocation] = useState<string>(
    activeCollege.campusLandmarks[0] || 'Central Library Foyer'
  );
  const [description, setDescription] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isSeniorToJunior, setIsSeniorToJunior] = useState(true);
  const [seniorSalePrice, setSeniorSalePrice] = useState<number>(3800);
  const [recommendedForSemesters, setRecommendedForSemesters] = useState(
    'Sem 3 & Sem 4 Lab / Project Evaluations'
  );
  const [allowGroupRental, setAllowGroupRental] = useState(true);
  const [maxGroupMembers, setMaxGroupMembers] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedCollegeObj =
    colleges.find((c) => c.id === collegeId) || activeCollege;

  const smartSuggestion = useMemo(
    () => suggestSmartRentalPrice(category, condition, marketRetailValue),
    [category, condition, marketRetailValue]
  );

  const handleApplySmartPrice = () => {
    setDailyPrice(smartSuggestion.recommendedDaily);
    setSecurityDeposit(smartSuggestion.recommendedDeposit);
  };

  const handleCollegeChange = (newColId: string) => {
    setCollegeId(newColId);
    const found = colleges.find((c) => c.id === newColId);
    if (found && found.campusLandmarks.length > 0) {
      setPickupLocation(found.campusLandmarks[0]);
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSamplePhoto = () => {
    // Creates a clean SVG data URL photo for instant testing if user doesn't pick a local disk file
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#D9F2E6"/>
          <stop offset="100%" stop-color="#E6F0FA"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#bg)"/>
      <rect x="150" y="75" width="300" height="210" rx="24" fill="#17172B"/>
      <circle cx="300" cy="180" r="56" fill="#22A861"/>
      <circle cx="300" cy="180" r="26" fill="#FFFFFF"/>
      <text x="300" y="335" font-family="sans-serif" font-size="22" font-weight="bold" fill="#17172B" text-anchor="middle">${(title || category).slice(0, 28)}</text>
      <text x="300" y="362" font-family="monospace" font-size="14" fill="#1F9D55" text-anchor="middle">Uploaded Campus Item Photo · ${selectedCollegeObj.shortName}</text>
    </svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setPhotoDataUrl(dataUrl);
    setUploadedFileName('Campus_Equipment_Photo.svg');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please enter a product title.');
      return;
    }
    if (dailyPrice <= 0) {
      setErrorMsg('Daily rental price must be greater than ₹0.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await onCreateListing({
        title,
        description,
        category,
        brand: brand || 'Campus Verified',
        condition,
        dailyPrice,
        securityDeposit,
        marketRetailValue,
        collegeId,
        pickupLocation,
        ownerId: currentUser.id,
        photoDataUrl: photoDataUrl || undefined,
        isSeniorToJunior,
        seniorSalePrice: isSeniorToJunior ? seniorSalePrice : undefined,
        recommendedForSemesters: isSeniorToJunior
          ? recommendedForSemesters
          : undefined,
        allowGroupRental,
        maxGroupMembers,
      });

      if (created) {
        onClose();
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Failed to publish listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="list-product-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <p className="text-xs font-medium text-[#1F9D55]">
              List Unused Campus Gear · Upload Item Photo · Earn Every Semester
            </p>
            <h2
              id="list-product-modal-title"
              className="text-lg font-bold text-[#17172B]"
            >
              List Your Product on {selectedCollegeObj.shortName} Marketplace
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close list product dialog"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Photo Upload Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label
                  htmlFor="item-photo-upload"
                  className="text-xs font-bold text-[#17172B] flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#1F9D55]" />
                  <span>Upload Photo of Item for Rent (JPG, PNG, WebP)</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Students see your actual uploaded item photo on the marketplace card.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="item-photo-upload"
                  className="px-3.5 py-2 rounded-lg bg-[#17172B] text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                >
                  Choose Image File
                </label>
                <input
                  id="item-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleGenerateSamplePhoto}
                  className="px-3 py-2 rounded-lg bg-[#E6F4EA] text-[#197A42] text-xs font-semibold hover:bg-[#D4EDE0] cursor-pointer whitespace-nowrap"
                >
                  Use Sample Camera Photo
                </button>
              </div>
            </div>

            {photoDataUrl && (
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                <img
                  src={photoDataUrl}
                  alt="Uploaded item preview"
                  className="w-20 h-14 object-cover rounded-lg border border-slate-300"
                />
                <div className="text-xs">
                  <p className="font-bold text-[#1F9D55] flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photo Ready: {uploadedFileName || 'Uploaded Image'}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoDataUrl('');
                      setUploadedFileName('');
                    }}
                    className="text-[11px] text-rose-600 hover:underline mt-0.5 cursor-pointer"
                  >
                    Remove photo
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="listing-title-input"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                Product Title *
              </label>
              <input
                id="listing-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. STM32 Nucleo Board + Logic Analyzer Kit / Sony ZV-E10 Camera"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="listing-category-select"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                Rental Category *
              </label>
              <select
                id="listing-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as RentalCategory)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none bg-white"
              >
                {RENTAL_CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="listing-brand-input"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                Brand / Publisher
              </label>
              <input
                id="listing-brand-input"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Casio, Sony, Texas Instruments, Apple"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="listing-condition-select"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                Product Condition
              </label>
              <select
                id="listing-condition-select"
                value={condition}
                onChange={(e) =>
                  setCondition(e.target.value as ProductCondition)
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none bg-white"
              >
                <option value="Like New">Like New (Mint)</option>
                <option value="Good">Good (Well Maintained)</option>
                <option value="Fair">Fair (Functional)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="listing-retail-input"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                Approx. Market Value (₹) for Smart Pricing
              </label>
              <input
                id="listing-retail-input"
                type="number"
                min={200}
                value={marketRetailValue}
                onChange={(e) => setMarketRetailValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Smart Rental Price Recommendation Banner */}
          <div className="p-3.5 rounded-xl bg-[#F4FBF7] border border-[#22A861]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#197A42] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>
                  Smart Campus Price Suggestion: ₹{smartSuggestion.recommendedDaily}/day
                  (Range ₹{smartSuggestion.minDaily}–₹{smartSuggestion.maxDaily}) · Deposit ₹
                  {smartSuggestion.recommendedDeposit}
                </span>
              </p>
              <p className="text-[11px] text-slate-600">
                {smartSuggestion.rationale}
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplySmartPrice}
              className="px-3.5 py-2 rounded-lg bg-[#1F9D55] text-white text-xs font-semibold hover:bg-[#198B4A] cursor-pointer whitespace-nowrap shrink-0"
            >
              Apply Smart Price
            </button>
          </div>

          {/* Daily Price, Deposit, College & Campus Pickup Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="listing-daily-price"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                Daily Rental Price (₹ / day) *
              </label>
              <input
                id="listing-daily-price"
                type="number"
                min={10}
                required
                value={dailyPrice}
                onChange={(e) => setDailyPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label
                htmlFor="listing-deposit"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                Refundable Security Deposit (₹) *
              </label>
              <input
                id="listing-deposit"
                type="number"
                min={0}
                required
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label
                htmlFor="listing-college-select"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                College Marketplace
              </label>
              <select
                id="listing-college-select"
                value={collegeId}
                onChange={(e) => handleCollegeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none bg-white"
              >
                {colleges.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="listing-pickup-select"
                className="block text-xs font-semibold text-[#17172B] mb-1"
              >
                <MapPin className="w-3.5 h-3.5 inline mr-1 text-[#1F9D55]" />
                Campus Pickup Point (Landmark)
              </label>
              <select
                id="listing-pickup-select"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none bg-white"
              >
                {selectedCollegeObj.campusLandmarks.map((lm) => (
                  <option key={lm} value={lm}>
                    {lm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="listing-description"
              className="block text-xs font-semibold text-[#17172B] mb-1"
            >
              Description & Included Accessories
            </label>
            <textarea
              id="listing-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Include model specs, cables/chargers included, and ideal courses or campus events..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-[#22A861] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-[#17172B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSeniorToJunior}
                  onChange={(e) => setIsSeniorToJunior(e.target.checked)}
                  className="rounded text-[#1F9D55] focus:ring-[#1F9D55]"
                />
                <GraduationCap className="w-4 h-4 text-[#1F9D55]" />
                <span>Senior-to-Junior Academic Share</span>
              </label>
              {isSeniorToJunior && (
                <div className="space-y-1.5 pl-6">
                  <input
                    type="text"
                    value={recommendedForSemesters}
                    onChange={(e) => setRecommendedForSemesters(e.target.value)}
                    placeholder="Recommended semesters"
                    aria-label="Recommended semesters for juniors"
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      Optional Buyout ₹:
                    </span>
                    <input
                      type="number"
                      value={seniorSalePrice}
                      onChange={(e) =>
                        setSeniorSalePrice(Number(e.target.value))
                      }
                      aria-label="Optional senior-to-junior buyout price"
                      className="w-24 px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-[#17172B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowGroupRental}
                  onChange={(e) => setAllowGroupRental(e.target.checked)}
                  className="rounded text-[#6C4CF1] focus:ring-[#6C4CF1]"
                />
                <Users className="w-4 h-4 text-[#6C4CF1]" />
                <span>Allow Group Rental Cost Split</span>
              </label>
              {allowGroupRental && (
                <div className="pl-6 flex items-center gap-2">
                  <span className="text-[11px] text-slate-600">
                    Max Students Splitting:
                  </span>
                  <select
                    value={maxGroupMembers}
                    onChange={(e) => setMaxGroupMembers(Number(e.target.value))}
                    aria-label="Maximum students in group rental"
                    className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white font-mono"
                  >
                    {[2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} Students
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1F9D55]" />
              Listing goes live immediately on {selectedCollegeObj.shortName}
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer whitespace-nowrap shrink-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rentbase-btn-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
              >
                {submitting ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
