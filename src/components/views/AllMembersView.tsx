
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
import { db, auth } from "@/lib/firebase";
import { MemberFormDialog } from "../admin/MemberFormDialog";
import Papa from 'papaparse';

const ADMIN_EMAIL = 'sudanscoutadmin@scout.com';

export default function AllMembersView() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScout, setEditingScout] = useState<Scout | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    if (auth.currentUser?.email !== ADMIN_EMAIL) {
        toast({ variant: "destructive", title: t('admin.permissionDenied'), description: "You are not authorized to perform this action." });
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

  const handleExportCSV = () => {
    const dataToExport: any[] = [];
    scouts.forEach(scout => {
      const baseScoutData = {
        id: scout.id,
        fullName: scout.fullName,
        dateOfBirth: scout.dateOfBirth,
        address: scout.address,
        group: scout.group,
        imageUrl: scout.imageUrl,
      };

      if (scout.payments && scout.payments.length > 0) {
        scout.payments.forEach(payment => {
          dataToExport.push({
            ...baseScoutData,
            payment_month: payment.month,
            payment_amount: payment.amount,
            payment_status: payment.status,
            payment_datePaid: payment.datePaid || '',
          });
        });
      } else {
        dataToExport.push({
          ...baseScoutData,
          payment_month: '',
          payment_amount: '',
          payment_status: '',
          payment_datePaid: '',
        });
      }
    });

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
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

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          // Step 1: Group all rows by member ID to build complete member objects
          const membersData = new Map<string, any>();
          for (const row of results.data as any[]) {
            if (!row.id) continue; // Skip rows without an ID

            // If we haven't seen this member ID yet, create their base profile
            if (!membersData.has(row.id)) {
              membersData.set(row.id, {
                id: row.id,
                fullName: row.fullName,
                dateOfBirth: row.dateOfBirth,
                address: row.address,
                group: row.group,
                imageUrl: row.imageUrl,
                payments: [],
              });
            }
            
            // Add payment record to the corresponding member
            const member = membersData.get(row.id);
            if (row.payment_month && row.payment_amount && row.payment_status) {
              member.payments.push({
                month: row.payment_month,
                amount: parseFloat(row.payment_amount),
                status: row.payment_status,
                datePaid: row.payment_datePaid || null,
              });
            }
          }

          // Step 2: Check against Firestore and prepare batch write for NEW members only
          const existingScoutsSnapshot = await getDocs(query(collection(db, 'scouts')));
          const existingScoutIds = new Set(existingScoutsSnapshot.docs.map(docData => docData.id));
          const batch = writeBatch(db);
          let successCount = 0;
          let skippedCount = 0;
          let errorCount = 0;

          for (const [id, scoutData] of membersData.entries()) {
            // If the member ID from the CSV already exists in the database, skip them.
            if (existingScoutIds.has(id)) {
              skippedCount++;
              continue;
            }

            try {
              // Validate the complete member object
              const validatedData = scoutSchema.parse(scoutData);
              const scoutRef = doc(db, 'scouts', validatedData.id);
              const { id: scoutId, ...savableData } = validatedData;
              batch.set(scoutRef, savableData);
              successCount++;
            } catch (parseError) {
              console.error('Skipping invalid row data for scout ID:', id, parseError);
              errorCount++;
            }
          }

          if (successCount > 0) {
            await batch.commit();
          }

          toast({
            title: t('admin.importSuccessTitle'),
            description: t('admin.importSuccessDesc', { successCount: String(successCount), skippedCount: String(skippedCount + errorCount) }),
          });
          
          if (successCount > 0) {
            await fetchScouts(); // Refresh the list to show newly imported members
          }
        },
        error: (error: any) => { throw new Error(error.message); }
      });
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
  };


  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
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
          <div className="flex flex-wrap justify-center sm:justify-end gap-2">
            <Button onClick={handleImportClick} disabled={isImporting}>
              {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isImporting ? t('admin.importing') : t('admin.importData')}
            </Button>
            <Button onClick={handleExportCSV} variant="outline"><Download className="mr-2 h-4 w-4" /> {t('admin.exportData')}</Button>
            <Button onClick={handleAddNew}><UserPlus className="mr-2 h-4 w-4" />{t('admin.addNewMember')}</Button>
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.memberName')}</TableHead>
                      <TableHead>{t('members.scoutId')}</TableHead>
                      <TableHead>{t('memberProfile.group')}</TableHead>
                      <TableHead className="text-right">{t('memberProfile.action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scouts.map((scout) => (
                      <TableRow key={scout.id}>
                        <TableCell>
                          <Link href={`/members/${scout.id}`} className="flex items-center gap-3 hover:underline">
                              <Avatar>
                                  <AvatarImage src={scout.imageUrl} alt={scout.fullName} />
                                  <AvatarFallback>{getInitials(scout.fullName)}</AvatarFallback>
                              </Avatar>
                            <span className="font-medium">{scout.fullName}</span>
                          </Link>
                        </TableCell>
                        <TableCell>{scout.id}</TableCell>
                        <TableCell>{scout.group}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                              <Button variant="outline" size="icon" onClick={() => handleEdit(scout)}>
                                  <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="icon" onClick={() => handleDelete(scout)}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                        </TableCell>
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
