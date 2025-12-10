"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlatformConfig, useUpdatePlatformConfig } from "@/hooks/query/usePlatformConfig";
import { platformConfigSchema } from "@/schemas/platform-config.schema";
import { FormGenerator, section, field } from "@/components/form/form-system";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/custom/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

/**
 * Platform Config Form - Admin
 * Manages platform-wide configuration using FormGenerator with Tabs
 * Matches backend schema from platform.plugin.js
 */
export function PlatformConfigForm({ token }) {
  const { config, isLoading, isError, error } = usePlatformConfig(token);
  const { updateConfig, isUpdating } = useUpdatePlatformConfig(token);
  const [editingDelivery, setEditingDelivery] = useState(null);

  const form = useForm({
    resolver: zodResolver(platformConfigSchema),
    defaultValues: {
      platformName: "",
      payment: {
        cash: { enabled: true },
        bkash: {},
        nagad: {},
        rocket: {},
        bank: {},
      },
      deliveryOptions: [],
      policies: {},
    },
  });

  const { fields: deliveryFields, append, remove } = useFieldArray({
    control: form.control,
    name: "deliveryOptions",
  });

  // Load config data into form
  useEffect(() => {
    if (config) {
      form.reset({
        platformName: config.platformName || "",
        payment: config.payment || {
          cash: { enabled: true },
          bkash: {},
          nagad: {},
          rocket: {},
          bank: {},
        },
        deliveryOptions: config.deliveryOptions || [],
        policies: config.policies || {},
      });
    }
  }, [config, form]);

  const handleSubmit = async (data) => {
    try {
      await updateConfig(data);
      setEditingDelivery(null);
      // Success toast is handled by the hook
    } catch (err) {
      // Error toast is handled by the hook
      console.error("Failed to update config:", err);
    }
  };

  const handleAddDelivery = () => {
    append({
      name: "",
      region: "",
      price: 0,
      estimatedDays: 0,
      isActive: true,
    });
    setEditingDelivery(deliveryFields.length);
  };

  const handleRemoveDelivery = (index) => {
    remove(index);
    if (editingDelivery === index) {
      setEditingDelivery(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon name="loader" className="h-5 w-5 animate-spin" />
          <span>Loading configuration...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <Icon name="alert-triangle" className="h-4 w-4" />
        <AlertDescription>
          Failed to load platform configuration: {error?.message || "Unknown error"}
        </AlertDescription>
      </Alert>
    );
  }

  // Payment methods schema
  const paymentMethodsSchema = {
    sections: [
      section(
        "payment-cash",
        "Cash on Delivery (COD)",
        [
          field.checkbox("payment.cash.enabled", "Enable Cash on Delivery", {
            description: "Allow customers to pay with cash when they receive their order",
          }),
        ],
        { cols: 1 }
      ),
      section(
        "payment-bkash",
        "bKash Wallet",
        [
          field.text("payment.bkash.walletNumber", "Wallet Number", {
            placeholder: "01XXXXXXXXX",
          }),
          field.text("payment.bkash.walletName", "Wallet Name", {
            placeholder: "Account holder name",
          }),
          field.textarea("payment.bkash.note", "Note", {
            placeholder: "Instructions for customers (e.g., 'Send Money', 'Personal Account')",
            rows: 2,
          }),
        ],
        { cols: 2 }
      ),
      section(
        "payment-nagad",
        "Nagad Wallet",
        [
          field.text("payment.nagad.walletNumber", "Wallet Number", {
            placeholder: "01XXXXXXXXX",
          }),
          field.text("payment.nagad.walletName", "Wallet Name", {
            placeholder: "Account holder name",
          }),
          field.textarea("payment.nagad.note", "Note", {
            placeholder: "Instructions for customers",
            rows: 2,
          }),
        ],
        { cols: 2 }
      ),
      section(
        "payment-rocket",
        "Rocket Wallet",
        [
          field.text("payment.rocket.walletNumber", "Wallet Number", {
            placeholder: "01XXXXXXXXX",
          }),
          field.text("payment.rocket.walletName", "Wallet Name", {
            placeholder: "Account holder name",
          }),
          field.textarea("payment.rocket.note", "Note", {
            placeholder: "Instructions for customers",
            rows: 2,
          }),
        ],
        { cols: 2 }
      ),
      section(
        "payment-bank",
        "Bank Transfer",
        [
          field.text("payment.bank.bankName", "Bank Name", {
            placeholder: "Dutch Bangla Bank",
          }),
          field.text("payment.bank.accountNumber", "Account Number", {
            placeholder: "1234567890",
          }),
          field.text("payment.bank.accountName", "Account Name", {
            placeholder: "Platform Name",
          }),
          field.text("payment.bank.branchName", "Branch Name", {
            placeholder: "Gulshan Branch",
          }),
          field.text("payment.bank.routingNumber", "Routing Number", {
            placeholder: "090260123",
          }),
          field.text("payment.bank.swiftCode", "SWIFT Code", {
            placeholder: "DBBLBDDH",
          }),
          field.textarea("payment.bank.note", "Note", {
            placeholder: "Instructions for customers",
            rows: 2,
          }),
        ],
        { cols: 2 }
      ),
    ],
  };

  // Policies schema
  const policiesSchema = {
    sections: [
      section(
        "policies",
        "Platform Policies",
        [
          field.textarea("policies.termsAndConditions", "Terms and Conditions", {
            placeholder: "Enter your terms and conditions or URL",
            rows: 3,
          }),
          field.textarea("policies.privacyPolicy", "Privacy Policy", {
            placeholder: "Enter your privacy policy or URL",
            rows: 3,
          }),
          field.textarea("policies.refundPolicy", "Refund Policy", {
            placeholder: "Enter your refund policy or URL",
            rows: 3,
          }),
          field.textarea("policies.shippingPolicy", "Shipping Policy", {
            placeholder: "Enter your shipping policy or URL",
            rows: 3,
          }),
        ],
        { cols: 1 }
      ),
    ],
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Icon name="info" className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform Name</label>
                <input
                  {...form.register("platformName")}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter platform name"
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>

          {/* Tabs for Payment, Delivery, Policies */}
          <Tabs defaultValue="payment" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <Icon name="wallet" className="h-4 w-4" />
                Payment Methods
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center gap-2">
                <Icon name="truck" className="h-4 w-4" />
                Delivery Options
              </TabsTrigger>
              <TabsTrigger value="policies" className="flex items-center gap-2">
                <Icon name="file-text" className="h-4 w-4" />
                Policies
              </TabsTrigger>
            </TabsList>

            {/* Payment Methods Tab */}
            <TabsContent value="payment" className="space-y-4 mt-6">
              <FormGenerator
                schema={paymentMethodsSchema}
                control={form.control}
                disabled={isUpdating}
              />
            </TabsContent>

            {/* Delivery Options Tab */}
            <TabsContent value="delivery" className="space-y-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold">Delivery Options</h3>
                  <p className="text-xs text-muted-foreground">
                    Manage delivery regions and pricing
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddDelivery}
                  disabled={isUpdating}
                >
                  <Icon name="plus" className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>

              {deliveryFields.length === 0 ? (
                <Alert>
                  <Icon name="info" className="h-4 w-4" />
                  <AlertDescription>
                    No delivery options configured. Click "Add Option" to create one.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Price (BDT)</TableHead>
                        <TableHead>Est. Days</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveryFields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            {editingDelivery === index ? (
                              <input
                                {...form.register(`deliveryOptions.${index}.name`)}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="Inside Dhaka"
                              />
                            ) : (
                              form.watch(`deliveryOptions.${index}.name`) || "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {editingDelivery === index ? (
                              <input
                                {...form.register(`deliveryOptions.${index}.region`)}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="dhaka"
                              />
                            ) : (
                              form.watch(`deliveryOptions.${index}.region`) || "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {editingDelivery === index ? (
                              <input
                                {...form.register(`deliveryOptions.${index}.price`, {
                                  valueAsNumber: true,
                                })}
                                type="number"
                                min="0"
                                step="1"
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="60"
                              />
                            ) : (
                              form.watch(`deliveryOptions.${index}.price`) || 0
                            )}
                          </TableCell>
                          <TableCell>
                            {editingDelivery === index ? (
                              <input
                                {...form.register(`deliveryOptions.${index}.estimatedDays`, {
                                  valueAsNumber: true,
                                })}
                                type="number"
                                min="0"
                                step="1"
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="2"
                              />
                            ) : (
                              form.watch(`deliveryOptions.${index}.estimatedDays`) || "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {editingDelivery === index ? (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  {...form.register(`deliveryOptions.${index}.isActive`)}
                                  className="rounded"
                                />
                                <span className="text-xs">Active</span>
                              </label>
                            ) : (
                              <Badge variant={form.watch(`deliveryOptions.${index}.isActive`) ? "default" : "secondary"}>
                                {form.watch(`deliveryOptions.${index}.isActive`) ? "Active" : "Inactive"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {editingDelivery === index ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingDelivery(null)}
                                  disabled={isUpdating}
                                >
                                  <Icon name="check" className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingDelivery(index)}
                                  disabled={isUpdating}
                                >
                                  <Icon name="pencil" className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveDelivery(index)}
                                disabled={isUpdating}
                              >
                                <Icon name="trash" className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="space-y-4 mt-6">
              <FormGenerator
                schema={policiesSchema}
                control={form.control}
                disabled={isUpdating}
              />
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setEditingDelivery(null);
              }}
              disabled={isUpdating}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Icon name="loader" className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon name="save" className="mr-2 h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
