const loadCV = async () => {
	try {

		const cv = await fetchData('scripts/cv.json');
		let template = await fetchData('scripts/template.html');

		addFirstLastProperties(cv);
		convertDates(cv, 'year');

		const page = document.querySelector('page');



		// THIS IS FOCUSING ON JOBS, BUT ALSO NEED TO APPLY TO OTHER STUFF, LIKE EDUCATION ETC.
		const strings = {
			'start': '{{#jobs}}',
			'end': '{{/jobs}}',
		}

		const jobTemplate = extractContentBetweenStrings(template, strings.start, strings.end);
		template = replaceContentBetweenStrings(template, strings.start, strings.end);
		tempTag = 'XXXX';
		template = template.replace(strings.start + strings.end, tempTag);

		const mustacheRendered = Mustache.render(template, cv);
		const rendered = unescapeHTMLElements(mustacheRendered);

		// Create temporary page.
		let tempPage = page.cloneNode(true);
		tempPage.style.position = 'absolute';
		tempPage.style.top = '0';
		tempPage.style.left = '900px';
		tempPage.style.opacity = '0.2';
		//tempPage.style.visibility = 'hidden';
		document.body.appendChild(tempPage);

		(async () => {
			let jobsList = '';
			const tempArray = [];

			// First loop to render jobs.
			cv.jobs.forEach((job, index) => {
				jobsList += Mustache.render(jobTemplate, job);
				tempArray[index] = rendered.replace(tempTag, jobsList);
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
