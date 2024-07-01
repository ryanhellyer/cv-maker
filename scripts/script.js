const loadCV = async () => {
	try {
		const cv = formatJSON(await fetchData('scripts/cv.json'));
		const template = await fetchData('scripts/template.html');

		let pages = [];
		pages.push(document.querySelector('page'));

		let pageKey = {value: 0}; // We use an object, so that it can be passed by reference in the processJobs() function.
		const page = pages[pageKey.value];

		pages[pageKey.value].innerHTML = template;

		const block = pages[pageKey.value].querySelector('main'); // SHOULD ALSO DO FOR HEADER, FOOTER, SIDEBAR ETC.
		let sections = Array.from(block.querySelectorAll('section'));

//cv.jobs = cv.jobs.slice(0,4);
//sections = sections.slice(0,1);

		block.innerHTML = '';
		for (let section of sections) {
			await processJobs(cv, section, block, pages, pageKey, template);
//			console.log('pageKey.value: ' + pageKey.value);
		}

		renderPage(pages[pageKey.value], cv);
	} catch (error) {
		console.error('Error:', error);
	}
};
window.addEventListener('load', loadCV);
