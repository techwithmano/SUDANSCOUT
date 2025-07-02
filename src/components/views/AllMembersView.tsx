
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Users, UserPlus, Edit, Trash2 } from "lucide-react";
import type { Scout } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, query, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { MemberFormDialog } from "../admin/MemberFormDialog";

const ADMIN_EMAIL = 'sudanscoutadmin@scout.com';

export default function AllMembersView() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScout, setEditingScout] = useState<Scout | null>(null);
  
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
      fetchScouts(); // Refresh the list if a change was made
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
        fetchScouts(); // Refetch the list
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
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
          <div className="text-center sm:text-left">
              <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary flex items-center justify-center sm:justify-start gap-3">
              <Users className="h-10 w-10" /> {t('admin.allMembersTitle')}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">{t('admin.allMembersSubtitle')}</p>
          </div>
          <Button onClick={handleAddNew}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t('admin.addNewMember')}
          </Button>
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
