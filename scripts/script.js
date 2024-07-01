const loadCV = async () => {
	try {
		const cv = formatJSON(await fetchData('scripts/cv.json'));
		const template = await fetchData('scripts/template.html');

		let pages = [];
		pages.push(document.querySelector('page'));

const page = pages[0];

		pages[0].innerHTML = template;

		const main = pages[0].querySelector('main');
		let sections = Array.from(main.querySelectorAll('section'));

cv.jobs = cv.jobs.slice(0,3);

		main.innerHTML = '';
		for (let section of sections) {
			let i = cv.jobs.length;
			let initialHTML = main.innerHTML;
			
			await renderCV(cv, section, main);
			while (i !== 0 && hasOverflowed(pages[0])) {
				i--;
				cv.jobs = cv.jobs.slice(0, i);
				main.innerHTML = initialHTML; // Reset to initial content before re-rendering
				await renderCV(cv, section, main);
			}

			if (hasOverflowed(pages[0])) {
				main.innerHTML = initialHTML;
//XXX make new page
			}
		}

		const mustacheRendered = Mustache.render(pages[0].innerHTML, cv);
		const rendered = unescapeHTMLElements(mustacheRendered);
		pages[0].innerHTML = rendered;
	} catch (error) {
		console.error('Error:', error);
	}
};
window.addEventListener('load', loadCV);
