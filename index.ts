import chalk from 'chalk';
import {queue} from 'async';
import { Puppeteer } from './puppeteer';
import *  as cheerio from 'cheerio';
import listItemsHandler from './items';
const SITE = 'https://shikimori.one/animes/page/';
const pages = 4;
const concurrency = 10;
const startTime = new Date();

export const puppeteer = new Puppeteer();
export const taskQueue = queue(async (task: Function, done) => {
  try {
    await task();
    console.log(chalk.bold.magenta(`Task completed, tasks left: ${taskQueue.length()}\n`));
    done();
  } catch (err) {
    console.error(chalk.red('Task failed: '), err);
  }
}, concurrency);

taskQueue.drain(() => {
  const endTime = new Date();
  console.log(chalk.green.bold(`🎉 All items completed [${(endTime.getTime() - startTime.getTime()) / 1000}s]\n`));
  puppeteer.closeBrowser();
});

async function parsePage(url: string) {
  try {
    const pageContent = await puppeteer.getHTML(url);
    const $ = cheerio.load(pageContent)
    const pages: string[] = []

    $('article a').each((i, element) => {
      pages.push(String($(element).attr('href')))
    })

    listItemsHandler(pages)
  } catch (err) {
    console.error(chalk.red('An error has occurred: '), err);
  }
}

main()
async function main() {
  for (let i = 1; i <= pages; i++) {
    taskQueue.push(
      () => parsePage(SITE+i),
      (err: unknown) => {
        if (err) {
          console.error(chalk.red(`🚫 Error getting data from page#${i}: `), err);
        } else {
          console.log(chalk.green.bold(`Completed getting data from page#${i}\n`));
        }
      }
    );
  }
}
