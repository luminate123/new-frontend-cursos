import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthHydrator } from "@/components/auth/AuthHydrator";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "EduTech Pro",
	description: "Plataforma educativa",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<Providers>
					<AuthHydrator />
					{children}
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}