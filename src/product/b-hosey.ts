import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const URLS: string[] = [
  "https://b-hosey.com/index.php?route=product/search&path=35&limit=100",
  "https://b-hosey.com/index.php?route=product/search&path=44&limit=100",
  "https://b-hosey.com/index.php?route=product/search&path=49&limit=100",
  "https://b-hosey.com/index.php?route=product/search&path=56&limit=100",
  "https://b-hosey.com/index.php?route=product/search&path=65&limit=100",
  "https://b-hosey.com/index.php?route=product/search&path=70&limit=100",
  "https://b-hosey.com/index.php?route=product/search&path=83&limit=100",
];

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
        const imgElement = container.querySelector(".image img");
        const anchorElement = container.querySelector(".text-concat a");
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

  const outputPath = path.resolve(__dirname, "../../output/b-hosey.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));

  console.log(`Results saved to ${outputPath}`);
  console.log(`Total products scraped: ${allProducts.length}`);
  await browser.close();
})();
