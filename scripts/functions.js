/**
 * Converts a Unix timestamp to a specified date component.
 * 
 * @param {number} unixTimestamp - The Unix timestamp to be converted.
 * @param {string} format - The format for the output ('year', 'month', 'week', 'day', or 'weekday').
 * @returns {string|number} - The converted date component based on the specified format.
 */
function convertTime(unixTimestamp, format) {
	const date = new Date(unixTimestamp * 1000);

	const options = {
		year: 'numeric',
		month: 'long',
		week: 'numeric',
		day: 'numeric',
		weekday: 'long'
	};

	switch(format) {
		case 'year':
			return date.getFullYear();
		case 'month':
			return date.toLocaleString('default', { month: 'long' });
		case 'week':
			const startOfYear = new Date(date.getFullYear(), 0, 1);
			const pastDaysOfYear = (date - startOfYear) / 86400000;
			return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
		case 'day':
			return date.getDate();
		case 'weekday':
			return date.toLocaleString('default', { weekday: 'long' });
		default:
			return date.toString();
	}
}

/**
 * Recursively adds isFirst and isLast properties to the first and last items of arrays within an object.
 * 
 * @param {Object} obj - The object to process.
 */
const addFirstLastProperties = (obj) => {

	// Iterate over each key in the object
	for (const key in obj) {

		// Check if the value associated with the key is an array
		if (Array.isArray(obj[key])) {

			// Iterate over each item in the array
			obj[key].forEach((item, index) => {

				if (index === 0) {
					item.isFirst = true;
				}

				if (index === obj[key].length - 1) {
					item.isLast = true;
				}
			});

		// Check if the value is a non-null object and recursively process it
		} else if (typeof obj[key] === 'object' && obj[key] !== null) {
			addFirstLastProperties(obj[key]);
		}
	}
};

/**
 * Recursively converts date fields in an object to a specific format.
 * @param {Object} obj - The object containing date fields to be converted.
 */
const convertDates = (obj, format) => {
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			if (typeof obj[key] === 'object') {
				convertDates(obj[key], format);
			} 

			// If the property is 'start' or 'date', format the timestamp.
			else if (key === 'start' || key === 'end') {
				obj[key] = convertTime(obj[key], format);
			}
		}
	}
};

/**
 * Unescapes common HTML typographic elements and entities in a string.
 *
 * This function takes a string containing HTML escaped characters and
 * converts them back to their unescaped form for typical HTML elements
 * such as paragraphs, headings, and other typographic elements. It also
 * handles common HTML entities like &, ", ', /, and &nbsp;.
 *
 * @param {string} str - The string containing HTML escaped characters.
 * @return {string} - The unescaped string with HTML elements and entities.
 *
 * @example
 * const escapedHTML = "Hello &lt;p&gt;This is a paragraph.&lt;/p&gt; &amp; &quot; &apos; &#x2F; &nbsp;";
 * const unescapedHTML = unescapeHTMLElements(escapedHTML);
 * console.log(unescapedHTML);  // Output: Hello <p>This is a paragraph.</p> & " ' /  
 */
const unescapeHTMLElements = (str) => {
  const tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'span', 'br', 'hr', 'div'];
  let entities = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
	'&#x2F;': '/',
	'&nbsp;': ' ',
  };

  tags.forEach(tag => {
	entities[`&lt;${tag}&gt;`] = `<${tag}>`;
	entities[`&lt;/${tag}&gt;`] = `</${tag}>`;
  });

  const regex = new RegExp(Object.keys(entities).join('|'), 'g');
  
  return str.replace(regex, match => entities[match]);
};

/**
 * Extracts the content of the .main section from the initial template and removes it,
 * returning the updated template and the content of the .main section.
 *
 * @param {string} initialTemplate - The initial HTML template as a string.
 * @returns {Object} An object containing the updated template without the .main section
 *                   and the content of the .main section.
 *                   { updatedTemplate: string, contentTemplate: string }
 */
const getTemplateSections = (initialTemplate) => {
	let container = document.createElement('div');
	container.innerHTML = initialTemplate;

	let mainSection = container.querySelector('.main');
	const contentTemplate = mainSection.innerHTML;

	mainSection.innerHTML = '';

	const updatedTemplate = container.innerHTML;

	return { updatedTemplate, contentTemplate };
};

const splitContentSections = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const result = [];
  const headings = doc.querySelectorAll('h2');

  headings.forEach(heading => {
	let content = `<h2>${heading.textContent.trim()}</h2>`;

	let nextElement = heading.nextElementSibling;
	while (nextElement && nextElement.tagName !== 'H2') {
	  content += nextElement.outerHTML;
	  nextElement = nextElement.nextElementSibling;
	}

	result.push(content.trim());
  });

  return result;
};

const replaceContentBetweenStrings = (htmlString, startString, endString) => {
	// Create a new DOM parser
	const parser = new DOMParser();
	// Parse the string into a document
	const doc = parser.parseFromString(htmlString, 'text/html');

	// Find the start and end positions of the strings
	const startIndex = htmlString.indexOf(startString);
	const endIndex = htmlString.indexOf(endString, startIndex + startString.length);

	if (startIndex !== -1 && endIndex !== -1) {
		// Remove content between the two strings
		const beforeContent = htmlString.slice(0, startIndex + startString.length);
		const afterContent = htmlString.slice(endIndex);
		return beforeContent + afterContent;
	}

	// If either string is not found, return the original HTML string
	return htmlString;
};

const extractContentBetweenStrings = (htmlString, startString, endString) => {
	// Create a new DOM parser
	const parser = new DOMParser();
	// Parse the string into a document
	const doc = parser.parseFromString(htmlString, 'text/html');
	
	// Find the start and end positions of the strings
	const startIndex = htmlString.indexOf(startString);
	const endIndex = htmlString.indexOf(endString, startIndex + startString.length);
	
	if (startIndex !== -1 && endIndex !== -1) {
		// Extract content between the two strings
		const content = htmlString.slice(startIndex + startString.length, endIndex);
		return content;
	}
	
	// If either string is not found, return an empty string
	return '';
};

function hasOverflow(element) {
	//console.log('element.scrollHeight: ' + element.scrollHeight, ', element.clientHeight: ' + element.clientHeight);
    return element.scrollHeight > element.clientHeight;
}
