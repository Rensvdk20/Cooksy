import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Nav from "./nav";

import "./global.scss";

const fredoka = Fredoka({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Cooksy",
	description: "Recipe sharing platform"
};

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={fredoka.className}>
				<Nav />
				<Toaster
					position="top-right"
					toastOptions={{
						className: "toaster"
					}}
				/>
				{children}
			</body>
		</html>
	);
}
