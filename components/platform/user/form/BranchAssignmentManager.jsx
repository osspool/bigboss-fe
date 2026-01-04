"use client";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, Building2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SelectInput } from "@classytic/clarity";
import { useBranches } from "@/hooks/query";
import { BRANCH_ROLE_OPTIONS } from "./user-form-schema";

/**
 * Branch Assignment Manager Component
 * Allows managing user's branch assignments with branch-specific roles
 */
export function BranchAssignmentManager({ token, disabled = false }) {
  const { control, watch, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "branches",
  });

  // Fetch available branches
  const { items: branches = [], isLoading: branchesLoading } = useBranches(
    token,
    { limit: 100, isActive: true },
    { public: false }
  );

  const watchedBranches = watch("branches") || [];

  // Get branch options excluding already assigned branches
  const assignedBranchIds = watchedBranches.map((b) => b.branchId).filter(Boolean);
  const availableBranches = branches.filter(
    (b) => !assignedBranchIds.includes(b._id)
  );

  const branchOptions = availableBranches.map((b) => ({
    value: b._id,
    label: `${b.name} (${b.code})`,
  }));

  const handleAddBranch = () => {
    append({
      branchId: "",
      roles: [],
      isPrimary: fields.length === 0, // First branch is primary by default
    });
  };

  const handleRemoveBranch = (index) => {
    const removedBranch = watchedBranches[index];
    remove(index);

    // If removed branch was primary, make first remaining branch primary
    if (removedBranch?.isPrimary && fields.length > 1) {
      setValue("branches.0.isPrimary", true);
    }
  };

  const handleSetPrimary = (index) => {
    // Unset all other primaries
    watchedBranches.forEach((_, i) => {
      setValue(`branches.${i}.isPrimary`, i === index);
    });
  };

  const handleBranchSelect = (index, branchId) => {
    const branch = branches.find((b) => b._id === branchId);
    if (branch) {
      setValue(`branches.${index}.branchId`, branchId);
      setValue(`branches.${index}.branchCode`, branch.code);
      setValue(`branches.${index}.branchName`, branch.name);
      setValue(`branches.${index}.branchRole`, branch.role);
    }
  };

  const handleRolesChange = (index, roles) => {
    setValue(`branches.${index}.roles`, roles || []);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Branch Assignments
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Assign user to branches with specific roles
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddBranch}
          disabled={disabled || availableBranches.length === 0}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Branch
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <Building2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No branch assignments</p>
          <p className="text-xs text-muted-foreground">
            Click "Add Branch" to assign user to a branch
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const branchData = watchedBranches[index] || {};
            const isPrimary = branchData.isPrimary;

            return (
              <Card key={field.id} className={isPrimary ? "border-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Branch Select */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <SelectInput
                          label="Branch"
                          items={[
                            // Include current selection even if assigned
                            ...(branchData.branchId ? [{
                              value: branchData.branchId,
                              label: `${branchData.branchName || 'Selected'} (${branchData.branchCode || ''})`,
                            }] : []),
                            ...branchOptions,
                          ]}
                          value={branchData.branchId || ""}
                          onValueChange={(val) => handleBranchSelect(index, val)}
                          placeholder="Select branch"
                          disabled={disabled || branchesLoading}
                        />

                        {/* Branch Role Display */}
                        {branchData.branchRole && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Branch Type</label>
                            <div className="h-10 flex items-center">
                              <Badge variant={branchData.branchRole === 'head_office' ? 'default' : 'secondary'}>
                                {branchData.branchRole === 'head_office' ? 'Head Office' : 'Sub Branch'}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Branch Roles Multi-select */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Branch Roles</label>
                        <div className="flex flex-wrap gap-2">
                          {BRANCH_ROLE_OPTIONS.map((role) => {
                            const isSelected = (branchData.roles || []).includes(role.value);
                            return (
                              <Badge
                                key={role.value}
                                variant={isSelected ? "default" : "outline"}
                                className={`cursor-pointer transition-colors ${
                                  disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/80"
                                }`}
                                onClick={() => {
                                  if (disabled) return;
                                  const currentRoles = branchData.roles || [];
                                  const newRoles = isSelected
                                    ? currentRoles.filter((r) => r !== role.value)
                                    : [...currentRoles, role.value];
                                  handleRolesChange(index, newRoles);
                                }}
                              >
                                {role.label}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant={isPrimary ? "default" : "ghost"}
                        size="icon"
                        onClick={() => handleSetPrimary(index)}
                        disabled={disabled || isPrimary}
                        title={isPrimary ? "Primary branch" : "Set as primary"}
                      >
                        <Star className={`h-4 w-4 ${isPrimary ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveBranch(index)}
                        disabled={disabled}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {isPrimary && (
                    <div className="mt-2 pt-2 border-t">
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Primary Branch
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
