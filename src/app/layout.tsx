import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import ReduxProvider from "@/components/ReduxProvider";

export const metadata: Metadata = {
  title: {
    default: "Best Shopping — electronics for developers",
    template: "%s · Best Shopping",
  },
  description: "Keyboards, mice, monitors and desk gear for developers. Secure checkout and order tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <ToastContainer theme="colored" position="top-center" autoClose={2500} />
        <ReduxProvider>
          <main className="flex-1">{children}</main>
        </ReduxProvider>
        <Footer />
      </body>
    </html>
  );
}
