import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import AuthProvider from "../../providers/auth-provider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GFood - Login",
  description: "Sistema de vendas para estabelecimentos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="br">
      <body className={inter.className + " text-black bg-gray-100"} >
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
