/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Laptop,
  Cpu,
  Calculator,
  BookOpen,
  Camera,
  Trophy,
  Speaker,
  Sparkles,
  Music,
  Compass,
  Armchair,
  Heart,
  MapPin,
  Star,
  Users,
  GraduationCap,
  PlusCircle,
  SlidersHorizontal,
  Menu,
  X,
  CheckCircle2,
} from 'lucide-react';
import {
  RENTAL_CATEGORIES,
  filterDiscoverableListings,
  type College,
  type UserProfile,
  type ProductListing,
  type RentalBooking,
  type CampusComplaint,
  type MarketplaceMode,
  type RentalCategory,
  type ProductCondition,
  type DiscoveryFilterOptions,
  type UserRentalHistoryEntry,
} from './utils/rentalLogic';
import {
  INITIAL_COLLEGES,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_BOOKINGS,
  INITIAL_COMPLAINTS,
  INITIAL_RENTAL_HISTORY,
} from './data/seedData';
import { HeroShowcase } from './components/HeroShowcase';
import { ProductVisual } from './components/ProductVisual';
import { BookingModal } from './components/BookingModal';
import { ListProductModal } from './components/ListProductModal';
import { StudentDashboard } from './components/StudentDashboard';
import {
  CollegeAdminView,
  AuthAndRoleModal,
  AddCollegeModal,
} from './components/AdminAndModePanels';

const CATEGORY_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Laptop,
  Cpu,
  Calculator,
  BookOpen,
  Camera,
  Trophy,
  Speaker,
  Sparkles,
  Music,
  Compass,
  Armchair,
};

