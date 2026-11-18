import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Inbox,
  Lock,
  LogOut,
  Phone,
  Plus,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { HALL_OPTIONS, RESTAURANT_INFO } from '../data/restaurantData';
import {
  db,
  handleFirestoreError,
  OperationType,
  SUPER_ADMIN_EMAIL,
} from '../firebase';
import { AdminRecord, useFirebase } from '../context/FirebaseContext';
import { TinchlikLogo } from './TinchlikLogo';

type AdminTab = 'stats' | 'bookings' | 'crm' | 'admins';
type ReservationStatus = 'new' | 'confirmed' | 'arrived' | 'cancelled';

interface ReservationRecord {
  id: string;
  code: string;
  name: string;
  phone: string;
  phoneNormalized: string;
  hallId: string;
  hallTitle: string;
  date: string;
  time: string;
  guests: number;
  notes: string;
  status: ReservationStatus;
  adminNote: string;
  telegramTarget: string;
  handledByEmail: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

interface CustomerCrmRecord {
  phoneNormalized: string;
  phoneDisplay: string;
  name: string;
  tags: string[];
  crmNote: string;
  updatedByEmail: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

interface AggregatedCustomer {
  phoneNormalized: string;
  phoneDisplay: string;
  name: string;
  totalBookings: number;
  confirmedOrArrived: number;
  cancelledCount: number;
  totalGuests: number;
  lastDate: string;
  preferredHall: string;
  tags: string[];
  crmNote: string;
  hasPersistedProfile: boolean;
}

interface AdminPanelProps {
  onBackToSite: () => void;
}

const STATUS_META: Record<
  ReservationStatus,
  { label: string; badgeClass: string; barClass: string }
> = {
  new: {
    label: 'Yangi',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    barClass: 'bg-amber-500',
  },
  confirmed: {
    label: 'Tasdiqlangan',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    barClass: 'bg-[#115E46]',
  },
  arrived: {
    label: 'Kelgan',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    barClass: 'bg-sky-600',
  },
  cancelled: {
    label: 'Bekor qilingan',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    barClass: 'bg-rose-500',
  },
};

const CRM_TAG_SUGGESTIONS = [
  'VIP',
  'Doimiy mijoz',
  'Banket',
  'Tug‘ilgan kun',
  'Biznes uchrashuv',
];

const EMAIL_PATTERN = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;

function formatTimestampUz(ts: Timestamp | null): string {
  if (!ts) return 'Hozirgina';
  try {
    const date = ts.toDate();
    return date.toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export function AdminPanel({ onBackToSite }: AdminPanelProps) {
  const {
    user,
    authReady,
    adminProfile,
    isSuperAdmin,
    canAccessPanel,
    canManageBookings,
    canManageAdmins,
    signingIn,
    authError,
    signInWithGoogle,
    signOutUser,
  } = useFirebase();

  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');

  // Firestore synced state
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [customersMap, setCustomersMap] = useState<Record<string, CustomerCrmRecord>>({});
  const [adminsList, setAdminsList] = useState<AdminRecord[]>([]);

  // Bookings UI state
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReservationStatus>('all');
  const [hallFilter, setHallFilter] = useState<string>('all');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingBookingId, setSavingBookingId] = useState<string | null>(null);
  const [confirmDeleteBookingId, setConfirmDeleteBookingId] = useState<string | null>(null);
  const [bookingFeedback, setBookingFeedback] = useState('');

  // CRM UI state
  const [crmSearch, setCrmSearch] = useState('');
  const [crmTagFilter, setCrmTagFilter] = useState<string>('all');
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [crmNameDraft, setCrmNameDraft] = useState('');
  const [crmNoteDraft, setCrmNoteDraft] = useState('');
  const [crmTagsDraft, setCrmTagsDraft] = useState<string[]>([]);
  const [savingCrmId, setSavingCrmId] = useState<string | null>(null);

  // Admins UI state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newCanAccess, setNewCanAccess] = useState(true);
  const [newCanManageBookings, setNewCanManageBookings] = useState(true);
  const [newCanManageAdmins, setNewCanManageAdmins] = useState(false);
  const [adminFormError, setAdminFormError] = useState('');
  const [adminFormSuccess, setAdminFormSuccess] = useState('');
  const [submittingAdmin, setSubmittingAdmin] = useState(false);
  const [confirmDeleteAdminEmail, setConfirmDeleteAdminEmail] = useState<string | null>(null);

  // Live Reservations subscription (only when authenticated & authorized)
  useEffect(() => {
    if (!authReady || !user || !canAccessPanel) {
      setReservations([]);
      return;
    }

    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: ReservationRecord[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          const rawStatus = String(d.status || 'new');
          const status: ReservationStatus =
            rawStatus === 'confirmed' ||
            rawStatus === 'arrived' ||
            rawStatus === 'cancelled'
              ? rawStatus
              : 'new';
          return {
            id: docSnap.id,
            code: String(d.code || ''),
            name: String(d.name || ''),
            phone: String(d.phone || ''),
            phoneNormalized: String(d.phoneNormalized || ''),
            hallId: String(d.hallId || 'oilaviy-zal'),
            hallTitle: String(d.hallTitle || 'Asosiy Oilaviy Zal'),
            date: String(d.date || ''),
            time: String(d.time || ''),
            guests: Number(d.guests || 1),
            notes: String(d.notes || ''),
            status,
            adminNote: String(d.adminNote || ''),
            telegramTarget: String(d.telegramTarget || '@Aligulyamov'),
            handledByEmail: String(d.handledByEmail || ''),
            createdAt: d.createdAt ?? null,
            updatedAt: d.updatedAt ?? null,
          };
        });
        setReservations(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'reservations');
      }
    );

    return () => unsub();
  }, [authReady, user, canAccessPanel]);

