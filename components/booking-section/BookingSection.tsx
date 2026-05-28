"use client";

import { useMemo, useState } from "react";
import styles from "./BookingSection.module.css";

const TIMES = ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "06:30 PM"] as const;

type TimeSlot = (typeof TIMES)[number];

const BookingSection = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);

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
              <button type="button" className={styles.requestButton}>
                Request Invitation
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
