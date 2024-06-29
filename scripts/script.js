const loadCV = async () => {
	try {
		// Get CV.
		const responseJSON = await fetch('scripts/cv.json');
		if (!responseJSON.ok) {
			throw new Error(`HTTP error! status: ${responseJSON.status}`);
		}
		const cv = await responseJSON.json();

		// Get main template.
		const responseTemplate = await fetch('scripts/template.html');
		if (!responseTemplate.ok) {
			throw new Error(`HTTP error! status: ${responseTemplate.status}`);
		}
		let template = await responseTemplate.text();

		addFirstLastProperties(cv);
		convertDates(cv, 'year');

		const page = document.querySelector('page');

// THIS IS FOCUSING ON JOBS, BUT ALSO NEED TO APPLY TO OTHER STUFF, LIKE EDUCATION ETC.

		const startString = '{{#jobs}}';
		const endString = '{{/jobs}}';

		const jobTemplate = extractContentBetweenStrings(template, startString, endString);
		template = replaceContentBetweenStrings(template, startString, endString);
		tempTag = 'XXXX';
		template = template.replace(startString + endString, tempTag);

		const mustacheRendered = Mustache.render(template, cv);
		const rendered = unescapeHTMLElements(mustacheRendered);
let tempPage = page.cloneNode(true);
tempPage.style.position = 'absolute';
tempPage.style.top = '0';
tempPage.style.left = '900px';
tempPage.style.opacity = '0.2';
//tempPage.style.visibility = 'hidden';
document.body.appendChild(tempPage);

let tempArray = [];
let fittingIndexes = [];
		let jobsList = '';

		cv.jobs.forEach((job, index) => {
		    jobsList += Mustache.render(jobTemplate, job);
		    tempArray[index] = rendered.replace(tempTag, jobsList);
		});

		(async () => {
		    for (const [index, tempRendered] of tempArray.entries()) {
		        tempPage.innerHTML = tempRendered;
		        await new Promise(requestAnimationFrame);

		        if (hasOverflow(tempPage)) {
			        console.log(index, tempPage.scrollHeight);		        	
		        }

		        if (! hasOverflow(tempPage)) {
		        	fittingIndexes.push(index);
		        }
		    }

	        const maxIndex = Math.max(...fittingIndexes);
			console.log('maxIndex: ' + maxIndex);
	        page.innerHTML = tempArray[maxIndex];
		})();


	} catch (error) {
		console.error('Error fetching or rendering the JSON file:', error);
	}
};
window.addEventListener('load', loadCV);
