import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const WEBSITE_NAME = "nbs";
const URLS = [
  "https://www.nbsgrocery.com/ourproducts/cid/333160/",
  "https://www.nbsgrocery.com/ourproducts/cid/333137/",
  "https://www.nbsgrocery.com/ourproducts/cid/359282/",
  "https://www.nbsgrocery.com/ourproducts/cid/359281/",
  "https://www.nbsgrocery.com/ourproducts/cid/357620/",
  "https://www.nbsgrocery.com/ourproducts/cid/379708/",
  "https://www.nbsgrocery.com/ourproducts/cid/363435/",
  "https://www.nbsgrocery.com/ourproducts/cid/558275/",
  "https://www.nbsgrocery.com/ourproducts/cid/556979/",
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let allProducts: Array<{ name: string; link: string; image: string; price: string }> = [];

  for (const url of URLS) {
    console.log(`Scraping ${url}`);
    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1024 });

    let hasNextPage = true;
    let currentPage = 1; // Track the current page
    while (hasNextPage) {
      const products = await page.$$eval(".product_box", (containers) => {
        return containers.map((container) => {
          const imgElement = container.querySelector(".img_frame a img");
          const anchorElement = container.querySelector(".title a");
          const priceElement = container.querySelector(".price");
          const productSold = container.querySelector(".product_list_sold_title");

          return {
            name: anchorElement?.textContent?.trim() || "",
            link: (anchorElement as HTMLAnchorElement)?.href || "",
            image: imgElement?.getAttribute("src") || "",
            price: priceElement?.textContent?.trim() || "",
            sold: productSold?.textContent?.trim() || "",
          };
        });
      });

      allProducts = allProducts.concat(products);

      // Check for "Next" button and navigate if it exists
      const nextButton = await page.$('a[aria-label="Next"]');
      if (nextButton) {
        process.stdout.write("."); // Append a dot to the console log
        await nextButton.click();
        await page.waitForNavigation({ waitUntil: "networkidle2" });
        currentPage++; // Increment the page counter
      } else {
        hasNextPage = false;
        console.log();
      }
    }
  }

  const outputPath = path.resolve(__dirname, `../../output/${WEBSITE_NAME}.json`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));

  console.log(`Results saved to ${outputPath}`);
  console.log(`Total products scraped: ${allProducts.length}`);
  await browser.close();
})();
