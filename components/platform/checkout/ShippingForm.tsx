import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ShippingFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
}

interface ShippingFormProps {
  data: ShippingFormData;
  onChange: (data: ShippingFormData) => void;
}

export function ShippingForm({ data, onChange }: ShippingFormProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* Contact */}
      <div>
        <h3 className="font-medium mb-4">Contact Information</h3>
        <div className="grid gap-4">
          <FormField
            id="email"
            label="Email"
            type="email"
            value={data.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />
          <FormField
            id="phone"
            label="Phone"
            type="tel"
            value={data.phone}
            onChange={handleChange}
            placeholder="01XXXXXXXXX"
            required
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h3 className="font-medium mb-4">Shipping Address</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="firstName"
              label="First Name"
              value={data.firstName}
              onChange={handleChange}
              required
            />
            <FormField
              id="lastName"
              label="Last Name"
              value={data.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <FormField
            id="addressLine1"
            label="Address"
            value={data.addressLine1}
            onChange={handleChange}
            placeholder="Street address"
            required
          />

          <FormField
            id="addressLine2"
            label="Apartment, suite, etc."
            value={data.addressLine2}
            onChange={handleChange}
            placeholder="Optional"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="city"
              label="City"
              value={data.city}
              onChange={handleChange}
              required
            />
            <FormField
              id="state"
              label="State / Division"
              value={data.state}
              onChange={handleChange}
            />
          </div>

          <FormField
            id="postalCode"
            label="Postal Code"
            value={data.postalCode}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Order Notes */}
      <div>
        <Label htmlFor="notes">Order Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          value={data.notes}
          onChange={handleChange}
          placeholder="Any special instructions for delivery..."
          className="mt-1.5"
          rows={3}
        />
      </div>
    </div>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: FormFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-1.5"
      />
    </div>
  );
}
