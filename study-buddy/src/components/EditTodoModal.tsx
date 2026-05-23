'use client';

import { useState } from 'react';
import { TAGS } from '@/lib/constants';

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
  onSave: (id: number, title: string, description: string, tag: string, priority: string, dueDate: string) => Promise<void>;
  onClose: () => void;
}

const fieldBorder = { border: '1px solid var(--grid-line)' };

export default function EditTodoModal({ todo, onSave, onClose }: Props) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [tag, setTag] = useState(todo.tag);
  const [priority, setPriority] = useState(todo.priority);
  const [dueDate, setDueDate] = useState(todo.dueDate);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onSave(todo.id, title.trim(), description.trim(), tag, priority, dueDate);
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', zIndex: 1000 }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--grid-line-strong)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--grid-line)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>编辑任务</h3>
          <button type="button" onClick={onClose} className="ink-hover p-0.5" style={{ color: 'var(--text-tertiary)' }}>
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              <path d="M4 4l7 7M11 4l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input
            type="text"
            placeholder="任务标题 *"
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', ...fieldBorder }}
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="描述（可选）"
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', ...fieldBorder }}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)', ...fieldBorder }}
              value={tag}
              onChange={e => setTag(e.target.value)}
            >
              <option value="">无标签</option>
              {TAGS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)', ...fieldBorder }}
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option value="high">高优先</option>
              <option value="medium">中优先</option>
              <option value="low">低优先</option>
            </select>
          </div>
          <input
            type="date"
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)', ...fieldBorder }}
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 px-4 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="ink-hover px-4 py-2 text-sm font-semibold"
            style={{ border: '1px solid var(--grid-line)', color: 'var(--text-secondary)' }}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="ink-hover px-4 py-2 text-sm font-semibold disabled:opacity-40"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {loading ? '...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}