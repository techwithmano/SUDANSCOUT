
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Loader2, UploadCloud, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadImage as uploadImageAction } from '@/app/actions/uploadActions';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/LanguageContext';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const { t } = useTranslation();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadImageAction(formData);
            if (result.success && result.url) {
                onChange(result.url);
                toast({ title: t('admin.updateSuccess'), description: 'Image uploaded successfully.' });
            } else {
                toast({ variant: 'destructive', title: 'Upload Failed', description: result.message });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'An unexpected error occurred.' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('admin.profilePicUrl')}</label>
            {value ? (
                <div className="relative w-48 h-48">
                    <Image src={value} alt="Uploaded image" layout="fill" objectFit="cover" className="rounded-md" />
                    <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => onChange('')}
                        disabled={disabled || isUploading}
                    >
                        <XCircle className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className={cn(
                    "relative flex justify-center items-center w-48 h-48 border-2 border-dashed rounded-md",
                    isUploading ? 'border-primary' : 'border-muted-foreground'
                )}>
                    <Input
                        type="file"
                        id="image-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        accept="image/*"
                        disabled={disabled || isUploading}
                    />
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                        <div className="text-center text-muted-foreground pointer-events-none">
                            <UploadCloud className="h-8 w-8 mx-auto" />
                            <p className="text-xs mt-1">Click or drag to upload</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
