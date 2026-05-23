'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AddTodoForm from '@/components/AddTodoForm';
import TodoList from '@/components/TodoList';
import TodoItem from '@/components/TodoItem';
import TagFilterBar from '@/components/TagFilterBar';
import Pomodoro from '@/components/Pomodoro';

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

interface Partner {
  id: number;
  username: string;
}

interface PendingRequest {
  id: number;
  user1Id: number;
  user1Name: string;
}

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [partnerTodos, setPartnerTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [progress, setProgress] = useState<{ streak: number; todayCompleted: number; yesterdayCompleted: number; totalTodos: number; totalCompleted: number; tagCounts: Record<string, number> } | null>(null);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});

  const [pairUser, setPairUser] = useState('');
  const [pairMsg, setPairMsg] = useState('');
  const [pairLoading, setPairLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [nudged, setNudged] = useState(false);

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterTag) params.set('tag', filterTag);
    if (sortBy) params.set('sort', sortBy);
    const url = `/api/todos?${params.toString()}`;
    const [todoRes, partnerRes, summaryRes] = await Promise.all([
      fetch(url).then(r => r.ok ? r.json() : { todos: [] }),
      fetch('/api/partner/todos').then(r => r.ok ? r.json() : { partner: null, todos: [] }),
      fetch('/api/stats/summary').then(r => r.ok ? r.json() : null),
    ]);
    setTodos(todoRes.todos || []);
    setPartner(partnerRes.partner || null);
    setPartnerTodos(partnerRes.todos || []);
    setProgress(summaryRes);
    setTagCounts(summaryRes?.tagCounts || {});
    setLoading(false);
  }, [filterTag, sortBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!partner) {
      fetch('/api/pair/pending')
        .then(r => r.ok ? r.json() : { requests: [] })
        .then(d => setPendingRequests(d.requests || []));
    } else {
      fetch('/api/pair/nudge').then(r => r.json()).then(d => setNudged(d.nudged));
    }
  }, [partner]);

  const addTodo = async (title: string, description: string, tag: string, priority: string, dueDate: string) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, tag, priority, dueDate }),
    });
    if (res.ok) {
      fetchData();
    }
  };

  const toggleTodo = async (id: number, completed: boolean) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (res.ok) {
      fetchData();
    }
  };

  const deleteTodo = async (id: number) => {
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const handleReorder = async (orderedTodos: Todo[]) => {
    setTodos(orderedTodos);
    const items = orderedTodos.map((t, i) => ({ id: t.id, sortOrder: i }));
    fetch('/api/todos/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    }).catch(() => {});
  };

  const handleLike = async (id: number) => {
    const res = await fetch(`/api/todos/${id}/like`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setPartnerTodos(prev => prev.map(t => t.id === id ? { ...t, likes: data.likes } : t));
    }
  };

  const handleNudge = async () => {
    await fetch('/api/pair/nudge', { method: 'POST' });
    setNudged(true);
    setTimeout(() => setNudged(false), 3000);
  };

  const handlePairRequest = async () => {
    if (!pairUser.trim()) return;
    setPairLoading(true);
    setPairMsg('');
    const res = await fetch('/api/pair/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: pairUser.trim() }),
    });
    const data = await res.json();
    setPairLoading(false);
    if (res.ok) {
      setPairMsg('已发送');
      setPairUser('');
    } else {
      setPairMsg(data.error || '失败');
    }
  };

  const handleAccept = async (pairId: number) => {
    const res = await fetch('/api/pair/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairId }),
    });
    if (res.ok) {
      setPendingRequests(prev => prev.filter(r => r.id !== pairId));
      fetchData();
    }
  };

  const handleUnpair = async () => {
    if (!confirm('确定要解除配对吗？')) return;
    const res = await fetch('/api/pair/unpair', { method: 'POST' });
    if (res.ok) {
      setPartner(null);
      setPartnerTodos([]);
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--grid-line)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  const myCompleted = todos.filter(t => t.completed).length;
  const partnerCompleted = partnerTodos.filter(t => t.completed).length;

  return (
    <div className="space-y-8">
      {/* Pomodoro Timer */}
      <Pomodoro />
      {/* Header */}
      <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--grid-line)', paddingBottom: '1.25rem' }}>
        <div>
          <h1 className="text-xl font-bold tracking-tight serif-display" style={{ color: 'var(--text-primary)' }}>
            任务列表
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {todos.length > 0 ? `${myCompleted}/${todos.length} 已完成` : '开始添加任务吧'}
          </p>
        </div>
        <Link
          href="/stats"
          className="ink-hover text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--grid-line)' }}
        >
          <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
            <path d="M1.5 11h5v4h-5v-4zM8.5 1.5h5v4h-5v-4zM1.5 1.5h5v4h-5v-4zM8.5 8.5h5v4h-5v-4z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          学习统计
        </Link>
      </div>

      {/* Progress cards — 4-column grid */}
      {progress && (
        <div className="grid grid-cols-4" style={{ border: '1px solid var(--grid-line)' }}>
          {[
            { label: '连续打卡', value: progress.streak, unit: '天', color: 'var(--accent-strong)' },
            { label: '今日完成', value: progress.todayCompleted, unit: '', color: 'var(--success)' },
            { label: '总完成率', value: progress.totalTodos > 0 ? Math.round((progress.totalCompleted / progress.totalTodos) * 100) : 0, unit: '%', color: 'var(--warn)' },
            { label: '当前进度', value: `${myCompleted}/${todos.length}`, unit: '', color: 'var(--gold)' },
          ].map(({ label, value, unit, color }, i) => (
            <div
              key={label}
              className="p-4"
              style={{ borderRight: i < 3 ? '1px solid var(--grid-line)' : 'none' }}
            >
              <div className="text-xl font-bold tracking-tight serif-display" style={{ color }}>
                {value}
                {typeof value === 'number' && unit ? <span className="text-xs font-medium ml-0.5" style={{ color: 'var(--text-tertiary)' }}>{unit}</span> : null}
              </div>
              <div className="text-[10px] mt-1 font-semibold label-spaced" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      <AddTodoForm onAdd={addTodo} />

      {/* Tag filter + sort */}
      <div className="flex gap-2 flex-wrap items-center justify-between" style={{ borderBottom: '1px solid var(--grid-line)', paddingBottom: '0.75rem' }}>
        <TagFilterBar activeTag={filterTag} onTagChange={setFilterTag} tagCounts={tagCounts} />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-1 text-[11px] font-semibold focus:outline-none"
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--grid-line)',
          }}
        >
          <option value="createdAt">按创建时间</option>
          <option value="priority">按优先级</option>
          <option value="dueDate">按截止日期</option>
          <option value="completed">按完成状态</option>
        </select>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My tasks */}
        <div>
          <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '1px solid var(--grid-line)', paddingBottom: '0.75rem' }}>
            <h2 className="text-xs font-semibold label-spaced" style={{ color: 'var(--text-secondary)' }}>我的任务</h2>
            <span
              className="text-[10px] px-2 py-0.5 font-semibold"
              style={{ color: 'var(--text-tertiary)', border: '1px solid var(--grid-line)' }}
            >
              {myCompleted}/{todos.length}
            </span>
            {todos.length > 0 && myCompleted === todos.length && (
              <span className="text-[10px] font-semibold px-2 py-0.5 seal-gold" style={{ color: 'var(--gold)', border: '1px solid rgba(196, 148, 62, 0.3)' }}>
                全部完成
              </span>
            )}
          </div>

          {todos.length === 0 ? (
            <div
              className="text-center py-16"
              style={{ border: '1px dashed var(--grid-line-strong)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {filterTag ? `还没有"${filterTag}"标签的任务` : '还没有任务，在上方添加一个吧'}
              </p>
            </div>
          ) : (
            <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} onReorder={handleReorder} />
          )}
        </div>

        {/* Partner tasks */}
        <div>
          <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '1px solid var(--grid-line)', paddingBottom: '0.75rem' }}>
            <h2 className="text-xs font-semibold label-spaced" style={{ color: 'var(--text-secondary)' }}>
              {partner ? `${partner.username} 的任务` : '搭子任务'}
            </h2>
            {partner && (
              <>
                <span
                  className="text-[10px] px-2 py-0.5 font-semibold"
                  style={{ color: 'var(--text-tertiary)', border: '1px solid var(--grid-line)' }}
                >
                  {partnerCompleted}/{partnerTodos.length}
                </span>
                <button
                  onClick={handleNudge}
                  className="ink-hover text-[10px] px-2 py-0.5 font-semibold"
                  style={{ background: 'var(--warn-bg)', color: 'var(--warn)', border: '1px solid var(--grid-line)' }}
                >
                  催更
                </button>
                <button
                  onClick={handleUnpair}
                  className="ink-hover text-[10px] px-2 py-0.5 font-semibold"
                  style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--grid-line)' }}
                >
                  解除
                </button>
              </>
            )}
            {nudged && (
              <span className="text-[10px] font-semibold animate-pulse" style={{ color: 'var(--warn)' }}>
                你的搭子催你学习啦!
              </span>
            )}
          </div>

          {!partner ? (
            <div style={{ border: '1px solid var(--grid-line)' }}>
              <div className="p-4" style={{ borderBottom: '1px solid var(--grid-line)' }}>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>搜索用户名发起配对</p>
              </div>
              <div className="p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入用户名"
                    className="flex-1 px-3 py-2 text-sm focus:outline-none"
                    style={{
                      background: 'var(--bg-muted)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--grid-line)',
                    }}
                    value={pairUser}
                    onChange={e => setPairUser(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handlePairRequest()}
                  />
                  <button
                    onClick={handlePairRequest}
                    disabled={pairLoading || !pairUser.trim()}
                    className="ink-hover px-4 py-2 text-sm font-semibold disabled:opacity-40 flex-shrink-0"
                    style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                  >
                    {pairLoading ? '...' : '配对'}
                  </button>
                </div>
                {pairMsg && (
                  <p className="mt-3 text-xs font-semibold" style={{ color: pairMsg === '已发送' ? 'var(--success)' : 'var(--danger)' }}>
                    {pairMsg}
                  </p>
                )}
              </div>
              {pendingRequests.length > 0 && (
                <div style={{ borderTop: '1px solid var(--grid-line)' }}>
                  {pendingRequests.map(req => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between px-4 py-2.5"
                      style={{ borderBottom: '1px solid var(--grid-line)' }}
                    >
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{req.user1Name}</span> 请求与你配对
                      </span>
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="ink-hover px-3 py-1 text-[11px] font-semibold"
                        style={{ background: 'var(--success)', color: '#fff' }}
                      >
                        接受
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : partnerTodos.length === 0 ? (
            <div
              className="text-center py-16"
              style={{ border: '1px dashed var(--grid-line-strong)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Ta 还没有任务</p>
            </div>
          ) : (
            <div className="space-y-2">
              {partnerTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  variant="partner"
                  onLike={handleLike}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
