import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
    roles?: string[];
    phone?: string;
  } | null;
  token?: string | null;
}

export function Layout({ children, user, token }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} token={token} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
