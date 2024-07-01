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

cv.jobs = cv.jobs.slice(0,3);

		main.innerHTML = '';
		for (let section of sections) {
			let i = cv.jobs.length;
			let initialHTML = main.innerHTML;
			
			await renderCV(cv, section, main);
			while (i !== 0 && hasOverflowed(page)) {
				i--;
				cv.jobs = cv.jobs.slice(0, i);
				main.innerHTML = initialHTML; // Reset to initial content before re-rendering
				await renderCV(cv, section, main);
			}

			if (hasOverflowed(page)) {
				main.innerHTML = initialHTML;
			}
		}

		const mustacheRendered = Mustache.render(page.innerHTML, cv);
		const rendered = unescapeHTMLElements(mustacheRendered);
		page.innerHTML = rendered;
	} catch (error) {
		console.error('Error:', error);
	}
};
window.addEventListener('load', loadCV);

async function renderCV(cv, section, main) {
	const mustacheRendered = Mustache.render(section.outerHTML, cv);
	const rendered = unescapeHTMLElements(mustacheRendered);
	main.innerHTML += rendered;

	await new Promise(requestAnimationFrame);
}