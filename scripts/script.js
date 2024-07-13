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
console.log('Stringified', JSON.parse(JSON.stringify(block.innerHTML)), 'Somewhere between this start and the end, the "Experience" section is being added, even though we are not on that section');

		let sections = Array.from(block.querySelectorAll('section'));

//cv.jobs = cv.jobs.slice(0,1);
sections = sections.slice(0,1);
console.log('despite only loading one section here, the education and language skills bits are still loading. Page 1 but no 0, has Education and Languages in it.', sections);
		block.innerHTML = '';
		let cvTemp = cv;

		for (let section of sections) {
			console.log(section.innerHTML);
		    let unprocessedJobs;
		    do {
				let initialHTML = block.innerHTML;
//console.log(initialHTML);
		        unprocessedJobs = await processJobs(cvTemp, section, block, initialHTML, pages, pageKey);
		        cvTemp.jobs = unprocessedJobs;

				if (
					hasOverflowed(pages[pageKey.value])
					&&
					unprocessedJobs.length > 0
				) {
					block.innerHTML = initialHTML;
					renderPage(pages[pageKey.value], cv);

					pageKey.value++;
					//alert(pageKey.value);
					addPage(pageKey, pages, template);
//					block = pages[pageKey.value].querySelector('main'); // can not be passed by reference to addPage() due to needing to be totally replaced. SHOULD ALSO DO FOR HEADER, FOOTER, SIDEBAR ETC.
console.log('Error is probably somewhere around this block. It seems to be including Education etc even though this iteration only loads the first section');
//console.log('stringified block', JSON.parse(JSON.stringify(pages[pageKey.value].innerHTML)));
			        await new Promise(resolve => setTimeout(resolve, 1000));
					//console.log('unprocessedJobs', unprocessedJobs);
				}
		    } while (unprocessedJobs.length !== 0);
		}

		renderPage(pages[pageKey.value], cvTemp); // I THINK THIS CATCHES THE LAST PAGE.
	} catch (error) {
		console.error('Error:', error);
	}
};
window.addEventListener('load', loadCV);
