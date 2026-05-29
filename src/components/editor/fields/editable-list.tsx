'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditableListProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

function SortableItem({
  id,
  index,
  value,
  placeholder,
  onUpdate,
  onRemove,
}: {
  id: string;
  index: number;
  value: string;
  placeholder?: string;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1">
      <button
        type="button"
        className="flex h-8 w-6 cursor-grab items-center justify-center rounded text-zinc-300 transition-colors hover:text-zinc-500 active:cursor-grabbing dark:hover:text-zinc-300"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <Input
        value={value}
        onChange={(e) => onUpdate(index, e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 shrink-0 cursor-pointer p-0 text-zinc-400 hover:text-red-500"
        onClick={() => onRemove(index)}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function EditableList({ label, items, onChange, placeholder }: EditableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addItem = () => onChange([...(items || []), '']);

  const updateItem = (index: number, value: string) => {
    const updated = [...(items || [])];
    updated[index] = value;
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange((items || []).filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentItems = items || [];
    const oldIndex = currentItems.findIndex((_, i) => `item-${i}` === active.id);
    const newIndex = currentItems.findIndex((_, i) => `item-${i}` === over.id);

    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(currentItems, oldIndex, newIndex));
  };

  const sortableIds = (items || []).map((_, i) => `item-${i}`);

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</label>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {(items || []).map((item, index) => (
              <SortableItem
                key={`item-${index}`}
                id={`item-${index}`}
                index={index}
                value={item}
                placeholder={placeholder}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="h-7 cursor-pointer gap-1 text-xs"
      >
        <Plus className="h-3 w-3" />
        Add
      </Button>
    </div>
  );
}
