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
