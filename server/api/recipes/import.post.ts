import { z } from "zod";
import {
	editRecipeSchema,
	type EditRecipe,
} from "~/schemas/recipe/editRecipeSchema";
import { uploadRemoteImage } from "~/server/utils/imagekit";

const importRecipeSchema = z.object({
	url: z.string().url("A valid recipe URL is required").max(2000),
});

type ImportRecipeResponse = {
	recipe: Partial<EditRecipe>;
	warnings: string[];
};

const NO_RECIPE_FOUND = "NO_RECIPE_FOUND";

function extractFirstJsonObject(value: string) {
	const fencedMatch = value.match(/```json\s*([\s\S]*?)```/i);
	if (fencedMatch?.[1]) {
		return fencedMatch[1].trim();
	}

	const firstCurly = value.indexOf("{");
	const lastCurly = value.lastIndexOf("}");

	if (firstCurly === -1 || lastCurly === -1 || lastCurly <= firstCurly) {
		throw new Error("No JSON object found in Gemini output");
	}

	return value.slice(firstCurly, lastCurly + 1);
}

function toPositiveInt(value: unknown, fallback = 1) {
	if (typeof value === "number" && Number.isFinite(value)) {
		return Math.max(1, Math.min(1000, Math.floor(value)));
	}

	if (typeof value === "string") {
		const match = value.match(/\d+/);
		if (match?.[0]) {
			return Math.max(1, Math.min(1000, Number.parseInt(match[0], 10)));
		}
	}

	return fallback;
}

function toStringValue(value: unknown) {
	return typeof value === "string" ? value.trim() : "";
}

function resolveUrl(candidate: string, baseUrl: string) {
	try {
		return new URL(candidate, baseUrl).toString();
	} catch {
		return "";
	}
}

function extractMetaTagContent(
	html: string,
	attribute: "property" | "name",
	attributeValue: string,
) {
	const escaped = attributeValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const firstPattern = new RegExp(
		`<meta[^>]+${attribute}=["']${escaped}["'][^>]+content=["']([^"']+)["']`,
		"i",
	);
	const secondPattern = new RegExp(
		`<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${escaped}["']`,
		"i",
	);

	return (
		html.match(firstPattern)?.[1] ?? html.match(secondPattern)?.[1] ?? ""
	);
}

async function extractFallbackImageUrl(recipeUrl: string) {
	const response = await fetch(recipeUrl, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
		},
	});

	if (!response.ok) {
		throw new Error(
			`Fallback image page request failed with status ${response.status}`,
		);
	}

	const html = await response.text();
	const candidates = [
		extractMetaTagContent(html, "property", "og:image"),
		extractMetaTagContent(html, "property", "og:image:url"),
		extractMetaTagContent(html, "name", "twitter:image"),
		extractMetaTagContent(html, "name", "twitter:image:src"),
		extractMetaTagContent(html, "name", "image"),
	];

	for (const candidate of candidates) {
		const trimmed = candidate.trim();
		if (!trimmed) continue;

		const resolved = resolveUrl(trimmed, recipeUrl);
		if (!resolved) continue;

		if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
			return resolved;
		}
	}

	return "";
}

function isYouTubeUrl(url: string) {
	try {
		const parsed = new URL(url);
		const hostname = parsed.hostname.toLowerCase();

		return (
			hostname === "youtube.com" ||
			hostname === "www.youtube.com" ||
			hostname === "m.youtube.com" ||
			hostname === "youtu.be"
		);
	} catch {
		return false;
	}
}

