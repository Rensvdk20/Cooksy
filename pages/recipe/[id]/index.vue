<template>
	<NuxtLayout>
		<div class="relative flex justify-center items-center h-100">
			<div class="absolute inset-0 bg-gradient-to-t from-zinc-900/100 via-zinc-900/50 to-zinc-900/0"></div>
			<div class="text-6xl absolute">Katsudon</div>
			<img src="/public/img/temp/katsudon.jpg" alt="Katsudon" class="w-full h-100 object-cover">
		</div>

		<div class="max-w-[1200px] mx-auto px-4 py-8 bg-zinc-90">
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div class="p-6 lg:col-span-1 col-span-2 bg-zinc-800 rounded-xl shadow-md">
					<h1 class="text-3xl">Ingredients</h1>
					<div class="mt-2">
						<h2>Main ingredients</h2>
						<ul class="pl-5 mt-2 space-y-2">
							<li>
								<label class="flex items-center cursor-pointer">
									<input type="checkbox" />
									2 Pork chop (Rib Chop)
								</label>
							</li>
							<li>
								<label class="flex items-center cursor-pointer">
									<input type="checkbox" />
									Panko
								</label>
							</li>
							<li>
								<label class="flex items-center cursor-pointer">
									<input type="checkbox" />
									Flour
								</label>
							</li>
							<li>
								<label class="flex items-center cursor-pointer">
									<input type="checkbox" />
									3 Eggs
								</label>
							</li>
							<li>
								<label class="flex items-center cursor-pointer">
									<input type="checkbox" />
									3L Sunflower oil
								</label>
							</li>
							<li>
								<label class="flex items-center cursor-pointer">
									<input type="checkbox" />
									Tonkatsu sauce
								</label>
							</li>
						</ul>
					</div>

					<div class="mt-6">
						<h2>Self Made Tonkatsu Sauce (Optional)</h2>
						<ul class="pl-5 mt-2 space-y-2">
							<li>
								<label class="flex items-center cursor-pointer">
									<input type="checkbox" />
									8 Tbsp ketchup
								</label>
							</li>
							<li>
								<label class="flex items-center cursor-pointer">
									<input type="checkbox" />
									2 Tbsp sojasaus
								</label>
							</li>
							<li>
								<label class="flex items-center cursor-pointer">
									<input type="checkbox" />
									3 Tbsp worcestershire sauce
								</label>
							</li>
							<li>
								<label class="flex items-center cursor-pointer">
									<input type="checkbox" />
									2 Tsp sugar
								</label>
							</li>
						</ul>
					</div>
				</div>
				<div class="p-6 col-span-2 bg-zinc-800 rounded-xl shadow-md">
					<div>
						<h2 class="text-3xl">Before</h2>
						<p>1. Get the rib chops out of the refrigerator 30 minutes before cooking</p>
					</div>
					<div class="mt-8">
						<h2 class="text-3xl">Instructions</h2>
						<p>
							1. Get the fryer and turn it to 170 °C<br /><br />

							2. Get a bowl with flour, a bowl with 3 beaten eggs and and a bowl of panko<br />
							3. Dip the rib chops in a bowl of flour and cover them fully<br />
							4. Put the rib chops in the bowl of eggs<br />
							5. Move the rib chops into the bowl of panko and press the panko a bit against the meat, make sure it’s fully covered in Panko<br />
							6. Put the covered rib chops on a plate<br /><br />

							7. Repeat the steps above for each rib chop<br />
							8. Put depending on the size of your fryer, about 2 pieces of rib chops in the oil and fry them on both sides for about 5 minutes 45 seconds (11 minutes 30 seconds total)<br />
							9. Take the rib chops out of the oil and put them on a rack so the oil can drip downand the bread-crumbs won’t get soggy<br />
						</p>
					</div>
				</div>
			</div>
		</div>
	</NuxtLayout>
</template>
