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
const initialJobNumber = cv.jobs.length;
		for (let section of sections) {
		    let initialHTML = block.innerHTML;

			await processJobs(cv, section, block, initialHTML, pages, pageKey, template);
/*
			if (cv.jobs.length !== 0 && initialJobNumber > cv.jobs.length) {
				console.log('NOW');
//		        block.innerHTML = initialHTML;
//		        renderPage(pages[pageKey.value], cv);

		        addPage(pageKey, pages, template);
				console.log(pageKey.value, 'page added', cv.jobs.length);
				await processJobs(cv, section, block, initialHTML, pages, pageKey, template);
console.log(cv.jobs.length);
				console.log('DONE!');
			}
*/

		    if (hasOverflowed(pages[pageKey.value])) {
		        block.innerHTML = initialHTML;
		        renderPage(pages[pageKey.value], cv);

		        addPage(pageKey, pages, template);
				console.log(pageKey.value, 'page added', cv.jobs.length);
		    }

			console.log(pageKey);
			if (cv.jobs.length !== 0) {
//				console.log('llll',cv.jobs.length);
//				await processJobs(cv, section, block, pages, pageKey, template);
			}
//			console.log('pageKey.value: ' + pageKey.value);
		}

		renderPage(pages[pageKey.value], cv);
	} catch (error) {
		console.error('Error:', error);
	}
};
window.addEventListener('load', loadCV);
