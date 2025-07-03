
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import type { Scout } from "@/lib/data";
import { scoutSchema } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, PlusCircle, Trash2, ShieldQuestion } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import translations from "@/locales";

type ScoutFormValues = z.infer<typeof scoutSchema>;

interface MemberFormProps {
  scout?: Scout | null;
  onSaveSuccess?: () => void;
}

const groups = [
  'troopAdvanced', 'troopBoyScouts', 'troopCubScouts', 
  'troopAdvancedGuides', 'troopGirlGuides', 'troopBrownies'
];

const buildGroupKeyMap = () => {
    const map: { [key: string]: string } = {};
    const allTranslations = [translations.en.about, translations.ar.about];
    
    groups.forEach(key => {
        map[key.toLowerCase()] = key;
        allTranslations.forEach(t => {
            const translatedValue = t[key as keyof typeof t];
            if (translatedValue && typeof translatedValue === 'string') {
                map[translatedValue.toLowerCase().trim()] = key;
            }
        });
    });
    return map;
};

const groupKeyMap = buildGroupKeyMap();

const getGroupKey = (groupValue: string | undefined): string => {
    if (!groupValue) return '';
    return groupKeyMap[groupValue.toLowerCase().trim()] || groupValue;
};

const normalizeScoutDataForForm = (scout: Scout): ScoutFormValues => {
    const sanitizedPayments = (scout.payments || []).map(p => ({
        month: p.month || '',
        amount: p.amount === undefined || p.amount === null ? 0 : Number(p.amount),
        status: p.status === 'paid' || p.status === 'due' ? p.status : 'due' as 'paid' | 'due',
    }));

    const groupKey = getGroupKey(scout.group);

    return {
        ...scout,
        group: groupKey,
        payments: sanitizedPayments,
        imageUrl: scout.imageUrl === 'https://placehold.co/400x400.png' ? '' : scout.imageUrl || '',
        id: scout.id || '',
        fullName: scout.fullName || '',
        dateOfBirth: scout.dateOfBirth || '',
        address: scout.address || '',
    };
};

export default function MemberForm({ scout, onSaveSuccess }: MemberFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { role } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!scout;
  const canManage = role === 'general' || role === 'finance';

  const form = useForm<ScoutFormValues>({
    resolver: zodResolver(scoutSchema),
    defaultValues: scout ? normalizeScoutDataForForm(scout) : {
      id: "",
      fullName: "",
      dateOfBirth: "",
      address: "",
      group: "",
      imageUrl: "",
      payments: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "payments",
  });

  const onSubmit = async (data: ScoutFormValues) => {
    setIsSubmitting(true);

    if (!canManage) {
      toast({ variant: "destructive", title: t('admin.permissionDenied'), description: t('admin.permissionDeniedDesc') });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const { id, ...savableData } = data;
      
      if (isEditMode && scout) {
        const scoutRef = doc(db, 'scouts', scout.id);
        await updateDoc(scoutRef, savableData);
        toast({ title: t('admin.updateSuccess'), description: t('admin.updateSuccessDesc') });
      } else {
        const scoutRef = doc(db, 'scouts', id);
        const docSnap = await getDoc(scoutRef);
        if (docSnap.exists()) {
            toast({ variant: "destructive", title: t('admin.idExistsError'), description: t('admin.idExistsErrorDesc') });
            setIsSubmitting(false);
            return;
        }
        await setDoc(scoutRef, savableData);
        toast({ title: t('admin.updateSuccess'), description: t('admin.createSuccessDesc') });
      }
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error("Failed to save scout:", error);
      const errorMessage = error instanceof Error ? error.message : t('admin.unknownError');
      toast({ variant: "destructive", title: t('admin.saveError'), description: t('admin.saveErrorDesc', { error: errorMessage }) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1"><ShieldQuestion className="h-4 w-4" />{t('admin.scoutId')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('admin.scoutIdHint')} disabled={isEditMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div/>
          <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>{t('admin.fullName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('admin.dob')}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>{t('admin.address')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField
            control={form.control}
            name="group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('admin.group')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.selectGroup')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groups.map(groupKey => (
                      <SelectItem key={groupKey} value={groupKey}>
                        {t(`about.${groupKey}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.profilePicUrl')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('admin.profilePicUrlHint')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Separator />
        
        <Card className="p-4 bg-muted/50">
            <CardHeader className="p-2">
                <CardTitle className="font-headline text-lg">{t('admin.paymentRecords')}</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
                <div className="space-y-4">
                    {fields.length > 0 ? (
                        fields.map((field, index) => (
                          <div key={field.id} className="p-4 border rounded-lg bg-card shadow-sm flex flex-col sm:flex-row sm:items-end sm:gap-4">
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                               <FormField control={form.control} name={`payments.${index}.month`} render={({ field }) => (<FormItem><FormLabel>{t('admin.paymentMonth')}</FormLabel><FormControl><Input {...field} placeholder={t('admin.paymentMonthHint')} /></FormControl><FormMessage /></FormItem>)} />
                               <FormField control={form.control} name={`payments.${index}.amount`} render={({ field }) => (<FormItem><FormLabel>{t('admin.paymentAmount')}</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>)} />
                               <FormField control={form.control} name={`payments.${index}.status`} render={({ field }) => (
                                 <FormItem>
                                   <FormLabel>{t('admin.paymentStatus')}</FormLabel>
                                   <Select onValueChange={field.onChange} value={field.value}>
                                     <FormControl>
                                       <SelectTrigger>
                                         <SelectValue placeholder={t('admin.selectStatus')} />
                                       </SelectTrigger>
                                     </FormControl>
                                     <SelectContent>
                                       <SelectItem value="due">{t('admin.statusDue')}</SelectItem>
                                       <SelectItem value="paid">{t('admin.statusPaid')}</SelectItem>
                                     </SelectContent>
                                   </Select>
                                   <FormMessage />
                                 </FormItem>
                               )} />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="mt-4 sm:mt-0 flex-shrink-0 h-9 w-9 text-destructive hover:bg-destructive/10 self-end sm:self-end"
                              aria-label="Remove payment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-muted-foreground px-2 py-4 text-center">{t('admin.noPaymentsYet')}</p>
                    )}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ month: "", amount: 20, status: "due" })} className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> {t('admin.addPayment')}</Button>
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? t('admin.saving') : isEditMode ? t('admin.saveChanges') : t('admin.createMember')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
