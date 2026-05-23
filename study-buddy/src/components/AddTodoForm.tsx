'use client';

import { useState } from 'react';
import { TAGS } from '@/lib/constants';

interface Props {
  onAdd: (title: string, description: string, tag: string, priority: string, dueDate: string) => Promise<void>;
}

const fieldBorder = { border: '1px solid var(--grid-line)' };

export default function AddTodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onAdd(title.trim(), description.trim(), tag, priority, dueDate);
    setTitle('');
    setDescription('');
    setTag('');
    setPriority('medium');
    setDueDate('');
    setExpanded(false);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid var(--grid-line)' }}>
      <div className="flex" style={{ borderBottom: expanded ? '1px solid var(--grid-line)' : 'none' }}>
        <input
          type="text"
          placeholder="添加新任务..."
          className="flex-1 px-4 py-2.5 text-sm focus:outline-none"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          required
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="ink-hover px-5 py-2.5 text-sm font-semibold tracking-wide disabled:opacity-40 flex-shrink-0"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          {loading ? '...' : '添加'}
        </button>
      </div>

      {expanded && (
        <div className="flex flex-wrap gap-0 p-3">
          <input
            type="text"
            placeholder="描述（可选）"
            className="flex-1 min-w-[120px] px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', ...fieldBorder }}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <select
            className="px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', ...fieldBorder }}
            value={tag}
            onChange={e => setTag(e.target.value)}
          >
            <option value="">无标签</option>
            {TAGS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', ...fieldBorder }}
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option value="high">高优先</option>
            <option value="medium">中优先</option>
            <option value="low">低优先</option>
          </select>
          <input
            type="date"
            className="px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', ...fieldBorder }}
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
      )}
    </form>
  );
}
