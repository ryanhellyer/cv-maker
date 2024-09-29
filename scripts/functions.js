const addPage = (pageKey, pages, template,) => {
	const newPage = document.createElement('page');
	document.body.insertBefore(newPage, document.body.lastChild);
	pages.push(newPage);
	pages[pageKey.value].innerHTML = template;
};

let jobsProcessed = 0;
const processJobs = async (cv, section, block, initialHTML, pages, pageKey) => {

	await renderBlock(cv, section, block);

	const removedJobs = [];

	while (cv.jobs.length !== 0 && hasOverflowed(pages[pageKey.value])) {
		removedJobs.unshift(cv.jobs.pop()); // Remove the last job and add it to the front of the removedJobs array.
		block.innerHTML = initialHTML; // Reset to initial content before re-rendering.
		await renderBlock(cv, section, block);
		await new Promise(resolve => setTimeout(resolve, 300));
	}

	cv.jobs = removedJobs;

	jobsProcessed++;
};

/**
 * Renders a block using Mustache templates and appends it to a specified element.
 *
 * @param {Object} cv - The CV data for the template.
 * @param {HTMLElement} section - The Mustache template element.
 * @param {HTMLElement} block - The target element to append the rendered content.
 * @returns {Promise<void>} Resolves after rendering and DOM update.
 */
async function renderBlock(cv, section, block) {
	const mustacheRendered = Mustache.render(section.outerHTML, cv);
	const rendered = unescapeHTMLElements(mustacheRendered);

	block.innerHTML += rendered;

	await new Promise(requestAnimationFrame);
}

/**
 * Renders a CV page using Mustache templates and updates its content.
 *
 * @param {array} pages - The page elements.
 * @param {Object} cv - The CV data object used for rendering the template.
 */
const renderPage = (page, cv) => {
	const mustacheRendered = Mustache.render(page.innerHTML, cv);
	const rendered = unescapeHTMLElements(mustacheRendered);
	page.innerHTML = rendered;
};

/**
 * Converts a Unix timestamp to a specified date component.
 * 
 * @param {number} unixTimestamp - The Unix timestamp to be converted.
 * @param {string} format - The format for the output ('year', 'month', 'week', 'day', or 'weekday').
 * @returns {string|number} - The converted date component based on the specified format.
 */
function convertTime(input, format) {
		let date;

		// Handle string inputs (for example for "present" or "YYYY-mm-dd").
		if (typeof input === 'string' || input instanceof String) {
				if (input === 'present') {
						return input;
				}
				// Check if the input is in "YYYY-mm-dd" format
				const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
				if (dateRegex.test(input)) {
						date = new Date(input);
				} else {
						return input;
				}
		} else {
				// Assume it's a Unix timestamp
				date = new Date(input * 1000);
		}

		// Check if the date is valid
		if (isNaN(date.getTime())) {
				return "Invalid date";
		}

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
						return date.toISOString().split('T')[0]; // Returns "YYYY-mm-dd"
		}
}

/**
 * Normalizes a multi-language object to a single language.
 *
 * Traverses a complex object structure and replaces multi-language entries 
 * with a single language version, prioritizing the specified primary language.
 *
 * @param {Object} obj - The object to be normalized.
 * @param {string} [primaryLang='en_US'] - The primary language to normalize to.
 *
 * @returns {Object} A new object with language-specific entries replaced.
 *
 * @throws {Error} If the primary language is not supported.
 */
const normalizeLanguage = (obj, primaryLang = 'en_US') => {

	if (!languages.includes(primaryLang)) {
		throw new Error(`Primary language '${primaryLang}' is not in the list of supported languages.`);
	}

	const processValue = (value) => {
		if (Array.isArray(value)) {
			return value.map(item => processValue(item));
		} else if (typeof value === 'object' && value !== null) {
			const langKeys = Object.keys(value).filter(key => languages.includes(key));
			if (langKeys.length > 0) {
				return value[primaryLang] || value[langKeys[0]] || null;
			} else {
				const newObj = {};
				for (const key in value) {
					newObj[key] = processValue(value[key]);
				}
				return newObj;
			}
		}
		return value;
	};

	return processValue(obj);
};

