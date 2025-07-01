
"use client";

import type { Payment } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDollarSign } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import Link from "next/link";

export function PaymentSection({ scoutId, initialPayments }: { scoutId: string; initialPayments: Payment[] }) {
  const { t } = useTranslation();

  // This component now gets its state from the parent via props (`initialPayments`), 
  // which are updated by Next.js when revalidatePath is called.
  const currentPayments = initialPayments || [];

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
                  <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="https://your-payment-link.com" target="_blank">
                      <CircleDollarSign className="mr-2 h-4 w-4" />
                      {t('memberProfile.payNow')}
                    </Link>
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
