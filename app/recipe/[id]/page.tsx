"use client";

export default function Recipe({ params }: { params: { id: string } }) {
	return <div>My Post: {params.id}</div>;
}
