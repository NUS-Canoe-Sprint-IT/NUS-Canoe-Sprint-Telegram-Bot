const fetch = require("node-fetch-commonjs")

export class FillForm {
	public async submitForm(
		name: string, 
		hp: string, 
		oneStar: string, 
		zeroStar: string, 
		startTime: string, 
		endTime: string
	){
		const encoded_name = encodeURIComponent(name);

		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();
		const currentMonth = currentDate.getMonth() + 1;
		const currentDay = currentDate.getDate();

		const [startHour, startMinute] = startTime.split(':');
		const [endHour, endMinute] = endTime.split(':');
		// REAL FORM URL USED!!!
		const response = await fetch('https://docs.google.com/forms/d/e/1FAIpQLSfMtt0kvol72F9A2BaLJacr8Xzm9n51KBxVfS8YkDe8SfS5GA/viewform', {
		  method: 'POST',
		  body: `entry.650249987=${encoded_name}&entry.159891337=${hp}&entry.1940228710=NUS&entry.1522705696=${oneStar}&entry.923232455=${zeroStar}&entry.76258493_hour=${startHour}&entry.76258493_minute=${startMinute}&entry.1960199521_hour=${endHour}&entry.1960199521_minute=${endMinute}&entry.2082654990_year=${currentYear}&entry.2082654990_month=${currentMonth}&entry.2082654990_day=${currentDay}&entry.1965888248=Co-Curricular+Activities+%28CCA%29&entry.1917318237=The+Paddle+Lodge+%40+MacRitchie+Reservoir&entry.1234664796=I+read+and+agree+to+the+disclaimer+note.`,
		  headers: {
		    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0',
		    'Content-Type': 'application/x-www-form-urlencoded',
		    'Origin': 'https://docs.google.com',
		    'Referer': 'https://docs.google.com/forms/d/e/1FAIpQLSfMtt0kvol72F9A2BaLJacr8Xzm9n51KBxVfS8YkDe8SfS5GA/viewform',
		  }
		});
		const html = await response.text();

		if (!response.ok || !html.includes('Your response has been recorded')){
			throw new Error(`Failed to submit form. Response: ${html}`);
		}
	} 
}