import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isAdminPage = nextUrl.pathname.startsWith("/super");
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isOnRegister = nextUrl.pathname.startsWith("/register");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }

      if (isAdminPage) {
        if (isLoggedIn) return true;
        return false;
      }

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 24 * 60 * 60, // 2 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
};

