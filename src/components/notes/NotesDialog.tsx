import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';

export default function NotesDialog({
  onAddNote,
  open,
  onOpenChange,
}: {
  onAddNote: (note: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [note, setNote] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        onClick={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Add a note to the selected text.
            <Textarea
              value={note}
              onChange={(e) => {
                console.log('Note:', e.target.value);
                setNote(e.target.value);
              }}
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setNote('');
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log('Saving Note:', note);
              onAddNote(note);
              setNote('');
            }}
            disabled={!note.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
