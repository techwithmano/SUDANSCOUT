
"use client";

import type { Scout } from "@/lib/data";
import { UserCog, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import MemberForm from "./MemberForm";

interface MemberFormDialogProps {
  isOpen: boolean;
  onClose: (wasSaved: boolean) => void;
  scout: Scout | null;
}

export function MemberFormDialog({ isOpen, onClose, scout }: MemberFormDialogProps) {
  const isEditMode = !!scout;

  const handleSaveSuccess = () => {
    onClose(true); // Signal that a save happened and close dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            {isEditMode ? <><UserCog className="h-6 w-6 text-primary" /> Edit Member Profile</> : <><UserPlus className="h-6 w-6 text-primary" /> Add New Member</>}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? `Editing profile for ${scout?.fullName}.` : 'Fill in the details for the new member.'}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
          <MemberForm scout={scout} onSaveSuccess={handleSaveSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
