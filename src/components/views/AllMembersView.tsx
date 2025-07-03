
"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Users, UserPlus, Edit, Trash2, Download, Upload } from "lucide-react";
import type { Scout } from "@/lib/data";
import { scoutSchema } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, query, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { MemberFormDialog } from "../admin/MemberFormDialog";
import Papa from 'papaparse';
import { cn } from "@/lib/utils";
import translations from "@/locales";

// This map helps find the correct internal group key (e.g., 'troopBoyScouts')
// from a display value in either English or Arabic (e.g., "Boy Scouts Troop" or "فرقة الفتيان").
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
    return groupKeyMap[String(groupValue).toLowerCase().trim()] || String(groupValue);
};

export default function AllMembersView() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const { role } = useAuth();
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScout, setEditingScout] = useState<Scout | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const canManageMembers = role === 'general' || role === 'finance' || role === 'custodian';

  const fetchScouts = async () => {
    setIsLoading(true);
    try {
        const scoutsCol = collection(db, 'scouts');
        const q = query(scoutsCol);
        const scoutsSnapshot = await getDocs(q);
        const scoutsList = scoutsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Scout));
        setScouts(scoutsList);
    } catch (error) {
        console.error("Error fetching scouts:", error);
        toast({ variant: 'destructive', title: t('admin.fetchError'), description: t('admin.fetchErrorDesc') });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchScouts();
  }, []);

  const handleAddNew = () => {
    setEditingScout(null);
    setIsDialogOpen(true);
  }

  const handleEdit = (scout: Scout) => {
    setEditingScout(scout);
    setIsDialogOpen(true);
  }

  const handleDialogClose = (wasSaved: boolean) => {
    setIsDialogOpen(false);
    if (wasSaved) {
      fetchScouts();
    }
  }

  const handleDelete = async (scout: Scout) => {
    if (!canManageMembers) {
        toast({ variant: "destructive", title: t('admin.permissionDenied'), description: t('admin.permissionDeniedDesc') });
        return;
    }

    try {
        await deleteDoc(doc(db, 'scouts', scout.id));
        toast({ title: t('admin.updateSuccess'), description: t('admin.deleteSuccessDesc', { name: scout.fullName }) });
        fetchScouts();
    } catch (error) {
        console.error("Firestore Delete Error:", error);
        const errorMessage = error instanceof Error ? error.message : t('admin.unknownError');
        toast({ 
            variant: 'destructive', 
            title: t('admin.saveError'), 
            description: t('admin.deleteErrorDesc', { error: errorMessage })
        });
    }
  };

  const formatDateForExport = (dateString: string | undefined): string => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString || '';
    }
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleExportCsv = () => {
    const maxPayments = scouts.reduce((max, scout) => {
      const numPayments = scout.payments?.length || 0;
      return numPayments > max ? numPayments : max;
    }, 0);

    const baseHeaders = ['id', 'fullName', 'dateOfBirth', 'address', 'group', 'imageUrl'];
    const paymentHeaders: string[] = [];
    for (let i = 1; i <= maxPayments; i++) {
      paymentHeaders.push(`payment_month_${i}`);
      paymentHeaders.push(`payment_amount_${i}`);
      paymentHeaders.push(`payment_status_${i}`);
    }
    const headers = [...baseHeaders, ...paymentHeaders];

    const dataToExport = scouts.map(scout => {
      const row: { [key: string]: any } = {
        id: scout.id,
        fullName: scout.fullName,
        dateOfBirth: formatDateForExport(scout.dateOfBirth),
        address: scout.address,
        group: getDisplayedGroup(scout.group || ''), // Use helper to get translated name
        imageUrl: scout.imageUrl,
      };

      (scout.payments || []).forEach((payment, index) => {
        const i = index + 1;
        row[`payment_month_${i}`] = payment.month;
        row[`payment_amount_${i}`] = payment.amount;
        row[`payment_status_${i}`] = locale === 'ar' 
            ? (payment.status === 'paid' ? 'مدفوع' : 'مستحق')
            : payment.status;
      });
      return row;
    });

    const csv = Papa.unparse(dataToExport, { header: true, columns: headers });
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'scouts_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const parseDateFromImport = (dateValue: string | number | undefined): string => {
    if (typeof dateValue === 'string') {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
            const [day, month, year] = dateValue.split('/');
            return `${year}-${month}-${day}`;
        }
    }
    // Return as is if not in dd/mm/yyyy format (might already be yyyy-mm-dd)
    return String(dateValue || '');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            try {
                const jsonData = results.data;
                const membersToUpsert: Scout[] = [];

                for (const row of jsonData as any[]) {
                    if (!row.id || !String(row.id).trim()) continue;
                    
                    const scoutData: any = {
                        id: String(row.id).trim(),
                        fullName: row.fullName || '',
                        dateOfBirth: parseDateFromImport(row.dateOfBirth),
                        address: row.address || '',
                        group: getGroupKey(row.group), // Use helper to get the internal key
                        imageUrl: row.imageUrl || '',
                        payments: [],
                    };

                    let i = 1;
                    while (row[`payment_month_${i}`] !== undefined && row[`payment_month_${i}`] !== null) {
                        const rawStatus = String(row[`payment_status_${i}`] || '').trim().toLowerCase();
                        let finalStatus: 'paid' | 'due' = 'due';
                        
                        if (rawStatus === 'مدفوع' || rawStatus === 'paid') {
                          finalStatus = 'paid';
                        } else if (rawStatus === 'مستحق' || rawStatus === 'due') {
                          finalStatus = 'due';
                        }

                        const payment = {
                          month: row[`payment_month_${i}`],
                          amount: parseFloat(row[`payment_amount_${i}`]) || 0,
                          status: finalStatus,
                        };
                        
                        if (payment.month) {
                          scoutData.payments.push(payment);
                        }
                        i++;
                    }
                    membersToUpsert.push(scoutData);
                }
                
                const existingScoutsSnapshot = await getDocs(query(collection(db, 'scouts')));
                const existingScoutIds = new Set(existingScoutsSnapshot.docs.map(docData => docData.id));
                const batch = writeBatch(db);
                
                let createdCount = 0;
                let updatedCount = 0;
                let errorCount = 0;

                for (const scoutData of membersToUpsert) {
                  try {
                    const validatedData = scoutSchema.parse(scoutData);
                    const scoutRef = doc(db, 'scouts', validatedData.id);
                    const { id, ...savableData } = validatedData;
                    batch.set(scoutRef, savableData, { merge: true });

                    if (existingScoutIds.has(id)) {
                      updatedCount++;
                    } else {
                      createdCount++;
                    }
                  } catch (parseError) {
                    console.error(`Skipping invalid row data for scout ID ${scoutData.id}:`, parseError);
                    errorCount++;
                  }
                }

                if (createdCount + updatedCount > 0) {
                  await batch.commit();
                }

                toast({
                  title: t('admin.importSuccessTitle'),
                  description: t('admin.importProcessComplete', { 
                      createdCount: String(createdCount), 
                      updatedCount: String(updatedCount),
                      errorCount: String(errorCount)
                  }),
                });
                
                if (createdCount + updatedCount > 0) {
                  await fetchScouts();
                }

            } catch (error) {
                console.error("Import failed:", error);
                toast({
                    variant: 'destructive',
                    title: t('admin.importErrorTitle'),
                    description: t('admin.importErrorDesc', { error: error instanceof Error ? error.message : String(error) }),
                });
            } finally {
                setIsImporting(false);
                if (event.target) event.target.value = '';
            }
        },
        error: (error: any) => {
            console.error("CSV Parse error:", error);
            toast({
                variant: 'destructive',
                title: t('admin.importErrorTitle'),
                description: t('admin.importErrorDesc', { error: error.message }),
            });
            setIsImporting(false);
            if (event.target) event.target.value = '';
        }
    });
  };


  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const getDisplayedGroup = (groupValue: string) => {
    const groupKeys = ['troopAdvanced', 'troopBoyScouts', 'troopCubScouts', 'troopAdvancedGuides', 'troopGirlGuides', 'troopBrownies'];
    if (groupValue && groupKeys.includes(groupValue)) {
        return t(`about.${groupValue}`);
    }
    return groupValue;
  };

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </div>
    )
  }

  return (
    <>
      <MemberFormDialog 
        isOpen={isDialogOpen} 
        onClose={handleDialogClose}
        scout={editingScout}
      />
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
        aria-label={t('admin.selectCsv')}
      />
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
          <div className="text-center sm:text-left">
              <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary flex items-center justify-center sm:justify-start gap-3">
              <Users className="h-10 w-10" /> {t('admin.allMembersTitle')}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">{t('admin.allMembersSubtitle')}</p>
          </div>
          {canManageMembers && (
            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              <Button onClick={handleImportClick} disabled={isImporting}>
                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {isImporting ? t('admin.importing') : t('admin.importData')}
              </Button>
              <Button onClick={handleExportCsv} variant="outline"><Download className="mr-2 h-4 w-4" /> {t('admin.exportData')}</Button>
              <Button onClick={handleAddNew}><UserPlus className="mr-2 h-4 w-4" />{t('admin.addNewMember')}</Button>
            </div>
          )}
        </div>
        <Card>
          <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cn(locale === 'ar' ? 'text-right' : 'text-left')}>{t('admin.memberName')}</TableHead>
                      <TableHead className={cn(locale === 'ar' ? 'text-right' : 'text-left')}>{t('members.scoutId')}</TableHead>
                      <TableHead className={cn(locale === 'ar' ? 'text-right' : 'text-left')}>{t('memberProfile.group')}</TableHead>
                      {canManageMembers && <TableHead className={cn(locale === 'ar' ? 'text-left' : 'text-right')}>{t('memberProfile.action')}</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scouts.map((scout) => (
                      <TableRow key={scout.id}>
                        <TableCell className={cn(locale === 'ar' ? 'text-right' : 'text-left')}>
                          <Link href={`/members/${scout.id}`} className="flex items-center gap-3 hover:underline">
                              <Avatar>
                                  <AvatarImage src={scout.imageUrl} alt={scout.fullName} />
                                  <AvatarFallback>{getInitials(scout.fullName)}</AvatarFallback>
                              </Avatar>
                            <span className="font-medium">{scout.fullName}</span>
                          </Link>
                        </TableCell>
                        <TableCell className={cn(locale === 'ar' ? 'text-right' : 'text-left')}>{scout.id}</TableCell>
                        <TableCell className={cn(locale === 'ar' ? 'text-right' : 'text-left')}>{getDisplayedGroup(scout.group || '')}</TableCell>
                        {canManageMembers && (
                          <TableCell className={cn(locale === 'ar' ? 'text-left' : 'text-right')}>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="icon" onClick={() => handleEdit(scout)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDelete(scout)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
