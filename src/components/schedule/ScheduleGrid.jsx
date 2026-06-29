import React, { useState, useMemo } from 'react';
import { useSchedule } from '../../contexts/ScheduleContext';
import { DAYS_SHORT, hexToRgba } from '../../utils/helpers';
import { MapPin } from 'lucide-react';

/*
 * Pixel-per-minute constant.
 * Every minute of time always maps to exactly this many CSS pixels.
 * Grid lines, time labels, and schedule items all share this single constant
 * so alignment is guaranteed.
 */
const PX_PER_MIN = 1; // 1 px per minute → 60 px per hour

export default function ScheduleGrid({ onClickSlot, onClickItem }) {
  const { items, categories, settings } = useSchedule();
  const [hoveredSlot, setHoveredSlot] = useState(null);

  const daysToShow = settings.showWeekend ? 7 : 5;
  const startH = Number(settings.startHour) || 6;
  const endH = Number(settings.endHour) || 22;

  const hours = useMemo(() => {
    const h = [];
    for (let i = startH; i <= endH; i++) h.push(i);
    return h;
  }, [startH, endH]);

  const totalMinutes = (endH - startH + 1) * 60;
  const totalHeight = totalMinutes * PX_PER_MIN;

  /* Convert an hour:minute pair to a Y pixel offset from the top of the grid */
  const timeToY = (hour, minute) => {
    return ((Number(hour) - startH) * 60 + (Number(minute) || 0)) * PX_PER_MIN;
  };

  const getItemStyle = (item) => {
    const top = timeToY(item.startHour, item.startMinute);
    const bottom = timeToY(item.endHour, item.endMinute);
    const height = Math.max(bottom - top - 2, 24);

    return {
      position: 'absolute',
      top: `${top}px`,
      left: '2px',
      right: '2px',
      height: `${height}px`,
      background: `linear-gradient(135deg, ${item.color}, ${hexToRgba(item.color, 0.8)})`,
      borderRadius: 'var(--radius-sm)',
      padding: '4px 8px',
      color: '#fff',
      fontSize: 'var(--font-size-xs)',
      fontWeight: 500,
      cursor: 'pointer',
      overflow: 'hidden',
      transition: 'transform 150ms ease, box-shadow 150ms ease',
      boxShadow: `0 2px 6px ${hexToRgba(item.color, 0.3)}`,
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: '1px',
    };
  };

  const getCategoryIcon = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat?.icon || '📌';
  };

  const formatMin = (v) => String(Number(v) || 0).padStart(2, '0');
  const formatHr = (v) => String(Number(v)).padStart(2, '0');

  return (
    <div style={{
      display: 'flex',
      flex: 1,
      overflow: 'auto',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border-light)',
    }}>
      {/* Time Column (Sticky) */}
      <div style={{
        flexShrink: 0,
        width: '64px',
        borderRight: '1px solid var(--color-border-light)',
        background: 'var(--color-bg)',
        position: 'sticky',
        left: 0,
        zIndex: 10,
        boxShadow: '2px 0 8px rgba(0,0,0,0.03)',
        minHeight: `${totalHeight + 44}px`,
      }}>
        {/* Day-header spacer */}
        <div style={{ height: '44px', borderBottom: '1px solid var(--color-border-light)' }} />

        {/* Time labels — same height system as the grid */}
        <div style={{ position: 'relative', height: `${totalHeight}px` }}>
          {hours.map(hour => (
            <div
              key={hour}
              style={{
                position: 'absolute',
                top: `${timeToY(hour, 0)}px`,
                width: '100%',
                height: `${60 * PX_PER_MIN}px`,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '4px',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
              }}
            >
              {`${String(hour).padStart(2, '0')}:00`}
            </div>
          ))}
        </div>
      </div>

      {/* ── Day Columns ── */}
      <div style={{ display: 'flex', flex: 1, minWidth: 'max-content', minHeight: `${totalHeight + 44}px` }}>
        {Array.from({ length: daysToShow }).map((_, dayIndex) => {
          const today = new Date().getDay();
          const adjustedToday = today === 0 ? 6 : today - 1;
          const isToday = dayIndex === adjustedToday;
          const dayItems = items.filter(item => Number(item.dayIndex) === dayIndex);

          return (
            <div key={dayIndex} style={{
              flex: 1,
              minWidth: '120px',
              borderRight: dayIndex < daysToShow - 1 ? '1px solid var(--color-border-light)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              minHeight: `${totalHeight + 44}px`,
            }}>
              {/* Day Header */}
              <div style={{
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                color: isToday ? 'var(--color-today-text)' : 'var(--color-text-secondary)',
                borderBottom: '1px solid var(--color-border-light)',
                background: isToday
                  ? 'var(--color-today-bg)'
                  : 'var(--color-bg)',
                position: 'sticky',
                top: 0,
                zIndex: 5,
              }}>
                {DAYS_SHORT[dayIndex]}
                {isToday && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '20%',
                    right: '20%',
                    height: '2px',
                    background: 'var(--color-primary)',
                    borderRadius: '2px 2px 0 0',
                  }} />
                )}
              </div>

              {/* ── Grid + Items container ── */}
              <div style={{
                position: 'relative',
                height: `${totalHeight}px`,
                flexShrink: 0,
              }}>
                {/* Grid hour-lines (absolute, same coordinate system as items) */}
                {hours.map(hour => {
                  const y = timeToY(hour, 0);
                  const slotKey = `${dayIndex}-${hour}`;
                  const isHovered = hoveredSlot === slotKey;
                  return (
                    <div
                      key={hour}
                      style={{
                        position: 'absolute',
                        top: `${y}px`,
                        left: 0,
                        right: 0,
                        height: `${60 * PX_PER_MIN}px`,
                        borderBottom: '1px solid var(--color-border-light)',
                        background: isHovered ? 'var(--color-surface-hover)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={() => setHoveredSlot(slotKey)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      onClick={() => onClickSlot?.(dayIndex, hour)}
                    />
                  );
                })}

                {/* Schedule Items (absolute, same coordinate system as grid lines) */}
                {dayItems.map(item => (
                  <div
                    key={item.id}
                    style={getItemStyle(item)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClickItem?.(item);
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = `0 4px 12px ${hexToRgba(item.color, 0.4)}`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = `0 2px 6px ${hexToRgba(item.color, 0.3)}`;
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '10px' }}>{getCategoryIcon(item.category)}</span>
                      <span className="truncate" style={{ fontWeight: 600, lineHeight: 1.2 }}>{item.title}</span>
                    </div>
                    <span style={{ opacity: 0.9, fontSize: '10px', lineHeight: 1 }}>
                      {`${formatHr(item.startHour)}:${formatMin(item.startMinute)} - ${formatHr(item.endHour)}:${formatMin(item.endMinute)}`}
                    </span>
                    {item.location && (
                      <span style={{ opacity: 0.85, fontSize: '9px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <MapPin size={8} /> {item.location}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
