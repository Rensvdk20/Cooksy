"use client";

import { signup } from "@/utils/auth/actions";
import toast from "react-hot-toast";

import "./register.scss";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
	const router = useRouter();

	async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		const response = await signup(formData);
		if (response.status != 201)
			toast.error(response.message, {
				id: "signup-error"
			});
		else {
			router.push("/login?register=success");
		}
	}

	return (
		<div className="register">
			<form onSubmit={handleSignup}>
				<label htmlFor="username">Username:</label>
				<input id="username" name="username" type="text" required />
				<label htmlFor="email">Email:</label>
				<input id="email" name="email" type="email" required />
				<label htmlFor="password">Password:</label>
				<input id="password" name="password" type="password" required />
				<button className="btn">Sign up</button>
			</form>
		</div>
	);
}
