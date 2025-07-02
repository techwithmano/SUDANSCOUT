
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Send, Facebook, Instagram } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();

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
    const whatsAppNumber = "249963081890"; 

    let messageBody = '';

    if (locale === 'ar') {
        messageBody = `رسالة جديدة من موقع كشافة السودان:
*الاسم:* ${data.name}
*البريد الإلكتروني:* ${data.email}
*الموضوع:* ${data.subject}

*الرسالة:*
${data.message}`;
    } else {
        messageBody = `New message from the Scout Central website:
*Name:* ${data.name}
*Email:* ${data.email}
*Subject:* ${data.subject}

*Message:*
${data.message}`;
    }
    
    const url = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(messageBody)}`;

    window.open(url, '_blank')?.focus();

    toast({
      title: t('contact.readyToSendTitle'),
      description: t('contact.redirectWhatsApp'),
    });
    
    form.reset();
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
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {t('contact.formSend')}
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
          <Separator />
           <div>
            <h3 className="text-2xl font-bold font-headline text-primary mb-4">{t('contact.followUsTitle')}</h3>
            <div className="flex items-center gap-6">
              <Link href="https://www.facebook.com/share/g/1AC4aV26H4/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                  <Facebook className="h-8 w-8" />
              </Link>
              <Link href="https://www.instagram.com/scoutsudankw/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                  <Instagram className="h-8 w-8" />
              </Link>
              <Link href="https://www.tiktok.com/@scoutsudankw" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="TikTok">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="currentColor"
                >
                  <title>TikTok</title>
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.65-6.48-2.31-1.64-1.66-2.34-4.04-2.34-6.42 0-2.54 1.14-4.88 2.89-6.41 1.81-1.56 4.14-2.32 6.51-2.32.01 2.21-.01 4.41.01 6.62-.92.13-1.84.34-2.7.67-1.13.43-2.18.99-3.07 1.71-.92.73-1.56 1.7-1.89 2.86-.25.86-.33 1.77-.21 2.68.17 1.39.77 2.73 1.74 3.71.97.98 2.24 1.56 3.59 1.63 1.41.08 2.83-.28 3.98-1.04.99-.64 1.77-1.57 2.25-2.69.41-.95.59-2.01.59-3.07v-11.4c.02-.3-.02-.6-.05-.89-.04-.33-.1-.65-.19-.97-.08-.27-.2-.54-.33-.79-.13-.26-.28-.51-.45-.75-.17-.24-.36-.47-.56-.68-.2-.21-.42-.41-.65-.59-.23-.18-.47-.35-.72-.51-.25-.16-.52-.3-.79-.43s-.55-.24-.83-.34c-.28-.1-.57-.18-.86-.25-.29-.07-.58-.12-.88-.17zm-1.84 6.57c.92-.02 1.84-.02 2.76 0 .02 2.05.01 4.11.01 6.16-.91.09-1.82.28-2.68.61-1.09.4-2.07.95-2.88 1.65-.54.46-1.01.99-1.39 1.58-.52.83-.8 1.76-.85 2.73-.04.81.08 1.61.32 2.38.41 1.28 1.16 2.45 2.18 3.33 1.05.9 2.33 1.42 3.68 1.47 1.34.05 2.67-.3 3.75-1.07.89-.64 1.59-1.51 2.05-2.52.34-.73.53-1.53.53-2.35 0-2.07-.01-4.13.01-6.2 1.01-.23 2.02-.42 3.02-.63v-2.12c-1.33.22-2.63.56-3.87 1.04-.69.27-1.35.59-1.98.98-2.18 1.33-4.91 1.18-6.99-.37-1.03-.77-1.88-1.74-2.52-2.82-.41-.71-.65-1.5-.7-2.33-.03-.51-.01-1.02.04-1.53.07-.63.21-1.26.42-1.86.29-.83.74-1.59 1.32-2.25.7-.79 1.57-1.42 2.53-1.87.41-.19.83-.35 1.26-.49.43-.14.86-.26 1.3-.35.43-.09.87-.15 1.3-.2.43-.05.86-.08 1.29-.1z" />
                </svg>
              </Link>
            </div>
           </div>
        </div>
      </div>
    </div>
  );
}
