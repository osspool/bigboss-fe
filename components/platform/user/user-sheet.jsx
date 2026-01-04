"use client";
import { FormSheet } from "@classytic/clarity";
import { UserForm } from "./form/user.form";
import { useFormSubmitState } from "@/hooks/use-form-submit-state";

/**
 * User Sheet Component
 *
 * Displays a side sheet for editing user profiles
 * - Allows updating user roles and status
 * - No create mode (users created through registration)
 */
export function UserSheet({
  token,
  open,
  onOpenChange,
  user = null,
}) {
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();
  const handleSuccess = () => {
    // Keep sheet open on success for continued editing
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit User"
      description="Update user details and permissions"
      size="lg"
      className="px-4"
      formId="user-sheet-form"
      submitLabel="Update User"
      cancelLabel="Close"
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={handleCancel}
    >
      <UserForm
        token={token}
        user={user}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        onSubmitStateChange={handleSubmitStateChange}
        formId="user-sheet-form"
      />
    </FormSheet>
  );
}
