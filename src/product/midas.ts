import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const WEBSITE_NAME = "midas";
const URLS: string[] = [
  "https://pandan-jb.estore.midas.com.my/product/category&path=2&instock=false&limit=5000",
  "https://pandan-jb.estore.midas.com.my/product/category&path=3&instock=false&limit=5000",
  "https://pandan-jb.estore.midas.com.my/product/category&path=5&instock=false&limit=5000",
  "https://pandan-jb.estore.midas.com.my/product/category&path=6&instock=false&limit=5000",
  "https://pandan-jb.estore.midas.com.my/product/category&path=11&instock=false&limit=5000",
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let allProducts: Array<{ name: string; link: string; image: string; price: string }> = [];

  for (const url of URLS) {
    console.log(`Scraping ${url}`);
    await page.goto(url, { timeout: 60000 }); // 60 seconds timeout for this navigation
    await page.setViewport({ width: 1080, height: 1024 });

    const products = await page.$$eval(".product-thumb", (containers) => {
      return containers.map((container) => {
        const imgElement = container.querySelector(".product-img img");
        const nameElement = container.querySelector(".name a");
        const priceElement = container.querySelector(".price-normal") || container.querySelector(".price-new");

        return {
          name: nameElement?.textContent?.trim() || "",
          link: (nameElement as HTMLAnchorElement)?.href || "",
          image: imgElement?.getAttribute("data-src") || imgElement?.getAttribute("src") || "",
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
