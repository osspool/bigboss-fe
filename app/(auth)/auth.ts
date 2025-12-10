import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { handleApiRequest } from "@/api/api-handler";
import { authConfig } from "./auth.config";
import type { User, AuthResponse, UserRoleType } from "@/api/user-data";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      roles?: UserRoleType[];
      phone?: string;
      organizationId?: string;
    };
    accessToken?: string;
    refreshToken?: string;
    roles?: UserRoleType[];
    organizationId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    email?: string;
    name?: string;
    roles?: UserRoleType[];
    phone?: string;
    image?: string;
    accessToken?: string;
    refreshToken?: string;
    organizationId?: string;
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
      credentials: {},
      async authorize({ email, password }) {
        try {
          const data = await handleApiRequest("POST", "/api/v1/auth/login", {
            body: { email, password },
          }) as AuthResponse;

          const { user, token, refreshToken } = data;
          console.log("User new", user);

          if (!user) {
            throw new Error("User not found.");
          }

          return {
            user,
            token,
            refreshToken,
            access_token: token,
            refresh_token: refreshToken,
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
          const data = await handleApiRequest("POST", "/api/v1/auth/oauth-login", {
            body: {
              email: (user as any).email,
              name: (user as any).name,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              image: (user as any).image,
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
        } catch (error) {
          console.error("OAuth backend authentication error:", error);
          return token;
        }
      }
      // Initial sign in - Credentials provider
      else if (user) {
        const u = user as any;
        token.sub = u.user._id || u.user.id;
        token.email = u.user.email;
        token.name = u.user.name;
        token.roles = u.user.roles || ['user'];
        token.phone = u.user.phone;
        token.accessToken = u.access_token || u.token;
        token.refreshToken = u.refresh_token || u.refreshToken;
        if (u.user.image) token.image = u.user.image;
        token.organizationId = u?.user?.organization ?? undefined;
      }

      // Handle session updates (e.g., after creating organization)
      if (trigger === "update" && session) {
        if (session.shouldRefresh) {
          try {
            const refreshData = await handleApiRequest("POST", "/api/v1/auth/refresh", {
              body: { token: token.refreshToken },
            });

            const newAccessToken = refreshData.token;
            const newRefreshToken = refreshData.refreshToken;

            // Decode JWT to extract user data (server-side compatible)
            const base64Url = newAccessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
            const decodedUser = JSON.parse(jsonPayload);
            console.log("decodedUser", JSON.stringify(decodedUser, null, 2));

            token.sub = decodedUser.id;
            token.email = decodedUser.email;
            token.name = decodedUser.name;
            token.roles = decodedUser.roles;
            token.phone = decodedUser.phone;
            if (decodedUser.image) token.image = decodedUser.image;
            token.organizationId = decodedUser.organization;
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
      }

      return session;
    },
  },
});

