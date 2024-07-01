/*
NOTE TO SELF: THE cv.jobs VAR IS BEING HANDLED WRONG.
AS THE FIRST PAGE FILLS WITH JOBS, THE JOBS WE NEED FOR THE SECOND PAGE ARE BEING DELETED, SO
THE SECOND PAGE SHOWS JIBBERISH.
*/
const loadCV = async () => {
	try {
		const cv = formatJSON(await fetchData('scripts/cv.json'));
		const template = await fetchData('scripts/template.html');

		let pages = [];
		let pageKey = {value: 0}; // We use an object, so that it can be passed by reference in the processJobs() function.

		addPage(pageKey, pages, template);
		let block = pages[pageKey.value].querySelector('main'); // can not be passed by reference to addPage() due to needing to be totally replaced. SHOULD ALSO DO FOR HEADER, FOOTER, SIDEBAR ETC.

		let sections = Array.from(block.querySelectorAll('section'));

//cv.jobs = cv.jobs.slice(0,1);
//sections = sections.slice(0,1);

		block.innerHTML = '';
let initialJobNumber = cv.jobs.length;
		for (let section of sections) {
			let initialHTML = block.innerHTML;
console.log(cv.jobs.length);
			await processJobs(cv, section, block, initialHTML, pages, pageKey, template);

			if (hasOverflowed(pages[pageKey.value])) {
				block.innerHTML = initialHTML;
				renderPage(pages[pageKey.value], cv);

				pageKey.value++;
				addPage(pageKey, pages, template);
				block = pages[pageKey.value].querySelector('main'); // can not be passed by reference to addPage() due to needing to be totally replaced. SHOULD ALSO DO FOR HEADER, FOOTER, SIDEBAR ETC.

				console.log('page ' + pageKey.value + ' added', cv.jobs.length);
			}/* else if (cv.jobs.length !== 0 && initialJobNumber > cv.jobs.length) {
				console.log('NOW');

//				block.innerHTML = initialHTML;
//				renderPage(pages[pageKey.value], cv);

				pageKey.value++;
				addPage(pageKey, pages, template);
				block = pages[pageKey.value].querySelector('main'); // can not be passed by reference to addPage() due to needing to be totally replaced. SHOULD ALSO DO FOR HEADER, FOOTER, SIDEBAR ETC.

				await processJobs(cv, section, block, initialHTML, pages, pageKey, template);

				console.log('DONE!');
			}*/
		}

		renderPage(pages[pageKey.value], cv); // I THINK THIS CATCHES THE LAST PAGE.
	} catch (error) {
		console.error('Error:', error);
	}
};
window.addEventListener('load', loadCV);
