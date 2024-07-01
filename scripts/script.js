const loadCV = async () => {
	try {

		const cv = await fetchData('scripts/cv.json');
		const template = document.createElement('div');
		template.innerHTML = await fetchData('scripts/template.html');
		addFirstLastProperties(cv);
		convertDates(cv, 'year');

		const page = document.querySelector('page');

		// Create temporary page.
		let tempPage = page.cloneNode(true);
		tempPage.style.position = 'absolute';
		tempPage.style.top = '0';
		tempPage.style.left = '900px';
		tempPage.style.opacity = '0.6';
		//tempPage.style.visibility = 'hidden';
		document.body.appendChild(tempPage);


const main = template.querySelector('main');
const sections = Array.from(main.querySelectorAll('section'));

main.innerHTML = '';

sections.forEach(section => {

	// THIS IS FOCUSING ON JOBS, BUT ALSO NEED TO APPLY TO OTHER STUFF, LIKE EDUCATION ETC.
	const strings = {
		'start': '{{#jobs}}',
		'end': '{{/jobs}}',
	}

	const itemTemplate = extractContentBetweenStrings(section.outerHTML, strings.start, strings.end);
	template.innerHTML = replaceContentBetweenStrings(section.outerHTML, strings.start, strings.end);
	const tempTag = md5(strings);
	section.innerHTML = section.innerHTML.replace(strings.start + strings.end, tempTag);

	const mustacheRendered = Mustache.render(template.innerHTML, cv);
	const rendered = unescapeHTMLElements(mustacheRendered);

	const items = cv.jobs;

	(async () => {
		let itemsString = '';
		const tempArray = [];

		// First loop to render item.
		items.forEach((item, index) => {
			itemsString += Mustache.render(itemTemplate, item);
			tempArray[index] = rendered.replace(tempTag, itemsString);
		});

		// Second loop to find the index's which it on the page.
		const fittingIndexes = [];
		for (const [index, tempRendered] of tempArray.entries()) {
			tempPage.innerHTML = tempRendered;
			await new Promise(requestAnimationFrame);

			if (!hasOverflow(tempPage)) {
				fittingIndexes.push(index);
			}
		}

		// Determine the index with the maximum fitting.
		const maxIndex = Math.max(...fittingIndexes);

		// Replace the page content with the best fitting template.
		main.innerHTML += tempArray[maxIndex];
page.innerHTML = main.innerHTML;
	})();

});

//	main.innerHTML += '<hr>';

//console.log('....'+template.innerHTML);



	} catch (error) {
		console.error('Error fetching or rendering the JSON file:', error);
	}
};
window.addEventListener('load', loadCV);
