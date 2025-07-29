import ImageKit from "imagekit";
import { v4 as uuidv4 } from 'uuid';

const imagekit = new ImageKit({
	publicKey : process.env.IMAGEKIT_PUBLIC_KEY!,
	privateKey : process.env.IMAGEKIT_PRIVATE_KEY!,
	urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT!
});

export default defineEventHandler(async (event) => {
	await auth(event);

	const body = await readBody(event);

	const uploadResult = await imagekit.upload({
		file: body.base64Img,
		fileName: `${uuidv4()}`,
		folder: "recipe_images",
	});

	if (!uploadResult.url) {
		throw createError({
			statusCode: 500,
			statusMessage: "Image upload failed",
		});
	}

	return {
		imageUrl: uploadResult.url,
	};
});

