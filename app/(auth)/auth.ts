import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { handleApiRequest } from "@/lib/sdk";
import { authConfig } from "./auth.config";
import type { AuthResponse, UserRoleType } from "@classytic/commerce-sdk/auth";

type JwtBranchClaim = {
  branchId: string;
  branchCode?: string;
  branchName?: string;
  branchRole?: "head_office" | "sub_branch";
  roles?: string[];
};

function decodeJwtPayload(accessToken?: string | null): Record<string, unknown> | null {
  if (!accessToken) return null;
  const parts = accessToken.split(".");
  if (parts.length < 2) return null;
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    const decoded = JSON.parse(jsonPayload);
    return decoded && typeof decoded === "object" ? decoded : null;
  } catch {
    return null;
  }
}

// Extend NextAuth types (Auth.js v5)
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      roles?: UserRoleType[];
      phone?: string;
      organizationId?: string;
    } & DefaultSession["user"];
    accessToken?: string;
    refreshToken?: string;
    roles?: UserRoleType[];
    organizationId?: string;
    organizations?: string[];
    branch?: JwtBranchClaim;
    branchIds?: string[];
    isAdmin?: boolean;
    isWarehouseStaff?: boolean;
    isActive?: boolean;
  }

  interface User {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    roles?: UserRoleType[];
    phone?: string;
    organizationId?: string;
    organizations?: string[];
    branch?: JwtBranchClaim;
    branchIds?: string[];
    isAdmin?: boolean;
    isWarehouseStaff?: boolean;
    isActive?: boolean;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    sub?: string;
    email?: string;
    name?: string;
    roles?: UserRoleType[];
    phone?: string;
    image?: string;
    accessToken?: string;
    refreshToken?: string;
    organizationId?: string;
    organizations?: string[];
    branch?: JwtBranchClaim;
    branchIds?: string[];
    isAdmin?: boolean;
    isWarehouseStaff?: boolean;
    isActive?: boolean;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        try {
          const data = await handleApiRequest<AuthResponse>("POST", "/api/v1/auth/login", {
            body: { email, password },
          });

          const { user, token, refreshToken } = data;
          console.log("User new", user);

          if (!user) {
            throw new Error("User not found.");
          }

          // Return User object with extra fields for jwt callback
          return {
            id: user._id || user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            roles: user.roles,
            phone: user.phone,
            organizationId: user.organization,
            accessToken: token,
            refreshToken: refreshToken,
          };
        } catch (error) {
          console.error("Error during user authorization:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in - OAuth providers (like Google)
      if (account?.provider === "google") {
        try {
          const data = await handleApiRequest<{
            user: { _id: string; email: string; name: string; roles?: UserRoleType[]; phone?: string; image?: string; organization?: string };
            access_token: string;
            refresh_token: string;
          }>("POST", "/api/v1/auth/oauth-login", {
            body: {
              email: user?.email,
              name: user?.name,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              image: user?.image,
            },
          });

          token.sub = data.user._id;
          token.email = data.user.email;
          token.name = data.user.name;
          token.roles = data.user.roles || ['user'];
          token.phone = data.user.phone;
          token.accessToken = data.access_token;
          token.refreshToken = data.refresh_token;
          if (data.user.image) token.image = data.user.image;
          token.organizationId = data?.user?.organization ?? undefined;

          const decoded = decodeJwtPayload(token.accessToken);
          if (decoded) {
            token.organizations = Array.isArray(decoded.organizations) ? decoded.organizations : undefined;
            token.branch = (decoded.branch as JwtBranchClaim) ?? undefined;
            token.branchIds = Array.isArray(decoded.branchIds) ? decoded.branchIds : undefined;
            token.isAdmin = typeof decoded.isAdmin === "boolean" ? decoded.isAdmin : undefined;
            token.isWarehouseStaff = typeof decoded.isWarehouseStaff === "boolean" ? decoded.isWarehouseStaff : undefined;
            token.isActive = typeof decoded.isActive === "boolean" ? decoded.isActive : undefined;
          }
        } catch (error) {
          console.error("OAuth backend authentication error:", error);
          return token;
        }
      }
      // Initial sign in - Credentials provider
      else if (user) {
        token.sub = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.roles = user.roles || ['user'];
        token.phone = user.phone;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        if (user.image) token.image = user.image;
        token.organizationId = user.organizationId;

        const decoded = decodeJwtPayload(token.accessToken);
        if (decoded) {
          token.organizations = Array.isArray(decoded.organizations) ? decoded.organizations : undefined;
          token.branch = (decoded.branch as JwtBranchClaim) ?? undefined;
          token.branchIds = Array.isArray(decoded.branchIds) ? decoded.branchIds : undefined;
          token.isAdmin = typeof decoded.isAdmin === "boolean" ? decoded.isAdmin : undefined;
          token.isWarehouseStaff = typeof decoded.isWarehouseStaff === "boolean" ? decoded.isWarehouseStaff : undefined;
          token.isActive = typeof decoded.isActive === "boolean" ? decoded.isActive : undefined;
        }
      }

      // Handle session updates (e.g., after creating organization)
      if (trigger === "update" && session) {
        if (session.shouldRefresh) {
          try {
            const refreshData = await handleApiRequest<{ token: string; refreshToken: string }>(
              "POST",
              "/api/v1/auth/refresh",
              { body: { token: token.refreshToken } }
            );

            const newAccessToken = refreshData.token;
            const newRefreshToken = refreshData.refreshToken;

            // Decode JWT to extract user data (server-side compatible)
            const decodedUser = decodeJwtPayload(newAccessToken) ?? {};
            console.log("decodedUser", JSON.stringify(decodedUser, null, 2));

            if (typeof decodedUser.id === "string") token.sub = decodedUser.id;
            if (typeof decodedUser.email === "string") token.email = decodedUser.email;
            if (typeof decodedUser.name === "string") token.name = decodedUser.name;
            if (Array.isArray(decodedUser.roles)) token.roles = decodedUser.roles as UserRoleType[];
            if (typeof decodedUser.phone === "string") token.phone = decodedUser.phone;
            if (typeof decodedUser.image === "string") token.image = decodedUser.image;
            if (typeof decodedUser.organization === "string") token.organizationId = decodedUser.organization;
            token.organizations = Array.isArray(decodedUser.organizations) ? decodedUser.organizations : token.organizations;
            token.branch = (decodedUser.branch as JwtBranchClaim) ?? token.branch;
            token.branchIds = Array.isArray(decodedUser.branchIds) ? decodedUser.branchIds : token.branchIds;
            token.isAdmin = typeof decodedUser.isAdmin === "boolean" ? decodedUser.isAdmin : token.isAdmin;
            token.isWarehouseStaff = typeof decodedUser.isWarehouseStaff === "boolean" ? decodedUser.isWarehouseStaff : token.isWarehouseStaff;
            token.isActive = typeof decodedUser.isActive === "boolean" ? decodedUser.isActive : token.isActive;
            token.accessToken = newAccessToken;
            token.refreshToken = newRefreshToken;

            return token;
          } catch (error) {
            console.error("Failed to refresh token in JWT callback:", error);
          }
        }

        // Manual session updates (fallback or for other use cases)
        const sUser = session.user || {};

        if (typeof sUser.name !== "undefined") token.name = sUser.name;
        if (typeof sUser.email !== "undefined") token.email = sUser.email;
        if (typeof sUser.id !== "undefined") token.sub = sUser.id;

        const nextPhone = typeof sUser.phone !== "undefined" ? sUser.phone : session.phone;
        if (typeof nextPhone !== "undefined") token.phone = nextPhone;

        const nextRoles = typeof sUser.roles !== "undefined" ? sUser.roles : session.roles;
        if (typeof nextRoles !== "undefined") token.roles = nextRoles;

        if (typeof sUser.image !== "undefined") token.image = sUser.image;

        if (typeof session.accessToken !== "undefined") {
          token.accessToken = session.accessToken;
        }
        if (typeof session.refreshToken !== "undefined") {
          token.refreshToken = session.refreshToken;
        }

        const nextOrgId = typeof session.organizationId !== "undefined"
          ? session.organizationId
          : sUser.organizationId;

        if (typeof nextOrgId !== "undefined" && nextOrgId !== null) {
          token.organizationId = nextOrgId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.email = token.email!;
        session.user.name = token.name!;
        session.user.roles = token.roles || ['user'];
        session.user.phone = token.phone;
        if (token.image) session.user.image = token.image;
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.roles = token.roles || ['user'];
        session.organizationId = token.organizationId;
        session.organizations = token.organizations;
        session.branch = token.branch;
        session.branchIds = token.branchIds;
        session.isAdmin = token.isAdmin;
        session.isWarehouseStaff = token.isWarehouseStaff;
        session.isActive = token.isActive;
      }

      return session;
    },
  },
});