export default function App() {
  // Platform state hydrated from Express backend (/api/state) with deterministic initial seed fallback
  const [marketplaceMode, setMarketplaceMode] =
    useState<MarketplaceMode>('COLLEGE_MODE');
  const [colleges, setColleges] = useState<College[]>(INITIAL_COLLEGES);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [products, setProducts] = useState<ProductListing[]>(INITIAL_PRODUCTS);
  const [bookings, setBookings] = useState<RentalBooking[]>(INITIAL_BOOKINGS);
  const [complaints, setComplaints] =
    useState<CampusComplaint[]>(INITIAL_COMPLAINTS);
  const [rentalHistory, setRentalHistory] = useState<UserRentalHistoryEntry[]>(
    INITIAL_RENTAL_HISTORY
  );

  const [currentUserId, setCurrentUserId] = useState<string>('u-student-1');
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<
    'home' | 'dashboard' | 'admin'
  >('home');

  // Discovery Filter State — defaults to ADCET (Annasaheb Dange College of Engineering & Technology, Ashta)
  const [selectedCollegeId, setSelectedCollegeId] =
    useState<string>('col-adcet');
  const [scope, setScope] =
    useState<DiscoveryFilterOptions['scope']>('same_college');
  const [selectedCategory, setSelectedCategory] = useState<
    RentalCategory | 'ALL'
  >('ALL');
  const [selectedCondition, setSelectedCondition] = useState<
    ProductCondition | 'ALL'
  >('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [seniorToJuniorOnly, setSeniorToJuniorOnly] = useState<boolean>(false);
  const [groupRentalOnly, setGroupRentalOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] =
    useState<DiscoveryFilterOptions['sortBy']>('recommended');

  // Modals & UI drawers
  const [bookingModalProduct, setBookingModalProduct] =
    useState<ProductListing | null>(null);
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAddCollegeModalOpen, setIsAddCollegeModalOpen] =
    useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const marketplaceGridRef = useRef<HTMLDivElement | null>(null);
  const categoriesSectionRef = useRef<HTMLDivElement | null>(null);
  const collegesSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeView]);

  useEffect(() => {
    fetch('/api/state')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.colleges) {
          setMarketplaceMode(data.marketplaceMode);
          setColleges(data.colleges);
          setUsers(data.users);
          setProducts(data.products);
          setBookings(data.bookings);
          setComplaints(data.complaints);
          if (data.rentalHistory) {
            setRentalHistory(data.rentalHistory);
          }
        }
      })
      .catch(() => {
        // Fallback to local seed state if offline
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const requireSignInForAction = (actionLabel: string): boolean => {
    if (!isSignedIn) {
      setIsAuthModalOpen(true);
      showToast(
        `Sign in is compulsory to ${actionLabel}. Please sign in with your name, email, and password first.`
      );
      return false;
    }
    return true;
  };

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || users[0],
    [users, currentUserId]
  );

  const selectedCollege = useMemo(
    () => colleges.find((c) => c.id === selectedCollegeId) || colleges[0],
    [colleges, selectedCollegeId]
  );

  const filteredListings = useMemo(
    () =>
      filterDiscoverableListings(
        products,
        {
          selectedCollegeId,
          selectedCityId: selectedCollege.cityId,
          scope,
          category: selectedCategory,
          condition: selectedCondition,
          maxPrice,
          onlyAvailable,
          seniorToJuniorOnly,
          groupRentalOnly,
          searchQuery,
          sortBy,
        },
        marketplaceMode,
        colleges
      ),
    [
      products,
      selectedCollegeId,
      selectedCollege.cityId,
      scope,
      selectedCategory,
      selectedCondition,
      maxPrice,
      onlyAvailable,
      seniorToJuniorOnly,
      groupRentalOnly,
      searchQuery,
      sortBy,
      marketplaceMode,
      colleges,
    ]
  );

  const syncServerState = (state: {
    marketplaceMode: MarketplaceMode;
    colleges: College[];
    users: UserProfile[];
    products: ProductListing[];
    bookings: RentalBooking[];
    complaints: CampusComplaint[];
    rentalHistory?: UserRentalHistoryEntry[];
  }) => {
    setMarketplaceMode(state.marketplaceMode);
    setColleges(state.colleges);
    setUsers(state.users);
    setProducts(state.products);
    setBookings(state.bookings);
    setComplaints(state.complaints);
    if (state.rentalHistory) {
      setRentalHistory(state.rentalHistory);
    }
  };

  const handleSelectCollegeWithVerification = async (targetColId: string) => {
    const col = colleges.find((c) => c.id === targetColId);
    if (!col) return;

    if (
      currentUser.role === 'STUDENT' &&
      !currentUser.authorizedCollegeIds.includes(targetColId)
    ) {
      if (currentUser.verificationStatus !== 'VERIFIED') {
        showToast(
          'Verify your home college ID first before unlocking cross-campus marketplaces.'
        );
        return;
      }
      // Authorize verified student for participating college
      try {
        const res = await fetch(
          `/api/users/${currentUser.id}/authorize-college`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetCollegeId: targetColId }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          syncServerState(data.state);
        }
      } catch {
        // Local update fallback
      }
    }
    setSelectedCollegeId(targetColId);
    setScope('same_college');
    showToast(`Switched active campus marketplace to ${col.shortName}`);
  };

  const handleAddCollege = async (payload: {
    name: string;
    shortName: string;
    cityName: string;
    state: string;
    emailDomain: string;
    landmarksInput: string;
  }) => {
    const res = await fetch('/api/colleges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to add college.');
    }
    syncServerState(data.state);
    setSelectedCollegeId(data.college.id);
    setScope('same_college');
    setSelectedCategory('ALL');
    setSearchQuery('');
    showToast(
      `Added ${data.college.name}! Showing all ${data.addedProducts?.length || 3} campus equipment items.`
    );
    scrollToSection(marketplaceGridRef);
  };

  const handleCreateListing = async (
    payload: Record<string, unknown>
  ): Promise<ProductListing | null> => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Could not publish listing.');
    }
    syncServerState(data.state);
    setSelectedCollegeId(data.product.collegeId);
    showToast(`Listing "${data.product.title}" with photo published to ${data.product.collegeName}!`);
    return data.product;
  };

  const handleCreateBooking = async (payload: {
    productId: string;
    renterId: string;
    startDate: string;
    endDate: string;
    groupSize: number;
    groupMemberNames: string[];
    pickupLocation: string;
    returnTimerHours?: number;
    renterUploadedPhotoUrl?: string;
  }): Promise<RentalBooking | null> => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Booking failed.');
    }
    syncServerState(data.state);
    showToast(
      `Booking ${data.booking.bookingReference} logged to database with Return Timer!`
    );
    return data.booking;
  };

  const handleBookingStatusAction = async (
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
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, scannedCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error };
      }
      syncServerState(data.state);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, productId }),
      });
      if (res.ok) {
        const data = await res.json();
        syncServerState(data.state);
      }
    } catch {
      // Ignore network error
    }
  };

  const handleSignInUser = async (payload: {
    email: string;
    password?: string;
    fullName?: string;
    collegeId?: string;
  }): Promise<UserProfile | null> => {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Sign in failed.');
    }
    syncServerState(data.state);
    setCurrentUserId(data.user.id);
    setSelectedCollegeId(data.user.collegeId);
    setIsSignedIn(true);
    showToast(
      `Signed in as ${data.user.fullName}! You can now rent and list campus equipment.`
    );
    return data.user;
  };

  const handleRegisterUser = async (
    payload: Record<string, unknown>
  ): Promise<UserProfile | null> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }
    syncServerState(data.state);
    setCurrentUserId(data.user.id);
    setSelectedCollegeId(data.user.collegeId);
    setIsSignedIn(true);
    showToast(
      `Welcome ${data.user.fullName}! Account registered and signed in.`
    );
    return data.user;
  };

  const handleVerifyStudent = async (
    targetUserId: string,
    status: 'VERIFIED' | 'REJECTED'
  ) => {
    const res = await fetch(`/api/admin/verify-user/${targetUserId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUserId: currentUser.id, status }),
    });
    if (res.ok) {
      const data = await res.json();
      syncServerState(data.state);
      showToast(`Student verification status updated to ${status}.`);
    }
  };

  const handleModerateListing = async (
    listingId: string,
    approvalStatus: 'APPROVED' | 'REJECTED'
  ) => {
    const res = await fetch(`/api/admin/approve-listing/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUserId: currentUser.id, approvalStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      syncServerState(data.state);
      showToast(`Product listing marked as ${approvalStatus}.`);
    }
  };

  const handleResolveComplaint = async (complaintId: string) => {
    const res = await fetch(`/api/admin/complaints/${complaintId}`, {
      method: 'PATCH',
    });
    if (res.ok) {
      const data = await res.json();
      syncServerState(data.state);
      showToast('Campus complaint marked as resolved.');
    }
  };

  const handleSwitchMarketplaceMode = async (mode: MarketplaceMode) => {
    const res = await fetch('/api/super-admin/mode', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    if (res.ok) {
      const data = await res.json();
      syncServerState(data.state);
      if (mode === 'CITY_MODE') {
        setScope('city_wide');
      } else if (mode === 'MULTI_CITY_MODE') {
        setScope('all_locations');
      } else {
        setScope('same_college');
      }
      showToast(`Platform switched to ${mode.replace(/_/g, ' ')}!`);
    }
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    setActiveView('home');
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#17172B]">
      {/* Sticky Floating Pill Top Navigation Bar (Strict 3-Zone Contract + Reference Aesthetic) */}
      <div className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 pt-3 pb-2 bg-[#E3F3F7]/85 backdrop-blur-md">
        <header className="max-w-7xl mx-auto bg-white/95 rounded-full px-5 py-2.5 shadow-sm border border-emerald-950/10 flex items-center justify-between gap-8">
          {/* Zone 1: Single Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-[#17172B] whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 rounded-xl bg-[#22A861] text-white font-extrabold text-base inline-flex items-center justify-center shadow-xs">
              R
            </span>
            <span>RentKaro</span>
          </a>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={() => scrollToSection(marketplaceGridRef)}
              className={`hover:text-[#17172B] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'home' ? 'text-[#17172B] font-semibold' : ''
              }`}
            >
              Explore
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(categoriesSectionRef)}
              className="hover:text-[#17172B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Categories
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(collegesSectionRef)}
              className="hover:text-[#17172B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Colleges
            </button>
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className={`hover:text-[#17172B] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'dashboard'
                  ? 'text-[#1F9D55] font-bold underline underline-offset-4'
                  : ''
              }`}
            >
              Dashboard & Timer
            </button>
            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className={`hover:text-[#17172B] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'admin'
                  ? 'text-[#1F9D55] font-bold underline underline-offset-4'
                  : ''
              }`}
            >
              Admin & Modes
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action Button (+ Mobile Menu Toggle) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="rentbase-btn-primary text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isSignedIn ? currentUser.fullName : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile navigation menu"
              className="md:hidden p-2 rounded-full text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        {/* Responsive Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 max-w-7xl mx-auto bg-white rounded-2xl p-4 shadow-lg border border-slate-200 flex flex-col gap-2.5 text-sm font-semibold">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToSection(marketplaceGridRef);
              }}
              className="text-left py-2 px-3 rounded-xl hover:bg-slate-50"
            >
              Explore Marketplace
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToSection(categoriesSectionRef);
              }}
              className="text-left py-2 px-3 rounded-xl hover:bg-slate-50"
            >
              College Categories
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToSection(collegesSectionRef);
              }}
              className="text-left py-2 px-3 rounded-xl hover:bg-slate-50"
            >
              Participating Colleges
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveView('dashboard');
              }}
              className="text-left py-2 px-3 rounded-xl hover:bg-slate-50 text-[#1F9D55]"
            >
              Dashboard, Return Timer & History DB
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveView('admin');
              }}
              className="text-left py-2 px-3 rounded-xl hover:bg-slate-50"
            >
              College Admin & City Expansion Modes
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (!requireSignInForAction('list a product for rent')) return;
                setIsListModalOpen(true);
              }}
              className="rentbase-btn-primary text-white text-center py-2.5 px-4 rounded-xl"
            >
              + List & Upload Item Photo
            </button>
          </div>
        )}
      </div>

      {/* Sub-Header Campus Context, Add College & Expansion Mode Toolbar */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600">
            <span className="font-semibold text-[#17172B]">
              Active Campus: {selectedCollege.name}
            </span>
            <button
              type="button"
              onClick={() => setIsAddCollegeModalOpen(true)}
              className="px-2.5 py-0.5 rounded-md bg-[#F4FBF7] text-[#197A42] border border-[#22A861]/30 font-semibold hover:bg-emerald-100/70 cursor-pointer"
            >
              + Add College
            </button>
            <span aria-hidden="true">·</span>
            <span>
              {isSignedIn ? (
                <>
                  Signed In: <strong>{currentUser.fullName}</strong>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-amber-700 font-semibold hover:underline cursor-pointer"
                >
                  Not Signed In — Sign In Compulsory to Rent or List
                </button>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200"
              role="group"
              aria-label="Switch Marketplace Expansion Mode"
            >
              {(
                [
                  { id: 'COLLEGE_MODE', label: '1. College Mode' },
                  { id: 'CITY_MODE', label: '2. City Mode' },
                  { id: 'MULTI_CITY_MODE', label: '3. Multi-City' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSwitchMarketplaceMode(m.id)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    marketplaceMode === m.id
                      ? 'bg-[#17172B] text-white'
                      : 'text-slate-600 hover:text-[#17172B]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-[#17172B] text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#2CC06E] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MAIN CONTENT VIEWPORT */}
      <main className="flex-1">
        {activeView === 'dashboard' && (
          <StudentDashboard
            currentUser={currentUser}
            selectedCollege={selectedCollege}
            colleges={colleges}
            users={users}
            products={products}
            bookings={bookings}
            rentalHistory={rentalHistory}
            onBookingAction={handleBookingStatusAction}
            onOpenListModal={() => {
              if (!requireSignInForAction('list a product for rent')) return;
              setIsListModalOpen(true);
            }}
            onSelectProductForBooking={(prod) => {
              if (!requireSignInForAction('rent campus equipment')) return;
              setBookingModalProduct(prod);
            }}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {activeView === 'admin' && (
          <CollegeAdminView
            currentUser={currentUser}
            colleges={colleges}
            users={users}
            products={products}
            bookings={bookings}
            complaints={complaints}
            marketplaceMode={marketplaceMode}
            onVerifyUser={handleVerifyStudent}
            onModerateListing={handleModerateListing}
            onResolveComplaint={handleResolveComplaint}
            onSwitchMarketplaceMode={handleSwitchMarketplaceMode}
            onQuickSwitchAdminRole={(adminUser) => {
              setCurrentUserId(adminUser.id);
              setSelectedCollegeId(adminUser.collegeId);
              showToast(
                `Switched to ${adminUser.fullName} (${adminUser.role})`
              );
            }}
          />
        )}

        {activeView === 'home' && (
          <>
            {/* 1. Hero Showcase (Matches Reference Image + Search, Add College & Upload Photo) */}
            <HeroShowcase
              colleges={colleges}
              selectedCollegeId={selectedCollegeId}
              onSelectCollege={handleSelectCollegeWithVerification}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onTriggerExplore={() => scrollToSection(marketplaceGridRef)}
              onOpenListModal={() => {
                if (!requireSignInForAction('list a product for rent')) return;
                setIsListModalOpen(true);
              }}
              onOpenDashboard={() => setActiveView('dashboard')}
              onOpenAddCollegeModal={() => setIsAddCollegeModalOpen(true)}
              currentUser={currentUser}
              marketplaceMode={marketplaceMode}
            />

            {/* 2. Campus-Based Product Discovery & Marketplace Grid */}
            <section
              ref={marketplaceGridRef}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-[#1F9D55]">
                    {selectedCollege.name} Marketplace · Verified Peer-to-Peer Equipment Sharing
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17172B] mt-1">
                    Available Campus Equipment & Student Gear
                  </h2>
                </div>

                {/* Scope Segmented Filter (Same College / Nearby Colleges / All Colleges) */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/75 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setScope('same_college')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      scope === 'same_college'
                        ? 'bg-white text-[#17172B] shadow-xs'
                        : 'text-slate-600 hover:text-[#17172B]'
                    }`}
                  >
                    Same College ({selectedCollege.shortName})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope('nearby_colleges')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      scope === 'nearby_colleges'
                        ? 'bg-white text-[#17172B] shadow-xs'
                        : 'text-slate-600 hover:text-[#17172B]'
                    }`}
                  >
                    Nearby {selectedCollege.cityName} Colleges
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (marketplaceMode !== 'MULTI_CITY_MODE') {
                        handleSwitchMarketplaceMode('MULTI_CITY_MODE');
                      } else {
                        setScope('all_locations');
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      scope === 'all_locations'
                        ? 'bg-white text-[#17172B] shadow-xs'
                        : 'text-slate-600 hover:text-[#17172B]'
                    }`}
                  >
                    All Colleges Equipment ({products.length})
                  </button>
                </div>
              </div>

              {/* Smart Discovery Filter Bar */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center text-xs">
                <div className="lg:col-span-3 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#1F9D55] shrink-0" />
                  <select
                    aria-label="Filter by product category"
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(
                        e.target.value as RentalCategory | 'ALL'
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-[#17172B]"
                  >
                    <option value="ALL">All 11 Campus Categories</option>
                    {RENTAL_CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <select
                    aria-label="Filter by product condition"
                    value={selectedCondition}
                    onChange={(e) =>
                      setSelectedCondition(
                        e.target.value as ProductCondition | 'ALL'
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-[#17172B]"
                  >
                    <option value="ALL">Any Condition</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div className="lg:col-span-2 flex items-center gap-2">
                  <label
                    htmlFor="max-price-range"
                    className="text-slate-600 whitespace-nowrap font-mono"
                  >
                    ≤ ₹{maxPrice}/d
                  </label>
                  <input
                    id="max-price-range"
                    type="range"
                    min={50}
                    max={1500}
                    step={25}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#1F9D55]"
                  />
                </div>

                <div className="lg:col-span-3 flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 font-semibold text-[#17172B] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seniorToJuniorOnly}
                      onChange={(e) => setSeniorToJuniorOnly(e.target.checked)}
                      className="rounded text-[#1F9D55]"
                    />
                    <span>Senior-to-Junior</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 font-semibold text-[#17172B] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={groupRentalOnly}
                      onChange={(e) => setGroupRentalOnly(e.target.checked)}
                      className="rounded text-[#6C4CF1]"
                    />
                    <span>Group Split</span>
                  </label>
                </div>

                <div className="lg:col-span-2">
                  <select
                    aria-label="Sort products by"
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as DiscoveryFilterOptions['sortBy']
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-[#17172B]"
                  >
                    <option value="recommended">Sort: Campus Priority</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="highest_rated">Highest Rated</option>
                    <option value="recently_added">Recently Added</option>
                  </select>
                </div>
              </div>

              {/* Product Cards Grid */}
              {filteredListings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
                  <p className="text-base font-bold text-[#17172B]">
                    No matching campus products found for these filters
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try expanding your search to All Colleges, resetting your price slider, or listing your own product on {selectedCollege.shortName}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('ALL');
                      setSelectedCondition('ALL');
                      setMaxPrice(1500);
                      setSeniorToJuniorOnly(false);
                      setGroupRentalOnly(false);
                      setSearchQuery('');
                      setScope('same_college');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#17172B] text-white text-xs font-semibold cursor-pointer"
                  >
                    Reset Discovery Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((product) => {
                    const isWished = currentUser.wishlistProductIds.includes(
                      product.id
                    );
                    return (
                      <article
                        key={product.id}
                        className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#22A861]/50 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between overflow-hidden"
                      >
                        <div>
                          <div className="relative">
                            <ProductVisual
                              photoKey={product.photos[0] || product.id}
                              category={product.category}
                              title={product.title}
                              className="w-full h-48"
                            />
                            <button
                              type="button"
                              onClick={() => handleToggleWishlist(product.id)}
                              aria-label={
                                isWished
                                  ? `Remove ${product.title} from wishlist`
                                  : `Save ${product.title} to wishlist`
                              }
                              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs hover:scale-105 transition-transform cursor-pointer"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  isWished
                                    ? 'fill-rose-500 text-rose-500'
                                    : 'text-slate-600'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="p-5 space-y-2.5">
                            {/* Clean unboxed metadata with typographic separators */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
                              <span className="font-semibold text-[#197A42]">
                                {product.collegeName}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{product.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>{product.condition}</span>
                            </div>

                            <h3 className="text-base font-bold text-[#17172B] leading-snug line-clamp-2">
                              {product.title}
                            </h3>

                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {product.description}
                            </p>

                            {/* Pickup Landmark & Owner Info */}
                            <div className="pt-1 text-xs text-slate-500 space-y-1">
                              <p className="flex items-center gap-1.5 truncate">
                                <MapPin className="w-3.5 h-3.5 text-[#1F9D55] shrink-0" />
                                <span className="truncate">
                                  Pickup: {product.pickupLocation}
                                </span>
                              </p>
                              <p className="flex items-center justify-between text-[11px]">
                                <span>
                                  Owner: <strong className="text-[#17172B]">{product.ownerName}</strong> ({product.ownerYear})
                                </span>
                                <span className="inline-flex items-center gap-0.5 font-mono font-bold text-[#17172B]">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  {product.rating} ({product.reviewCount})
                                </span>
                              </p>
                            </div>

                            {/* Unique Campus Feature Highlights (Unboxed clean text lines) */}
                            {(product.isSeniorToJunior ||
                              product.allowGroupRental) && (
                              <div className="pt-1.5 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium">
                                {product.isSeniorToJunior && (
                                  <span className="text-[#197A42] inline-flex items-center gap-1">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    Senior-to-Junior Share
                                  </span>
                                )}
                                {product.allowGroupRental && (
                                  <span className="text-[#6C4CF1] inline-flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" />
                                    Split up to {product.maxGroupMembers} Students (₹
                                    {Math.ceil(
                                      product.dailyPrice /
                                        product.maxGroupMembers
                                    )}
                                    /person)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Contiguous Card Footer: Daily Price, Deposit & Rent CTA */}
                        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-extrabold text-[#17172B] font-mono tabular-nums">
                                ₹{product.dailyPrice}
                              </span>
                              <span className="text-xs text-slate-500">
                                / day
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                              Refundable Deposit: ₹{product.securityDeposit}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (
                                !requireSignInForAction(
                                  'rent campus equipment'
                                )
                              ) {
                                return;
                              }
                              setBookingModalProduct(product);
                            }}
                            className="rentbase-btn-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
                          >
                            Rent Now
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 3. All 11 College Rental Categories Section */}
            <section
              ref={categoriesSectionRef}
              className="bg-white border-y border-slate-200/80 py-14 px-4 sm:px-6 lg:px-8"
            >
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-[#1F9D55]">
                      11 Student-Curated Categories
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17172B] mt-1">
                      Explore by Campus Rental Category
                    </h2>
                  </div>
                  {selectedCategory !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('ALL')}
                      className="text-xs font-semibold text-[#1F9D55] hover:underline cursor-pointer"
                    >
                      Show All Categories
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {RENTAL_CATEGORIES.map((cat) => {
                    const IconComp =
                      CATEGORY_ICON_MAP[cat.iconName] || Laptop;
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          scrollToSection(marketplaceGridRef);
                        }}
                        className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-[#F4FBF7] border-[#22A861] shadow-xs'
                            : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 text-[#1F9D55] flex items-center justify-center shrink-0">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#17172B] truncate">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                            {cat.description}
                          </p>
                          <p className="text-[11px] font-mono font-semibold text-[#197A42] mt-1.5 tabular-nums">
                            From ₹{cat.avgDailyPrice}/day
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 4. Participating College Communities Switcher + Add New College */}
            <section
              ref={collegesSectionRef}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold text-[#1F9D55]">
                    Dedicated Campus Marketplaces · Add Any College & View Equipment
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17172B] mt-1">
                    Participating College Communities ({colleges.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2">
                    Switch between ADCET Ashta, VJTI Mumbai, COEP Pune, BITS Goa, or add your own college to immediately browse all campus equipment available there.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddCollegeModalOpen(true)}
                  className="rentbase-btn-primary text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl cursor-pointer inline-flex items-center gap-2 shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Add New College</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {colleges.map((col) => {
                  const isActive = col.id === selectedCollegeId;
                  const isAuthorized =
                    currentUser.authorizedCollegeIds.includes(col.id);
                  const colEquipmentCount = products.filter(
                    (p) => p.collegeId === col.id
                  ).length;
                  return (
                    <div
                      key={col.id}
                      className={`rounded-2xl p-5 border flex flex-col justify-between gap-4 ${
                        isActive
                          ? 'bg-[#F4FBF7] border-[#22A861]'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-semibold text-[#17172B]">
                            {col.cityName}, {col.state}
                          </span>
                          <span className="font-mono text-[#1F9D55] font-bold">
                            {colEquipmentCount} Equipment Items
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#17172B]">
                          {col.name}
                        </h3>
                        <p className="text-xs text-slate-600">
                          {col.supportsInstitutionalEmail
                            ? `Supports @${col.emailDomain} + ID Card Upload`
                            : 'Verified via Physical ID Card & Admin Approval'}
                        </p>
                        <div className="pt-1 text-[11px] text-slate-500">
                          <p className="font-semibold text-slate-700">
                            Official Pickup Landmarks:
                          </p>
                          <p className="truncate">
                            {col.campusLandmarks.slice(0, 2).join(' · ')}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleSelectCollegeWithVerification(col.id);
                          scrollToSection(marketplaceGridRef);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-[#1F9D55] text-white'
                            : 'bg-[#17172B] text-white hover:bg-slate-800'
                        }`}
                      >
                        {isActive
                          ? `Viewing ${col.shortName} Equipment`
                          : isAuthorized
                          ? `See ${col.shortName} Equipment`
                          : `Unlock & View ${col.shortName}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 5. "Your Unused Products Can Earn You Money" CTA Banner + How It Works & Testimonials */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-14">
              {/* Owner & Customer Dual CTA Banner */}
              <div className="rounded-3xl bg-[#17172B] text-white p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <p className="text-xs font-bold text-[#2CC06E]">
                    Turn Dorm Shelf Clutter Into Monthly Pocket Money
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Your Unused Products Can Earn You Money.
                  </h2>
                  <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Upload a photo of your DSLR camera, engineering drafter, scientific calculator, or trekking backpack—list it in 60 seconds with Smart Pricing, live Return Timer protection, and QR-verified campus handover.
                  </p>
                </div>

                <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => scrollToSection(marketplaceGridRef)}
                    className="rentbase-btn-primary text-white text-sm font-semibold px-5 py-3 rounded-full cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Start Renting
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!requireSignInForAction('list a product for rent')) {
                        return;
                      }
                      setIsListModalOpen(true);
                    }}
                    className="px-5 py-3 rounded-full bg-white text-[#17172B] hover:bg-slate-100 text-sm font-semibold cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4 text-[#1F9D55]" />
                    <span>Upload & List Product</span>
                  </button>
                </div>
              </div>

              {/* How It Works + Student Testimonials Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
                  <h3 className="text-lg font-extrabold text-[#17172B]">
                    How Campus Rental, Return Timer & History DB Works
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-[#1F9D55] text-sm">
                        01.
                      </span>
                      <div>
                        <p className="font-bold text-[#17172B]">
                          Sign In or Register Your Campus Account
                        </p>
                        <p className="text-slate-600">
                          Every user’s Full Name, Registered Email, and rental activity is stored in the campus database.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-[#1F9D55] text-sm">
                        02.
                      </span>
                      <div>
                        <p className="font-bold text-[#17172B]">
                          Upload Item Photos & Rent with Live Return Timer
                        </p>
                        <p className="text-slate-600">
                          Upload photos of items you want to rent, split group costs with classmates, and track your live Return Countdown Timer.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-[#1F9D55] text-sm">
                        03.
                      </span>
                      <div>
                        <p className="font-bold text-[#17172B]">
                          On-Time QR Return or Automatic Overdue Fine Calculation
                        </p>
                        <p className="text-slate-600">
                          Return on time at the campus pickup landmark for instant deposit release, or clear any late-return fine directly in your dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attributable Student Testimonials */}
                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <blockquote className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      “Before RentKaro, our robotics team spent ₹14,000 buying Raspberry Pi and LIDAR sensors for a 2-week course project. We split a senior’s kit 4 ways for ₹120/day at ADCET Central Library and aced our evaluation.”
                    </p>
                    <footer className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs font-bold text-[#17172B]">
                        Aarav Mehta · B.Tech CSE, 3rd Year
                      </p>
                      <p className="text-[11px] text-[#1F9D55]">
                        ADCET Ashta — Saved ₹12,800 in Sem 5
                      </p>
                    </footer>
                  </blockquote>

                  <blockquote className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      “My Sony A7 IV camera sat idle in my hostel locker 25 days a month. Listing it on RentKaro with the live Return Timer and QR pickup earned me ₹14,300 during annual campus fest season.”
                    </p>
                    <footer className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs font-bold text-[#17172B]">
                        Ananya Kulkarni · B.Tech EE, 4th Year
                      </p>
                      <p className="text-[11px] text-[#1F9D55]">
                        ADCET Ashta — Earned ₹14,300 from 15 Rentals
                      </p>
                    </footer>
                  </blockquote>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#22A861] text-white font-bold text-xs inline-flex items-center justify-center">
              R
            </span>
            <span className="font-bold text-[#17172B]">RentKaro</span>
            <span>·</span>
            <span>Your Campus. Your Marketplace. Rent Anything.</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="hover:text-[#17172B] cursor-pointer"
            >
              Campus Marketplace
            </button>
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className="hover:text-[#17172B] cursor-pointer"
            >
              Dashboard, Timer & History DB
            </button>
            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className="hover:text-[#17172B] cursor-pointer"
            >
              College Admin & City Expansion
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      {bookingModalProduct && (
        <BookingModal
          product={bookingModalProduct}
          college={
            colleges.find((c) => c.id === bookingModalProduct.collegeId) ||
            selectedCollege
          }
          currentUser={currentUser}
          existingBookings={bookings}
          onClose={() => setBookingModalProduct(null)}
          onSubmitBooking={handleCreateBooking}
          onNavigateDashboard={() => setActiveView('dashboard')}
        />
      )}

      {isListModalOpen && (
        <ListProductModal
          colleges={colleges}
          selectedCollegeId={selectedCollegeId}
          currentUser={currentUser}
          onClose={() => setIsListModalOpen(false)}
          onCreateListing={handleCreateListing}
        />
      )}

      {isAddCollegeModalOpen && (
        <AddCollegeModal
          onClose={() => setIsAddCollegeModalOpen(false)}
          onAddCollege={handleAddCollege}
        />
      )}

      {isAuthModalOpen && (
        <AuthAndRoleModal
          colleges={colleges}
          users={users}
          currentUser={currentUser}
          onSignInUser={handleSignInUser}
          onRegisterUser={handleRegisterUser}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
}
