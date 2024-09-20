"use client";

import { createClient } from "@/utils/auth/client";
import { useRouter } from "next/navigation";

interface Props {
	class?: string;
}

export default function Signout(props: Props) {
	const supabase = createClient();
	const router = useRouter();

	const signout = async () => {
		await supabase.auth.signOut();
		router.push("/login");
	};

	return (
		<span className={props.class} onClick={signout}>
			Logout
		</span>
	);
}
