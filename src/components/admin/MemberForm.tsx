
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
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

type ScoutFormValues = z.infer<typeof scoutSchema>;

interface MemberFormProps {
  scout?: Scout | null;
  onSaveSuccess?: () => void;
}

const ADMIN_EMAIL = 'sudanscoutadmin@scout.com';

export default function MemberForm({ scout, onSaveSuccess }: MemberFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!scout;

  const form = useForm<ScoutFormValues>({
    resolver: zodResolver(scoutSchema),
    defaultValues: {
      id: "",
      fullName: "",
      dateOfBirth: "",
      address: "",
      group: "",
      imageUrl: "",
      payments: [],
    },
  });

  useEffect(() => {
    if (scout) {
      const dob = scout.dateOfBirth ? new Date(scout.dateOfBirth) : null;
      const formattedDob = dob && !isNaN(dob.getTime()) ? dob.toISOString().split('T')[0] : "";

      form.reset({
        ...scout,
        dateOfBirth: formattedDob,
        imageUrl: scout.imageUrl === 'https://placehold.co/400x400.png' ? '' : scout.imageUrl,
      });
    } else {
      form.reset({
        id: "",
        fullName: "",
        dateOfBirth: "",
        address: "",
        group: "",
        imageUrl: "",
        payments: [],
      });
    }
  }, [scout, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "payments",
  });

  const onSubmit = async (data: ScoutFormValues) => {
    setIsSubmitting(true);

    if (auth.currentUser?.email !== ADMIN_EMAIL) {
      toast({ variant: "destructive", title: "Permission Denied", description: "You are not authorized to save member data." });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const scoutData = {
        ...data,
        imageUrl: data.imageUrl || "https://placehold.co/400x400.png",
      };

      const { id, ...savableData } = scoutData;
      
      if (isEditMode && scout) {
        const scoutRef = doc(db, 'scouts', scout.id);
        await updateDoc(scoutRef, savableData);
        toast({ title: "Success!", description: "Member profile has been updated." });
      } else {
        const scoutRef = doc(db, 'scouts', id);
        const docSnap = await getDoc(scoutRef);
        if (docSnap.exists()) {
            toast({ variant: "destructive", title: "Error", description: "A member with this ID already exists. Please use a unique ID." });
            setIsSubmitting(false);
            return;
        }
        await setDoc(scoutRef, savableData);
        toast({ title: "Success!", description: "New member has been created." });
      }
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error("Failed to save scout:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Error", description: 'Failed to save scout: ' + errorMessage });
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
                <FormLabel className="flex items-center gap-1"><ShieldQuestion className="h-4 w-4" />Scout ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter a unique ID" disabled={isEditMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div/>
          <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="group" render={({ field }) => (<FormItem><FormLabel>Group</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com/image.png" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-headline text-lg mb-4">Payment Records</h3>
          <div className="space-y-4">
            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg">
                    <FormField control={form.control} name={`payments.${index}.month`} render={({ field }) => (<FormItem><FormLabel>Month</FormLabel><FormControl><Input {...field} placeholder="e.g. January 2024" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`payments.${index}.amount`} render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`payments.${index}.status`} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="due">Due</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ month: "", amount: 20, status: "due", datePaid: null })}><PlusCircle className="mr-2 h-4 w-4" /> Add Payment</Button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Member'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
