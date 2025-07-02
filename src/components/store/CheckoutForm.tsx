
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/context/LanguageContext";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  address: z.string().min(10, "A valid address is required"),
  phone: z.string().min(10, "A valid phone number is required"),
  email: z.string().email("Please enter a valid email"),
  scoutId: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const { toast } = useToast();
  const { t, locale } = useTranslation();
  const { cartItems, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      phone: "",
      email: "",
      scoutId: "",
    },
  });

  async function onSubmit(data: CheckoutFormValues) {
    setIsSubmitting(true);
    const whatsAppNumber = "249963081890";

    const itemsSummary = cartItems.map(item => {
        const productName = (locale === 'ar' ? item.name_ar : item.name_en) || item.name_en || item.name_ar || item.name;
        const sizeInfo = item.size ? ` (${t('product.size')}: ${item.size})` : '';
        return `- ${item.quantity}x ${productName}${sizeInfo}`;
    }).join('\n');

    let messageBody = '';

    if (locale === 'ar') {
        messageBody = `*طلب جديد من موقع كشافة السودان:*\n\n`;
        messageBody += `*تفاصيل العميل:*\n`;
        messageBody += `الاسم: ${data.firstName} ${data.lastName}\n`;
        messageBody += `العنوان: ${data.address}\n`;
        messageBody += `الهاتف: ${data.phone}\n`;
        messageBody += `البريد الإلكتروني: ${data.email}\n`;
        if (data.scoutId) {
            messageBody += `معرف الكشاف: ${data.scoutId}\n`;
        }
        messageBody += `\n*ملخص الطلب:*\n`;
        messageBody += `${itemsSummary}\n\n`;
        messageBody += `*السعر الإجمالي: ${totalPrice.toFixed(3)} دينار كويتي*`;
    } else {
        messageBody = `*New Order from Scout Central Website:*\n\n`;
        messageBody += `*Customer Details:*\n`;
        messageBody += `Name: ${data.firstName} ${data.lastName}\n`;
        messageBody += `Address: ${data.address}\n`;
        messageBody += `Phone: ${data.phone}\n`;
        messageBody += `Email: ${data.email}\n`;
        if (data.scoutId) {
            messageBody += `Scout ID: ${data.scoutId}\n`;
        }
        messageBody += `\n*Order Summary:*\n`;
        messageBody += `${itemsSummary}\n\n`;
        messageBody += `*Total Price: ${totalPrice.toFixed(3)} KWD*`;
    }

    const url = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(messageBody)}`;

    window.open(url, '_blank')?.focus();

    toast({
        title: t('contact.readyToSendTitle'),
        description: t('contact.redirectWhatsApp'),
    });
    
    form.reset();
    clearCart();
    router.push('/store');
    
    // This might not be reached if the redirect happens too fast, but it's good practice.
    setIsSubmitting(false);
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('store.checkoutFirstName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('store.checkoutFirstNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('store.checkoutLastName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('store.checkoutLastNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('store.checkoutAddress')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('store.checkoutAddressPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('store.checkoutPhone')}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder={t('store.checkoutPhonePlaceholder')} {...field} />
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
                    <FormLabel>{t('store.checkoutEmail')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('store.checkoutEmailPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="scoutId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('store.checkoutScoutId')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('store.checkoutScoutIdPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting || cartItems.length === 0} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6">
              {isSubmitting ? t('store.checkoutPlacingOrder') : `${t('store.checkoutPlaceOrder')} (${totalPrice.toFixed(3)} KWD)`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
