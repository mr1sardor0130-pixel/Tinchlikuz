import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Mail,
  Minus,
  Phone,
  Plus,
  Send,
} from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { HALL_OPTIONS, RESTAURANT_INFO } from '../data/restaurantData';
import { useLanguage } from '../context/LanguageContext';
import { SiteTranslation, TRANSLATIONS } from '../data/translations';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface ReservationSectionProps {
  selectedHallId: string;
  onHallChange: (hallId: string) => void;
}

const TIME_SLOTS = ['12:30', '14:00', '18:00', '19:30', '21:00'];

interface ConfirmedBooking {
  id: string;
  code: string;
  name: string;
  phone: string;
  hallTitle: string;
  date: string;
  time: string;
  guests: number;
  notes: string;
  messageText: string;
  telegramDirectUrl: string;
  mailtoUrl: string;
}

function buildBookingMessage(
  t: SiteTranslation,
  data: {
    code: string;
    name: string;
    phone: string;
    hallTitle: string;
    date: string;
    time: string;
    guests: number;
    notes: string;
  }
): string {
  const lines = [
    t.reservation.msgGreeting,
    '',
    `${t.reservation.msgCode}: #${data.code}`,
    `${t.reservation.msgHall}: ${data.hallTitle}`,
    `${t.reservation.msgDate}: ${data.date}`,
    `${t.reservation.msgTime}: ${data.time}`,
    `${t.reservation.msgGuests}: ${data.guests} ${t.reservation.guestsUnit}`,
    `${t.reservation.msgName}: ${data.name}`,
    `${t.reservation.msgPhone}: ${data.phone}`,
  ];
  if (data.notes.trim()) {
    lines.push(`${t.reservation.msgNotes}: ${data.notes.trim()}`);
  }
  return lines.join('\n');
}

