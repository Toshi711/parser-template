import cherio from 'cheerio';
import chalk from 'chalk';
import {puppeteer, taskQueue} from './index'

const task = async (url: string) => {
  try {
    console.log(chalk.green(`Getting data from: `) + chalk.green.bold(url));
    const detailContent = await puppeteer.getHTML(url);
    const $ = cherio.load(detailContent);

    const title = $('h1').text().trim()
    const score = $('.score-value').text().trim()
    
    console.log(`${title} - ${score}`)
  } catch (err) {
    throw err;
  }
};

export default function listItemsHandler(urls: string[]) {
  for(let url of urls){
    taskQueue.push(
      () => task(url),
      err => {
        if (err) {
          console.log(err);
          throw new Error('Error getting data from url[ ' + url + ' ]');
        }
        console.log(chalk.green.bold(`Success getting data from: \n${url}\n`));
      }
    );
  }
}