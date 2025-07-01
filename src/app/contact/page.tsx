
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { submitContactForm } from "./actions";
import { useState } from "react";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    try {
      const result = await submitContactForm(data);
      if (result.success) {
        toast({
          title: t('contact.successTitle'),
          description: t('contact.successDescription'),
        });
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: t('contact.errorTitle'),
          description: result.message,
        });
      }
    } catch (error) {
       toast({
          variant: 'destructive',
          title: t('contact.errorTitle'),
          description: t('contact.errorDescription'),
        });
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{t('contact.mainTitle')}</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          {t('contact.mainSubtitle')}
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Send className="h-6 w-6 text-primary" /> {t('contact.formTitle')}
            </CardTitle>
            <CardDescription>{t('contact.formSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.formName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('contact.formName')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.formEmail')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t('contact.formEmail')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.formSubject')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('contact.formSubject')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.formMessage')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('contact.formMessage')} rows={6} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {isSubmitting ? t('contact.formSending') : t('contact.formSend')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="space-y-8">
          <h2 className="text-3xl font-bold font-headline text-primary">{t('contact.infoTitle')}</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold font-headline text-lg">{t('contact.hqTitle')}</h3>
                <p className="text-muted-foreground">123 Scout Trail, Adventure City, AC 12345</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold font-headline text-lg">{t('contact.emailTitle')}</h3>
                <p className="text-muted-foreground">contact@scoutcentral.org</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold font-headline text-lg">{t('contact.callTitle')}</h3>
                <p className="text-muted-foreground">(123) 456-7890</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