  // Live Customers CRM subscription
  useEffect(() => {
    if (!authReady || !user || !canAccessPanel) {
      setCustomersMap({});
      return;
    }

    const unsub = onSnapshot(
      collection(db, 'customers'),
      (snapshot) => {
        const map: Record<string, CustomerCrmRecord> = {};
        snapshot.docs.forEach((docSnap) => {
          const d = docSnap.data();
          map[docSnap.id] = {
            phoneNormalized: String(d.phoneNormalized || docSnap.id),
            phoneDisplay: String(d.phoneDisplay || ''),
            name: String(d.name || ''),
            tags: Array.isArray(d.tags) ? d.tags.map((t) => String(t)) : [],
            crmNote: String(d.crmNote || ''),
            updatedByEmail: String(d.updatedByEmail || ''),
            createdAt: d.createdAt ?? null,
            updatedAt: d.updatedAt ?? null,
          };
        });
        setCustomersMap(map);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'customers');
      }
    );

    return () => unsub();
  }, [authReady, user, canAccessPanel]);

  // Live Admins subscription (only when user has canManageAdmins)
  useEffect(() => {
    if (!authReady || !user || !canManageAdmins) {
      setAdminsList([]);
      return;
    }

    const unsub = onSnapshot(
      collection(db, 'admins'),
      (snapshot) => {
        const items: AdminRecord[] = snapshot.docs
          .map((docSnap) => {
            const d = docSnap.data();
            return {
              email: String(d.email || docSnap.id),
              displayName: String(d.displayName || docSnap.id),
              canAccessPanel: Boolean(d.canAccessPanel),
              canManageBookings: Boolean(d.canManageBookings),
              canManageAdmins: Boolean(d.canManageAdmins),
              addedBy: String(d.addedBy || SUPER_ADMIN_EMAIL),
              createdAt: d.createdAt ?? null,
              updatedAt: d.updatedAt ?? null,
            };
          })
          .sort((a, b) => a.email.localeCompare(b.email));
        setAdminsList(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'admins');
      }
    );

    return () => unsub();
  }, [authReady, user, canManageAdmins]);

  useEffect(() => {
    if (activeTab === 'admins' && !canManageAdmins) {
      setActiveTab('bookings');
    }
  }, [activeTab, canManageAdmins]);

  const filteredReservations = useMemo(() => {
    const q = bookingSearch.trim().toLowerCase();
    return reservations.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (hallFilter !== 'all' && item.hallId !== hallFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.hallTitle.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q)
      );
    });
  }, [reservations, bookingSearch, statusFilter, hallFilter]);

  const aggregatedCustomers = useMemo<AggregatedCustomer[]>(() => {
    const map = new Map<string, AggregatedCustomer>();

    for (const res of reservations) {
      const key = res.phoneNormalized;
      if (!key) continue;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          phoneNormalized: key,
          phoneDisplay: res.phone,
          name: res.name,
          totalBookings: 1,
          confirmedOrArrived:
            res.status === 'confirmed' || res.status === 'arrived' ? 1 : 0,
          cancelledCount: res.status === 'cancelled' ? 1 : 0,
          totalGuests: res.status === 'cancelled' ? 0 : res.guests,
          lastDate: res.date,
          preferredHall: res.hallTitle,
          tags: [],
          crmNote: '',
          hasPersistedProfile: false,
        });
      } else {
        existing.totalBookings += 1;
        if (res.status === 'confirmed' || res.status === 'arrived') {
          existing.confirmedOrArrived += 1;
        }
        if (res.status === 'cancelled') {
          existing.cancelledCount += 1;
        } else {
          existing.totalGuests += res.guests;
        }
        if (res.date > existing.lastDate) {
          existing.lastDate = res.date;
          existing.preferredHall = res.hallTitle;
        }
      }
    }

    // Merge persisted CRM profiles
    Object.values(customersMap).forEach((crm) => {
      const current = map.get(crm.phoneNormalized);
      if (current) {
        current.name = crm.name || current.name;
        current.phoneDisplay = crm.phoneDisplay || current.phoneDisplay;
        current.tags = crm.tags;
        current.crmNote = crm.crmNote;
        current.hasPersistedProfile = true;
      } else {
        map.set(crm.phoneNormalized, {
          phoneNormalized: crm.phoneNormalized,
          phoneDisplay: crm.phoneDisplay,
          name: crm.name,
          totalBookings: 0,
          confirmedOrArrived: 0,
          cancelledCount: 0,
          totalGuests: 0,
          lastDate: '—',
          preferredHall: '—',
          tags: crm.tags,
          crmNote: crm.crmNote,
          hasPersistedProfile: true,
        });
      }
    });

    const list = Array.from(map.values()).sort(
      (a, b) => b.totalBookings - a.totalBookings || b.totalGuests - a.totalGuests
    );

    const q = crmSearch.trim().toLowerCase();
    return list.filter((c) => {
      if (crmTagFilter !== 'all' && !c.tags.includes(crmTagFilter)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phoneDisplay.toLowerCase().includes(q) ||
        c.crmNote.toLowerCase().includes(q)
      );
    });
  }, [reservations, customersMap, crmSearch, crmTagFilter]);

  const stats = useMemo(() => {
    const total = reservations.length;
    const byStatus: Record<ReservationStatus, number> = {
      new: 0,
      confirmed: 0,
      arrived: 0,
      cancelled: 0,
    };
    const byHall: Record<string, { title: string; count: number; guests: number }> = {};
    HALL_OPTIONS.forEach((h) => {
      byHall[h.id] = { title: h.title, count: 0, guests: 0 };
    });

    const byTime: Record<string, number> = {};
    let totalGuests = 0;

    for (const r of reservations) {
      byStatus[r.status] += 1;
      if (r.status !== 'cancelled') {
        totalGuests += r.guests;
      }
      if (!byHall[r.hallId]) {
        byHall[r.hallId] = { title: r.hallTitle, count: 0, guests: 0 };
      }
      byHall[r.hallId].count += 1;
      if (r.status !== 'cancelled') {
        byHall[r.hallId].guests += r.guests;
      }
      if (r.time) {
        byTime[r.time] = (byTime[r.time] || 0) + 1;
      }
    }

    const activeCount = total - byStatus.cancelled;
    const avgGuests = activeCount > 0 ? Math.round(totalGuests / activeCount) : 0;
    const successRate =
      total > 0
        ? Math.round(((byStatus.confirmed + byStatus.arrived) / total) * 100)
        : 0;

    // Last 7 days trend
    const last7Days: { date: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
      last7Days.push({
        date: iso,
        label,
        count: reservations.filter((r) => r.date === iso).length,
      });
    }
    const maxDailyCount = Math.max(1, ...last7Days.map((d) => d.count));

    const timeSlotsSorted = Object.entries(byTime).sort((a, b) => b[1] - a[1]);

    return {
      total,
      byStatus,
      byHall: Object.values(byHall),
      totalGuests,
      avgGuests,
      successRate,
      last7Days,
      maxDailyCount,
      timeSlotsSorted,
      uniqueCustomersCount: new Set(
        reservations.map((r) => r.phoneNormalized).filter(Boolean)
      ).size,
    };
  }, [reservations]);

  const handleUpdateBookingStatus = async (
    booking: ReservationRecord,
    nextStatus: ReservationStatus
  ) => {
    if (!canManageBookings || !user?.email) return;
    setSavingBookingId(booking.id);
    setBookingFeedback('');
    const docPath = `reservations/${booking.id}`;
    try {
      await updateDoc(doc(db, 'reservations', booking.id), {
        status: nextStatus,
        handledByEmail: user.email.toLowerCase().slice(0, 120),
        updatedAt: serverTimestamp(),
      });
      setBookingFeedback(`#${booking.code} holati «${STATUS_META[nextStatus].label}» qilib yangilandi.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    } finally {
      setSavingBookingId(null);
    }
  };

  const handleSaveBookingNote = async (booking: ReservationRecord) => {
    if (!canManageBookings || !user?.email) return;
    const draft = (noteDrafts[booking.id] ?? booking.adminNote).trim().slice(0, 500);
    setSavingBookingId(booking.id);
    setBookingFeedback('');
    const docPath = `reservations/${booking.id}`;
    try {
      await updateDoc(doc(db, 'reservations', booking.id), {
        adminNote: draft,
        handledByEmail: user.email.toLowerCase().slice(0, 120),
        updatedAt: serverTimestamp(),
      });
      setBookingFeedback(`#${booking.code} uchun ichki izoh saqlandi.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    } finally {
      setSavingBookingId(null);
    }
  };

  const handleDeleteBooking = async (booking: ReservationRecord) => {
    if (!canManageBookings) return;
    setSavingBookingId(booking.id);
    const docPath = `reservations/${booking.id}`;
    try {
      await deleteDoc(doc(db, 'reservations', booking.id));
      setConfirmDeleteBookingId(null);
      setBookingFeedback(`#${booking.code} bron o‘chirildi.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    } finally {
      setSavingBookingId(null);
    }
  };

  const openCrmEditor = (customer: AggregatedCustomer) => {
    setEditingCustomerId(customer.phoneNormalized);
    setCrmNameDraft(customer.name);
    setCrmNoteDraft(customer.crmNote);
    setCrmTagsDraft(customer.tags);
  };

  const toggleCrmTag = (tag: string) => {
    setCrmTagsDraft((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 10) return prev;
      return [...prev, tag];
    });
  };

  const handleSaveCrmCustomer = async (customer: AggregatedCustomer) => {
    if (!canManageBookings || !user?.email) return;
    const cleanName = crmNameDraft.trim().slice(0, 80) || customer.name;
    const cleanNote = crmNoteDraft.trim().slice(0, 500);
    const cleanTags = crmTagsDraft.slice(0, 10);
    const emailLower = user.email.toLowerCase().slice(0, 120);
    const docPath = `customers/${customer.phoneNormalized}`;

    setSavingCrmId(customer.phoneNormalized);
    try {
      if (customer.hasPersistedProfile && customersMap[customer.phoneNormalized]) {
        await updateDoc(doc(db, 'customers', customer.phoneNormalized), {
          phoneDisplay: customer.phoneDisplay.slice(0, 30),
          name: cleanName,
          tags: cleanTags,
          crmNote: cleanNote,
          updatedByEmail: emailLower,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, 'customers', customer.phoneNormalized), {
          phoneNormalized: customer.phoneNormalized,
          phoneDisplay: customer.phoneDisplay.slice(0, 30),
          name: cleanName,
          tags: cleanTags,
          crmNote: cleanNote,
          updatedByEmail: emailLower,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setEditingCustomerId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    } finally {
      setSavingCrmId(null);
    }
  };

  const handleAddAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!canManageAdmins || !user?.email) return;

    setAdminFormError('');
    setAdminFormSuccess('');

    const emailClean = newAdminEmail.trim().toLowerCase().slice(0, 120);
    const nameClean = newAdminName.trim().slice(0, 80);

    if (!EMAIL_PATTERN.test(emailClean)) {
      setAdminFormError('Iltimos, to‘g‘ri Google email manzilini kiriting (masalan: menejer@gmail.com).');
      return;
    }

    if (emailClean === SUPER_ADMIN_EMAIL) {
      setAdminFormError(`${SUPER_ADMIN_EMAIL} allaqachon bosh super-admin hisoblanadi.`);
      return;
    }

    if (nameClean.length < 1) {
      setAdminFormError('Iltimos, admin ismi yoki lavozimini kiriting.');
      return;
    }

    setSubmittingAdmin(true);
    const docPath = `admins/${emailClean}`;
    const existingAdmin = adminsList.find((a) => a.email === emailClean);
    try {
      if (existingAdmin) {
        await updateDoc(doc(db, 'admins', emailClean), {
          displayName: nameClean,
          canAccessPanel: newCanAccess,
          canManageBookings: newCanManageBookings,
          canManageAdmins: newCanManageAdmins,
          updatedAt: serverTimestamp(),
        });
        setAdminFormSuccess(`${emailClean} huquqlari yangilandi.`);
      } else {
        await setDoc(doc(db, 'admins', emailClean), {
          email: emailClean,
          displayName: nameClean,
          canAccessPanel: newCanAccess,
          canManageBookings: newCanManageBookings,
          canManageAdmins: newCanManageAdmins,
          addedBy: user.email.toLowerCase().slice(0, 120),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setAdminFormSuccess(`${emailClean} admin sifatida qo‘shildi.`);
      }
      setNewAdminEmail('');
      setNewAdminName('');
      setNewCanAccess(true);
      setNewCanManageBookings(true);
      setNewCanManageAdmins(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleToggleAdminPermission = async (
    record: AdminRecord,
    field: 'canAccessPanel' | 'canManageBookings' | 'canManageAdmins'
  ) => {
    if (!canManageAdmins) return;
    if (record.email === SUPER_ADMIN_EMAIL) return;

    const nextVal = !record[field];
    const docPath = `admins/${record.email}`;
    try {
      await updateDoc(doc(db, 'admins', record.email), {
        displayName: record.displayName,
        canAccessPanel: field === 'canAccessPanel' ? nextVal : record.canAccessPanel,
        canManageBookings:
          field === 'canManageBookings' ? nextVal : record.canManageBookings,
        canManageAdmins:
          field === 'canManageAdmins' ? nextVal : record.canManageAdmins,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!canManageAdmins || email === SUPER_ADMIN_EMAIL) return;
    const docPath = `admins/${email}`;
    try {
      await deleteDoc(doc(db, 'admins', email));
      setConfirmDeleteAdminEmail(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  // 1. Loading Screen
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#f8f9f8] flex items-center justify-center p-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-sm w-full text-center space-y-3 shadow-xs">
          <TinchlikLogo className="w-16 h-16 mx-auto" />
          <p className="text-sm font-medium text-stone-700">
            Admin panel yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Google Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#141a17] text-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1b221e] border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TinchlikLogo className="w-14 h-14 border-white/25" />
              <div>
                <p className="text-xs font-medium text-emerald-400">
                  Tinchlik Oilaviy Restorani
                </p>
                <h1 className="font-display text-2xl font-semibold text-white">
                  Admin Panel va CRM
                </h1>
              </div>
            </div>
          </div>

          <p className="text-sm text-stone-300 leading-relaxed">
            Bron xabarlari, mijozlar CRM bazasi, statistika va admin huquqlarini
            boshqarish uchun Google hisobingiz orqali tizimga kiring.
          </p>

          {authError && (
            <p
              role="alert"
              className="text-xs font-medium text-rose-300 bg-rose-950/60 border border-rose-800 rounded-lg p-3"
            >
              {authError}
            </p>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled={signingIn}
              onClick={() => void signInWithGoogle()}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 min-h-[48px] text-sm font-semibold text-white bg-[#115E46] hover:bg-[#0D4A37] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                {signingIn ? 'Kirilmoqda...' : 'Google bilan kirish'}
              </span>
            </button>

            <button
              type="button"
              onClick={onBackToSite}
              className="w-full inline-flex items-center justify-center gap-2 px-5 min-h-[44px] text-xs font-medium text-stone-300 hover:text-white bg-[#141a17] border border-stone-700 hover:border-stone-500 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Asosiy saytga qaytish</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated but Not Authorized
  if (!canAccessPanel) {
    return (
      <div className="min-h-screen bg-[#f8f9f8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-stone-900">
              Kirish huquqi berilmagan
            </h1>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Siz <strong className="text-stone-900">{user.email}</strong> hisobi
              orqali kirdingiz, ammo ushbu hisobga Admin panelga kirish ruxsati
              biriktirilmagan.
            </p>
            <p className="mt-2 text-xs text-stone-500">
              Ruxsat olish uchun bosh admin ({SUPER_ADMIN_EMAIL}) sizning
              emailingizni adminlar ro‘yxatiga qo‘shishi va «Panelga kirish
              huquqi»ni yoqishi kerak.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="inline-flex items-center gap-2 px-4 min-h-[44px] text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Boshqa hisob bilan kirish</span>
            </button>
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-2 px-4 min-h-[44px] text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Saytga qaytish</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin Panel
  const roleLabel = isSuperAdmin
    ? 'Super Admin'
    : canManageAdmins
    ? 'Boshqaruvchi Admin'
    : canManageBookings
    ? 'Menejer (Kirish + Boshqarish)'
    : 'Kuzatuvchi (Faqat kirish)';

  return (
    <div className="min-h-screen bg-[#f8f9f8] text-stone-900 flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#141a17] text-white border-b border-stone-800">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <TinchlikLogo className="w-10 h-10 sm:w-12 sm:h-12 border-white/25 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg sm:text-xl font-semibold text-white truncate">
                  Tinchlik Admin
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/90 border border-emerald-800 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                  {roleLabel}
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate">
                {user.email}
                {adminProfile?.displayName ? ` · ${adminProfile.displayName}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 min-h-[40px] text-xs sm:text-sm font-medium text-stone-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Asosiy sayt</span>
              <span className="sm:hidden">Sayt</span>
            </button>
            <button
              type="button"
              onClick={() => void signOutUser()}
              aria-label="Hisobdan chiqish"
              className="inline-flex items-center gap-1.5 px-3 min-h-[40px] text-xs sm:text-sm font-medium text-stone-300 hover:text-white border border-stone-700 hover:border-stone-500 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-800/80">
          <nav
            aria-label="Admin bo‘limlari"
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2"
          >
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`inline-flex items-center gap-2 px-3.5 min-h-[42px] text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#115E46] text-white'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Inbox className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Bron xabarlari</span>
              {stats.byStatus.new > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-semibold bg-amber-400 text-stone-950 rounded tabular-nums">
                  {stats.byStatus.new}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`inline-flex items-center gap-2 px-3.5 min-h-[42px] text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-[#115E46] text-white'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Statistika</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('crm')}
              className={`inline-flex items-center gap-2 px-3.5 min-h-[42px] text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'crm'
                  ? 'bg-[#115E46] text-white'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Mijozlar CRM</span>
              <span className="text-[11px] text-stone-300 bg-white/10 px-1.5 py-0.5 rounded tabular-nums">
                {stats.uniqueCustomersCount}
              </span>
            </button>

            {canManageAdmins && (
              <button
                type="button"
                onClick={() => setActiveTab('admins')}
                className={`inline-flex items-center gap-2 px-3.5 min-h-[42px] text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'admins'
                    ? 'bg-[#115E46] text-white'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Adminlar va huquqlar</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {!canManageBookings && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-xs sm:text-sm text-amber-900">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
            <span>
              Sizda faqat <strong>Panelga kirish huquqi</strong> yoqilgan. Bron
              holatini o‘zgartirish, o‘chirish va CRM tahrirlash uchun{' '}
              <strong>Boshqarish huquqi</strong> talab etiladi.
            </span>
          </div>
        )}

        {/* ================= TAB 1: BRON XABARLARI ================= */}
        {activeTab === 'bookings' && (
          <section aria-label="Bron xabarlari" className="space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900">
                  Bron xabarlari
                </h1>
                <p className="text-sm text-stone-600">
                  Sayt orqali kelgan barcha stol va banket zali arizalari real
                  vaqtda shu yerda ko‘rinadi.
                </p>
              </div>

              <a
                href={RESTAURANT_INFO.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 min-h-[44px] text-xs sm:text-sm font-medium text-white bg-[#229ED9] hover:bg-[#1B8BC0] rounded-lg transition-colors self-start lg:self-auto"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Telegram (@{RESTAURANT_INFO.telegramUsername})</span>
              </a>
            </div>

            {/* Filters */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative md:col-span-2">
                  <Search
                    className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Ism, telefon, bron raqami (#TN-...) bo‘yicha qidirish..."
                    className="w-full pl-10 pr-4 min-h-[44px] text-sm bg-[#f8f9f8] border border-stone-200 rounded-lg focus:outline-none focus:border-[#115E46]"
                  />
                </div>

                <select
                  aria-label="Zal bo‘yicha filtrlash"
                  value={hallFilter}
                  onChange={(e) => setHallFilter(e.target.value)}
                  className="px-3.5 min-h-[44px] text-sm bg-[#f8f9f8] border border-stone-200 rounded-lg focus:outline-none focus:border-[#115E46]"
                >
                  <option value="all">Barcha zallar</option>
                  {HALL_OPTIONS.map((hall) => (
                    <option key={hall.id} value={hall.id}>
                      {hall.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['all', 'new', 'confirmed', 'arrived', 'cancelled'] as const).map(
                  (statusKey) => {
                    const active = statusFilter === statusKey;
                    const label =
                      statusKey === 'all'
                        ? `Barchasi (${reservations.length})`
                        : `${STATUS_META[statusKey].label} (${stats.byStatus[statusKey]})`;
                    return (
                      <button
                        key={statusKey}
                        type="button"
                        onClick={() => setStatusFilter(statusKey)}
                        className={`px-3.5 min-h-[38px] text-xs font-medium rounded-lg border transition-colors cursor-pointer tabular-nums ${
                          active
                            ? 'bg-[#115E46] border-[#115E46] text-white'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {bookingFeedback && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm px-4 py-3 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                  <span>{bookingFeedback}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingFeedback('')}
                  className="text-xs font-medium text-emerald-800 hover:underline cursor-pointer"
                >
                  Yopish
                </button>
              </div>
            )}

            {/* Bookings Cards List */}
            {filteredReservations.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-2">
                <Inbox className="w-8 h-8 text-stone-400 mx-auto" aria-hidden="true" />
                <p className="text-sm font-medium text-stone-800">
                  Hozircha bron xabarlari topilmadi
                </p>
                <p className="text-xs text-stone-500">
                  Yangi arizalar saytdagi bron formasi orqali yuborilishi bilan
                  avtomatik shu yerda paydo bo‘ladi.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReservations.map((booking) => {
                  const meta = STATUS_META[booking.status];
                  const draftNote = noteDrafts[booking.id] ?? booking.adminNote;
                  const noteChanged = draftNote !== booking.adminNote;
                  const telegramReplyText = encodeURIComponent(
                    `Bron #${booking.code} (${booking.name}, ${booking.phone}) — ${booking.date} ${booking.time}, ${booking.hallTitle}, ${booking.guests} kishi.`
                  );

                  return (
                    <article
                      key={booking.id}
                      className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                              #{booking.code}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded border ${meta.badgeClass}`}
                            >
                              {meta.label}
                            </span>
                            <span className="text-xs text-stone-500 tabular-nums">
                              {formatTimestampUz(booking.createdAt)}
                            </span>
                          </div>
                          <h2 className="text-lg font-semibold text-stone-900">
                            {booking.name}
                          </h2>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-700">
                            <a
                              href={`tel:${booking.phone.replace(/\s+/g, '')}`}
                              className="inline-flex items-center gap-1.5 font-medium text-[#115E46] hover:underline tabular-nums"
                            >
                              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{booking.phone}</span>
                            </a>
                            <span className="inline-flex items-center gap-1.5 tabular-nums">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
                              <span>
                                {booking.date} · {booking.time}
                              </span>
                            </span>
                            <span className="font-medium tabular-nums">
                              {booking.guests} kishi · {booking.hallTitle}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <a
                            href={`https://t.me/${RESTAURANT_INFO.telegramUsername}?text=${telegramReplyText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 min-h-[38px] text-xs font-medium text-[#1B8BC0] bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>@{RESTAURANT_INFO.telegramUsername}</span>
                          </a>

                          {canManageBookings && (
                            <>
                              {confirmDeleteBookingId === booking.id ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={savingBookingId === booking.id}
                                    onClick={() => void handleDeleteBooking(booking)}
                                    className="px-3 min-h-[38px] text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                                  >
                                    O‘chirishni tasdiqlash
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteBookingId(null)}
                                    className="px-2.5 min-h-[38px] text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
                                  >
                                    Bekor
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteBookingId(booking.id)}
                                  aria-label={`#${booking.code} bronni o‘chirish`}
                                  className="inline-flex items-center gap-1.5 px-3 min-h-[38px] text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>O‘chirish</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="bg-[#f8f9f8] border border-stone-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-700">
                          <span className="font-medium text-stone-900">
                            Mehmon izohi:{' '}
                          </span>
                          {booking.notes}
                        </div>
                      )}

                      {/* Status Switcher + Internal Admin Note */}
                      <div className="pt-3 border-t border-stone-100 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        <div className="lg:col-span-6 flex flex-wrap gap-1.5">
                          {(
                            ['new', 'confirmed', 'arrived', 'cancelled'] as const
                          ).map((st) => {
                            const active = booking.status === st;
                            return (
                              <button
                                key={st}
                                type="button"
                                disabled={
                                  !canManageBookings ||
                                  savingBookingId === booking.id ||
                                  active
                                }
                                onClick={() => void handleUpdateBookingStatus(booking, st)}
                                className={`px-3 min-h-[36px] text-xs font-medium rounded-lg border transition-colors ${
                                  active
                                    ? 'bg-stone-900 border-stone-900 text-white'
                                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed'
                                }`}
                              >
                                {STATUS_META[st].label}
                              </button>
                            );
                          })}
                        </div>

                        <div className="lg:col-span-6 flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={500}
                            disabled={!canManageBookings}
                            value={draftNote}
                            onChange={(e) =>
                              setNoteDrafts((prev) => ({
                                ...prev,
                                [booking.id]: e.target.value,
                              }))
                            }
                            placeholder="Menejer izohi (masalan: 4-stol tayyorlandi)..."
                            className="flex-1 px-3 min-h-[38px] text-xs sm:text-sm bg-[#f8f9f8] border border-stone-200 rounded-lg disabled:opacity-60 focus:outline-none focus:border-[#115E46]"
                          />
                          {canManageBookings && (
                            <button
                              type="button"
                              disabled={!noteChanged || savingBookingId === booking.id}
                              onClick={() => void handleSaveBookingNote(booking)}
                              className="inline-flex items-center gap-1 px-3.5 min-h-[38px] text-xs font-medium text-white bg-[#115E46] hover:bg-[#0D4A37] disabled:opacity-40 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Saqlash</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {booking.handledByEmail && (
                        <p className="text-[11px] text-stone-400">
                          Oxirgi tahrir: {booking.handledByEmail}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ================= TAB 2: STATISTIKA ================= */}
        {activeTab === 'stats' && (
          <section aria-label="Restoran statistikasi" className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900">
                Statistika va tahlil
              </h1>
              <p className="text-sm text-stone-600">
                Bronlar oqimi, zallar bandligi, faol soatlar va mijozlar ko‘rsatkichlari.
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1">
                <p className="text-xs font-medium text-stone-500">Jami bronlar</p>
                <p className="text-3xl font-semibold text-stone-900 tabular-nums">
                  {stats.total}
                </p>
                <p className="text-xs text-stone-500 tabular-nums">
                  {stats.uniqueCustomersCount} ta noyob mijoz
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1">
                <p className="text-xs font-medium text-stone-500">
                  Yangi (ko‘rib chiqilmagan)
                </p>
                <p className="text-3xl font-semibold text-amber-600 tabular-nums">
                  {stats.byStatus.new}
                </p>
                <p className="text-xs text-stone-500">
                  Javob kutayotgan arizalar
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1">
                <p className="text-xs font-medium text-stone-500">
                  Tasdiqlangan va kelgan
                </p>
                <p className="text-3xl font-semibold text-[#115E46] tabular-nums">
                  {stats.byStatus.confirmed + stats.byStatus.arrived}
                </p>
                <p className="text-xs text-stone-500 tabular-nums">
                  Konversiya: {stats.successRate}%
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1">
                <p className="text-xs font-medium text-stone-500">
                  Jami mehmonlar (faol)
                </p>
                <p className="text-3xl font-semibold text-stone-900 tabular-nums">
                  {stats.totalGuests}
                </p>
                <p className="text-xs text-stone-500 tabular-nums">
                  O‘rtacha: {stats.avgGuests} kishi / bron
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Halls Breakdown */}
              <div className="lg:col-span-6 bg-white border border-stone-200 rounded-xl p-6 space-y-4">
                <h2 className="font-display text-lg font-semibold text-stone-900">
                  Zallar bo‘yicha taqsimot
                </h2>
                <div className="space-y-4">
                  {stats.byHall.map((hall) => {
                    const pct =
                      stats.total > 0 ? Math.round((hall.count / stats.total) * 100) : 0;
                    return (
                      <div key={hall.title} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="font-medium text-stone-800">
                            {hall.title}
                          </span>
                          <span className="text-stone-600 tabular-nums">
                            {hall.count} ta bron · {hall.guests} mehmon ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#115E46] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status + Peak Times */}
              <div className="lg:col-span-6 bg-white border border-stone-200 rounded-xl p-6 space-y-5">
                <h2 className="font-display text-lg font-semibold text-stone-900">
                  Bron holatlari va eng faol vaqtlar
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {(['new', 'confirmed', 'arrived', 'cancelled'] as const).map(
                    (st) => (
                      <div
                        key={st}
                        className="border border-stone-200 rounded-lg p-3 flex items-center justify-between"
                      >
                        <span className="text-xs font-medium text-stone-700">
                          {STATUS_META[st].label}
                        </span>
                        <span className="text-base font-semibold text-stone-900 tabular-nums">
                          {stats.byStatus[st]}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-2.5">
                  <p className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Kelish vaqtlari bo‘yicha talab</span>
                  </p>
                  {stats.timeSlotsSorted.length === 0 ? (
                    <p className="text-xs text-stone-400">Hali ma’lumot yo‘q</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {stats.timeSlotsSorted.map(([slot, count]) => (
                        <div
                          key={slot}
                          className="px-3 py-1.5 rounded-lg bg-[#f8f9f8] border border-stone-200 text-xs font-medium text-stone-800 tabular-nums"
                        >
                          {slot} — <strong>{count}</strong> ta
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 7-Day Trend Bar Chart */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-stone-900">
                  Oxirgi 7 kunlik bronlar dinamikasi
                </h2>
                <span className="text-xs text-stone-500">Sana bo‘yicha soni</span>
              </div>
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-4">
                {stats.last7Days.map((day) => {
                  const heightPct = Math.round((day.count / stats.maxDailyCount) * 100);
                  return (
                    <div
                      key={day.date}
                      className="flex flex-col items-center justify-end h-full gap-2"
                    >
                      <span className="text-xs font-semibold text-stone-700 tabular-nums">
                        {day.count}
                      </span>
                      <div className="w-full max-w-[44px] flex-1 bg-stone-100 rounded-t-lg flex items-end overflow-hidden">
                        <div
                          className="w-full bg-[#115E46] rounded-t-lg transition-all"
                          style={{
                            height: `${day.count === 0 ? 4 : Math.max(12, heightPct)}%`,
                            opacity: day.count === 0 ? 0.25 : 1,
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-stone-500 tabular-nums">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 3: MIJOZLAR CRM ================= */}
        {activeTab === 'crm' && (
          <section aria-label="Mijozlar CRM bazasi" className="space-y-5">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900">
                Mijozlar CRM tizimi
              </h1>
              <p className="text-sm text-stone-600">
                Telefon raqami bo‘yicha birlashtirilgan mijozlar tarixi, tashrif
                soni, VIP teglar va menejer izohlari.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
              <div className="relative">
                <Search
                  className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={crmSearch}
                  onChange={(e) => setCrmSearch(e.target.value)}
                  placeholder="Mijoz ismi, telefon raqami yoki CRM izohi bo‘yicha qidirish..."
                  className="w-full pl-10 pr-4 min-h-[44px] text-sm bg-[#f8f9f8] border border-stone-200 rounded-lg focus:outline-none focus:border-[#115E46]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCrmTagFilter('all')}
                  className={`px-3 min-h-[36px] text-xs font-medium rounded-lg border cursor-pointer ${
                    crmTagFilter === 'all'
                      ? 'bg-[#115E46] border-[#115E46] text-white'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  Barchasi
                </button>
                {CRM_TAG_SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCrmTagFilter(tag)}
                    className={`px-3 min-h-[36px] text-xs font-medium rounded-lg border cursor-pointer ${
                      crmTagFilter === tag
                        ? 'bg-[#115E46] border-[#115E46] text-white'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {aggregatedCustomers.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-2">
                <Users className="w-8 h-8 text-stone-400 mx-auto" aria-hidden="true" />
                <p className="text-sm font-medium text-stone-800">
                  Mijozlar topilmadi
                </p>
                <p className="text-xs text-stone-500">
                  Bronlar kelib tushgach, har bir mijoz avtomatik ravishda CRM
                  ro‘yxatida shakllanadi.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aggregatedCustomers.map((customer) => {
                  const isEditing = editingCustomerId === customer.phoneNormalized;
                  return (
                    <article
                      key={customer.phoneNormalized}
                      className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-base sm:text-lg font-semibold text-stone-900">
                            {customer.name}
                          </h2>
                          <a
                            href={`tel:${customer.phoneDisplay.replace(/\s+/g, '')}`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#115E46] hover:underline tabular-nums mt-0.5"
                          >
                            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{customer.phoneDisplay}</span>
                          </a>
                        </div>

                        {canManageBookings && !isEditing && (
                          <button
                            type="button"
                            onClick={() => openCrmEditor(customer)}
                            className="px-3 min-h-[36px] text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                          >
                            CRM tahrirlash
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-[#f8f9f8] border border-stone-200/80 rounded-lg p-3 text-center">
                        <div>
                          <p className="text-[11px] text-stone-500">Jami bron</p>
                          <p className="text-base font-semibold text-stone-900 tabular-nums">
                            {customer.totalBookings}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-stone-500">Kelgan/Tasd.</p>
                          <p className="text-base font-semibold text-[#115E46] tabular-nums">
                            {customer.confirmedOrArrived}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-stone-500">Mehmonlar</p>
                          <p className="text-base font-semibold text-stone-900 tabular-nums">
                            {customer.totalGuests}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-stone-600 flex flex-wrap justify-between gap-2">
                        <span>Oxirgi sana: {customer.lastDate}</span>
                        <span>Zal: {customer.preferredHall}</span>
                      </div>

                      {customer.tags.length > 0 && !isEditing && (
                        <div className="flex flex-wrap gap-1.5">
                          {customer.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {customer.crmNote && !isEditing && (
                        <p className="text-xs text-stone-700 bg-stone-50 border border-stone-200 rounded-lg p-3">
                          {customer.crmNote}
                        </p>
                      )}

                      {isEditing && (
                        <div className="pt-3 border-t border-stone-200 space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-stone-700 mb-1">
                              Mijoz ismi
                            </label>
                            <input
                              type="text"
                              maxLength={80}
                              value={crmNameDraft}
                              onChange={(e) => setCrmNameDraft(e.target.value)}
                              className="w-full px-3 min-h-[40px] text-sm bg-[#f8f9f8] border border-stone-200 rounded-lg focus:outline-none focus:border-[#115E46]"
                            />
                          </div>

                          <div>
                            <span className="block text-xs font-medium text-stone-700 mb-1.5">
                              Teglar
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {CRM_TAG_SUGGESTIONS.map((tag) => {
                                const selected = crmTagsDraft.includes(tag);
                                return (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleCrmTag(tag)}
                                    className={`px-2.5 py-1 text-xs font-medium rounded border cursor-pointer ${
                                      selected
                                        ? 'bg-[#115E46] border-[#115E46] text-white'
                                        : 'bg-white border-stone-200 text-stone-700'
                                    }`}
                                  >
                                    {tag}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-stone-700 mb-1">
                              CRM izoh (didlar, afzal stol, eslatmalar)
                            </label>
                            <textarea
                              rows={2}
                              maxLength={500}
                              value={crmNoteDraft}
                              onChange={(e) => setCrmNoteDraft(e.target.value)}
                              placeholder="Masalan: VIP-2 xonasini yaxshi ko‘radi, choy limonli..."
                              className="w-full p-2.5 text-sm bg-[#f8f9f8] border border-stone-200 rounded-lg focus:outline-none focus:border-[#115E46]"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={savingCrmId === customer.phoneNormalized}
                              onClick={() => void handleSaveCrmCustomer(customer)}
                              className="inline-flex items-center gap-1.5 px-4 min-h-[40px] text-xs font-medium text-white bg-[#115E46] hover:bg-[#0D4A37] rounded-lg cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Saqlash</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCustomerId(null)}
                              className="inline-flex items-center gap-1.5 px-4 min-h-[40px] text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Bekor</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ================= TAB 4: ADMINLAR VA HUQUQLAR ================= */}
        {activeTab === 'admins' && canManageAdmins && (
          <section aria-label="Adminlar va huquqlar boshqaruvi" className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900">
                Adminlar va huquqlar
              </h1>
              <p className="text-sm text-stone-600">
                Yangi admin qo‘shing, olib tashlang hamda har bir admin uchun{' '}
                <strong>panelga kirish</strong> va <strong>boshqarish</strong>{' '}
                huquqlarini alohida belgilang.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Add Admin Form */}
              <form
                onSubmit={(e) => void handleAddAdmin(e)}
                className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#115E46]" aria-hidden="true" />
                  <h2 className="font-display text-lg font-semibold text-stone-900">
                    Yangi admin qo‘shish
                  </h2>
                </div>

                <div>
                  <label
                    htmlFor="new-admin-email"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Google Email manzili
                  </label>
                  <input
                    id="new-admin-email"
                    type="email"
                    required
                    maxLength={120}
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="aligulyamov@gmail.com"
                    className="w-full px-3.5 min-h-[44px] text-sm bg-[#f8f9f8] border border-stone-200 rounded-lg focus:outline-none focus:border-[#115E46]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new-admin-name"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Ismi va lavozimi
                  </label>
                  <input
                    id="new-admin-name"
                    type="text"
                    required
                    maxLength={80}
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="Masalan, Aligulyamov — Menejer"
                    className="w-full px-3.5 min-h-[44px] text-sm bg-[#f8f9f8] border border-stone-200 rounded-lg focus:outline-none focus:border-[#115E46]"
                  />
                </div>

                <div className="space-y-2.5 pt-2 border-t border-stone-100">
                  <p className="text-xs font-semibold text-stone-800">
                    Huquqlar darajasi
                  </p>

                  <label className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanAccess}
                      onChange={(e) => setNewCanAccess(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#115E46]"
                    />
                    <span>
                      <strong className="text-stone-900 block">
                        Panelga kirish huquqi
                      </strong>
                      Bron xabarlari, CRM va statistikani ko‘ra oladi
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanManageBookings}
                      onChange={(e) => {
                        setNewCanManageBookings(e.target.checked);
                        if (e.target.checked) setNewCanAccess(true);
                      }}
                      className="mt-0.5 w-4 h-4 accent-[#115E46]"
                    />
                    <span>
                      <strong className="text-stone-900 block">
                        Boshqarish huquqi
                      </strong>
                      Bron holatini o‘zgartirish, o‘chirish va CRM tahrirlash
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanManageAdmins}
                      onChange={(e) => {
                        setNewCanManageAdmins(e.target.checked);
                        if (e.target.checked) setNewCanAccess(true);
                      }}
                      className="mt-0.5 w-4 h-4 accent-[#115E46]"
                    />
                    <span>
                      <strong className="text-stone-900 block">
                        Admin qo‘shish va olish huquqi
                      </strong>
                      Boshqa adminlarni qo‘shish, huquqlarini o‘zgartirish va o‘chirish
                    </span>
                  </label>
                </div>

                {adminFormError && (
                  <p role="alert" className="text-xs font-medium text-rose-600">
                    {adminFormError}
                  </p>
                )}

                {adminFormSuccess && (
                  <p className="text-xs font-medium text-[#115E46]">
                    {adminFormSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submittingAdmin}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 min-h-[46px] text-sm font-medium text-white bg-[#115E46] hover:bg-[#0D4A37] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>{submittingAdmin ? 'Saqlanmoqda...' : 'Admin qo‘shish'}</span>
                </button>
              </form>

              {/* Admins List */}
              <div className="lg:col-span-7 space-y-3">
                {/* Bootstrapped Immutable Super Admin Card */}
                <div className="bg-[#141a17] text-white border border-stone-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                      <span className="text-xs font-semibold text-emerald-400">
                        Asosiy Super Admin (Doimiy)
                      </span>
                    </div>
                    <p className="text-base font-semibold text-white">
                      {SUPER_ADMIN_EMAIL}
                    </p>
                    <p className="text-xs text-stone-400">
                      Barcha huquqlarga ega: Kirish · Boshqarish · Adminlarni
                      boshqarish
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg self-start sm:self-center">
                    Himoyalangan
                  </span>
                </div>

                {adminsList.filter((a) => a.email !== SUPER_ADMIN_EMAIL).length === 0 ? (
                  <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-sm text-stone-500">
                    Hozircha qo‘shimcha adminlar qo‘shilmagan. Chapdagi forma
                    orqali istalgan Google emailni admin qilib qo‘shishingiz mumkin.
                  </div>
                ) : (
                  adminsList
                    .filter((a) => a.email !== SUPER_ADMIN_EMAIL)
                    .map((admin) => (
                      <article
                        key={admin.email}
                        className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-stone-900">
                              {admin.displayName}
                            </h3>
                            <p className="text-sm text-stone-600">{admin.email}</p>
                            <p className="text-[11px] text-stone-400 mt-0.5">
                              Qo‘shgan: {admin.addedBy}
                            </p>
                          </div>

                          {confirmDeleteAdminEmail === admin.email ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => void handleRemoveAdmin(admin.email)}
                                className="px-3 min-h-[36px] text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                              >
                                Olib tashlashni tasdiqlash
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteAdminEmail(null)}
                                className="px-2.5 min-h-[36px] text-xs font-medium text-stone-600 bg-stone-100 rounded-lg cursor-pointer"
                              >
                                Bekor
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteAdminEmail(admin.email)}
                              className="inline-flex items-center gap-1.5 px-3 min-h-[36px] text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg cursor-pointer self-start"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Olib tashlash</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() =>
                              void handleToggleAdminPermission(admin, 'canAccessPanel')
                            }
                            className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer ${
                              admin.canAccessPanel
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-stone-50 border-stone-200 text-stone-500'
                            }`}
                          >
                            <span className="block font-semibold">
                              Panelga kirish
                            </span>
                            <span className="text-[11px]">
                              {admin.canAccessPanel ? 'Ruxsat bor' : 'Yopiq'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleToggleAdminPermission(
                                admin,
                                'canManageBookings'
                              )
                            }
                            className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer ${
                              admin.canManageBookings
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-stone-50 border-stone-200 text-stone-500'
                            }`}
                          >
                            <span className="block font-semibold">
                              Boshqarish huquqi
                            </span>
                            <span className="text-[11px]">
                              {admin.canManageBookings ? 'Ruxsat bor' : 'Faqat ko‘rish'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleToggleAdminPermission(admin, 'canManageAdmins')
                            }
                            className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer ${
                              admin.canManageAdmins
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-stone-50 border-stone-200 text-stone-500'
                            }`}
                          >
                            <span className="block font-semibold">
                              Admin qo‘shish/olish
                            </span>
                            <span className="text-[11px]">
                              {admin.canManageAdmins ? 'Ruxsat bor' : 'Cheklangan'}
                            </span>
                          </button>
                        </div>
                      </article>
                    ))
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
