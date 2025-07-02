
"use client";

import type { Payment, Scout } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDollarSign } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export function PaymentSection({ scout }: { scout: Scout }) {
  const { t } = useTranslation();

  const currentPayments = scout.payments || [];

  const handlePayNow = (payment: Payment) => {
    const whatsAppNumber = "249963081890";
    
    let messageBody = `*Scout Payment Notification*\n\n`;
    messageBody += `*Member Details:*\n`;
    messageBody += `- Name: ${scout.fullName}\n`;
    messageBody += `- Scout ID: ${scout.id}\n`;
    messageBody += `- Group: ${scout.group}\n`;
    messageBody += `- Address: ${scout.address}\n\n`;
    
    messageBody += `*Payment Details:*\n`;
    messageBody += `- Month: ${payment.month}\n`;
    messageBody += `- Amount: ${(payment.amount || 0).toFixed(3)} KWD`;
    
    const url = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(messageBody)}`;
    
    window.open(url, '_blank')?.focus();
  };

  return (
    <div className="mt-4 border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead className="font-semibold">{t('memberProfile.month')}</TableHead>
            <TableHead className="font-semibold">{t('memberProfile.amount')}</TableHead>
            <TableHead className="font-semibold">{t('memberProfile.status')}</TableHead>
            <TableHead className="font-semibold text-right">{t('memberProfile.action')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPayments.map((payment, index) => (
            <TableRow key={`${payment.month}-${index}`} className={cn(payment.status === 'paid' && 'bg-primary/5')}>
              <TableCell className="font-medium">{payment.month}</TableCell>
              <TableCell>{(payment.amount || 0).toFixed(3)} KWD</TableCell>
              <TableCell>
                <Badge
                  variant={payment.status === 'paid' ? 'default' : 'secondary'}
                  className={cn(
                    payment.status === 'paid' ? 'bg-green-600 text-white' : 'bg-yellow-400 text-black',
                    'font-semibold'
                  )}
                >
                  {payment.status === 'paid' ? t('memberProfile.paid') : t('memberProfile.due')}
                </Badge>
                {payment.status === 'paid' && payment.datePaid && (
                   <p className="text-xs text-muted-foreground mt-1">
                    {t('memberProfile.on')} {new Date(payment.datePaid).toLocaleDateString()}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-right">
                {payment.status === "due" ? (
                  <Button 
                    size="sm" 
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => handlePayNow(payment)}
                  >
                    <CircleDollarSign className="mr-2 h-4 w-4" />
                    {t('memberProfile.payNow')}
                  </Button>
                ) : (
                  <span className="flex items-center justify-end text-green-600 font-medium">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    {t('memberProfile.paid')}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
