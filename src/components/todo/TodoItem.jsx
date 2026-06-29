import React, { useState } from 'react';
import { useTodo } from '../../contexts/TodoContext';
import { PRIORITY_LEVELS } from '../../utils/helpers';
import { Check, ChevronDown, ChevronRight, Calendar, GripVertical, Edit2, Trash2 } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { th } from 'date-fns/locale';

export default function TodoItem({ 
  task, onEdit, isSelectionMode, isSelected, onToggleSelect, onEnterSelection 
}) {
  const { toggleTask, toggleSubtask, deleteTask } = useTodo();
  const [expanded, setExpanded] = useState(false);
  const longPressTimer = React.useRef(null);

  const priority = PRIORITY_LEVELS.find(p => p.value === task.priority);
  const hasSubtasks = task.subtasks?.length > 0;
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;

  const dueDateLabel = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    let dateStr = format(date, 'd MMM', { locale: th });
    if (task.dueTime) {
      dateStr += ` ${task.dueTime}`;
    }

    if (isToday(date)) return { text: `วันนี้ ${task.dueTime || ''}`, color: 'var(--color-warning)' };
    if (isPast(date) && !task.completed) return { text: `เลยกำหนด (${dateStr})`, color: 'var(--color-danger)' };
    return { text: dateStr, color: 'var(--color-text-muted)' };
  };

  const due = dueDateLabel();

  // --- Long Press Logic ---
  const startLongPress = () => {
    longPressTimer.current = setTimeout(() => {
      onEnterSelection && onEnterSelection();
      onToggleSelect && onToggleSelect(task.id);
      window.navigator.vibrate && window.navigator.vibrate(50);
    }, 600);
  };

  const stopLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div 
      className="todo-item-container" 
      style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}
      onMouseDown={startLongPress}
      onMouseUp={stopLongPress}
      onMouseLeave={stopLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={stopLongPress}
    >
      <div
        className={`card ${isSelectionMode ? 'selection-mode' : ''} ${isSelected ? 'selected' : ''}`}
        style={{
          padding: '14px 16px',
          opacity: task.completed ? 0.6 : 1,
          transition: 'all 0.2s ease',
          animation: 'fadeInUp 300ms ease forwards',
          zIndex: 2,
          position: 'relative',
          cursor: isSelectionMode ? 'pointer' : 'default',
          border: isSelectionMode && isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border-light)',
          background: isSelectionMode && isSelected ? 'var(--color-bg-secondary)' : 'var(--color-surface)',
        }}
        onClick={() => {
          if (isSelectionMode) {
            onToggleSelect(task.id);
          }
        }}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'auto 1fr auto', 
          gap: '12px',
          alignItems: 'start'
        }}>
          
          {/* --- COL 1: Selection/Status (Left) --- */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginTop: '2px',
            minWidth: isSelectionMode ? '22px' : '46px' 
          }}>
            {isSelectionMode ? (
               <div style={{
                 width: '22px',
                 height: '22px',
                 borderRadius: '50%',
                 border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                 background: isSelected ? 'var(--color-primary)' : 'transparent',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 animation: 'fadeInScale 200ms ease',
               }}>
                 {isSelected && <Check size={12} color="white" strokeWidth={4} />}
               </div>
            ) : (
              <>
                <div style={{ color: 'var(--color-text-muted)', opacity: 0.3, cursor: 'grab', flexShrink: 0 }}>
                  <GripVertical size={16} />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    border: `2px solid ${task.completed ? 'var(--color-success)' : priority?.color || 'var(--color-border)'}`,
                    background: task.completed ? 'var(--color-success)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    flexShrink: 0,
                  }}
                >
                  {task.completed && (
                    <Check size={14} color="white" strokeWidth={3} style={{ animation: 'checkmark 300ms ease' }} />
                  )}
                </button>
              </>
            )}
          </div>

          {/* --- COL 2: Content (Middle - Stretches) --- */}
          <div style={{ minWidth: 0 }}>
            {/* Title & Badge Row */}
            <div style={{ marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '2px' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: priority?.color || 'var(--color-border)',
                  marginTop: '7px',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontWeight: 600,
                  fontSize: 'var(--font-size-sm)',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'var(--color-text-muted)' : 'var(--color-text)',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                }}>
                  {task.title}
                </span>
              </div>
              
              {due && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '10px',
                  color: due.color,
                  fontWeight: 600,
                  background: 'var(--color-bg-secondary)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}>
                  <Calendar size={10} />
                  {due.text}
                </span>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                marginTop: '4px',
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}>
                {task.description}
              </p>
            )}

            {/* Tags */}
            {task.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                {task.tags.map(tag => (
                  <span key={tag} className="badge badge-green" style={{ fontSize: '10px', padding: '1px 8px' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Subtasks Toggle */}
            {hasSubtasks && (
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                  }}
                >
                  {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  รายการย่อย ({completedSubtasks}/{task.subtasks.length})
                </button>

                <div style={{
                  width: '100%',
                  height: '3px',
                  background: 'var(--color-border-light)',
                  borderRadius: '2px',
                  marginTop: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${(completedSubtasks / task.subtasks.length) * 100}%`,
                    height: '100%',
                    background: 'var(--color-success)',
                    borderRadius: '2px',
                    transition: 'width 300ms ease',
                  }} />
                </div>

                {expanded && (
                  <div style={{
                    marginTop: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    paddingLeft: '4px',
                    animation: 'fadeInUp 200ms ease',
                  }}>
                    {task.subtasks.map(st => (
                      <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSubtask(task.id, st.id); }}
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            border: `1.5px solid ${st.completed ? 'var(--color-success)' : 'var(--color-border)'}`,
                            background: st.completed ? 'var(--color-success)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {st.completed && <Check size={10} color="white" strokeWidth={3} />}
                        </button>
                        <span style={{
                          fontSize: 'var(--font-size-xs)',
                          textDecoration: st.completed ? 'line-through' : 'none',
                          color: st.completed ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                          wordBreak: 'break-word',
                        }}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- COL 3: Actions (Right - Fixed) --- */}
          {!isSelectionMode && (
            <div style={{ 
              display: 'flex', 
              gap: '6px', 
              alignItems: 'center',
              width: '74px', 
              minWidth: '74px',
              justifyContent: 'flex-end',
              alignSelf: 'start',
              marginTop: '2px'
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className="btn btn-icon btn-ghost"
                style={{ 
                  width: '38px', 
                  minWidth: '38px',
                  height: '38px', 
                  background: 'var(--color-bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  borderRadius: '10px',
                  color: 'var(--color-text-secondary)',
                  overflow: 'visible'
                }}
              >
                <Edit2 
                  style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }} 
                  strokeWidth={2} 
                />
              </button>
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (window.confirm('ยืนยันการลบงานนี้?')) deleteTask(task.id); 
                }}
                className="btn btn-icon btn-ghost"
                style={{ 
                  width: '38px',
                  minWidth: '38px',
                  height: '38px', 
                  background: 'var(--color-bg-secondary)', 
                  color: '#FF5C5C', // Force Vivid Red
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  borderRadius: '10px',
                  overflow: 'visible'
                }}
              >
                <Trash2 
                  style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }} 
                  strokeWidth={2} 
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
