"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlatformConfig, useUpdatePlatformConfig } from "@/hooks/query";
import { platformConfigSchema } from "@/schemas/platform-config.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/custom/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

/**
 * Platform Config Form - Admin
 * Manages platform-wide configuration following API doc structure
 * @see docs/api/platform.md
 */
export function PlatformConfigForm({ token }) {
  const { config, isLoading, isError, error } = usePlatformConfig(token);
  const { updateConfig, isUpdating } = useUpdatePlatformConfig(token);

  const form = useForm({
    resolver: zodResolver(platformConfigSchema),
    defaultValues: {
      platformName: "",
      paymentMethods: [],
      checkout: {
        allowStorePickup: false,
        pickupBranches: [],
        deliveryFeeSource: "provider",
        freeDeliveryThreshold: 0,
      },
      logistics: {
        autoCreateShipment: false,
        autoCreateOnStatus: "confirmed",
      },
      vat: {
        isRegistered: false,
        defaultRate: 0,
        pricesIncludeVat: true,
        invoice: {
          prefix: "",
          showVatBreakdown: true,
        },
        supplementaryDuty: {
          enabled: false,
          defaultRate: 0,
        },
      },
      membership: {
        enabled: false,
        pointsPerAmount: 1,
        amountPerPoint: 100,
        roundingMode: "floor",
        tiers: [],
        cardPrefix: "MBR",
        cardDigits: 8,
        redemption: {
          enabled: false,
          minRedeemPoints: 100,
          minOrderAmount: 0,
          maxRedeemPercent: 50,
          pointsPerBdt: 10,
        },
      },
      policies: {},
    },
  });

  const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({
    control: form.control,
    name: "paymentMethods",
  });

  const { fields: pickupFields, append: appendPickup, remove: removePickup } = useFieldArray({
    control: form.control,
    name: "checkout.pickupBranches",
  });

  const { fields: tierFields, append: appendTier, remove: removeTier } = useFieldArray({
    control: form.control,
    name: "membership.tiers",
  });

  // Load config data into form
  useEffect(() => {
    if (config) {
      form.reset({
        platformName: config.platformName || "",
        paymentMethods: config.paymentMethods || [],
        checkout: {
          allowStorePickup: config.checkout?.allowStorePickup || false,
          pickupBranches: config.checkout?.pickupBranches || [],
          deliveryFeeSource: config.checkout?.deliveryFeeSource || "provider",
          freeDeliveryThreshold: config.checkout?.freeDeliveryThreshold || 0,
        },
        logistics: config.logistics || {
          autoCreateShipment: false,
          autoCreateOnStatus: "confirmed",
        },
        vat: config.vat || {
          isRegistered: false,
          defaultRate: 0,
          pricesIncludeVat: true,
          invoice: {
            prefix: "",
            showVatBreakdown: true,
          },
          supplementaryDuty: {
            enabled: false,
            defaultRate: 0,
          },
        },
        membership: config.membership || {
          enabled: false,
          pointsPerAmount: 1,
          amountPerPoint: 100,
          roundingMode: "floor",
          tiers: [],
          cardPrefix: "MBR",
          cardDigits: 8,
          redemption: {
            enabled: false,
            minRedeemPoints: 100,
            minOrderAmount: 0,
            maxRedeemPercent: 50,
            pointsPerBdt: 10,
          },
        },
        policies: config.policies || {},
      });
    }
  }, [config, form]);

  const handleSubmit = async (data) => {
    try {
      await updateConfig(data);
    } catch (err) {
      console.error("Failed to update config:", err);
    }
  };

  // Handle form validation errors
  const onInvalid = (errors) => {
    console.error("Form validation failed:", errors);
    toast.error("Please fix the validation errors before saving");
  };

  // Track validation errors
  const formErrors = form.formState.errors;
  const hasErrors = Object.keys(formErrors).length > 0;

  const handleAddPaymentMethod = (type) => {
    const templates = {
      cash: { type: "cash", name: "Cash on Delivery", isActive: true },
      bkash: {
        type: "mfs",
        provider: "bkash",
        name: "bKash",
        walletNumber: "",
        walletName: "",
        isActive: true,
      },
      nagad: {
        type: "mfs",
        provider: "nagad",
        name: "Nagad",
        walletNumber: "",
        walletName: "",
        isActive: true,
      },
      rocket: {
        type: "mfs",
        provider: "rocket",
        name: "Rocket",
        walletNumber: "",
        walletName: "",
        isActive: true,
      },
      bank: {
        type: "bank_transfer",
        name: "Bank Transfer",
        bankName: "",
        accountNumber: "",
        accountName: "",
        isActive: true,
      },
      card: {
        type: "card",
        name: "Card Payment",
        bankName: "",
        cardTypes: ["visa", "mastercard"],
        isActive: true,
      },
    };
    appendPayment(templates[type] || templates.cash);
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

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(handleSubmit, onInvalid)} className="space-y-6">
          {/* Form Validation Errors */}
          {hasErrors && (
            <Alert variant="destructive">
              <Icon name="alert-triangle" className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Please fix the following errors:</p>
                  <ul className="list-disc list-inside text-sm">
                    {Object.entries(formErrors).map(([key, error]) => (
                      <li key={key}>
                        {key}: {error?.message || error?.root?.message || "Invalid value"}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Icon name="info" className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input
                id="platformName"
                {...form.register("platformName")}
                placeholder="Enter platform name"
                disabled={isUpdating}
              />
              {form.formState.errors.platformName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.platformName.message}
                </p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="payment" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <Icon name="wallet" className="h-4 w-4" />
                Payment
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center gap-2">
                <Icon name="truck" className="h-4 w-4" />
                Delivery
              </TabsTrigger>
              <TabsTrigger value="vat" className="flex items-center gap-2">
                <Icon name="receipt" className="h-4 w-4" />
                VAT
              </TabsTrigger>
              <TabsTrigger value="logistics" className="flex items-center gap-2">
                <Icon name="package" className="h-4 w-4" />
                Logistics
              </TabsTrigger>
              <TabsTrigger value="policies" className="flex items-center gap-2">
                <Icon name="file-text" className="h-4 w-4" />
                Policies
              </TabsTrigger>
              <TabsTrigger value="membership" className="flex items-center gap-2">
                <Icon name="award" className="h-4 w-4" />
                Membership
              </TabsTrigger>
            </TabsList>

            {/* Payment Methods Tab */}
            <TabsContent value="payment" className="space-y-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold">Payment Methods</h3>
                  <p className="text-xs text-muted-foreground">
                    Configure available payment methods for checkout
                  </p>
                </div>
                <Select onValueChange={handleAddPaymentMethod}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Add method..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="rocket">Rocket</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentFields.length === 0 ? (
                <Alert>
                  <Icon name="info" className="h-4 w-4" />
                  <AlertDescription>
                    No payment methods configured. Add a method to get started.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {paymentFields.map((field, index) => (
                    <PaymentMethodForm
                      key={field.id}
                      index={index}
                      form={form}
                      onRemove={() => removePayment(index)}
                      disabled={isUpdating}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Delivery Tab */}
            <TabsContent value="delivery" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Checkout Settings</h3>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowStorePickup"
                      {...form.register("checkout.allowStorePickup")}
                      className="rounded"
                      disabled={isUpdating}
                    />
                    <Label htmlFor="allowStorePickup" className="cursor-pointer">
                      Allow store pickup
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="freeDeliveryThreshold">
                      Free Delivery Threshold (BDT)
                    </Label>
                    <Input
                      id="freeDeliveryThreshold"
                      type="number"
                      min="0"
                      {...form.register("checkout.freeDeliveryThreshold", {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
                      className="max-w-xs"
                      disabled={isUpdating}
                    />
                    <p className="text-xs text-muted-foreground">
                      Set to 0 to disable free delivery
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Pickup Branches</h4>
                        <p className="text-xs text-muted-foreground">
                          Optional branches for store pickup selection.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          appendPickup({ branchId: "", branchCode: "", branchName: "" })
                        }
                        disabled={isUpdating}
                      >
                        Add Branch
                      </Button>
                    </div>

                    {pickupFields.length === 0 ? (
                      <Alert>
                        <Icon name="info" className="h-4 w-4" />
                        <AlertDescription>
                          No pickup branches configured. Store pickup will use defaults.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        {pickupFields.map((field, index) => (
                          <Card key={field.id}>
                            <CardContent className="pt-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Branch {index + 1}</p>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removePickup(index)}
                                  disabled={isUpdating}
                                >
                                  <Icon name="trash" className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label>Branch ID</Label>
                                  <Input
                                    {...form.register(`checkout.pickupBranches.${index}.branchId`)}
                                    placeholder="12345"
                                    disabled={isUpdating}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Branch Code</Label>
                                  <Input
                                    {...form.register(`checkout.pickupBranches.${index}.branchCode`)}
                                    placeholder="DHK"
                                    disabled={isUpdating}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Branch Name</Label>
                                  <Input
                                    {...form.register(`checkout.pickupBranches.${index}.branchName`)}
                                    placeholder="Dhaka Main"
                                    disabled={isUpdating}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <Alert>
                    <Icon name="info" className="h-4 w-4" />
                    <AlertDescription>
                      Delivery pricing is provided by the courier provider API. Configure logistics settings in the Logistics tab.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </TabsContent>

            {/* VAT Tab */}
            <TabsContent value="vat" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vatRegistered"
                    {...form.register("vat.isRegistered")}
                    className="rounded"
                    disabled={isUpdating}
                  />
                  <Label htmlFor="vatRegistered" className="cursor-pointer">
                    VAT Registered Business
                  </Label>
                </div>

                {form.watch("vat.isRegistered") && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bin">BIN (13 digits)</Label>
                        <Input
                          id="bin"
                          {...form.register("vat.bin")}
                          placeholder="1234567890123"
                          maxLength={13}
                          disabled={isUpdating}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registeredName">Registered Name</Label>
                        <Input
                          id="registeredName"
                          {...form.register("vat.registeredName")}
                          placeholder="Business name"
                          disabled={isUpdating}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="defaultRate">Default VAT Rate (%)</Label>
                        <Input
                          id="defaultRate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          {...form.register("vat.defaultRate", {
                            valueAsNumber: true,
                          })}
                          placeholder="15"
                          disabled={isUpdating}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vatCircle">VAT Circle/Zone</Label>
                        <Input
                          id="vatCircle"
                          {...form.register("vat.vatCircle")}
                          placeholder="Dhaka Circle"
                          disabled={isUpdating}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="pricesIncludeVat"
                        {...form.register("vat.pricesIncludeVat")}
                        className="rounded"
                        disabled={isUpdating}
                      />
                      <Label htmlFor="pricesIncludeVat" className="cursor-pointer">
                        Catalog prices include VAT
                      </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                        <Input
                          id="invoicePrefix"
                          {...form.register("vat.invoice.prefix")}
                          placeholder="INV-"
                          disabled={isUpdating}
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id="showVatBreakdown"
                          {...form.register("vat.invoice.showVatBreakdown")}
                          className="rounded"
                          disabled={isUpdating}
                        />
                        <Label htmlFor="showVatBreakdown" className="cursor-pointer">
                          Show VAT breakdown on invoice
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="supplementaryDutyEnabled"
                          {...form.register("vat.supplementaryDuty.enabled")}
                          className="rounded"
                          disabled={isUpdating}
                        />
                        <Label htmlFor="supplementaryDutyEnabled" className="cursor-pointer">
                          Enable supplementary duty
                        </Label>
                      </div>

                      {form.watch("vat.supplementaryDuty.enabled") && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="supplementaryDutyRate">Supplementary Duty Rate (%)</Label>
                            <Input
                              id="supplementaryDutyRate"
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...form.register("vat.supplementaryDuty.defaultRate", {
                                valueAsNumber: true,
                              })}
                              placeholder="0"
                              disabled={isUpdating}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Logistics Tab */}
            <TabsContent value="logistics" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultPickupStoreId">Default Pickup Store ID</Label>
                    <Input
                      id="defaultPickupStoreId"
                      type="number"
                      {...form.register("logistics.defaultPickupStoreId", {
                        valueAsNumber: true,
                      })}
                      placeholder="12345"
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultPickupStoreName">Default Pickup Store Name</Label>
                    <Input
                      id="defaultPickupStoreName"
                      {...form.register("logistics.defaultPickupStoreName")}
                      placeholder="Main Warehouse"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultPickupAreaId">Default Pickup Area ID</Label>
                    <Input
                      id="defaultPickupAreaId"
                      type="number"
                      {...form.register("logistics.defaultPickupAreaId", {
                        valueAsNumber: true,
                      })}
                      placeholder="1"
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultPickupAreaName">Default Pickup Area Name</Label>
                    <Input
                      id="defaultPickupAreaName"
                      {...form.register("logistics.defaultPickupAreaName")}
                      placeholder="Dhaka"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoCreateShipment"
                    {...form.register("logistics.autoCreateShipment")}
                    className="rounded"
                    disabled={isUpdating}
                  />
                  <Label htmlFor="autoCreateShipment" className="cursor-pointer">
                    Auto-create shipment on order confirmation
                  </Label>
                </div>

                {form.watch("logistics.autoCreateShipment") && (
                  <div className="space-y-2">
                    <Label htmlFor="autoCreateOnStatus">Auto-create on Status</Label>
                    <Input
                      id="autoCreateOnStatus"
                      {...form.register("logistics.autoCreateOnStatus")}
                      placeholder="confirmed"
                      disabled={isUpdating}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
                  <Textarea
                    id="termsAndConditions"
                    {...form.register("policies.termsAndConditions")}
                    placeholder="Enter your terms and conditions or URL"
                    rows={3}
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacyPolicy">Privacy Policy</Label>
                  <Textarea
                    id="privacyPolicy"
                    {...form.register("policies.privacyPolicy")}
                    placeholder="Enter your privacy policy or URL"
                    rows={3}
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refundPolicy">Refund Policy</Label>
                  <Textarea
                    id="refundPolicy"
                    {...form.register("policies.refundPolicy")}
                    placeholder="Enter your refund policy or URL"
                    rows={3}
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingPolicy">Shipping Policy</Label>
                  <Textarea
                    id="shippingPolicy"
                    {...form.register("policies.shippingPolicy")}
                    placeholder="Enter your shipping policy or URL"
                    rows={3}
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Membership Tab */}
            <TabsContent value="membership" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="membershipEnabled"
                    {...form.register("membership.enabled")}
                    className="rounded"
                    disabled={isUpdating}
                  />
                  <Label htmlFor="membershipEnabled" className="cursor-pointer">
                    Enable membership program
                  </Label>
                </div>

                {form.watch("membership.enabled") && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pointsPerAmount">Points Per Amount</Label>
                        <Input
                          id="pointsPerAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          {...form.register("membership.pointsPerAmount", {
                            valueAsNumber: true,
                          })}
                          placeholder="1"
                          disabled={isUpdating}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amountPerPoint">Amount Per Point (BDT)</Label>
                        <Input
                          id="amountPerPoint"
                          type="number"
                          min="1"
                          step="1"
                          {...form.register("membership.amountPerPoint", {
                            valueAsNumber: true,
                          })}
                          placeholder="100"
                          disabled={isUpdating}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Rounding Mode</Label>
                        <Select
                          value={form.watch("membership.roundingMode") || "floor"}
                          onValueChange={(value) => form.setValue("membership.roundingMode", value)}
                        >
                          <SelectTrigger disabled={isUpdating}>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="floor">Floor</SelectItem>
                            <SelectItem value="round">Round</SelectItem>
                            <SelectItem value="ceil">Ceil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardPrefix">Card Prefix</Label>
                        <Input
                          id="cardPrefix"
                          {...form.register("membership.cardPrefix")}
                          placeholder="MBR"
                          disabled={isUpdating}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardDigits">Card Digits</Label>
                        <Input
                          id="cardDigits"
                          type="number"
                          min="4"
                          max="12"
                          {...form.register("membership.cardDigits", {
                            valueAsNumber: true,
                          })}
                          placeholder="8"
                          disabled={isUpdating}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold">Membership Tiers</h3>
                          <p className="text-xs text-muted-foreground">
                            Define tier thresholds, multipliers, and discounts.
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            appendTier({
                              name: "",
                              minPoints: 0,
                              pointsMultiplier: 1,
                              discountPercent: 0,
                              color: "",
                            })
                          }
                          disabled={isUpdating}
                        >
                          Add Tier
                        </Button>
                      </div>

                      {tierFields.length === 0 ? (
                        <Alert>
                          <Icon name="info" className="h-4 w-4" />
                          <AlertDescription>
                            No tiers configured. Add a tier to enable tier-based benefits.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-3">
                          {tierFields.map((field, index) => (
                            <Card key={field.id}>
                              <CardContent className="pt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">
                                    Tier {index + 1}
                                  </p>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeTier(index)}
                                    disabled={isUpdating}
                                  >
                                    <Icon name="trash" className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                      {...form.register(`membership.tiers.${index}.name`)}
                                      placeholder="Gold"
                                      disabled={isUpdating}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Min Points</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      {...form.register(`membership.tiers.${index}.minPoints`, {
                                        valueAsNumber: true,
                                      })}
                                      placeholder="0"
                                      disabled={isUpdating}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Points Multiplier</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      {...form.register(`membership.tiers.${index}.pointsMultiplier`, {
                                        valueAsNumber: true,
                                      })}
                                      placeholder="1"
                                      disabled={isUpdating}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Discount Percent</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.01"
                                      {...form.register(`membership.tiers.${index}.discountPercent`, {
                                        valueAsNumber: true,
                                      })}
                                      placeholder="5"
                                      disabled={isUpdating}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Tier Color (optional)</Label>
                                    <Input
                                      {...form.register(`membership.tiers.${index}.color`)}
                                      placeholder="#FFD700"
                                      disabled={isUpdating}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold">Redemption Rules</h3>
                          <p className="text-xs text-muted-foreground">
                            Configure how points can be redeemed at POS/checkout.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="redemptionEnabled"
                          {...form.register("membership.redemption.enabled")}
                          className="rounded"
                          disabled={isUpdating}
                        />
                        <Label htmlFor="redemptionEnabled" className="cursor-pointer">
                          Enable points redemption
                        </Label>
                      </div>

                      {form.watch("membership.redemption.enabled") && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Minimum Redeem Points</Label>
                            <Input
                              type="number"
                              min="0"
                              {...form.register("membership.redemption.minRedeemPoints", {
                                valueAsNumber: true,
                              })}
                              placeholder="100"
                              disabled={isUpdating}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Minimum Order Amount (BDT)</Label>
                            <Input
                              type="number"
                              min="0"
                              {...form.register("membership.redemption.minOrderAmount", {
                                valueAsNumber: true,
                              })}
                              placeholder="0"
                              disabled={isUpdating}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Redeem Percent</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              {...form.register("membership.redemption.maxRedeemPercent", {
                                valueAsNumber: true,
                              })}
                              placeholder="50"
                              disabled={isUpdating}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Points Per BDT</Label>
                            <Input
                              type="number"
                              min="1"
                              {...form.register("membership.redemption.pointsPerBdt", {
                                valueAsNumber: true,
                              })}
                              placeholder="10"
                              disabled={isUpdating}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
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

/**
 * Individual Payment Method Form Component
 */
function PaymentMethodForm({ index, form, onRemove, disabled }) {
  const type = form.watch(`paymentMethods.${index}.type`);
  const provider = form.watch(`paymentMethods.${index}.provider`);
  const isActive = form.watch(`paymentMethods.${index}.isActive`);
  const cardTypes = form.watch(`paymentMethods.${index}.cardTypes`) || [];

  const getMethodLabel = () => {
    if (type === "cash") return "Cash on Delivery";
    if (type === "mfs") {
      const providerLabels = {
        bkash: "bKash",
        nagad: "Nagad",
        rocket: "Rocket",
        upay: "Upay",
      };
      return providerLabels[provider] || "MFS";
    }
    if (type === "bank_transfer") return "Bank Transfer";
    if (type === "card") return "Card Payment";
    return "Payment Method";
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold">{getMethodLabel()}</h4>
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...form.register(`paymentMethods.${index}.isActive`)}
                  className="rounded"
                  disabled={disabled}
                />
                <span className="text-sm">Active</span>
              </label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onRemove}
                disabled={disabled}
              >
                <Icon name="trash" className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                {...form.register(`paymentMethods.${index}.name`)}
                placeholder={getMethodLabel()}
                disabled={disabled}
              />
            </div>

            {type === "mfs" && (
              <div className="space-y-2">
                <Label>Provider</Label>
                <Input
                  value={provider || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}
          </div>

          {/* Type-specific Fields */}
          {type === "mfs" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Wallet Number</Label>
                <Input
                  {...form.register(`paymentMethods.${index}.walletNumber`)}
                  placeholder="01XXXXXXXXX"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label>Wallet Name</Label>
                <Input
                  {...form.register(`paymentMethods.${index}.walletName`)}
                  placeholder="Account holder name"
                  disabled={disabled}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Note (optional)</Label>
                <Textarea
                  {...form.register(`paymentMethods.${index}.note`)}
                  placeholder="Instructions for customers"
                  rows={2}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {type === "bank_transfer" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input
                  {...form.register(`paymentMethods.${index}.bankName`)}
                  placeholder="Dutch Bangla Bank"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  {...form.register(`paymentMethods.${index}.accountNumber`)}
                  placeholder="1234567890"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input
                  {...form.register(`paymentMethods.${index}.accountName`)}
                  placeholder="Platform Name"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input
                  {...form.register(`paymentMethods.${index}.branchName`)}
                  placeholder="Gulshan Branch"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label>Routing Number</Label>
                <Input
                  {...form.register(`paymentMethods.${index}.routingNumber`)}
                  placeholder="090260123"
                  disabled={disabled}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Note (optional)</Label>
                <Textarea
                  {...form.register(`paymentMethods.${index}.note`)}
                  placeholder="Instructions for customers"
                  rows={2}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {type === "card" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank/Provider Name</Label>
                <Input
                  {...form.register(`paymentMethods.${index}.bankName`)}
                  placeholder="City Bank"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Card Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["visa", "mastercard", "amex", "unionpay", "other"].map((cardType) => (
                    <label key={cardType} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={cardTypes.includes(cardType)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...cardTypes, cardType]
                            : cardTypes.filter((value) => value !== cardType);
                          form.setValue(`paymentMethods.${index}.cardTypes`, next);
                        }}
                        disabled={disabled}
                      />
                      <span className="capitalize">{cardType.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Note (optional)</Label>
                <Textarea
                  {...form.register(`paymentMethods.${index}.note`)}
                  placeholder="e.g., 2% surcharge applies"
                  rows={2}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {type === "cash" && (
            <Alert>
              <Icon name="info" className="h-4 w-4" />
              <AlertDescription>
                Cash on Delivery - customers pay when they receive their order
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
