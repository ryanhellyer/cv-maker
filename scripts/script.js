const loadCV = async () => {
	try {
		const cv = formatJSON(await fetchData('scripts/cv.json'));
		const template = await fetchData('scripts/template.html');

		let pages = [];
		pages.push(document.querySelector('page'));

		let pageKey = 0;
		const page = pages[pageKey];

		pages[pageKey].innerHTML = template;

		const block = pages[pageKey].querySelector('main'); // SHOULD ALSO DO FOR HEADER, FOOTER, SIDEBAR ETC.
		let sections = Array.from(block.querySelectorAll('section'));

//cv.jobs = cv.jobs.slice(0,3);

		block.innerHTML = '';
		for (let section of sections) {
			let i = cv.jobs.length;
			let initialHTML = block.innerHTML;
			
			await renderCV(cv, section, block);
			while (i !== 0 && hasOverflowed(pages[pageKey])) {
				i--;
				cv.jobs = cv.jobs.slice(0, i);
				block.innerHTML = initialHTML; // Reset to initial content before re-rendering
				await renderCV(cv, section, block);
			}

			if (hasOverflowed(pages[pageKey])) {
				block.innerHTML = initialHTML;

				renderPage(pages, pageKey, cv);
//		const mustacheRendered = Mustache.render(pages[pageKey].innerHTML, cv);
//		const rendered = unescapeHTMLElements(mustacheRendered);
//		pages[pageKey].innerHTML = rendered;

				const newPage = document.createElement('page');
				pages[pageKey].parentNode.insertBefore(newPage, pages[pageKey].nextSibling);
				pages.push(newPage);
				pageKey++;
				pages[pageKey].innerHTML = template;
			}
		}

		renderPage(pages, pageKey, cv);
	} catch (error) {
		console.error('Error:', error);
	}
};
window.addEventListener('load', loadCV);

/**
 * Renders a CV page using Mustache templates and updates its content.
 *
 * @param {array} pages - The page elements.
 * @param {number} pageKey - The index of the page in the pages array.
 * @param {Object} cv - The CV data object used for rendering the template.
 */
const renderPage = (pages, pageKey, cv) => {
	const mustacheRendered = Mustache.render(pages[pageKey].innerHTML, cv);
	const rendered = unescapeHTMLElements(mustacheRendered);
	pages[pageKey].innerHTML = rendered;
};
