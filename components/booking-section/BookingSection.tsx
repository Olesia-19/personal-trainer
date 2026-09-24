"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./BookingSection.module.css";

const TIMES = ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "06:30 PM"] as const;

type TimeSlot = (typeof TIMES)[number];

const BookingSection = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");

  const days = useMemo(() => {
    const result: string[] = [];

    for (let i = 0; i < 5; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      result.push(
        futureDate.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
        }),
      );
    }

    return result;
  }, []);

  const handleDateSelect = (day: string) => {
    setSelectedDate((prev) => (prev === day ? null : day));
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
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    setName("");
    setContact("");
    setEmail("");
  };

  return (
    <section id="book" className={styles.section} aria-labelledby="booking-title">
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>TAILORED TO YOUR SCHEDULE</p>
          <h2 id="booking-title" className={styles.title}>
            Book Your Assessment
          </h2>
        </header>

        <div className={styles.layout}>
          <div className={styles.leftColumn}>
            <div className={styles.group}>
              <p className={styles.groupLabel}>Choose date</p>
              <div className={styles.daysRow} role="radiogroup" aria-label="Select a preferred date">
                {days.map((day) => {
                  const isActive = selectedDate === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      className={`${styles.dayButton} ${isActive ? styles.dayButtonActive : ""}`}
                      onClick={() => handleDateSelect(day)}
                      aria-pressed={isActive}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Choose time</p>
              <div className={styles.timesGrid}>
                {TIMES.map((time) => {
                  const isActive = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      className={`${styles.timeButton} ${isActive ? styles.timeButtonActive : ""}`}
                      onClick={() => handleTimeSelect(time)}
                      aria-pressed={isActive}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className={styles.rightColumn} aria-live="polite">
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Session Summary</p>
              {hasSelection ? (
                <p className={styles.summaryText}>
                  Assessment Session • {selectedDate} at {selectedTime}
                </p>
              ) : (
                <p className={styles.summaryPlaceholder}>
                  Select preferred date and time to review your assessment details.
                </p>
              )}
              <button
                type="button"
                className={`${styles.requestButton} ${!hasSelection ? styles.requestButtonDisabled : ""}`}
                onClick={handleOpenModal}
                disabled={!hasSelection}
              >
                Request Invitation
              </button>
            </div>
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
                  Requesting invitation for: {selectedDate} at {selectedTime}
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

                  <label className={styles.fieldLabel} htmlFor="booking-contact">
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

                  <button type="submit" className={styles.submitButton}>
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
