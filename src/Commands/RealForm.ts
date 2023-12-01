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
		
		const response = await fetch('https://docs.google.com/forms/d/e/1FAIpQLSe9KO-YM_0llYvOS5gN5OwpWl0Q4MrJGDh1MhC5iGeG_nizxw/formResponse', {
		  method: 'POST',
		  
		  body: `entry.566172969=${encoded_name}&entry.1131253205=${hp}&entry.1893945818=NUS&entry.1621193565=${oneStar}&entry.1615606228=${zeroStar}&entry.1570249508_hour=${startHour}&entry.1570249508_minute=${startMinute}&entry.1447783740_hour=${endHour}&entry.1447783740_minute=${endMinute}&entry.862261437_year=${currentYear}&entry.862261437_month=${currentMonth}&entry.862261437_day=${currentDay}&entry.238192318=Co-Curricular+Activities+%28CCA%29&entry.1834008456=The+Paddle+Lodge+%40+MacRitchie+Reservoir&entry.396587464=I+have+read+and+agree+to+the+disclaimer+note.`,
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