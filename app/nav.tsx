"use client";

import "./nav.scss";
import Signout from "@/components/auth/Logout";
import { Fragment, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/auth/client";
import Link from "next/link";

export default function Nav() {
	const supabase = createClient();

	const [user, setUser] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
			setUser(session);
			setIsLoading(false);
		});

		return () => {
			authListener?.subscription.unsubscribe();
		};
	}, []);

	if (isLoading) {
		return <nav style={{ display: "block", height: "50px" }}></nav>;
	}

	return (
		<nav>
			<div className="left">
				<Link href={"/"} className="nav-item back">
					<img src="/img/cooksy-logo-white.svg" width={100} />
				</Link>
			</div>
			<div className="right">
				{user ? (
					<Fragment>
						<span className="nav-item">Profile</span>
						<Signout class="nav-item" />
					</Fragment>
				) : (
					<span className="nav-item">Login</span>
				)}
			</div>
		</nav>
	);
}
