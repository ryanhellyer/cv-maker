const loadCV = async () => {
	try {

		const cv = await fetchData('scripts/cv.json');
		let template = await fetchData('scripts/template.html');

		addFirstLastProperties(cv);
		convertDates(cv, 'year');

		const page = document.querySelector('page');

		// THIS IS FOCUSING ON JOBS, BUT ALSO NEED TO APPLY TO OTHER STUFF, LIKE EDUCATION ETC.
		const strings = {
			'start': '{{#jobs}}',
			'end': '{{/jobs}}',
		}
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
