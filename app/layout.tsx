/** @jsxImportSource react */

import "../styles/fonts/monoid.css";
import "../styles/global.css";
import "../styles/reset.css";

import type { Metadata, Viewport } from "next";
import { Fragment, type ReactNode } from "react";

import { AnalyticsWrapper } from "@/components/analytics";

export const metadata: Metadata = {
	title: {
		default: "Unstable Rust Feature Explorer",
		template: "%s | Unstable Rust Feature Explorer",
	},
	alternates: {
		canonical: "https://unstablerust.dev/",
	},
	description:
		"Explore and compare the unstable features between versions of the Rust programming language.",
	keywords:
		"rust, programming, nightly rust, rust features, rust nightly, feature comparison, versions, unstable features",
	authors: [
		{
			name: "Systemcluster",
		},
	],
	icons: [
		{
			rel: "icon",
			url: "/favicon.svg",
			type: "image/svg+xml",
		},
		{
			rel: "apple-touch-icon",
			url: "/favicon.svg",
			type: "image/svg+xml",
			sizes: "any",
		},
		{
			rel: "mask-icon",
			url: "/favicon.svg",
			type: "image/svg+xml",
			color: "#030303",
			sizes: "any",
		},
	],
	robots: {
		index: true,
		follow: true,
		nocache: false,
		noarchive: true,
	},
	other: {
		darkreader: "disable",
		"X-UA-Compatible": "IE=edge",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover",
	themeColor: "#030303",
	colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<Fragment>
				{children}
				<AnalyticsWrapper />
			</Fragment>
		</html>
	);
}
