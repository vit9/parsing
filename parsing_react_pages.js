
const $ = require('cheerio');
const got = require('got');
const puppeteer = require('puppeteer');

const url = 'https://...'; // some url 

// const response = await axios.get(url); get web page
// const $ = cheerio.load(response.data); get web page html
// const node = $('.products-grid a'); // find some html node

module.exports = () => {

    function extractItems() {
        const extractedElements = document.querySelectorAll('#boxes > div.box');
        const items = [];
        for (let element of extractedElements) {
          items.push(element.innerText);
        }
        return items;
      }
      
      async function scrapeInfiniteScrollItems(
        page,
        extractItems,
        itemTargetCount,
        scrollDelay = 1000,
      ) {
        let items = [];
        try {
          let previousHeight;
          while (items.length < itemTargetCount) {
            items = await page.evaluate(extractItems);
            previousHeight = await page.evaluate('document.body.scrollHeight');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
            await page.waitFor(scrollDelay);
          }
        } catch(e) { }
        return items;
      }
      
      (async () => {
        // settings for launch
        //{
        //  headless: false,
        //  args: ['--no-sandbox', '--disable-setuid-sandbox'],
       // } 
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        page.setViewport({ width: 1280, height: 926 });
      
        await page.goto(url);
        
        const items = await scrapeInfiniteScrollItems(page, extractItems, 100);
        console.log(items)

        // html code that need to parse
        // exmple 
        // const html = await page.content()
        // const fullProductsData = []
        // const name =  $('.item-name', html);
        // const countPerTk = $('.item-count', html)
        // const count = $('.item-details > h2', html);
        // name.each((index, el) => fullProductsData.push({productName: $(el).text()}))
        // count.each((index, el) => fullProductsData[index] = {...fullProductsData[index], count: $(el).text()})
        // countPerTk.each((index, el) => fullProductsData[index] = {...fullProductsData[index], countByPoint: $(el).text()})

        // Close the browser.
        await browser.close();
      })();
}

