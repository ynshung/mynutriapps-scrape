import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const WEBSITE_NAME = "frozenfood";
const URLS = [
  "https://frozenfood.com.my/?orderby=date&per_row=4&per_page=500&shop_view=grid",
  "https://frozenfood.com.my/page/2/?orderby=date&per_row=4&per_page=500&shop_view=grid",
  "https://frozenfood.com.my/page/3/?orderby=date&per_row=4&per_page=500&shop_view=grid",
  "https://frozenfood.com.my/page/4/?orderby=date&per_row=4&per_page=500&shop_view=grid",
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let allProducts: Array<{ name: string; link: string; image: string; price: string }> = [];

  for (const url of URLS) {
    console.log(`Scraping ${url}`);
    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1024 });

    const products = await page.$$eval(".wd-product", (containers) => {
      return containers.map((container) => {
        const imgElement = container.querySelector(".product-image-link img");
        const anchorElement = container.querySelector(".wd-entities-title a");
        const priceElement = container.querySelector("bdi");

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