/**
 * Recursively adds isFirst and isLast properties to the first and last items of arrays within an object,
 * and converts date fields in the object to a specific format.
 * 
 * @param {Object} obj - The object to process.
 * @param {string} format - The date format to convert to.
 * @returns {object} - The formatted JSON blob.
 */
const formatJSON = (obj, format = 'year') => {
	obj = addFirstLastProperties(obj);
	obj = convertDates(obj, format);
	obj = normalizeLanguage(obj, getQueryParam('lang', 'en'));

	return obj;
};

/**
 * Recursively adds isFirst and isLast properties to the first and last items of arrays within an object.
 * 
 * @param {Object} obj - The object to process.
 * @returns {object} - The JSON blob with added first and last properties.
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
			obj[key] = addFirstLastProperties(obj[key]);
		}
	}

	return obj;
};

/**
 * Recursively converts date fields in an object to a specific format.
 * @param {Object} obj - The object containing date fields to be converted.
 * @returns {object} - The JSON blob with formatted time strings.
 */
const convertDates = (obj, format) => {
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			if (typeof obj[key] === 'object') {
				obj[key] = convertDates(obj[key], format);
			}

			// If the property is 'start' or 'date', format the timestamp.
			else if (key === 'start' || key === 'end') {

				// ATS requires more specific date format.
				if ('ats' === getQueryParam('type', '')) {
					obj[key] = convertTime(obj[key], 'YYYY-mm-dd');
				} else {
					obj[key] = convertTime(obj[key], format);
				}
			}
		}
	}

	return obj;
};

/**
 * Retrieves the value of a specified query parameter from the current URL.
 * 
 * @param {string} param - The name of the query parameter to retrieve.
 * @param {string} [defaultValue=''] - The default value to return if the parameter is not found.
 * @returns {string} The value of the query parameter, or the default value if not found.
 */
function getQueryParam(param, defaultValue = '') {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get(param) || defaultValue;
}

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
 * Checks if an element has overflow in its content.
 *
 * @param {Element} element - The DOM element to check for overflow.
 * @returns {boolean} - True if the element has overflow, false otherwise.
 */
function hasOverflowed(element) {
	return element.scrollHeight > element.clientHeight;
}

/**
 * Fetches data from a URL and determines its type based on content-type header.
 * Supports fetching JSON for .json files and text for .html, .text, or .txt files.
 * Throws an error for unsupported content types.
 *
 * @param {string} url - The URL from which to fetch data.
 * @returns {Promise<any>} - Resolves with JSON object or text string depending on content type.
 * @throws {Error} - If fetch fails or if an unsupported content type is encountered.
 */
async function fetchData(url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch data from ${url}. HTTP status: ${response.status}`);
	}

	const contentType = response.headers.get('content-type');
	if (contentType.includes('application/json')) {
		return response.json();
	} else if (contentType.includes('text/html') || contentType.includes('text/plain')) {
		return response.text();
	} else {
		throw new Error(`Unsupported content type ${contentType} for ${url}`);
	}
}

const md5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}

/**
 * Strips the first heading element (h1, h2, etc.) from a given HTML string.
 *
 * @param {string} htmlString - The HTML string from which to strip the first heading.
 * @returns {string} - The modified HTML string with the first heading removed.
 */
const stripFirstHeading = (htmlString) => {
	// Create a temporary DOM element to parse the HTML string
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = htmlString;

	// Find the first heading (h1, h2, etc.) in the temporary DOM element
	const firstHeading = tempDiv.querySelector('h1, h2, h3, h4, h5, h6');
	if (firstHeading) {
		firstHeading.remove();
	}

	// Return the modified HTML as a string
	return tempDiv.innerHTML;
};

const languages = ['en_US', 'de_DE', 'fr_FR', 'es_ES', 'it_IT', 'ja_JP', 'zh_CN', 'ru_RU'];
