const https = require('https');
const topics = [
  'Introduction to Data Science Simplilearn',
  'Python Programming for Data Science Simplilearn',
  'Data Collection and Data Wrangling Simplilearn',
  'Exploratory Data Analysis EDA Simplilearn',
  'Data Visualization Simplilearn',
  'Statistics for Data Science Simplilearn',
  'Machine Learning Fundamentals Simplilearn',
  'Advanced Machine Learning Simplilearn',
  'Big Data and Data Engineering Basics Simplilearn',
  'Model Deployment Data Science Simplilearn'
];
let results = {};
let count = 0;
topics.forEach((t, i) => {
  const query = encodeURIComponent("site:youtube.com " + t);
  https.get("https://html.duckduckgo.com/html/?q=" + query, res => {
    let d = ''; res.on('data', c => d+=c);
    res.on('end', () => {
      const match = d.match(/v=([a-zA-Z0-9_-]{11})/);
      results[i] = match ? match[1] : 'dQw4w9WgXcQ';
      count++;
      if(count === topics.length) console.log(JSON.stringify(results, null, 2));
    });
  });
});
