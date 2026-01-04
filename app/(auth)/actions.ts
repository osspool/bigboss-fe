"use server";

import { z } from "zod";
import { handleApiRequest, forgetPassApi, resetPassApi } from "@/lib/sdk";
import { signIn } from "./auth";

const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const authRegisterSchema = z
  .object({
    name: z.string().min(3),
    email: z.string().email(),
    phone: z.string(),
    password: z.string().min(6),
    password2: z.string().min(6),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });

const authForgetPassSchema = z.object({
  email: z.string().email(),
});

const authResetSchema = z.object({
  password: z.string().min(6),
  token: z.string(),
});

export type ActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data" | "user_exists";
  message?: string;
  error?: string;
  errors?: Record<string, string>;
};

export const login = async (_: ActionState | null, formData: FormData): Promise<ActionState> => {
  try {
    const validatedData = authLoginSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    console.log("Logged in");

    return { status: "success" };
  } catch (error) {
    console.log("server error", error);
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export const register = async (_: ActionState | null, formData: FormData): Promise<ActionState> => {
  try {
    const validatedData = authRegisterSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: String(formData.get("phone") || ""),
      password: formData.get("password"),
      password2: formData.get("password2"),
    });

    try {
      const data = await handleApiRequest<{ success: boolean; message?: string }>(
        "POST",
        "/api/v1/auth/register",
        {
          body: {
            email: validatedData.email,
            name: validatedData.name,
            phone: validatedData.phone,
            password: validatedData.password,
          },
        }
      );

      return {
        status: "success",
        message: data.message || "User registered successfully",
      };
    } catch (error: any) {
      console.log(error);
      return {
        status: "failed",
        error: error.message || "Registration failed",
      };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      }

      return {
        status: "invalid_data",
        errors: fieldErrors,
      };
    }
    console.error("Unexpected error during registration:", error);
    return { status: "failed" };
  }
};

export const forgetPass = async (_: ActionState | null, formData: FormData): Promise<ActionState> => {
  try {
    const validatedData = authForgetPassSchema.parse({
      email: formData.get("email"),
    });

    try {
      const data = await forgetPassApi(validatedData);
      console.log("Password reset email sent:", data);
      return { status: "success" };
    } catch (apiError: any) {
      console.log("API error:", apiError.message);
      return {
        status: "failed",
        error: apiError.message,
      };
    }
  } catch (error) {
    console.error("Validation error:", error);
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }
    return { status: "failed" };
  }
};

export const resetPass = async (_: ActionState | null, formData: FormData): Promise<ActionState> => {
  try {
    const validatedData = authResetSchema.parse({
      password: formData.get("password"),
      token: formData.get("token"),
    });

    try {
      const data = await resetPassApi({
        newPassword: validatedData.password,
        token: validatedData.token,
      });

      console.log("Password reset response:", data);

      if (data && data.message === "Password has been reset") {
        return { status: "success" };
      }

      return { status: "failed" };
    } catch (apiError: any) {
      console.log("API error:", apiError.message);
      return {
        status: "failed",
        error: apiError.message,
      };
    }
  } catch (error) {
    console.error("Validation error:", error);
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }
    return { status: "failed" };
  }
};

