import React from 'react';
import {
  Search,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Bell,
  Star,
  MapPin,
  PlusCircle,
  Building2,
} from 'lucide-react';
import {
  RENTAL_CATEGORIES,
  type College,
  type RentalCategory,
  type UserProfile,
  type MarketplaceMode,
} from '../utils/rentalLogic';

interface HeroShowcaseProps {
  colleges: College[];
  selectedCollegeId: string;
  onSelectCollege: (collegeId: string) => void;
  selectedCategory: RentalCategory | 'ALL';
  onSelectCategory: (cat: RentalCategory | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onTriggerExplore: () => void;
  onOpenListModal: () => void;
  onOpenAddCollegeModal: () => void;
  onOpenDashboard: () => void;
  currentUser: UserProfile;
  marketplaceMode: MarketplaceMode;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  colleges,
  selectedCollegeId,
  onSelectCollege,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onTriggerExplore,
  onOpenListModal,
  onOpenAddCollegeModal,
  onOpenDashboard,
  currentUser,
  marketplaceMode,
}) => {
  const activeCollege =
    colleges.find((c) => c.id === selectedCollegeId) || colleges[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerExplore();
  };

  return (
    <section className="rentbase-hero-bg pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-950/10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto pt-4 sm:pt-8">
          <p className="text-xs sm:text-sm font-semibold text-[#197A42] tracking-tight mb-3">
            Eco-Friendly Campus Community · {activeCollege.shortName} ·{' '}
            {marketplaceMode === 'COLLEGE_MODE'
              ? 'College-Only Mode'
              : marketplaceMode === 'CITY_MODE'
              ? `${activeCollege.cityName} City-Wide Mode`
              : 'All-India Multi-City Mode'}
          </p>

          <h1
            className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#17172B] tracking-tight leading-[1.08]"
            style={{ textWrap: 'balance' }}
          >
            Why Buy When You Can Borrow?
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Your campus is full of things you need. Rent from fellow students at{' '}
            <span className="font-semibold text-[#17172B]">
              {activeCollege.shortName}
            </span>
            , save money and earn from products you don’t use.
          </p>

          {/* CTA Buttons */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onTriggerExplore}
              className="rentbase-btn-primary text-white font-semibold text-sm sm:text-base px-6 py-3 rounded-full inline-flex items-center gap-2 transition-transform duration-150 active:scale-98 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Start Renting</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenListModal}
              className="rentbase-btn-secondary font-semibold text-sm sm:text-base px-6 py-3 rounded-full inline-flex items-center gap-2 transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List & Upload Item Photo</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddCollegeModal}
              className="bg-white/90 hover:bg-white text-[#17172B] border border-slate-200 font-semibold text-sm sm:text-base px-5 py-3 rounded-full inline-flex items-center gap-2 shadow-xs transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Building2 className="w-4 h-4 text-[#1F9D55]" />
              <span>+ Add College</span>
            </button>
          </div>
        </div>

        {/* Campus Search, College & Category Bar */}
        <form
          onSubmit={handleSearchSubmit}
          aria-label="Search campus rental products"
          className="mt-8 max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl p-2.5 shadow-lg shadow-emerald-950/5 border border-emerald-900/10 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
        >
          <div className="sm:col-span-5 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50/80 border border-transparent focus-within:border-[#22A861] focus-within:bg-white transition-colors">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="w-full">
              <label
                htmlFor="hero-product-search"
                className="block text-[10px] font-semibold text-slate-400"
              >
                Search Campus Gear
              </label>
              <input
                id="hero-product-search"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Camera, Casio FX-991CW, Raspberry Pi..."
                className="w-full text-sm text-[#17172B] placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="sm:col-span-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50/80 border border-transparent focus-within:border-[#22A861] focus-within:bg-white">
            <MapPin className="w-4 h-4 text-[#1F9D55] shrink-0" />
            <div className="w-full min-w-0">
              <label
                htmlFor="hero-college-select"
                className="block text-[10px] font-semibold text-slate-400"
              >
                Campus Marketplace ({colleges.length})
              </label>
              <select
                id="hero-college-select"
                value={selectedCollegeId}
                onChange={(e) => onSelectCollege(e.target.value)}
                className="w-full text-sm font-semibold text-[#17172B] bg-transparent focus:outline-none truncate cursor-pointer"
              >
                {colleges.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.shortName} ({col.cityName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-50/80 border border-transparent focus-within:border-[#22A861] focus-within:bg-white">
            <label
              htmlFor="hero-category-select"
              className="block text-[10px] font-semibold text-slate-400"
            >
              Category
            </label>
            <select
              id="hero-category-select"
              value={selectedCategory}
              onChange={(e) =>
                onSelectCategory(e.target.value as RentalCategory | 'ALL')
              }
              className="w-full text-sm font-medium text-[#17172B] bg-transparent focus:outline-none truncate cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {RENTAL_CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.shortLabel}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full min-h-[46px] rentbase-btn-primary text-white text-sm font-semibold rounded-xl px-4 py-2.5 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Reference-Matched Layered Visual Showcase Deck */}
        <div className="mt-12 relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Left Wing */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl p-3.5 shadow-md border border-emerald-950/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#17172B]">
                    Camera Rented! · SAC Pickup
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Sony Alpha A7 IV · {activeCollege.shortName}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-[#1F9D55] tabular-nums">
                  + ₹1,350 Earned
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-md border border-emerald-950/5 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] text-[#1F9D55] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#17172B]">
                    Verification Complete
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    Trusted Campus Member · {activeCollege.shortName} ID Verified
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-md border border-emerald-950/5">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-500 tracking-wide">
                    Live Campus Rental Requests
                  </span>
                  <button
                    type="button"
                    onClick={onOpenDashboard}
                    className="text-xs font-semibold text-[#1F9D55] hover:underline cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#17172B] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        AK
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#17172B] truncate">
                          Ananya K. · 4th Yr EE
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          Sony A7IV Camera · Return Timer Active
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#1F9D55] shrink-0">
                      QR Ready
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#6C4CF1] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        RD
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#17172B] truncate">
                          Rohan D. · 2nd Yr Mech
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          Raspberry Pi 5 Lab Kit · Nov 15–18
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-700 shrink-0">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Centerpiece iPhone Frame */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full max-w-[340px] bg-[#17172B] rounded-[38px] p-3 shadow-2xl border-4 border-slate-800">
                <div className="w-28 h-4 bg-black rounded-full mx-auto mb-2.5" />
                <div className="bg-white rounded-[28px] p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#E6F4EA] text-[#1F9D55] font-bold text-xs flex items-center justify-center">
                        {currentUser.avatarUrl}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#17172B]">
                          Hey, {currentUser.fullName.split(' ')[0]}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {activeCollege.shortName} Dashboard
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenDashboard}
                      aria-label="Open student notifications and dashboard"
                      className="text-xs font-bold text-[#1F9D55] flex items-center gap-1 cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>RentKaro</span>
                    </button>
                  </div>

                  <div className="rounded-2xl p-4 text-white bg-gradient-to-br from-[#2CC06E] via-[#22A861] to-[#178546] shadow-md">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-50">
                      This Month Campus Earnings
                    </p>
                    <p className="mt-1 text-3xl font-extrabold font-mono tabular-nums">
                      ₹{(currentUser.walletEarnings || 8400).toLocaleString('en-IN')}
                    </p>
                    <p className="mt-1 text-xs text-emerald-50 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+18% vs last semester month</span>
                    </p>

                    <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-sm font-bold font-mono tabular-nums">
                          7
                        </p>
                        <p className="text-[10px] text-emerald-100">Active</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold font-mono tabular-nums">
                          4
                        </p>
                        <p className="text-[10px] text-emerald-100">Pending</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold font-mono tabular-nums inline-flex items-center gap-0.5">
                          <span>4.9</span>
                          <Star className="w-3 h-3 fill-current" />
                        </p>
                        <p className="text-[10px] text-emerald-100">Trust</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div>
                      <p className="text-xs font-bold text-[#17172B]">
                        Next Campus Handover
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {activeCollege.campusLandmarks[0]} · QR & Timer Active
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenDashboard}
                      className="px-3 py-1.5 rounded-lg bg-[#17172B] text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Open QR
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Wing */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-md border border-emerald-950/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Total Earned by Top Senior
                  </p>
                  <p className="text-2xl font-extrabold text-[#17172B] font-mono tabular-nums mt-0.5">
                    ₹14,300
                  </p>
                </div>
                <span className="text-xs font-bold text-[#1F9D55] font-mono tabular-nums">
                  +38% MoM
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-md border border-emerald-950/5 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#F4FBF7]">
                  <p className="text-[11px] font-medium text-slate-500">
                    Avg Savings / Sem
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-[#17172B] font-mono tabular-nums">
                    ₹6,450
                  </p>
                  <p className="text-[11px] text-[#1F9D55] font-medium mt-0.5">
                    vs buying new
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F4FBF7]">
                  <p className="text-[11px] font-medium text-slate-500">
                    Active Rentals
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-[#17172B] font-mono tabular-nums">
                    {activeCollege.activeListingsCount}
                  </p>
                  <p className="text-[11px] text-[#1F9D55] font-medium mt-0.5">
                    in {activeCollege.shortName}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50">
                  <p className="text-[11px] font-medium text-slate-500">
                    Verified Students
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-[#17172B] font-mono tabular-nums">
                    {activeCollege.verifiedStudentsCount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Campus Verified
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50">
                  <p className="text-[11px] font-medium text-slate-500">
                    Campus Pickups
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-[#17172B] font-mono tabular-nums">
                    {activeCollege.campusLandmarks.length} Zones
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Zero Private Address
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
