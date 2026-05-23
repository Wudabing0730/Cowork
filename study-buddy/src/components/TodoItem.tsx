'use client';

import { useState } from 'react';

interface Todo {
  id: number;
  title: string;
  description: string;
  tag: string;
  priority: string;
  dueDate: string;
  completed: number;
  likes: number;
  createdAt: string;
}

interface Props {
  todo: Todo;
  variant?: 'own' | 'partner';
  onToggle?: (id: number, completed: boolean) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  onLike?: (id: number) => Promise<void>;
  onEdit?: (todo: Todo) => void;
}

function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

const tagConfig: Record<string, { color: string; bg: string }> = {
  '背单词': { color: '#3B6F9E', bg: '#EDF2F7' },
  '刷题': { color: '#C47A2E', bg: '#FDF3E8' },
  '阅读': { color: '#7B5EA7', bg: '#F4F0F8' },
  '网课': { color: '#3D8B7A', bg: '#EDF5F2' },
  '运动': { color: '#C04E4E', bg: '#FCECEC' },
  '其他': { color: '#5C5C5C', bg: '#F3F1ED' },
};

export default function TodoItem({ todo, variant = 'own', onToggle, onDelete, onLike, onEdit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = todo.completed === 1;
  const overdue = !isCompleted && isOverdue(todo.dueDate);
  const isPartner = variant === 'partner';

  const tagStyle = todo.tag ? tagConfig[todo.tag] : null;

  return (
    <>
      <div
        className="group flex items-center gap-3 transition-all duration-200"
        style={{
          background: isCompleted ? 'var(--gold-light)' : overdue ? 'var(--danger-bg)' : 'var(--bg-surface)',
          border: isCompleted ? '1px solid rgba(196, 148, 62, 0.2)' : '1px solid var(--grid-line)',
        }}
      >
      {/* Checkbox */}
      <div className="pl-3 py-2.5">
        {isPartner ? (
          <div
            className="w-4 h-4 flex-shrink-0 flex items-center justify-center"
            style={{
              border: isCompleted ? '1px solid var(--gold)' : '1px solid var(--grid-line-strong)',
              background: isCompleted ? 'var(--gold)' : 'transparent',
            }}
          >
            {isCompleted && (
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ) : (
          <button
            onClick={() => onToggle?.(todo.id, !isCompleted)}
            className="ink-hover w-4 h-4 flex-shrink-0 flex items-center justify-center"
            style={{
              border: isCompleted ? '1px solid var(--gold)' : '1px solid var(--grid-line-strong)',
              background: isCompleted ? 'var(--gold)' : 'transparent',
            }}
          >
            {isCompleted && (
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', alignSelf: 'stretch', background: 'var(--grid-line)' }} />

      {/* Content + Actions */}
      <div
        className="flex-1 min-w-0 py-2.5 pr-2 flex items-start gap-2 justify-between"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {todo.priority === 'high' && !isCompleted && (
              <span className="w-1.5 h-1.5 flex-shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
            )}
            <p
              className="text-sm font-semibold"
              style={{
                color: isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                textDecoration: isCompleted ? 'line-through' : 'none',
              }}
            >
              {todo.title}
            </p>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '11px', flexShrink: 0 }}>
              {expanded ? '▾' : '▸'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {tagStyle && (
              <span
                className="text-[10px] px-1.5 py-px font-semibold flex-shrink-0"
                style={{ background: tagStyle.bg, color: tagStyle.color, border: '1px solid var(--grid-line)' }}
              >
                {todo.tag}
              </span>
            )}
            {todo.description && (
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{todo.description}</span>
            )}
            {todo.dueDate && (
              <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: overdue ? 'var(--danger)' : 'var(--text-tertiary)' }}>
                {overdue ? '已逾期' : todo.dueDate}
              </span>
            )}
            <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
              {new Date(todo.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
          {isPartner ? (
            todo.completed === 1 && onLike ? (
              <button
                onClick={() => onLike(todo.id)}
                className="ink-hover flex items-center gap-1 text-[10px] font-semibold"
                style={{ color: 'var(--accent)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                {todo.likes > 0 && <span>{todo.likes}</span>}
              </button>
            ) : null
          ) : (
            <div className="flex items-center gap-1">
              {!isCompleted && onEdit && (
                <button
                  onClick={() => onEdit(todo)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                    <path d="M10.5 2.5l2 2-8.5 8.5H2v-2l8.5-8.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => onDelete?.(todo.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                  <path d="M4 4l7 7M11 4l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    {expanded && (
      <div
        style={{
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          background: 'var(--bg-muted)',
          borderTop: '1px solid var(--grid-line)',
          padding: '0.5rem 1rem',
          paddingLeft: '3.5rem',
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{todo.title}</div>
        {todo.description && (
          <div style={{ marginBottom: '4px' }}>📝 {todo.description}</div>
        )}
        <div>🕐 创建于 {new Date(todo.createdAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
        {todo.dueDate && (
          <div>📅 截止 {new Date(todo.dueDate).toLocaleDateString('zh-CN')}</div>
        )}
        <div style={{ marginTop: '2px' }}>
          优先级：
          <span style={{
            fontSize: '10px',
            fontWeight: 600,
            padding: '0px 4px',
            borderRadius: '3px',
            background: todo.priority === 'high' ? 'var(--danger-bg)' : todo.priority === 'medium' ? 'var(--gold-light)' : 'var(--bg-muted)',
            color: todo.priority === 'high' ? 'var(--danger)' : todo.priority === 'medium' ? 'var(--gold)' : 'var(--text-tertiary)',
            border: '1px solid var(--grid-line)',
          }}>
            {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
          </span>
        </div>
      </div>
    )}
  </>
  );
}
