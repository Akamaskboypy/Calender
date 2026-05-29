/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(y: number, m: number) { 
  return new Date(y, m + 1, 0).getDate(); 
}

function getFirstDay(y: number, m: number) { 
  return new Date(y, m, 1).getDay(); 
}

export default function App() {
  const [now, setNow] = useState(new Date());
  const [view, setView] = useState<'year' | 'month'>('year');
  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear + 1, 0, 1);
  const totalMs = endOfYear.getTime() - startOfYear.getTime();
  const passedMs = now.getTime() - startOfYear.getTime();
  const percentage = (passedMs / totalMs) * 100;

  const totalDays = Math.floor(totalMs / 86400000);
  const daysPassed = Math.floor(passedMs / 86400000);
  const daysRemaining = totalDays - daysPassed;
  const weekNumber = Math.ceil((daysPassed + 1) / 7);

  const endOfDay = new Date(now.getTime());
  endOfDay.setHours(23, 59, 59, 999);
  const timeLeftMs = endOfDay.getTime() - now.getTime();
  const h = Math.floor(timeLeftMs / 3600000);
  const m = Math.floor((timeLeftMs % 3600000) / 60000);
  const s = Math.floor((timeLeftMs % 60000) / 1000);

  // Month View logic
  const renderMonthDays = () => {
    const days = [];
    const firstDay = getFirstDay(currentYear, selectedMonth);
    const daysInMonth = getDaysInMonth(currentYear, selectedMonth);
    
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayDate.getTime());
    weekStart.setDate(todayDate.getDate() - todayDate.getDay());
    const weekEnd = new Date(weekStart.getTime());
    weekEnd.setDate(weekStart.getDate() + 6);

    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="day-cell empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(currentYear, selectedMonth, day);
        let className = 'day-cell';
        
        if (currentYear === now.getFullYear() && selectedMonth === currentMonth && day === currentDate) {
            className += ' today';
        } else if (cellDate < todayDate) {
            className += ' passed';
        } else if (cellDate >= weekStart && cellDate <= weekEnd) {
            className += ' current-week';
        }

        days.push(<div key={`day-${day}`} className={className}>{day}</div>);
    }
    return days;
  };

  return (
    <div className="main-container">
      <div className="progress-section">
        <div className="year-display">{currentYear}</div>
        <div className="percentage-display">{percentage.toFixed(1)}% complete</div>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="details">
          <div className="detail-item">
            <div className="detail-label">Days Passed</div>
            <div className="detail-value">{daysPassed}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Days Remaining</div>
            <div className="detail-value">{daysRemaining}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Current Week</div>
            <div className="detail-value">Week {weekNumber}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Time Left Today</div>
            <div className="detail-value">
              {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      <div className="calendar-section">
        {view === 'year' ? (
          <div id="yearView">
            <div className="calendar-title">{currentYear} Calendar</div>
            <div className="year-grid">
              {Array.from({ length: 12 }).map((_, month) => {
                const isCurrentMonth = currentYear === now.getFullYear() && month === currentMonth;
                const total = getDaysInMonth(currentYear, month);
                let passed = 0;
                if (currentYear < now.getFullYear() || (currentYear === now.getFullYear() && month < currentMonth)) {
                  passed = total;
                } else if (isCurrentMonth) {
                  passed = currentDate;
                }
                const ptg = Math.round((passed / total) * 100);

                return (
                  <div 
                    key={month} 
                    className={`month-card ${isCurrentMonth ? 'current' : ''}`}
                    onClick={() => {
                        setSelectedMonth(month);
                        setView('month');
                    }}
                  >
                    <div className="month-name">{monthNames[month]}</div>
                    <div className="month-progress">{ptg}% complete</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div id="monthView" className="month-detail-view active">
            <div className="month-header">
              <div className="month-title">{monthNames[selectedMonth]} {currentYear}</div>
              <button className="back-button" onClick={() => setView('year')}>← Back to Year</button>
            </div>
            <div className="calendar-header">
              <div className="day-header">Sun</div>
              <div className="day-header">Mon</div>
              <div className="day-header">Tue</div>
              <div className="day-header">Wed</div>
              <div className="day-header">Thu</div>
              <div className="day-header">Fri</div>
              <div className="day-header">Sat</div>
            </div>
            <div className="calendar-grid">
              {renderMonthDays()}
            </div>
            <div className="legend">
              <div className="legend-item">
                <div className="legend-box today"></div>
                <span>Today</span>
              </div>
              <div className="legend-item">
                <div className="legend-box current-week"></div>
                <span>Current Week</span>
              </div>
              <div className="legend-item">
                <div className="legend-box passed"></div>
                <span>Past Days</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
