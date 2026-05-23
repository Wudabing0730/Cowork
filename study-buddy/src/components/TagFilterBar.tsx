'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TAGS } from '@/lib/constants';

const STORAGE_KEY = 'sb-tag-order';

function loadOrder(): string[] {
  if (typeof window === 'undefined') return [...TAGS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...TAGS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...TAGS];
    // Merge: keep persisted order for known tags, append any new tags
    const current = new Set<string>(TAGS);
    const persisted = parsed.filter((t: unknown) => typeof t === 'string' && current.has(t));
    const seen = new Set(persisted);
    for (const t of TAGS) {
      if (!seen.has(t)) persisted.push(t);
    }
    return persisted;
  } catch {
    return [...TAGS];
  }
}

function saveOrder(order: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch { /* noop */ }
}

interface TagFilterBarProps {
  activeTag: string;
  onTagChange: (tag: string) => void;
  tagCounts: Record<string, number>;
}

function SortableTag({
  tag,
  active,
  onClick,
  count,
}: {
  tag: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`tag-sortable ink-hover inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold ${isDragging ? 'tag-dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <button
        type="button"
        onClick={onClick}
        className={`${active ? 'tag-active-glow' : ''}`}
        style={{
          background: active ? 'var(--accent)' : 'transparent',
          color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
          border: active ? '1px solid var(--accent)' : '1px solid var(--grid-line)',
          borderRadius: 'var(--radius-sm)',
          padding: '2px 8px',
          lineHeight: '20px',
          cursor: 'inherit',
        }}
      >
        {tag}
      </button>
      {count > 0 && <span className="tag-count-badge">{count}</span>}
    </div>
  );
}

export default function TagFilterBar({ activeTag, onTagChange, tagCounts }: TagFilterBarProps) {
  const [items, setItems] = useState<string[]>(loadOrder);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems(prev => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);
      saveOrder(next);
      return next;
    });
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
  }, []);

  const activeItem = useMemo(() => items.find(i => i === activeDragId), [activeDragId, items]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="flex gap-1 flex-wrap items-center">
          {/* Fixed "全部" button — always first, not draggable */}
          <button
            type="button"
            onClick={() => onTagChange('')}
            className={`ink-hover px-3 py-1 text-[11px] font-semibold ${!activeTag ? 'tag-active-glow' : ''}`}
            style={{
              background: !activeTag ? 'var(--accent)' : 'transparent',
              color: !activeTag ? 'var(--accent-text)' : 'var(--text-secondary)',
              border: !activeTag ? '1px solid var(--accent)' : '1px solid var(--grid-line)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            全部
          </button>

          {/* Draggable tag buttons */}
          {items.map(tag => (
            <SortableTag
              key={tag}
              tag={tag}
              active={activeTag === tag}
              onClick={() => onTagChange(activeTag === tag ? '' : tag)}
              count={tagCounts[tag] ?? 0}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div className="tag-drag-overlay inline-flex items-center px-3 py-1 text-[11px] font-semibold"
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--grid-line-strong)',
            }}
          >
            <span style={{ padding: '2px 8px' }}>{activeItem}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
