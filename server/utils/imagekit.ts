import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";

const imagekit = new ImageKit({
	publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
	privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
	urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

async function uploadImage(file: string | Buffer) {
	const uploadResult = await imagekit.upload({
		file,
		fileName: uuidv4(),
		folder: "recipe_images",
	});

	if (!uploadResult.url) {
		throw createError({
			statusCode: 500,
			statusMessage: "Image upload failed",
		});
	}

	return uploadResult.url;
}

export async function uploadBase64Image(base64Img: string) {
	return uploadImage(base64Img);
}

export async function uploadRemoteImage(imageUrl: string) {
	console.info("[imagekit] Downloading remote image", { imageUrl });

	const response = await fetch(imageUrl);

	if (!response.ok) {
		console.error("[imagekit] Remote image download failed", {
			imageUrl,
			status: response.status,
		});

		throw createError({
			statusCode: 400,
			statusMessage: "Imported image could not be downloaded",
		});
	}

	const contentType = response.headers.get("content-type") ?? "";
	console.info("[imagekit] Remote image content type", {
		imageUrl,
		contentType,
	});

	if (!contentType.startsWith("image/")) {
		console.error(
			"[imagekit] Remote image rejected due to invalid content type",
			{
				imageUrl,
				contentType,
			},
		);

		throw createError({
			statusCode: 400,
			statusMessage: "Imported image is not a valid image type",
		});
	}

	const imageBuffer = Buffer.from(await response.arrayBuffer());
	const imageBase64 = imageBuffer.toString("base64");
	const base64DataUrl = `data:${contentType};base64,${imageBase64}`;

	console.info("[imagekit] Uploading base64 image", {
		imageUrl,
		byteLength: imageBuffer.length,
	});

	const uploadedUrl = await uploadImage(base64DataUrl);

	console.info("[imagekit] Remote image uploaded", {
		imageUrl,
		uploadedUrl,
	});

	return uploadedUrl;
}
