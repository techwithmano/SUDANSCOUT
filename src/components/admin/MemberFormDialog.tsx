
"use client";

import type { Scout } from "@/lib/data";
import { UserCog, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import MemberForm from "./MemberForm";
import { useTranslation } from "@/context/LanguageContext";

interface MemberFormDialogProps {
  isOpen: boolean;
  onClose: (wasSaved: boolean) => void;
  scout: Scout | null;
}

export function MemberFormDialog({ isOpen, onClose, scout }: MemberFormDialogProps) {
  const { t } = useTranslation();
  const isEditMode = !!scout;

  const handleSaveSuccess = () => {
    onClose(true); // Signal that a save happened and close dialog
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            {isEditMode ? <><UserCog className="h-6 w-6 text-primary" /> {t('admin.editMemberTitle')}</> : <><UserPlus className="h-6 w-6 text-primary" /> {t('admin.addMemberTitle')}</>}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? t('admin.editMemberDesc', { name: scout?.fullName || '' }) : t('admin.addMemberDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
          <MemberForm key={scout?.id || 'new-member'} scout={scout} onSaveSuccess={handleSaveSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