function decodeJsonEscapedString(value: string) {
	try {
		return JSON.parse(`"${value}"`);
	} catch {
		return value
			.replace(/\\n/g, "\n")
			.replace(/\\r/g, "\r")
			.replace(/\\t/g, "\t")
			.replace(/\\\//g, "/")
			.replace(/\\"/g, '"')
			.replace(/\\u0026/g, "&");
	}
}

async function extractYouTubeDescription(url: string) {
	const response = await fetch(url, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
		},
	});

	if (!response.ok) {
		throw new Error(
			`YouTube page request failed with status ${response.status}`,
		);
	}

	const html = await response.text();
	const shortDescriptionMatch = html.match(
		/"shortDescription":"((?:\\.|[^"\\])*)"/,
	);

	if (!shortDescriptionMatch?.[1]) {
		return "";
	}

	return decodeJsonEscapedString(shortDescriptionMatch[1]).trim();
}

async function getSourceContext(recipeUrl: string) {
	if (!isYouTubeUrl(recipeUrl)) {
		return "";
	}

	const description = await extractYouTubeDescription(recipeUrl);
	if (!description) {
		return "";
	}

	const cappedDescription = description.slice(0, 12000);

	return [
		"SOURCE_CONTEXT_TYPE: youtube_description",
		"SOURCE_CONTEXT_START",
		cappedDescription,
		"SOURCE_CONTEXT_END",
	].join("\n");
}

function normalizeRecipe(raw: any) {
	const normalizedBlocks = Array.isArray(raw?.ingredientBlocks)
		? raw.ingredientBlocks
		: Array.isArray(raw?.ingredients)
			? [{ name: "Ingredients", ingredients: raw.ingredients }]
			: [];

	const ingredientBlocks = normalizedBlocks
		.map((block: any, blockIndex: number) => {
			const ingredients = Array.isArray(block?.ingredients)
				? block.ingredients
				: [];

			return {
				name:
					toStringValue(block?.name) ||
					`Ingredients ${blockIndex + 1}`,
				order: blockIndex,
				ingredients: ingredients
					.map((ingredient: any) => ({
						name: toStringValue(ingredient?.name ?? ingredient),
					}))
					.filter(
						(ingredient: { name: string }) =>
							ingredient.name.length > 0,
					),
			};
		})
		.filter(
			(block: { ingredients: Array<{ name: string }> }) =>
				block.ingredients.length > 0,
		);

	const normalizedSteps = Array.isArray(raw?.steps)
		? raw.steps
		: Array.isArray(raw?.instructions)
			? raw.instructions.map((instruction: any) => ({
					instructions: instruction,
				}))
			: [];

	const steps = normalizedSteps
		.map((step: any, stepIndex: number) => {
			const instructions = toStringValue(step?.instructions ?? step);
			const stepName =
				toStringValue(step?.name) || `Step ${stepIndex + 1}`;

			return {
				name: stepName,
				order: stepIndex,
				instructions,
			};
		})
		.filter(
			(step: { instructions: string }) => step.instructions.length > 0,
		);

	return {
		name: toStringValue(raw?.name),
		servings: toPositiveInt(raw?.servings, 1),
		main_img: toStringValue(raw?.main_img),
		ingredientBlocks,
		steps,
	};
}

