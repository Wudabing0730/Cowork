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
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TodoItem from './TodoItem';

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
  todos: Todo[];
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onReorder: (orderedTodos: Todo[]) => void;
  onEdit: (todo: Todo) => void;
}

function SortableTodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  isDragging,
}: {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (todo: Todo) => void;
  isDragging: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="tag-sortable"
      {...attributes}
      {...listeners}
    >
      <div style={{ opacity: isDragging ? 0.3 : 1 }}>
        <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
      </div>
    </div>
  );
}

export default function TodoList({ todos, onToggle, onDelete, onReorder, onEdit }: Props) {
  const [activeDragId, setActiveDragId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const todoIds = useMemo(() => todos.map(t => t.id), [todos]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as number);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex(t => t.id === active.id);
    const newIndex = todos.findIndex(t => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(todos, oldIndex, newIndex);
    onReorder(reordered);
  }, [todos, onReorder]);

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
  }, []);

  const activeTodo = useMemo(
    () => activeDragId ? todos.find(t => t.id === activeDragId) : null,
    [activeDragId, todos]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={todoIds} strategy={verticalListSortingStrategy}>
        <div style={{ border: '1px solid var(--grid-line)' }}>
          {todos.map((todo, i) => (
            <div key={todo.id} style={{ borderBottom: i < todos.length - 1 ? '1px solid var(--grid-line)' : 'none' }}>
              <SortableTodoItem
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                isDragging={activeDragId === todo.id}
              />
            </div>
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeTodo ? (
          <div className="tag-drag-overlay"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--grid-line-strong)',
            }}
          >
            <TodoItem todo={activeTodo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
