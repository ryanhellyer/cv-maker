const loadCV = async () => {
	try {

		const cv = await fetchData('scripts/cv.json');
		addFirstLastProperties(cv); // maybe turn this into a wrapper for the cv await.
		convertDates(cv, 'year'); // maybe turn this into a wrapper for the cv await.

		const template = await fetchData('scripts/template.html');
		const page = document.querySelector('page');

		page.innerHTML = template;

		const main = page.querySelector('main');
		let sections = Array.from(main.querySelectorAll('section'));

sections = sections.slice(0, 1); // JUST TESTING WITH FIRST SECTION RIGHT NOW.
		sections.forEach(section => {
			(async () => {
				main.innerHTML += section.outerHTML;

				const mustacheRendered = Mustache.render(section.outerHTML, cv);
				const rendered = unescapeHTMLElements(mustacheRendered);
				main.innerHTML = rendered;

				let i = cv.jobs.length;
				while (i !== 0 && hasOverflowed(page)) {
					i--;
					cv.jobs = cv.jobs.slice(0, i); // slice from index 0 to 1 (exclusive)
					const mustacheRendered = Mustache.render(section.outerHTML, cv);
					const rendered = unescapeHTMLElements(mustacheRendered);
					main.innerHTML = rendered;

					await new Promise(requestAnimationFrame);
				}
			})();
		});
	} catch (error) {
		console.error('Error:', error);
	}
};
window.addEventListener('load', loadCV);
