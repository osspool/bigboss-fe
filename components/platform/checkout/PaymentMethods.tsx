import { useState, useMemo } from "react";
import {
  Wallet,
  Smartphone,
  Building2,
  CreditCard,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/constants";
import type { PaymentMethodConfig } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Payment method type for order creation
 * Use 'provider' for MFS (bkash, nagad, rocket), 'type' for others
 */
export type OrderPaymentType = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank_transfer' | 'card';

interface PaymentMethodsProps {
  /** Payment methods array from platform config */
  paymentMethods: PaymentMethodConfig[];
  /** Selected payment type (provider for MFS, type for others) */
  selected: OrderPaymentType;
  /** Callback when payment method changes */
  onChange: (method: OrderPaymentType) => void;
  /** Transaction ID / TrxID */
  transactionId: string;
  onTransactionIdChange: (value: string) => void;
  /** Sender phone for MFS payments */
  senderPhone: string;
  onSenderPhoneChange: (value: string) => void;
  /** Order total amount */
  total: number;
}

export function PaymentMethods({
  paymentMethods,
  selected,
  onChange,
  transactionId,
  onTransactionIdChange,
  senderPhone,
  onSenderPhoneChange,
  total,
}: PaymentMethodsProps) {
  // Filter active methods and group by type
  const activePayments = useMemo(() =>
    paymentMethods.filter(pm => pm.isActive !== false),
    [paymentMethods]
  );

  const groupedPayments = useMemo(() => ({
    cash: activePayments.filter(pm => pm.type === 'cash'),
    mfs: activePayments.filter(pm => pm.type === 'mfs'),
    bank: activePayments.filter(pm => pm.type === 'bank_transfer'),
    card: activePayments.filter(pm => pm.type === 'card'),
  }), [activePayments]);

  // Get currently selected method config
  const selectedConfig = useMemo(() => {
    if (selected === 'cash') {
      return groupedPayments.cash[0];
    }
    if (['bkash', 'nagad', 'rocket', 'upay'].includes(selected)) {
      return groupedPayments.mfs.find(pm => pm.provider === selected);
    }
    if (selected === 'bank_transfer') {
      return groupedPayments.bank[0];
    }
    if (selected === 'card') {
      return groupedPayments.card[0];
    }
    return undefined;
  }, [selected, groupedPayments]);

  const isMfsPayment = ['bkash', 'nagad', 'rocket', 'upay'].includes(selected);

  return (
    <div className="space-y-4">
      <h3 className="font-medium flex items-center gap-2">
        <Wallet className="h-5 w-5" />
        Payment Method
      </h3>

      {/* Cash on Delivery */}
      {groupedPayments.cash.length > 0 && (
        <PaymentOption
          isSelected={selected === 'cash'}
          onClick={() => onChange('cash')}
          icon={Wallet}
          label="Cash on Delivery"
          description="Pay when you receive"
        />
      )}

      {/* MFS Options (bKash, Nagad, Rocket) */}
      {groupedPayments.mfs.length > 0 && (
        <div className="space-y-2">
          {groupedPayments.mfs.map((method) => (
            <PaymentOption
              key={method._id || method.provider}
              isSelected={selected === method.provider}
              onClick={() => onChange(method.provider as OrderPaymentType)}
              icon={Smartphone}
              label={method.name}
              description={`Mobile payment via ${method.provider}`}
            />
          ))}
        </div>
      )}

      {/* Bank Transfer */}
      {groupedPayments.bank.length > 0 && (
        <div className="space-y-2">
          {groupedPayments.bank.map((method, idx) => (
            <PaymentOption
              key={method._id || idx}
              isSelected={selected === 'bank_transfer'}
              onClick={() => onChange('bank_transfer')}
              icon={Building2}
              label={method.name}
              description={method.bankName || "Direct bank transfer"}
            />
          ))}
        </div>
      )}

      {/* Card Payment */}
      {groupedPayments.card.length > 0 && (
        <div className="space-y-2">
          {groupedPayments.card.map((method, idx) => (
            <PaymentOption
              key={method._id || idx}
              isSelected={selected === 'card'}
              onClick={() => onChange('card')}
              icon={CreditCard}
              label={method.name}
              description={method.cardTypes?.join(', ') || "Credit/Debit card"}
            />
          ))}
        </div>
      )}

      {/* Payment Details for MFS */}
      {isMfsPayment && selectedConfig && (
        <MfsPaymentDetails
          method={selected as 'bkash' | 'nagad' | 'rocket' | 'upay'}
          config={selectedConfig}
          total={total}
          transactionId={transactionId}
          onTransactionIdChange={onTransactionIdChange}
          senderPhone={senderPhone}
          onSenderPhoneChange={onSenderPhoneChange}
        />
      )}

      {/* Payment Details for Bank Transfer */}
      {selected === 'bank_transfer' && selectedConfig && (
        <BankPaymentDetails
          config={selectedConfig}
          total={total}
          transactionId={transactionId}
          onTransactionIdChange={onTransactionIdChange}
        />
      )}
    </div>
  );
}

interface PaymentOptionProps {
  isSelected: boolean;
  onClick: () => void;
  icon: typeof Wallet;
  label: string;
  description: string;
}

function PaymentOption({ isSelected, onClick, icon: Icon, label, description }: PaymentOptionProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-4 p-4 border cursor-pointer transition-all",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground"
      )}
    >
      <input
        type="radio"
        name="payment"
        checked={isSelected}
        onChange={onClick}
        className="sr-only"
      />
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
          isSelected ? "border-primary" : "border-muted-foreground"
        )}
      >
        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </div>
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </label>
  );
}

