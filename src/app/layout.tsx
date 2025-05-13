import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { Providers } from "./heroui-provider";
import SidebarNav from "../components/SidebarNav";
import { LoadingIndicator } from "@/components/LoadingIndicator";
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
	title: "RFP Compliance Matrix",
	description: "Generate and analyze compliance matrices for RFPs",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					<Suspense fallback={null}>
						<LoadingIndicator />
					</Suspense>
					<div className="min-h-screen bg-[#f7fafd] flex">
						<SidebarNav />
						<div className="flex-1">{children}</div>
					</div>
				</Providers>
			</body>
		</html>
	);
}
