import { useState } from "react";
import {
  Wallet,
  Smartphone,
  Building2,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/constants";
import {
  ManualPaymentMethod,
  PlatformPaymentConfig,
  WalletDetails,
  BankDetails,
} from "@/types";
import { cn } from "@/lib/utils";

interface PaymentMethodOption {
  id: ManualPaymentMethod;
  label: string;
  description: string;
  icon: typeof Wallet;
  requiresTransactionDetails: boolean;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  { id: "cash", label: "Cash on Delivery", description: "Pay when you receive", icon: Wallet, requiresTransactionDetails: false },
  { id: "bkash", label: "bKash", description: "Mobile payment", icon: Smartphone, requiresTransactionDetails: true },
  { id: "nagad", label: "Nagad", description: "Mobile payment", icon: Smartphone, requiresTransactionDetails: true },
  { id: "rocket", label: "Rocket", description: "Mobile payment", icon: Smartphone, requiresTransactionDetails: true },
  { id: "bank", label: "Bank Transfer", description: "Direct transfer", icon: Building2, requiresTransactionDetails: true },
];

interface PaymentMethodsProps {
  config: PlatformPaymentConfig;
  selected: ManualPaymentMethod;
  onChange: (method: ManualPaymentMethod) => void;
  transactionId: string;
  onTransactionIdChange: (value: string) => void;
  senderPhone: string;
  onSenderPhoneChange: (value: string) => void;
  total: number;
}

export function PaymentMethods({
  config,
  selected,
  onChange,
  transactionId,
  onTransactionIdChange,
  senderPhone,
  onSenderPhoneChange,
  total,
}: PaymentMethodsProps) {
  const availableMethods = PAYMENT_METHODS.filter((method) => {
    if (method.id === "cash") return config.cash?.enabled;
    return !!config[method.id];
  });

  const currentMethod = PAYMENT_METHODS.find((m) => m.id === selected);

  return (
    <div className="space-y-4">
      <h3 className="font-medium flex items-center gap-2">
        <Wallet className="h-5 w-5" />
        Payment Method
      </h3>

      {/* Method Selection */}
      <div className="grid gap-3">
        {availableMethods.map((method) => {
          const Icon = method.icon;
          return (
            <label
              key={method.id}
              className={cn(
                "flex items-center gap-4 p-4 border cursor-pointer transition-all",
                selected === method.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <input
                type="radio"
                name="payment"
                checked={selected === method.id}
                onChange={() => onChange(method.id)}
                className="sr-only"
              />
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                  selected === method.id ? "border-primary" : "border-muted-foreground"
                )}
              >
                {selected === method.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{method.label}</p>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Payment Details */}
      {selected === "bkash" && config.bkash && (
        <WalletPaymentDetails
          method="bkash"
          config={config.bkash}
          total={total}
          transactionId={transactionId}
          onTransactionIdChange={onTransactionIdChange}
          senderPhone={senderPhone}
          onSenderPhoneChange={onSenderPhoneChange}
        />
      )}
      {selected === "nagad" && config.nagad && (
        <WalletPaymentDetails
          method="nagad"
          config={config.nagad}
          total={total}
          transactionId={transactionId}
          onTransactionIdChange={onTransactionIdChange}
          senderPhone={senderPhone}
          onSenderPhoneChange={onSenderPhoneChange}
        />
      )}
      {selected === "rocket" && config.rocket && (
        <WalletPaymentDetails
          method="rocket"
          config={config.rocket}
          total={total}
          transactionId={transactionId}
          onTransactionIdChange={onTransactionIdChange}
          senderPhone={senderPhone}
          onSenderPhoneChange={onSenderPhoneChange}
        />
      )}
      {selected === "bank" && config.bank && (
        <BankPaymentDetails
          config={config.bank}
          total={total}
          transactionId={transactionId}
          onTransactionIdChange={onTransactionIdChange}
        />
      )}
    </div>
  );
}

interface WalletPaymentDetailsProps {
  method: "bkash" | "nagad" | "rocket";
  config: WalletDetails;
  total: number;
  transactionId: string;
  onTransactionIdChange: (value: string) => void;
  senderPhone: string;
  onSenderPhoneChange: (value: string) => void;
}

function WalletPaymentDetails({
  method,
  config,
  total,
  transactionId,
  onTransactionIdChange,
  senderPhone,
  onSenderPhoneChange,
}: WalletPaymentDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const colorClass = method === "bkash" ? "pink" : method === "nagad" ? "orange" : "purple";

  return (
    <div className="mt-4 p-5 bg-muted border border-border">
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="h-5 w-5" />
        <h3 className="font-semibold">
          {method.charAt(0).toUpperCase() + method.slice(1)} Payment Details
        </h3>
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
  config: BankDetails;
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