interface MfsPaymentDetailsProps {
  method: 'bkash' | 'nagad' | 'rocket' | 'upay';
  config: PaymentMethodConfig;
  total: number;
  transactionId: string;
  onTransactionIdChange: (value: string) => void;
  senderPhone: string;
  onSenderPhoneChange: (value: string) => void;
}

function MfsPaymentDetails({
  method,
  config,
  total,
  transactionId,
  onTransactionIdChange,
  senderPhone,
  onSenderPhoneChange,
}: MfsPaymentDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const methodLabel = method.charAt(0).toUpperCase() + method.slice(1);

  return (
    <div className="mt-4 p-5 bg-muted border border-border">
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="h-5 w-5" />
        <h3 className="font-semibold">{methodLabel} Payment Details</h3>
      </div>

      <div className="space-y-3 text-sm">
        <DetailRow
          label="Send Money To"
          value={config.walletNumber}
          copyable
          onCopy={() => config.walletNumber && copyToClipboard(config.walletNumber, "number")}
          copied={copiedField === "number"}
        />
        <DetailRow label="Account Name" value={config.walletName} />
        <DetailRow label="Amount to Send" value={formatPrice(total)} highlight />
        {config.note && (
          <p className="text-muted-foreground pt-2 text-xs">{config.note}</p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border space-y-4">
        <div>
          <Label htmlFor="transactionId" className="text-sm font-medium">
            Transaction ID (TrxID) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="transactionId"
            value={transactionId}
            onChange={(e) => onTransactionIdChange(e.target.value.toUpperCase())}
            placeholder="e.g., BGH3K5L90P"
            className="mt-1.5 h-11 font-mono uppercase"
          />
        </div>
        <div>
          <Label htmlFor="senderPhone" className="text-sm font-medium">
            Sender Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="senderPhone"
            value={senderPhone}
            onChange={(e) => onSenderPhoneChange(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="mt-1.5 h-11"
            maxLength={11}
          />
        </div>
      </div>
    </div>
  );
}

interface BankPaymentDetailsProps {
  config: PaymentMethodConfig;
  total: number;
  transactionId: string;
  onTransactionIdChange: (value: string) => void;
}

function BankPaymentDetails({
  config,
  total,
  transactionId,
  onTransactionIdChange,
}: BankPaymentDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="mt-4 p-5 bg-muted border border-border">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="h-5 w-5" />
        <h3 className="font-semibold">Bank Transfer Details</h3>
      </div>

      <div className="space-y-3 text-sm">
        <DetailRow label="Bank Name" value={config.bankName} />
        <DetailRow label="Account Name" value={config.accountName} />
        <DetailRow
          label="Account Number"
          value={config.accountNumber}
          copyable
          onCopy={() => config.accountNumber && copyToClipboard(config.accountNumber, "account")}
          copied={copiedField === "account"}
        />
        {config.branchName && <DetailRow label="Branch" value={config.branchName} />}
        {config.routingNumber && <DetailRow label="Routing Number" value={config.routingNumber} />}
        <DetailRow label="Amount to Transfer" value={formatPrice(total)} highlight />
        {config.note && (
          <p className="text-muted-foreground pt-2 text-xs">{config.note}</p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <Label htmlFor="transactionId" className="text-sm font-medium">
          Transaction Reference <span className="text-destructive">*</span>
        </Label>
        <Input
          id="transactionId"
          value={transactionId}
          onChange={(e) => onTransactionIdChange(e.target.value)}
          placeholder="Enter transaction reference"
          className="mt-1.5 h-11"
        />
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  copyable,
  onCopy,
  copied,
  highlight,
}: {
  label: string;
  value?: string;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  highlight?: boolean;
}) {
  if (!value) return null;

  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn("font-medium", highlight && "font-semibold")}>{value}</span>
        {copyable && onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="p-1 hover:bg-background rounded transition-colors"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
