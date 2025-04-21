import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const WEBSITE_NAME = "everrise";
const BASE_URL = "https://shop.everrise.com.my/bmm/product/category&instock=false&limit=1000";
const PATHS = [2, 3, 4, 6, 7, 9, 10, 11, 15, 27, 33, 35, 36, 37, 39, 43, 48, 51];
const URLS = PATHS.map((path) => `${BASE_URL}&path=${path}`);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let allProducts: Array<{ name: string; link: string; image: string; price: string }> = [];

  for (const url of URLS) {
    console.log(`Scraping ${url}`);
    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1024 });

    const products = await page.$$eval(".product-thumb", (containers) => {
      return containers.map((container) => {
        const imgElement = container.querySelector(".img-first");
        const anchorElement = container.querySelector(".name a");
        const priceElement = container.querySelector(".price-normal") || container.querySelector(".price-new");

        return {
          name: anchorElement?.textContent?.trim() || "",
          link: (anchorElement as HTMLAnchorElement)?.href || "",
          image: imgElement?.getAttribute("src") || "",
          price: priceElement?.textContent?.trim() || "",
        };
      });
    });

    allProducts = allProducts.concat(products);
  }

  const outputPath = path.resolve(__dirname, `../../output/${WEBSITE_NAME}.json`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));

  console.log(`Results saved to ${outputPath}`);
  console.log(`Total products scraped: ${allProducts.length}`);
  await browser.close();
})();
