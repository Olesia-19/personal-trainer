"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useHeaderReveal } from "@/hooks/useHeaderReveal";
import styles from "./BookingSection.module.css";

const TIMES = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "06:30 PM",
] as const;

type TimeSlot = (typeof TIMES)[number];

type DayOption = {
  id: string;
  weekday: string;
  day: number;
  labelLong: string;
  monthLabel: string;
};

const BookingSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const requestButtonRef = useRef<HTMLButtonElement>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");

  useHeaderReveal({
    triggerRef: sectionRef,
    eyebrowRef,
    headingRef,
    leadRef,
  });

  const days = useMemo(() => {
    const result: DayOption[] = [];

    for (let i = 0; i < 5; i++) {
      const futureDate = new Date();
      futureDate.setHours(12, 0, 0, 0);
      futureDate.setDate(futureDate.getDate() + i);

      const year = futureDate.getFullYear();
      const month = String(futureDate.getMonth() + 1).padStart(2, "0");
      const dayNum = String(futureDate.getDate()).padStart(2, "0");

      result.push({
        id: `${year}-${month}-${dayNum}`,
        weekday: futureDate.toLocaleDateString("en-US", { weekday: "short" }),
        day: futureDate.getDate(),
        labelLong: futureDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
        monthLabel: futureDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }

    return result;
  }, []);

  const monthLabel = days[0]?.monthLabel ?? null;

  const selectedDay = useMemo(
    () => days.find((day) => day.id === selectedDate) ?? null,
    [days, selectedDate],
  );

  const handleDateSelect = (dayId: string) => {
    setSelectedDate((prev) => (prev === dayId ? null : dayId));
  };

  const handleTimeSelect = (time: TimeSlot) => {
    setSelectedTime((prev) => (prev === time ? null : time));
  };

  const hasSelection = selectedDate !== null && selectedTime !== null;

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        setHasSubmitted(false);
        if (hasSubmitted) {
          setSelectedDate(null);
          setSelectedTime(null);
        }
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [hasSubmitted, isModalOpen]);

  const handleOpenModal = () => {
    if (!hasSelection) {
      return;
    }

    setHasSubmitted(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (hasSubmitted) {
      setSelectedDate(null);
      setSelectedTime(null);
    }
    setHasSubmitted(false);
    requestAnimationFrame(() => {
      requestButtonRef.current?.focus();
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    setName("");
    setContact("");
    setEmail("");
  };

  const summaryDate = selectedDay?.labelLong ?? "Not selected";
  const summaryTime = selectedTime ?? "Not selected";
  const hintText = hasSelection
    ? "Your assessment is ready to request. We'll confirm by invitation."
    : "Select preferred date and time to review your assessment details.";

  return (
    <section
      ref={sectionRef}
      id="book"
      className={styles.section}
      aria-labelledby="booking-heading"
    >
      <div className="container">
        <header className="sectionHeader">
          <p ref={eyebrowRef} className="eyebrow">
            Tailored to your schedule
          </p>
          <h2
            ref={headingRef}
            id="booking-heading"
            className="sectionTitle"
          >
            Book Your Assessment
          </h2>
          <p ref={leadRef} className={`sectionLead ${styles.lead}`}>
            30 minutes: we&apos;ll talk through your goals, any health
            considerations, and sketch out a first draft of your program. No
            obligation either way.
          </p>
        </header>

        <div className={styles.panel}>
          <div className={styles.pick}>
            <fieldset className={styles.group}>
              <div className={styles.groupHead}>
                <legend className={styles.groupLegend} id="booking-date-legend">
                  <span className={styles.step} aria-hidden="true">
                    1
                  </span>
                  <span className={styles.groupTitle}>Choose date</span>
                </legend>
                {monthLabel ? (
                  <span className={styles.monthLabel}>{monthLabel}</span>
                ) : null}
              </div>

              <div
                className={styles.dateGrid}
                role="group"
                aria-labelledby="booking-date-legend"
              >
                {days.map((day) => {
                  const isActive = selectedDate === day.id;
                  return (
                    <button
                      key={day.id}
                      type="button"
                      className={`${styles.dateChip} ${isActive ? styles.chipActive : ""}`}
                      onClick={() => handleDateSelect(day.id)}
                      aria-pressed={isActive}
                      aria-label={day.labelLong}
                    >
                      <span className={styles.dateWeekday}>{day.weekday}</span>
                      <span className={styles.dateDay}>{day.day}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className={styles.group}>
              <div className={styles.groupHead}>
                <legend className={styles.groupLegend} id="booking-time-legend">
                  <span className={styles.step} aria-hidden="true">
                    2
                  </span>
                  <span className={styles.groupTitle}>Choose time</span>
                </legend>
              </div>

              <div
                className={styles.timeGrid}
                role="group"
                aria-labelledby="booking-time-legend"
              >
                {TIMES.map((time) => {
                  const isActive = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      className={`${styles.timeChip} ${isActive ? styles.chipActive : ""}`}
                      onClick={() => handleTimeSelect(time)}
                      aria-pressed={isActive}
                      aria-label={time}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <aside className={styles.summary} aria-live="polite">
            <div className={styles.summaryHead}>
              <h3 className={styles.summaryTitle}>Session Summary</h3>
              <span className={styles.durationPill}>30 min</span>
            </div>

            <dl className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <dt>Date</dt>
                <dd
                  className={
                    selectedDay ? styles.summaryValue : styles.summaryEmpty
                  }
                >
                  {summaryDate}
                </dd>
              </div>
              <div className={styles.summaryRow}>
                <dt>Time</dt>
                <dd
                  className={
                    selectedTime ? styles.summaryValue : styles.summaryEmpty
                  }
                >
                  {summaryTime}
                </dd>
              </div>
              <div className={styles.summaryRow}>
                <dt>Duration</dt>
                <dd className={styles.summaryValue}>30 minutes</dd>
              </div>
              <div className={styles.summaryRow}>
                <dt>Cost</dt>
                <dd className={styles.summaryValue}>Free</dd>
              </div>
            </dl>

            <p className={styles.hint}>{hintText}</p>

            <div className={styles.badges}>
              <span className="badge">Free consultation</span>
              <span className="badge">No commitment</span>
            </div>

            <button
              ref={requestButtonRef}
              type="button"
              className={`btn btn-primary ${styles.requestButton} ${!hasSelection ? styles.requestButtonDisabled : ""}`}
              onClick={handleOpenModal}
              disabled={!hasSelection}
            >
              Request Invitation
            </button>
          </aside>
        </div>
      </div>

      {isModalOpen ? (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={handleCloseModal}
        >
          <div
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={handleCloseModal}
              aria-label="Close invitation form"
            >
              ×
            </button>

            {hasSubmitted ? (
              <div className={styles.successState}>
                <div className={styles.successCheck} aria-hidden="true">
                  <svg viewBox="0 0 24 24" className={styles.successCheckIcon}>
                    <path d="M20 6L9 17L4 12" />
                  </svg>
                </div>
                <h3 id="booking-modal-title" className={styles.modalTitle}>
                  Application Sent.
                </h3>
                <p className={styles.modalSummary}>
                  Our team will review your request and contact you shortly.
                </p>
              </div>
            ) : (
              <div>
                <p className={styles.modalEyebrow}>Private Access</p>
                <h3 id="booking-modal-title" className={styles.modalTitle}>
                  Request Invitation
                </h3>
                <p className={styles.modalSummary}>
                  Requesting invitation for: {selectedDay?.labelLong ?? selectedDate}{" "}
                  at {selectedTime}
                </p>

                <form className={styles.modalForm} onSubmit={handleSubmit}>
                  <label className={styles.fieldLabel} htmlFor="booking-name">
                    Full Name
                  </label>
                  <input
                    id="booking-name"
                    className={styles.fieldInput}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    required
                  />

                  <label
                    className={styles.fieldLabel}
                    htmlFor="booking-contact"
                  >
                    Contact (Phone or Telegram handle)
                  </label>
                  <input
                    id="booking-contact"
                    className={styles.fieldInput}
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    autoComplete="tel"
                    required
                  />

                  <label className={styles.fieldLabel} htmlFor="booking-email">
                    Email Address
                  </label>
                  <input
                    id="booking-email"
                    type="email"
                    className={styles.fieldInput}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />

                  <button
                    type="submit"
                    className={`btn btn-primary ${styles.submitButton}`}
                  >
                    Submit Application
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default BookingSection;
