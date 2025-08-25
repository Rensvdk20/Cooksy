import prisma from "~/lib/prisma";

await prisma.recipe.create({
	data: {
		name: 'Katsudon',
		servings: 2,
		main_img: 'https://i.imgur.com/A5c8ReE.jpeg',
		ingredientBlocks: {
			create: [
				{
					name: 'Main Ingredients',
					ingredients: {
						create: [
							{ name: '2 Pork chop (Rib Chop)' },
							{ name: 'Panko' },
							{ name: 'Flour' },
							{ name: '3 Eggs' },
							{ name: '3L Sunflower oil' },
							{ name: 'Tonkatsu sauce' }
						]
					}
				},
				{
					name: 'Self Made Tonkatsu Sauce (Optional)',
					ingredients: {
						create: [
							{ name: '8 Tbsp ketchup' },
							{ name: '2 Tbsp soy sauce' },
							{ name: '3 Tbsp worcestershire sauce' },
							{ name: '2 Tsp sugar' }
						]
					}
				}
			]
		},
		steps: {
			create: [
				{
					name: 'Before',
					instructions: '1. Get the rib chops out of the refrigerator 30 minutes before cooking'
				},
				{
					name: 'Instructions',
					instructions: [
						'1. Get the fryer and turn it to 170 °C',
						'2. Get a bowl with flour, a bowl with 3 beaten eggs and a bowl of panko',
						'3. Dip the rib chops in a bowl of flour and cover them fully',
						'4. Put the rib chops in the bowl of eggs',
						'5. Move the rib chops into the bowl of panko and press the panko a bit against the meat, make sure it’s fully covered in panko',
						'6. Put the covered rib chops on a plate',
						'7. Repeat the steps above for each rib chop',
						'8. Depending on the size of your fryer, put about 2 pieces of rib chops in the oil and fry them on both sides for about 5 minutes 45 seconds (11 minutes 30 seconds total)',
						'9. Take the rib chops out of the oil and put them on a rack so the oil can drip down and the breadcrumbs won’t get soggy'
					].join('\n')
				},
				{
					name: 'I don’t have tonkatsu sauce (Optional)',
					instructions: '1. Mix the ketchup, soy sauce, worcestershire sauce and sugar\n2. Stir well until the sugar is fully dissolved'
				}
			]
		}
	}
});
