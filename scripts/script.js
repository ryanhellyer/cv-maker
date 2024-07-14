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

		for (let section of sections) {

			do {
				let initialHTML = block.innerHTML;

				const initialJobNumber = cv.jobs.length;
				await processJobs(cv, section, block, initialHTML, pages, pageKey);

				if (
					(
						hasOverflowed(pages[pageKey.value])
						&&
						cv.jobs.length > 0
					)
					||
					(
						initialJobNumber === cv.jobs.length
						&&
						0 !== initialJobNumber
					)
				) {
					block.innerHTML = initialHTML;
					renderPage(pages[pageKey.value], cv);

					// Strip first heading, since it was already displayed. - MAYBE SHOULD ALSO STRIP PARAGRAPHS AND OTHER STUFF BEFORE THE <OL> TOO.
					section.innerHTML = stripFirstHeading(section.innerHTML);

					pageKey.value++;
					addPage(pageKey, pages, template);
					block = pages[pageKey.value].querySelector('main'); // can not be passed by reference to addPage() due to needing to be totally replaced. SHOULD ALSO DO FOR HEADER, FOOTER, SIDEBAR ETC.
					block.innerHTML = '';

					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			} while (cv.jobs.length !== 0);
		}

		renderPage(pages[pageKey.value], cv); // I THINK THIS CATCHES THE LAST PAGE.
	} catch (error) {
		console.error('Error:', error);
	}
};
window.addEventListener('load', loadCV);


const button = document.createElement('button');
button.id = 'generate-pdf';
button.textContent = 'Generate PDF';
document.body.appendChild(button);

const button2 = document.createElement('button');
button2.id = 'save-pdf';
button2.textContent = 'Save PDF';
document.body.appendChild(button2);

document.getElementById('save-pdf').addEventListener('click', () => {
	window.print();
});

document.getElementById('generate-pdf').addEventListener('click', () => {

    document.body.classList.add('printing');

	waitForPaint(() => {
    	const element = document.body;
		const opt = {
			margin: [0, 0, 0, 0], // top, right, bottom, left in mm
			filename: 'document.pdf',
			image: { type: 'jpeg', quality: 0.98 },
			html2canvas: { scale: 2 },
			jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
		};

		html2pdf().set(opt).from(element).save();
	});
//    document.body.classList.remove('printing');
});

function waitForPaint(callback) {
	requestAnimationFrame(() => {
		requestAnimationFrame(callback);
	});
}