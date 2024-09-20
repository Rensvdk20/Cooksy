"use server";

import { createClient } from "@/utils/auth/server";
import RegisterResponse from "@/schemas/registerResponse";

export async function signup(formData: FormData): Promise<RegisterResponse> {
	const supabase = createClient();

	const data = {
		email: formData.get("email") as string,
		password: formData.get("password") as string,
		options: {
			data: {
				username: formData.get("username") as string
			}
		}
	};

	// User register validation
	try {
		if (data.email.length < 3) throw Error("Email must be at least 3 characters long");

		if (data.options.data.username.length < 3)
			throw Error("Username must be at least 3 characters long");

		if (data.password.length < 8) throw Error("Password must be at least 8 characters long");

		const passRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
		if (!passRegex.test(data.password))
			throw Error(
				"Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
			);
	} catch (err: any) {
		return {
			status: 400,
			message: err.message
		};
	}

	if (!(await supabase.auth.signUp(data)))
		return {
			status: 500,
			message: "There was a problem signing you up, please try again later"
		};

	return {
		status: 201,
		message: "Account created successfully"
	};
}
