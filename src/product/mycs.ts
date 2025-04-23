import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const WEBSITE_NAME = "mycs";
const URLS = [
  "https://www.mycs.com.my/frozen-products?product_list_limit=75",
  "https://www.mycs.com.my/cooking-essentials?product_list_limit=75",
  "https://www.mycs.com.my/cooking-essentials?p=2&product_list_limit=75",
  "https://www.mycs.com.my/cooking-essentials?p=3&product_list_limit=75",
  "https://www.mycs.com.my/cooking-essentials?p=4&product_list_limit=75",
  "https://www.mycs.com.my/cooking-essentials?p=5&product_list_limit=75",
  "https://www.mycs.com.my/cooking-essentials?p=6&product_list_limit=75",
  "https://www.mycs.com.my/groceries?product_list_limit=75",
  "https://www.mycs.com.my/groceries?p=2&product_list_limit=75",
  "https://www.mycs.com.my/groceries?p=3&product_list_limit=75",
  "https://www.mycs.com.my/groceries?p=4&product_list_limit=75",
  "https://www.mycs.com.my/groceries?p=5&product_list_limit=75",
  "https://www.mycs.com.my/groceries?p=6&product_list_limit=75",
  "https://www.mycs.com.my/groceries?p=7&product_list_limit=75",
  "https://www.mycs.com.my/groceries?p=8&product_list_limit=75",
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let allProducts: Array<{ name: string; link: string; image: string; price: string }> = [];

  for (const url of URLS) {
    console.log(`Scraping ${url}`);
    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1024 });

    const products = await page.$$eval(".product-item", (containers) => {
      return containers.map((container) => {
        const imgElement = container.querySelector(".product-image-photo");
        const anchorElement = container.querySelector(".product-item-link");
        const priceElement = container.querySelector(".price");

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
