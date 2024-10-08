"use client";

import { createClient } from "@/utils/auth/client";
import { useEffect, useState } from "react";

import "./login.scss";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

async function login(formData: FormData) {
	const supabase = createClient();

	const data = {
		email: formData.get("email") as string,
		password: formData.get("password") as string
	};

	const { error } = await supabase.auth.signInWithPassword(data);

	if (error) {
		throw new Error("Login failed");
	}
}

export default function LoginPage() {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const searchParams = useSearchParams();
		if (searchParams.get("register") === "success") {
			toast.success("Account created successfully", {
				id: "signup-success"
			});
		}
	}, []);

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const formData = new FormData(e.currentTarget);

		try {
			await login(formData);
		} catch (err: any) {
			setLoading(false);
			setError(err.message);
		} finally {
			router.push("/");
		}
	};

	return (
		<div className="login">
			<form onSubmit={handleLogin}>
				<label htmlFor="email">Email:</label>
				<input id="email" name="email" type="email" required />

				<label htmlFor="password">Password:</label>
				<input id="password" name="password" type="password" autoComplete="on" required />

				<button className="btn" type="submit" disabled={loading}>
					{loading ? "Logging in..." : "Log in"}
				</button>

				{error && <p>{error}</p>}
			</form>
		</div>
	);
}
