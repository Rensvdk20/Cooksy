import { uploadBase64Image } from "~/server/utils/imagekit";

export default defineEventHandler(async (event) => {
	await auth(event);

	const body = await readBody(event);
	const imageUrl = await uploadBase64Image(body.base64Img);

	return {
		imageUrl,
	};
});
