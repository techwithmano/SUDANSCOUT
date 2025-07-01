
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/context/LanguageContext";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const ADMIN_EMAIL = 'sudanscoutadmin@scout.com';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      if (userCredential.user.email !== ADMIN_EMAIL) {
        await auth.signOut();
        throw new Error("Access denied. Not an admin account.");
      }

      toast({
        title: t('admin.loginSuccessTitle'),
        description: t('admin.loginSuccessDescription'),
      });
      router.push("/members");
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('admin.loginErrorTitle'),
        description: t('admin.loginErrorDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center py-12 md:py-24">
        <Link href="/" className="flex items-center gap-2 font-bold font-headline text-2xl text-primary mb-8">
          <Image src="/logo.png" alt={t('header.scoutCentral')} width={40} height={40} />
          <span>{t('header.scoutCentral')}</span>
        </Link>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            {t('admin.loginTitle')}
          </CardTitle>
          <CardDescription>{t('admin.loginSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contact.formEmail')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.password')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground">
                {isSubmitting ? t('admin.loggingIn') : t('admin.login')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
