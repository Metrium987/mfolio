import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

export type ManageListUpdate<T> = (patch: Partial<T>) => void;

/**
 * Admin list manager: each item is one compact row with three actions —
 * 👁 view (read-only preview modal), ✏️ edit (full form modal), 🗑 delete
 * (with confirmation). Edits apply to the parent draft; nothing is saved
 * until the section's own "Enregistrer" button is pressed.
 */
export function ManageList<T extends object>({
  items,
  onItemsChange,
  emptyItem,
  addLabel,
  itemLabel,
  summary,
  form,
  preview,
}: {
  items: T[];
  onItemsChange: (items: T[]) => void;
  emptyItem: () => T;
  addLabel: string;
  itemLabel: (item: T, index: number) => string;
  summary: (item: T) => ReactNode;
  form: (item: T, update: ManageListUpdate<T>) => ReactNode;
  preview: (item: T) => ReactNode;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const add = () => {
    const next = [...items, emptyItem()];
    onItemsChange(next);
    setEditingIndex(next.length - 1);
  };

  const confirmDelete = () => {
    if (deletingIndex === null) return;
    onItemsChange(items.filter((_, n) => n !== deletingIndex));
    setDeletingIndex(null);
  };

  const editingItem = editingIndex !== null ? items[editingIndex] : undefined;
  const previewItem = previewIndex !== null ? items[previewIndex] : undefined;
  const deletingItem =
    deletingIndex !== null ? items[deletingIndex] : undefined;

  const updateEditingItem: ManageListUpdate<T> = (patch) => {
    if (editingIndex === null) return;
    onItemsChange(
      items.map((item, n) => (n === editingIndex ? { ...item, ...patch } : item)),
    );
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Aucun élément pour le moment.
        </p>
      ) : (
        items.map((item, index) => (
          <div
            key={index}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-md border border-border bg-card px-4 py-3"
          >
            <div className="min-w-0 flex-1">{summary(item)}</div>
            <div className="flex shrink-0 items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Voir"
                onClick={() => setPreviewIndex(index)}
              >
                <Eye className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Éditer"
                onClick={() => setEditingIndex(index)}
              >
                <Pencil className="size-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title="Supprimer"
                    onClick={() => setDeletingIndex(index)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer cet élément ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      « {itemLabel(item, index)} » sera retiré de la liste.
                      N'oubliez pas d'enregistrer la section pour appliquer la
                      suppression.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeletingIndex(null)}>
                      Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete}>
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        className="rounded-full"
      >
        <Plus className="size-4" />
        {addLabel}
      </Button>

      {/* Edit modal */}
      <Dialog
        open={editingIndex !== null}
        onOpenChange={(open) => {
          if (!open) setEditingIndex(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem && editingIndex !== null
                ? `Éditer — ${itemLabel(editingItem, editingIndex)}`
                : "Éditer"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulaire d'édition de l'élément.
            </DialogDescription>
          </DialogHeader>
          {editingItem && editingIndex !== null
            ? form(editingItem, updateEditingItem)
            : null}
        </DialogContent>
      </Dialog>

      {/* Preview modal */}
      <Dialog
        open={previewIndex !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewIndex(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {previewItem && previewIndex !== null
                ? itemLabel(previewItem, previewIndex)
                : ""}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Aperçu en lecture seule de l'élément.
            </DialogDescription>
          </DialogHeader>
          {previewItem && preview(previewItem)}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Muted label — small helper used by several previews. */
export function PreviewLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </p>
  );
}
