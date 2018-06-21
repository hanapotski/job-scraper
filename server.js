const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
require('colors');

if (process.argv.length !== 3) {
  console.error('Add a word to search. ex: node server <jobtosearch>'.red);
} else {
  const wordToSearch = process.argv[2];
  (searchWord => {
    axios
      .get(
        `https://stackoverflow.com/jobs?q=${searchWord}&l=Los+Angeles%2c+CA%2c+USA&d=20&u=Miles&sort=p`
      )
      .then(result => {
        const $ = cheerio.load(result.data);
        const jobsData = [];
        const jobs = $('h2.fs-subheading > a');
        jobs.each((i, job) => {
          jobsData.push({
            title: $(job).text(),
            link: 'https://stackoverflow.com/' + $(job).attr('href'),
            posted: $(job)
              .closest('div')
              .first()
              .find('span.ps-absolute.pt2.r0.fc-black-500.fs-body1.pr12.t24')
              .text()
          });
        });

        const date = moment();
        fs.writeFileSync(
          path.join(
            __dirname,
            `./searches/jobsearch(${wordToSearch})-${date.format('LLL')}.json`
          ),
          JSON.stringify(jobsData, null, 4)
        );
        console.log(
          'Check the search results for '.green +
            `${wordToSearch} `.blue +
            'inside the'.green +
            ' searches '.yellow +
            'folder'.green
        );
      });
  })(wordToSearch);
}
