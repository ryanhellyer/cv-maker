const loadCV = async () => {
	try {
		// Get CV.
		const responseJSON = await fetch('scripts/cv.json');
		if (!responseJSON.ok) {
			throw new Error(`HTTP error! status: ${responseJSON.status}`);
		}
		const cv = await responseJSON.json();

		// Get main template.
		const responseTemplate = await fetch('scripts/template.html');
		if (!responseTemplate.ok) {
			throw new Error(`HTTP error! status: ${responseTemplate.status}`);
		}
		let template = await responseTemplate.text();

		addFirstLastProperties(cv);
		convertDates(cv, 'year');

		// Get template bits.
		const templates = getTemplateSections(template);
		const mainTemplate = templates.updatedTemplate;
		const contentTemplate = templates.contentTemplate;
		const page = document.querySelector('page');

		// Render the main part of the page.
		const mustacheRendered = Mustache.render(mainTemplate, cv);
		page.innerHTML = unescapeHTMLElements(mustacheRendered);

		const main = document.querySelector('.main');
		const contentBits = splitContentSections(contentTemplate);




		// Iterate through the result array.
		contentBits.forEach((item, index) => {
			main.innerHTML += item;

// THIS IS FOCUSING ON JOBS, BUT ALSO NEED TO APPLY TO OTHER STUFF, LIKE EDUCATION ETC.

			const startString = '{{#jobs}}';
			const endString = '{{/jobs}}';
//console.log(cv.jobs);
//			console.log(   replaceContentBetweenStrings(item, startString, endString)   );
//			console.log(   extractContentBetweenStrings(item, startString, endString)   );

			const jobsTemplate = replaceContentBetweenStrings(item, startString, endString);
			const jobTemplate = extractContentBetweenStrings(item, startString, endString);

			let jobsList = '';
			cv.jobs.forEach(job => {
				jobsList += Mustache.render(jobTemplate, job);
				console.log(   Mustache.render(jobTemplate, job)    );
			});

			main.innerHTML = Mustache.render(contentTemplate, cv);
			main.innerHTML = unescapeHTMLElements(main.innerHTML);
		});
	} catch (error) {
		console.error('Error fetching or rendering the JSON file:', error);
	}
};
window.addEventListener('load', loadCV);