function buildPrompt(url: string, sourceContext: string) {
	return [
		"You extract recipe data from public webpages.",
		`Read this recipe page URL: ${url}`,
		`If you cannot confidently find a real recipe with ingredients and steps, respond with exactly ${NO_RECIPE_FOUND}.`,
		"Otherwise respond with a single JSON object and no markdown.",
		"You are formatting for an existing recipe app and must follow these strict rules.",
		"Evidence and hallucination rules:",
		"- Use only information explicitly present in the source URL content or provided SOURCE_CONTEXT.",
		"- Do not invent ingredients, quantities, temperatures, times, or cooking steps.",
		"- If details are missing, leave them out instead of guessing.",
		`- If core recipe evidence is missing, return exactly ${NO_RECIPE_FOUND}.`,
		"- For YouTube recipe imports, prioritize SOURCE_CONTEXT text over assumptions from the video title.",
		"Language rules:",
		"- Everything must be in Dutch, some words can stay in English if needed.",
		"Step formatting rules:",
		"- Steps must be clean and easy to read.",
		"- Keep step names short and phase-like when possible, such as Before, Preparing the rice, Preparing the chicken, Cutting the fruits, Optional, Sauce, Assembly.",
		"- Preserve chronology from the source exactly. Do not move actions earlier or later unless the source explicitly says to do so.",
		"- Never rewrite the sequence to a 'best practice' order.",
		"- Example: if source says to season while in the pan, keep seasoning in that cooking step and do not move it to a prep step.",
		"- Exception: you may move clearly independent wait/prep tasks to an early prep step when they are explicitly safe to do beforehand (for example: take meat out of the fridge 30 minutes before cooking, long marination, resting, soaking).",
		"- This exception only applies to standalone timing/prep tasks and must not change core cooking actions or temperatures.",
		"- Preparation steps are optional. Include them only when they add real value (for example resting, marinating, preheating, chilling, soaking, bringing ingredients to room temperature).",
		"- If prep/wait actions are included, only place them early when the source clearly states they happen before cooking.",
		'- Step instructions must be numbered inside the string using this format: "1. ...\\n2. ...\\n3. ...".',
		"- Use line breaks between numbered lines and avoid large text blocks.",
		"- Keep instruction lines concise and action-focused.",
		"Ingredient block rules:",
		"- Avoid putting all ingredients under one generic block when the recipe clearly has parts.",
		"- Infer and split into multiple ingredient blocks for composite recipes (for example burgers, sandwiches, bowls, layered dishes, sauces, marinades, toppings, coatings, dough/filling).",
		"- Good block names: Main ingredients, Patty, Bun, Sauce, Toppings, Marinade, Coating, Filling, Dough, Optional ingredients, Oil. Don't use names like: For Serving",
		"- If there are many ingredients (about 8 or more) and multiple components, prefer 2 or more meaningful blocks instead of one generic block.",
		"- Try to avoid multiple blocks with 1 or 2 steps each. Instead, combine those into fewer blocks with more ingredients each when it makes sense.",
		'- Only use a single block named "Ingredients" when the recipe is truly simple and does not have logical sub-components.',
		"General style rules:",
		'- Keep ingredient lines compact and practical, e.g. "2 tbsp soy sauce", "150 g sushi rice".',
		"- Whenever there are american and metric units, prefer metric but include both when possible, e.g. '1 cup (240 ml) milk' or '4oz (120 g) chocolate'.",
		"- Preserve all important quantities, temperatures, and times.",
		"- Keep source step order faithful; do not reorder for style.",
		"Don't add unnecessary steps like 'Serve' or 'Serve immediately'",
		"Use this schema exactly:",
		"{",
		'  "name": string,',
		'  "servings": number,',
		'  "main_img": string,',
		'  "ingredientBlocks": [',
		'    { "name": string, "ingredients": [ { "name": string } ] }',
		"  ],",
		'  "steps": [',
		'    { "name": string, "instructions": string }',
		"  ]",
		"}",
		"If section names are missing, infer useful block names from context instead of defaulting to one block.",
		'Only if the recipe is truly simple, use one block named "Ingredients".',
		'If a step title is missing, create titles like "Step 1".',
		"Do not include extra keys.",
		sourceContext || "",
	].join("\n");
}

function parseGeminiJson(geminiText: string) {
	const jsonText = extractFirstJsonObject(geminiText);
	return JSON.parse(jsonText);
}

function isNoRecipeFoundResponse(value: string) {
	return value.trim().toUpperCase() === NO_RECIPE_FOUND;
}

