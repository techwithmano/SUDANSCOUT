
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
import { placeOrder } from "@/app/store/actions";
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
  const { t } = useTranslation();
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
    try {
      const result = await placeOrder({
        customerDetails: data,
        cartItems: cartItems,
        totalPrice: totalPrice
      });
       if (result.success) {
        toast({
          title: t('store.checkoutSuccessTitle'),
          description: t('store.checkoutSuccessDescription'),
        });
        form.reset();
        clearCart();
        router.push('/store');
      } else {
        toast({
          variant: 'destructive',
          title: t('store.checkoutErrorTitle'),
          description: result.message,
        });
      }
    } catch (error) {
       toast({
          variant: 'destructive',
          title: t('store.checkoutErrorTitle'),
          description: t('store.checkoutErrorDescription'),
        });
    } finally {
        setIsSubmitting(false);
    }
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
                      <Input placeholder="John" {...field} />
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
                      <Input placeholder="Doe" {...field} />
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
                    <Input placeholder="123 Main St, Anytown" {...field} />
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
                      <Input type="tel" placeholder="(123) 456-7890" {...field} />
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
                      <Input type="email" placeholder="you@example.com" {...field} />
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
                    <Input placeholder="e.g., 12345" {...field} />
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
