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
const initialJobNumber = cv.jobs.length;
		for (let section of sections) {
			let initialHTML = block.innerHTML;
			await processJobs(cv, section, block, initialHTML, pages, pageKey, template);

			if (hasOverflowed(pages[pageKey.value])) {
				block.innerHTML = initialHTML;
				renderPage(pages[pageKey.value], cv);

				pageKey.value++;
				addPage(pageKey, pages, template);
				console.log('page ' + pageKey.value + ' added', cv.jobs.length);
			}


			/*
			if (cv.jobs.length !== 0 && initialJobNumber > cv.jobs.length) {
				console.log('NOW');
				renderPage(pages[pageKey.value], cv);

				addPage(pageKey, pages, template);
				await processJobs(cv, section, block, initialHTML, pages, pageKey, template);
console.log(cv.jobs.length);
				console.log('DONE!');
			}
			*/
		}

		renderPage(pages[pageKey.value], cv); // I THINK THIS CATCHES THE LAST PAGE.
	} catch (error) {
		console.error('Error:', error);
	}
};
window.addEventListener('load', loadCV);
