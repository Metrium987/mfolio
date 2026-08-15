import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * SortableList — drag & drop reordering for the dashboard's lists.
 *
 * Wraps @dnd-kit so each editor gets the same polished behaviour without
 * duplicating sensor/context plumbing:
 *  - grab with the mouse (⋮⋮ handle), drag & drop to reorder
 *  - works on touch screens (handle has touch-action: none)
 *  - keyboard accessible out of the box (Space/Enter to lift, arrows to move)
 *  - arrow buttons keep working — both methods coexist
 *
 * Positional ids are used: the list only re-renders on drop, so ids stay
 * stable during a drag and the reordered items settle with the row animation.
 */
export function SortableList<T>({
  items,
  onReorder,
  renderRow,
  className,
}: {
  items: T[];
  onReorder: (nextItems: T[]) => void;
  renderRow: (item: T, index: number, dragHandle: ReactNode) => ReactNode;
  className?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);
    if (
      Number.isNaN(oldIndex) ||
      Number.isNaN(newIndex) ||
      oldIndex < 0 ||
      newIndex < 0 ||
      oldIndex >= items.length ||
      newIndex >= items.length
    ) {
      return;
    }
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  const ids = items.map((_, index) => index);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item, index) => (
            <SortableRow
              key={index}
              id={index}
              item={item}
              index={index}
              renderRow={renderRow}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/** The visual ⋮⋮ handle — spread `attributes` + `listeners` onto a button. */
export function DragHandle({
  attributes,
  listeners,
}: {
  attributes: DraggableAttributes;
  listeners?: DraggableSyntheticListeners;
}) {
  return (
    <button
      type="button"
      {...attributes}
      {...listeners}
      title="Déplacer (glisser)"
      aria-label="Déplacer"
      className="shrink-0 cursor-grab touch-none rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <GripVertical className="size-4" />
    </button>
  );
}

function SortableRow<T>({
  id,
  item,
  index,
  renderRow,
}: {
  id: number;
  item: T;
  index: number;
  renderRow: (item: T, index: number, dragHandle: ReactNode) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const dragHandle = <DragHandle attributes={attributes} listeners={listeners} />;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-md",
        isDragging && "relative z-10 shadow-lg ring-1 ring-border",
      )}
    >
      {renderRow(item, index, dragHandle)}
    </div>
  );
}
