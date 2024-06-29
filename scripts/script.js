const loadCV = async () => {
	try {

		const cv = await fetchData('scripts/cv.json');
		let template = await fetchData('scripts/template.html');
const tempTemplate = document.createElement('div');
tempTemplate.innerHTML = template;
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


const main = tempTemplate.querySelector('main');
const sections = Array.from(main.querySelectorAll('section'));

		// THIS IS FOCUSING ON JOBS, BUT ALSO NEED TO APPLY TO OTHER STUFF, LIKE EDUCATION ETC.
		const strings = {
			'start': '{{#jobs}}',
			'end': '{{/jobs}}',
		}

		const itemTemplate = extractContentBetweenStrings(template, strings.start, strings.end);
		template = replaceContentBetweenStrings(template, strings.start, strings.end);
		const tempTag = md5(strings);
		template = template.replace(strings.start + strings.end, tempTag);

		const mustacheRendered = Mustache.render(template, cv);
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
			page.innerHTML = tempArray[maxIndex];
		})();


	} catch (error) {
		console.error('Error fetching or rendering the JSON file:', error);
	}
};
window.addEventListener('load', loadCV);
