import chalk from 'chalk';
import queue from 'async/queue';
import { DoneCallback } from 'async/queue';
import { Puppeteer } from './puppeteer';

const SITE = 'https://auto.ru/catalog/cars/all/?page_num=';
const pages = 4;
const concurrency = 10;
const startTime = new Date();

export const puppeteer = new Puppeteer();
export const taskQueue = queue(async (task: Function, done: DoneCallback) => {
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
