import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
	title: "Pihordev — Agent Analytics",
	description: "Analytics dashboard for autonomous AI coding agents",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={`${GeistSans.variable} ${GeistMono.variable}`}
			suppressHydrationWarning
		>
			<body className="font-sans antialiased">
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
