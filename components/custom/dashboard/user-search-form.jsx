// app/admin/caterers/components/user-search-form.jsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUserSearch } from "@/hooks/query/use-user";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import FormInput from "@/components/form-utils/form-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, UserCheck, AlertCircle, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function UserSearchForm({ token, onUserSelected, onCancel, requiredRole = "employee" }) {
  const [searchedEmail, setSearchedEmail] = useState("");
  const { searchUser, user, notFound, isSearching, error, reset } = useUserSearch({ token });
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values) => {
    setSearchedEmail(values.email);
    searchUser(values.email);
  };

  const handleSelectUser = () => {
    if (user) {
      onUserSelected(user);
    }
  };

  const handleClearSearch = () => {
    form.reset({ email: "" });
    setSearchedEmail("");
    reset();
  };

  // Role restriction with admin/superadmin bypass. Defaults to 'employee' if not provided.
  const isPrivileged = user?.roles?.includes("admin") || user?.roles?.includes("superadmin");
  const hasRequiredRole = isPrivileged || (requiredRole ? user?.roles?.includes(requiredRole) : true);

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <FormInput
                control={form.control}
                name="email"
                label="User Email"
                placeholder="Enter user email"
                type="email"
                required
              />
            </div>
            <Button type="submit" disabled={isSearching} size="icon" className="flex-shrink-0">
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </FieldGroup>
      </form>

      {(notFound || error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {notFound ? "No user found with this email" : error?.message}
          </AlertDescription>
        </Alert>
      )}

      {user && (
        <div className="border rounded-md p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {user.roles.map((role) => (
                  <Badge key={role} variant={role === "seller" ? "default" : "secondary"}>
                    {role}
                  </Badge>
                ))}
              </div>
              
              {user.phone && (
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {user.phone}
                </p>
              )}
              
              {user.address && (
                <p className="text-sm">
                  <span className="font-medium">Address:</span> {user.address}
                </p>
              )}
            </div>
            
            <Button 
              onClick={handleSelectUser}
              disabled={!hasRequiredRole}
              className="flex-shrink-0"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Select User
            </Button>
          </div>
          
          {user && requiredRole && !hasRequiredRole && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Missing Required Role</AlertTitle>
              <AlertDescription>
                This user doesn't have the required role "{requiredRole}".
                Please add this role to the user first.
              </AlertDescription>
            </Alert>
          )}
          
          {user && hasRequiredRole && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                This user meets the role requirement and can be selected.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleClearSearch}>
              Clear Search
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}