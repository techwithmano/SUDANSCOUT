
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

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

export function MultiImageUpload({ value, onChange, disabled }: MultiImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const { t } = useTranslation();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const newUrls: string[] = [];
        
        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const result = await uploadImageAction(formData);
                if (result.success && result.url) {
                    newUrls.push(result.url);
                } else {
                    toast({ variant: 'destructive', title: `Upload Failed for ${file.name}`, description: result.message });
                }
            } catch (error) {
                 toast({ variant: 'destructive', title: `Upload Failed for ${file.name}`, description: 'An unexpected error occurred.' });
            }
        }
        
        onChange([...value, ...newUrls]);
        if(newUrls.length > 0) {
           toast({ title: 'Success', description: `${newUrls.length} image(s) uploaded.` });
        }
        setIsUploading(false);
    };
    
    const handleRemoveImage = (urlToRemove: string) => {
        onChange(value.filter(url => url !== urlToRemove));
    };

    return (
        <div className="flex flex-col gap-4">
            <div className={cn(
                "relative flex justify-center items-center w-full min-h-[10rem] p-4 border-2 border-dashed rounded-md",
                isUploading ? 'border-primary' : 'border-muted-foreground'
            )}>
                <Input
                    type="file"
                    id="multi-image-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    disabled={disabled || isUploading}
                />
                {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                    <div className="text-center text-muted-foreground pointer-events-none">
                        <UploadCloud className="h-8 w-8 mx-auto" />
                        <p className="text-sm mt-1">Click or drag to upload files</p>
                        <p className="text-xs">You can select multiple images</p>
                    </div>
                )}
            </div>

            {value && value.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {value.map((url, index) => (
                        <div key={index} className="relative w-full aspect-square">
                            <Image src={url} alt={`Uploaded image ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md" />
                             <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={() => handleRemoveImage(url)}
                                disabled={disabled || isUploading}
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
