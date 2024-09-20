"use client";

import "./nav.scss";
import Signout from "@/components/auth/Logout";
import { Fragment, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/auth/client";

const supabase = createClient();

export default function Nav() {
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
		return <nav style={{ display: "block", height: "19px" }}></nav>;
	}

	return (
		<nav>
			{user ? (
				<Fragment>
					<span className="nav-item">Profile</span>
					<Signout class="nav-item" />
				</Fragment>
			) : (
				<span className="nav-item">Login</span>
			)}
		</nav>
	);
}
