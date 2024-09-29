console.log('Use this for generating PDFs: https://www.npmjs.com/package/jspdf');

const loadCV = async () => {
	try {
		//const cv = formatJSON(await fetchData('files/' + getQueryParam('file', 'cv') + '-' + getQueryParam('lang', 'en') + '.json'));
		const cv = formatJSON(await fetchData('files/' + getQueryParam('file', 'cv') + '.json'));
		let template = await fetchData('templates/' + getQueryParam('template', 'liuba') + '.html');

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

/**
 * Needs documented.
 * Sets up body classes.
 */
document.addEventListener('DOMContentLoaded', function() {

	// Function to sanitize input
	function sanitizeInput(input) {
		// Create an element to use browser's built-in functionality
		const tempElement = document.createElement('div');
		tempElement.textContent = input;
		return tempElement.textContent; // Use textContent to get the sanitized text
	}

	// Function to get and sanitize query parameters
	function getSanitizedQueryParam(name) {
		const value = getQueryParam(name);
		return value ? sanitizeInput(value) : null;
	}

	// Get and sanitize query parameters
	const params = ['type', 'lang', 'format'];
	const sanitizedParams = params.reduce((acc, param) => {
		const value = getSanitizedQueryParam(param);
		if (value) {
			acc[param] = value;
		}

		return acc;
	}, {});

	// Add sanitized parameters as classes to the body element
	Object.values(sanitizedParams).forEach(value => {
		document.body.classList.add(value);
	});
});




/**
 * Adding buttons and setting selections.
 */

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


/**
 * File selector.
 */
const selectBox = document.createElement('select');
selectBox.id = 'file-selector';
const options = ['cv', 'liuba'];
options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1);
    selectBox.appendChild(optionElement);
});
const currentFile = new URLSearchParams(window.location.search).get('file') || 'cv';
selectBox.value = currentFile;
selectBox.addEventListener('change', (event) => {
    const selectedFile = event.target.value;
    const url = new URL(window.location);
    url.searchParams.set('file', selectedFile);
    window.location.href = url.toString();
});
document.body.insertBefore(selectBox, document.body.firstChild);

/**
 * Language selector.
 */
const createLanguageSelector = () => {
    const languages = ['en_US', 'de_DE', 'fr_FR', 'es_ES', 'it_IT', 'ja_JP', 'zh_CN', 'ru_RU'];
    
    const selectBox = document.createElement('select');
    selectBox.id = 'language-selector';
    
    languages.forEach(lang => {
        const optionElement = document.createElement('option');
        optionElement.value = lang;
        // Create a more readable label for each language
        const label = lang.split('_')[0].toLowerCase();
        optionElement.textContent = label.charAt(0).toUpperCase() + label.slice(1);
        selectBox.appendChild(optionElement);
    });
    
    // Get the current language from URL params or default to 'en_US'
    const currentLang = new URLSearchParams(window.location.search).get('lang') || 'en_US';
    selectBox.value = currentLang;
    
    selectBox.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        const url = new URL(window.location);
        url.searchParams.set('lang', selectedLang);
        window.location.href = url.toString();
    });
    
    // Insert the select box at the beginning of the body
    document.body.insertBefore(selectBox, document.body.firstChild);
};
createLanguageSelector();

/**
 * CV Type selector.
 */
const createCVTypeSelector = () => {
    const types = [
        { value: 'ats', label: 'ATS' },
        { value: 'normal', label: 'Normal' }
    ];
    
    const selectBox = document.createElement('select');
    selectBox.id = 'cv-type-selector';
    
    types.forEach(type => {
        const optionElement = document.createElement('option');
        optionElement.value = type.value;
        optionElement.textContent = type.label;
        selectBox.appendChild(optionElement);
    });
    
    // Get the current CV type from URL params or default to 'normal'
    const currentType = new URLSearchParams(window.location.search).get('type') || 'normal';
    selectBox.value = currentType;
    
    selectBox.addEventListener('change', (event) => {
        const selectedType = event.target.value;
        const url = new URL(window.location);
        url.searchParams.set('type', selectedType);
        window.location.href = url.toString();
    });
    
    // Create a label for the select box
    const label = document.createElement('label');
    label.htmlFor = 'cv-type-selector';
    label.textContent = 'CV Type: ';
    
    // Create a container for the label and select box
    const container = document.createElement('div');
    container.appendChild(label);
    container.appendChild(selectBox);
    
    // Insert the container at the beginning of the body
    document.body.insertBefore(container, document.body.firstChild);
};
createCVTypeSelector();