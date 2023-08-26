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
		// Testing Form used, not real form. Feel free to spam. 
		const response = await fetch('https://docs.google.com/forms/d/e/1FAIpQLScPuxvh-x25U_IUiDQDxEvClXKEtVz9zTNmGtoWDgxk95R_fA/formResponse', {
		  method: 'POST',
		  body: `entry.1661917649=${encoded_name}&entry.18740119=${hp}&entry.903605068=NUS&entry.202460231=${oneStar}&entry.1867953654=${zeroStar}&entry.476828904_hour=${startHour}&entry.476828904_minute=${startMinute}&entry.1889441574_hour=${endHour}&entry.1889441574_minute=${endMinute}&entry.698202065_year=${currentYear}&entry.698202065_month=${currentMonth}&entry.698202065_day=${currentDay}&entry.1757175466=Co-Curricular+Activities+%28CCA%29&entry.1030466242=The+Paddle+Lodge+%40+MacRitchie+Reservoir&entry.879462990=I+read+and+agree+to+the+disclaimer+note.`,
		  headers: {
		    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0',
		    'Content-Type': 'application/x-www-form-urlencoded',
		    'Origin': 'https://docs.google.com',
		    'Referer': 'https://docs.google.com/forms/d/e/1FAIpQLScPuxvh-x25U_IUiDQDxEvClXKEtVz9zTNmGtoWDgxk95R_fA/viewform',
		  }
		});

		if (!response.ok || !response.body.includes('Your response has been recorded')){
			throw new Error('Failed to submit form! Use /form to try again');
		}
	} 
}