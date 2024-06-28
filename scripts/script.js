const loadCV = async () => {
	try {
		// Get CV.
		const responseJSON = await fetch('scripts/cv.json');
		if (!responseJSON.ok) {
			throw new Error(`HTTP error! status: ${responseJSON.status}`);
		}
		const cv = await responseJSON.json();

		// Get template.
		const responseTemplate = await fetch('scripts/template.html');
		if (!responseTemplate.ok) {
			throw new Error(`HTTP error! status: ${responseTemplate.status}`);
		}
		const template = await responseTemplate.text();

		addFirstLastProperties(cv);
		convertDates(cv, 'year');

		const cvElement = document.querySelector('page');

		cvElement.innerHTML = Mustache.render(template, cv);

	} catch (error) {
		console.error('Error fetching or rendering the JSON file:', error);
	}
};

window.addEventListener('load', loadCV);