export function ReservationSection({
  selectedHallId,
  onHallChange,
}: ReservationSectionProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('19:30');
  const [guests, setGuests] = useState(4);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState<ConfirmedBooking | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  const telegramTriggerRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (selectedHallId === 'banket-zali' && guests < 20) {
      setGuests(40);
    } else if (selectedHallId === 'vip-xona' && (guests < 6 || guests > 24)) {
      setGuests(10);
    } else if (selectedHallId === 'oilaviy-zal' && guests > 20) {
      setGuests(4);
    }
  }, [selectedHallId]);

  const handleGuestStep = (delta: number) => {
    setGuests((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > 250) return 250;
      return next;
    });
  };

  const handleCopyText = async () => {
    if (!confirmed) return;
    try {
      await navigator.clipboard.writeText(confirmed.messageText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard may be restricted in some preview frames
    }
  };

  const persistReservation = async (
    reservationId: string,
    payload: {
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
    }
  ) => {
    setCloudStatus('saving');
    const docPath = `reservations/${reservationId}`;
    try {
      await setDoc(doc(db, 'reservations', reservationId), {
        code: payload.code,
        name: payload.name,
        phone: payload.phone,
        phoneNormalized: payload.phoneNormalized,
        hallId: payload.hallId,
        hallTitle: payload.hallTitle,
        date: payload.date,
        time: payload.time,
        guests: payload.guests,
        notes: payload.notes,
        status: 'new',
        adminNote: '',
        telegramTarget: `@${RESTAURANT_INFO.telegramUsername}`,
        handledByEmail: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setCloudStatus('saved');
    } catch (err) {
      setCloudStatus('error');
      handleFirestoreError(err, OperationType.CREATE, docPath);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setCopied(false);

    const cleanName = name.trim().slice(0, 80);
    const cleanPhone = phone.trim().slice(0, 30);
    const digitsOnly = cleanPhone.replace(/\D/g, '').slice(0, 20);
    const cleanNotes = notes.trim().slice(0, 500);
    const clampedGuests = Math.max(1, Math.min(250, Math.trunc(Number(guests) || 1)));

    if (cleanName.length < 2) {
      setError(t.reservation.errName);
      return;
    }

    if (digitsOnly.length < 7) {
      setError(t.reservation.errPhone);
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError(t.reservation.errDate);
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      setError(t.reservation.errTime);
      return;
    }

    const hallObj = HALL_OPTIONS.find((h) => h.id === selectedHallId) || HALL_OPTIONS[0];
    const localizedHallTitle = (t.hallsData[hallObj.id]?.title || hallObj.title).slice(0, 80);
    const code = `TN-${Math.floor(1000 + Math.random() * 9000)}`;
    const reservationId = `tn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const messageText = buildBookingMessage(t, {
      code,
      name: cleanName,
      phone: cleanPhone,
      hallTitle: localizedHallTitle,
      date,
      time,
      guests: clampedGuests,
      notes: cleanNotes,
    });

    const telegramDirectUrl = `https://t.me/${RESTAURANT_INFO.telegramUsername}?text=${encodeURIComponent(
      messageText
    )}`;

    const mailSubject = `${t.reservation.mailSubjectPrefix} #${code} — ${cleanName} (${date}, ${time})`;
    const mailtoUrl = `mailto:${RESTAURANT_INFO.email}?subject=${encodeURIComponent(
      mailSubject
    )}&body=${encodeURIComponent(messageText)}`;

    setConfirmed({
      id: reservationId,
      code,
      name: cleanName,
      phone: cleanPhone,
      hallTitle: localizedHallTitle,
      date,
      time,
      guests: clampedGuests,
      notes: cleanNotes,
      messageText,
      telegramDirectUrl,
      mailtoUrl,
    });

    if (telegramTriggerRef.current) {
      telegramTriggerRef.current.href = telegramDirectUrl;
      telegramTriggerRef.current.click();
    }

    void persistReservation(reservationId, {
      code,
      name: cleanName,
      phone: cleanPhone,
      phoneNormalized: digitsOnly,
      hallId: hallObj.id,
      hallTitle: localizedHallTitle,
      date,
      time,
      guests: clampedGuests,
      notes: cleanNotes,
    }).catch((err) => {
      console.error(err);
    });
  };

  return (
    <section id="bron" className="py-16 lg:py-20 bg-[#141a17] text-stone-100">
      <a
        ref={telegramTriggerRef}
        href={RESTAURANT_INFO.telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        Telegram
      </a>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-medium text-emerald-400 tracking-wide mb-2">
                {t.reservation.eyebrow}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight text-balance">
                {t.reservation.title}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-stone-300 leading-relaxed">
                {t.reservation.subtitlePrefix}
                <span className="text-emerald-300 font-medium">
                  @{RESTAURANT_INFO.telegramUsername}
                </span>
                {t.reservation.subtitleMiddle}
                <span className="text-white font-medium">
                  {RESTAURANT_INFO.email}
                </span>
                {t.reservation.subtitleSuffix}
              </p>
            </div>

            <div className="pt-6 border-t border-stone-800 space-y-4">
              <p className="text-xs font-medium text-stone-400">
                {t.reservation.quickContactTitle}
              </p>
              <div className="space-y-2.5">
                {RESTAURANT_INFO.phones.map((p) => (
                  <a
                    key={p.display}
                    href={p.href}
                    className="flex items-center gap-3 text-base font-medium text-white hover:text-emerald-300 transition-colors tabular-nums"
                  >
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>{p.display}</span>
                  </a>
                ))}
                <a
                  href={RESTAURANT_INFO.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm font-medium text-stone-200 hover:text-emerald-300 transition-colors"
                >
                  <Send className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Telegram: @{RESTAURANT_INFO.telegramUsername}</span>
                </a>
                <a
                  href={`mailto:${RESTAURANT_INFO.email}`}
                  className="flex items-center gap-3 text-sm font-medium text-stone-200 hover:text-emerald-300 transition-colors"
                >
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>{RESTAURANT_INFO.email}</span>
                </a>
              </div>
              <p className="text-xs text-stone-400">
                {t.restaurant.hours} · {t.restaurant.address}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#1b221e] border border-stone-800 rounded-xl p-6 sm:p-8">
            {confirmed ? (
              <div className="space-y-6 py-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-medium text-emerald-400 tabular-nums">
                        {t.reservation.msgCode} · #{confirmed.code}
                      </p>
                      {cloudStatus === 'saved' && (
                        <span className="text-[11px] font-medium text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                          {t.reservation.savedBadge}
                        </span>
                      )}
                      {cloudStatus === 'saving' && (
                        <span className="text-[11px] text-stone-400">
                          {t.reservation.savingBadge}
                        </span>
                      )}
                      {cloudStatus === 'error' && (
                        <span className="text-[11px] text-amber-300">
                          {t.reservation.fallbackBadge}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 font-display text-2xl font-semibold text-white">
                      {t.reservation.confirmedTitle}
                    </h3>
                    <p className="mt-1 text-sm text-stone-300">
                      {t.reservation.confirmedSubtitle(
                        RESTAURANT_INFO.telegramUsername,
                        RESTAURANT_INFO.email
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-stone-800 text-sm">
                  <div>
                    <p className="text-xs text-stone-400">{t.reservation.guestLabel}</p>
                    <p className="mt-0.5 font-medium text-white">{confirmed.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">{t.reservation.phoneLabel}</p>
                    <p className="mt-0.5 font-medium text-white tabular-nums">
                      {confirmed.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">{t.reservation.hallLabel}</p>
                    <p className="mt-0.5 font-medium text-white">{confirmed.hallTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">
                      {t.reservation.dateTimeGuestsLabel}
                    </p>
                    <p className="mt-0.5 font-medium text-white tabular-nums">
                      {confirmed.date} · {confirmed.time} · {confirmed.guests}{' '}
                      {t.reservation.guestsUnit}
                    </p>
                  </div>
                </div>

                <div className="bg-[#141a17] border border-stone-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-stone-400">
                      {t.reservation.emailPreviewLabel} ({RESTAURANT_INFO.email})
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.reservation.copiedText}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.reservation.copyText}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs text-stone-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {confirmed.messageText}
                  </pre>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <a
                    href={confirmed.telegramDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 min-h-[48px] text-sm font-medium text-white bg-[#229ED9] hover:bg-[#1B8BC0] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>
                      {t.reservation.sendTelegramBtn} (@{RESTAURANT_INFO.telegramUsername})
                    </span>
                  </a>

                  <a
                    href={confirmed.mailtoUrl}
                    className="inline-flex items-center justify-center gap-2 px-5 min-h-[48px] text-sm font-medium text-white bg-[#115E46] hover:bg-[#0D4A37] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>
                      {t.reservation.sendEmailBtn} ({RESTAURANT_INFO.email})
                    </span>
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmed(null);
                      setCloudStatus('idle');
                      setNotes('');
                      setCopied(false);
                    }}
                    className="px-4 min-h-[44px] text-xs font-medium text-stone-300 hover:text-white underline underline-offset-4 cursor-pointer"
                  >
                    {t.reservation.newBookingBtn}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-2">
                    {t.reservation.chooseHallLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {HALL_OPTIONS.map((hall) => {
                      const active = selectedHallId === hall.id;
                      const hallTr = t.hallsData[hall.id];
                      return (
                        <button
                          key={hall.id}
                          type="button"
                          onClick={() => onHallChange(hall.id)}
                          className={`px-3.5 py-2.5 text-left rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#115E46] border-[#115E46] text-white'
                              : 'bg-[#141a17] border-stone-700 text-stone-300 hover:border-stone-500'
                          }`}
                        >
                          <span className="block truncate">{hallTr?.title || hall.title}</span>
                          <span className="block text-[11px] opacity-80 mt-0.5 tabular-nums">
                            {hallTr?.capacity || hall.capacity}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="booking-date"
                      className="block text-xs font-medium text-stone-300 mb-1.5"
                    >
                      {t.reservation.dateLabel}
                    </label>
                    <div className="relative">
                      <Calendar
                        className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="booking-date"
                        type="date"
                        min={todayStr}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-3.5 min-h-[44px] text-base sm:text-sm bg-[#141a17] border border-stone-700 rounded-lg text-white tabular-nums focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-stone-300 mb-1.5">
                      {t.reservation.guestsCountLabel}
                    </span>
                    <div className="flex items-center justify-between px-2 min-h-[44px] bg-[#141a17] border border-stone-700 rounded-lg">
                      <button
                        type="button"
                        onClick={() => handleGuestStep(-1)}
                        aria-label={t.reservation.decreaseGuestsAria}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-md text-stone-300 hover:bg-stone-800 transition-colors cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold text-white tabular-nums">
                        {guests} {t.reservation.guestsUnit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleGuestStep(1)}
                        aria-label={t.reservation.increaseGuestsAria}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-md text-stone-300 hover:bg-stone-800 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-stone-300 mb-2">
                    {t.reservation.arrivalTimeLabel}
                  </span>
                  <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const active = time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTime(slot)}
                          className={`px-3.5 min-h-[44px] text-xs sm:text-sm font-medium rounded-lg border tabular-nums transition-colors cursor-pointer ${
                            active
                              ? 'bg-white text-stone-900 border-white'
                              : 'bg-[#141a17] text-stone-300 border-stone-700 hover:border-stone-500'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="booking-name"
                      className="block text-xs font-medium text-stone-300 mb-1.5"
                    >
                      {t.reservation.nameLabel}
                    </label>
                    <input
                      id="booking-name"
                      type="text"
                      maxLength={80}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.reservation.namePlaceholder}
                      className="w-full px-3.5 min-h-[44px] text-base sm:text-sm bg-[#141a17] border border-stone-700 rounded-lg text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-phone"
                      className="block text-xs font-medium text-stone-300 mb-1.5"
                    >
                      {t.reservation.phoneInputLabel}
                    </label>
                    <input
                      id="booking-phone"
                      type="tel"
                      maxLength={30}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-3.5 min-h-[44px] text-base sm:text-sm bg-[#141a17] border border-stone-700 rounded-lg text-white tabular-nums placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="booking-notes"
                    className="block text-xs font-medium text-stone-300 mb-1.5"
                  >
                    {t.reservation.notesLabel}
                  </label>
                  <input
                    id="booking-notes"
                    type="text"
                    maxLength={500}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.reservation.notesPlaceholder}
                    className="w-full px-3.5 min-h-[44px] text-base sm:text-sm bg-[#141a17] border border-stone-700 rounded-lg text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-xs font-medium text-rose-400">
                    {error}
                  </p>
                )}

                <div className="space-y-2.5 pt-1">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 min-h-[48px] text-sm font-medium text-white bg-[#115E46] hover:bg-[#0D4A37] rounded-lg transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>{t.reservation.submitBtn}</span>
                  </button>
                  <p className="text-xs text-stone-400">
                    {t.reservation.submitHint(
                      RESTAURANT_INFO.telegramUsername,
                      RESTAURANT_INFO.email
                    )}
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
