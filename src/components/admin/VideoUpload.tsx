
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, XCircle, Video as VideoIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadImage as uploadMediaAction } from '@/app/actions/uploadActions';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/LanguageContext';

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function VideoUpload({ value, onChange, disabled }: VideoUploadProps) {
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
            const result = await uploadMediaAction(formData);
            if (result.success && result.url) {
                onChange(result.url);
                toast({ title: t('admin.updateSuccess'), description: 'Video uploaded successfully.' });
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
            {value ? (
                <div className="relative w-full max-w-sm">
                    <video src={value} controls className="w-full h-auto rounded-md bg-black" />
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
                    "relative flex justify-center items-center w-full h-32 border-2 border-dashed rounded-md",
                    isUploading ? 'border-primary' : 'border-muted-foreground'
                )}>
                    <Input
                        type="file"
                        id="video-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        accept="video/*"
                        disabled={disabled || isUploading}
                    />
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                        <div className="text-center text-muted-foreground pointer-events-none">
                            <UploadCloud className="h-8 w-8 mx-auto" />
                            <p className="text-xs mt-1">Click or drag to upload video</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
