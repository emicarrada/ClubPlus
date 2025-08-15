import React, { useState, useEffect } from 'react';
import './styles.css';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Fecha objetivo: 31 de octubre de 2025 a las 23:59:59
  const targetDate = new Date('2025-10-31T23:59:59').getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-container">
      <div className="countdown-timer">
        <div className="time-block">
          <div className="time-value">{timeLeft.days}</div>
          <div className="time-label">DAYS</div>
        </div>
        <div className="time-block">
          <div className="time-value">{timeLeft.hours}</div>
          <div className="time-label">HOURS</div>
        </div>
        <div className="time-block">
          <div className="time-value">{timeLeft.minutes}</div>
          <div className="time-label">MINUTES</div>
        </div>
        <div className="time-block">
          <div className="time-value">{timeLeft.seconds}</div>
          <div className="time-label">SECONDS</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