export default defineEventHandler(
	async (event): Promise<ImportRecipeResponse> => {
		await auth(event);

		const body = await readBody(event);
		const parsedRequest = importRecipeSchema.safeParse(body);

		if (!parsedRequest.success) {
			throw createError({
				statusCode: 400,
				statusMessage:
					parsedRequest.error.issues[0]?.message ??
					"Invalid import request",
			});
		}

		const recipeUrl = parsedRequest.data.url;
		console.info("[recipes/import] Incoming import request", {
			url: recipeUrl,
		});

		if (
			!recipeUrl.startsWith("http://") &&
			!recipeUrl.startsWith("https://")
		) {
			throw createError({
				statusCode: 400,
				statusMessage: "Only http and https URLs are supported",
			});
		}

		const config = useRuntimeConfig(event);
		const geminiApiKey = config.geminiApiKey as string | undefined;
		const geminiModel = config.geminiModel as string | undefined;

		if (!geminiApiKey || !geminiModel) {
			console.error("[recipes/import] Gemini configuration missing", {
				hasApiKey: Boolean(geminiApiKey),
				hasModel: Boolean(geminiModel),
			});

			throw createError({
				statusCode: 500,
				statusMessage:
					"Gemini is not configured, set GEMINI_API_KEY and GEMINI_MODEL",
			});
		}

		console.info("[recipes/import] Calling Gemini model", {
			model: geminiModel,
		});

		let sourceContext = "";
		let fallbackImageUrl = "";
		try {
			sourceContext = await getSourceContext(recipeUrl);
			console.info("[recipes/import] Source context collected", {
				isYouTube: isYouTubeUrl(recipeUrl),
				sourceContextLength: sourceContext.length,
			});
		} catch (error) {
			console.error("[recipes/import] Failed to collect source context", {
				error,
			});
		}

		try {
			fallbackImageUrl = await extractFallbackImageUrl(recipeUrl);
			console.info("[recipes/import] Fallback image extraction result", {
				hasFallbackImage: Boolean(fallbackImageUrl),
				fallbackImageUrl,
			});
		} catch (error) {
			console.error("[recipes/import] Failed to extract fallback image", {
				error,
			});
		}

		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contents: [
						{
							parts: [
								{ text: buildPrompt(recipeUrl, sourceContext) },
							],
						},
					],
					generationConfig: {
						temperature: 0.1,
						responseMimeType: "text/plain",
					},
				}),
			},
		);

		console.info("[recipes/import] Gemini response received", {
			ok: response.ok,
			status: response.status,
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("[recipes/import] Gemini request failed", {
				status: response.status,
				errorText,
			});

			const loweredError = errorText.toLowerCase();
			const isRateLimit =
				response.status === 429 ||
				loweredError.includes("resource_exhausted") ||
				loweredError.includes("rate") ||
				loweredError.includes("quota");

			if (isRateLimit) {
				throw createError({
					statusCode: 429,
					statusMessage:
						"Gemini rate limit reached, please try again later",
				});
			}

			throw createError({
				statusCode: 502,
				statusMessage: "Gemini request failed, please try again later",
			});
		}

		const data = await response.json();
		const modelText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!modelText || typeof modelText !== "string") {
			console.error(
				"[recipes/import] Gemini did not return usable text payload",
				{
					hasCandidates: Array.isArray(data?.candidates),
				},
			);

			throw createError({
				statusCode: 502,
				statusMessage: "Gemini did not return recipe content",
			});
		}

		console.info("[recipes/import] Gemini text payload parsed", {
			textLength: modelText.length,
			preview: modelText.slice(0, 300),
		});

		if (isNoRecipeFoundResponse(modelText)) {
			console.warn(
				"[recipes/import] Gemini reported no recipe found for URL",
				{
					url: recipeUrl,
				},
			);

			throw createError({
				statusCode: 422,
				statusMessage: "No recipe was found on this URL",
			});
		}

		let normalized: ReturnType<typeof normalizeRecipe>;

		try {
			normalized = normalizeRecipe(parseGeminiJson(modelText));
			console.info("[recipes/import] Gemini payload normalized", {
				recipeName: normalized.name,
				ingredientBlockCount: normalized.ingredientBlocks.length,
				stepCount: normalized.steps.length,
				hasImage: Boolean(normalized.main_img),
			});
		} catch (error) {
			console.error(
				"[recipes/import] Failed to parse/normalize Gemini payload",
				{
					error,
				},
			);

			throw createError({
				statusCode: 502,
				statusMessage: "Gemini returned invalid recipe data",
			});
		}

		const warnings: string[] = [];

		if (
			normalized.ingredientBlocks.length === 0 ||
			normalized.steps.length === 0
		) {
			console.warn(
				"[recipes/import] Rejecting import due to missing core recipe data",
				{
					hasIngredients: normalized.ingredientBlocks.length > 0,
					hasSteps: normalized.steps.length > 0,
				},
			);

			throw createError({
				statusCode: 422,
				statusMessage: "Could not find a complete recipe on this page",
			});
		}

		if (!normalized.name) warnings.push("Recipe name was missing");
		if (normalized.ingredientBlocks.length === 0)
			warnings.push("No ingredients were found");
		if (normalized.steps.length === 0) warnings.push("No steps were found");

		if (isYouTubeUrl(recipeUrl) && !sourceContext) {
			warnings.push(
				"Could not read recipe description from YouTube page. Steps may be incomplete.",
			);
		}

		const hadGeminiImage = Boolean(toStringValue(normalized.main_img));
		const primaryImageUrl = normalized.main_img || fallbackImageUrl;

		if (primaryImageUrl) {
			try {
				console.info(
					"[recipes/import] Attempting imported image upload",
					{
						imageUrl: primaryImageUrl,
					},
				);

				normalized.main_img = await uploadRemoteImage(primaryImageUrl);

				console.info(
					"[recipes/import] Imported image upload succeeded",
					{
						hostedImageUrl: normalized.main_img,
					},
				);

				if (
					!hadGeminiImage &&
					fallbackImageUrl &&
					primaryImageUrl === fallbackImageUrl
				) {
					warnings.push("Used fallback page metadata image");
				}
			} catch (error) {
				console.error("[recipes/import] Imported image upload failed", {
					error,
				});

				if (fallbackImageUrl && fallbackImageUrl !== primaryImageUrl) {
					try {
						console.info(
							"[recipes/import] Retrying image upload with fallback URL",
							{
								fallbackImageUrl,
							},
						);

						normalized.main_img =
							await uploadRemoteImage(fallbackImageUrl);
						warnings.push("Used fallback page metadata image");

						console.info(
							"[recipes/import] Fallback image upload succeeded",
							{
								hostedImageUrl: normalized.main_img,
							},
						);
					} catch (fallbackError) {
						console.error(
							"[recipes/import] Fallback image upload failed",
							{
								error: fallbackError,
							},
						);
						warnings.push("Main image could not be imported");
						normalized.main_img = "";
					}
				} else {
					warnings.push("Main image could not be imported");
					normalized.main_img = "";
				}
			}
		} else {
			warnings.push("No main image was found");
		}

		const validationCandidate = {
			name: normalized.name,
			servings: normalized.servings,
			main_img: normalized.main_img,
			ingredientBlocks: normalized.ingredientBlocks,
			steps: normalized.steps,
		};

		const parsedRecipe = editRecipeSchema.safeParse(validationCandidate);
		if (!parsedRecipe.success) {
			console.warn("[recipes/import] Recipe validation issues detected", {
				issueCount: parsedRecipe.error.issues.length,
				issues: parsedRecipe.error.issues.map((issue) => issue.message),
			});

			for (const issue of parsedRecipe.error.issues) {
				warnings.push(issue.message);
			}
		}

		if (warnings.length > 0) {
			console.warn("[recipes/import] Import warnings", {
				warningCount: warnings.length,
				warnings,
			});
		}

		console.info("[recipes/import] Import completed", {
			recipeName: normalized.name,
			ingredientBlockCount: normalized.ingredientBlocks.length,
			stepCount: normalized.steps.length,
			warningCount: warnings.length,
		});

		return {
			recipe: normalized,
			warnings,
		};
	},
);
