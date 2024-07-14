/*
NOTE TO SELF: THE cv.jobs VAR IS BEING HANDLED WRONG.
AS THE FIRST PAGE FILLS WITH JOBS, THE JOBS WE NEED FOR THE SECOND PAGE ARE BEING DELETED, SO
THE SECOND PAGE SHOWS JIBBERISH.
*/
console.log('Use this for generating PDFs: https://www.npmjs.com/package/jspdf');

const loadCV = async () => {
	try {
		const cv = formatJSON(await fetchData('scripts/cv.json'));
		const template = await fetchData('scripts/template.html');

		let pages = [];
		let pageKey = {value: 0}; // We use an object, so that it can be passed by reference in the processJobs() function.

		addPage(pageKey, pages, template);
		let block = pages[pageKey.value].querySelector('main'); // can not be passed by reference to addPage() due to needing to be totally replaced. SHOULD ALSO DO FOR HEADER, FOOTER, SIDEBAR ETC.

		let sections = Array.from(block.querySelectorAll('section'));

		block.innerHTML = '';
		let cvTemp = cv;

		for (let section of sections) {
			let unprocessedJobs;

			do {
				let initialHTML = block.innerHTML;
				unprocessedJobs = await processJobs(cvTemp, section, block, initialHTML, pages, pageKey);
				cvTemp.jobs = unprocessedJobs;
// instead of hasOverflowed here, need to return that it WAS overflowed, because it probably isn't overlowed right now.
				if (
					hasOverflowed(pages[pageKey.value])
					&&
					unprocessedJobs.length > 0
				) {
					block.innerHTML = initialHTML;
					renderPage(pages[pageKey.value], cv);

					// Strip first heading, since it was already displayed.
					section.innerHTML = stripFirstHeading(section.innerHTML);

					pageKey.value++;
					addPage(pageKey, pages, template);
					block = pages[pageKey.value].querySelector('main'); // can not be passed by reference to addPage() due to needing to be totally replaced. SHOULD ALSO DO FOR HEADER, FOOTER, SIDEBAR ETC.
					block.innerHTML = '';

					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			} while (unprocessedJobs.length !== 0);
		}

		renderPage(pages[pageKey.value], cvTemp); // I THINK THIS CATCHES THE LAST PAGE.
	} catch (error) {
		console.error('Error:', error);
	}
};
window.addEventListener('load', loadCV);
