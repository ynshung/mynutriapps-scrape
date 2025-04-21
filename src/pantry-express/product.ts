import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const URLS: string[] = [
  "https://www.pantryexpress.my/48-groceries?id_category=48&n=791",
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let allProducts: Array<{ name: string; link: string; image: string; desc: string; price: string }> = [];

  for (const url of URLS) {
    console.log(`Scraping ${url}`);
    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1024 });

    const products = await page.$$eval(".product-container", (containers) => {
      return containers.map((container) => {
        const nameElement = container.querySelector(".product-name");
        const imgElement = container.querySelector(".product-image-container img");
        const descElement = container.querySelector(".product-desc");
        const priceElement = container.querySelector(".product-price");

        return {
          name: nameElement?.textContent?.trim() || "",
          link: (nameElement as HTMLAnchorElement)?.href || "",
          image: imgElement?.getAttribute("src") || "",
          desc: descElement?.textContent?.trim() || "",
          price: priceElement?.textContent?.trim() || "",
        };
      });
    });

    allProducts = allProducts.concat(products);
  }

  const outputPath = path.resolve(__dirname, "../../output/pantryexpress.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));

  console.log(`Results saved to ${outputPath}`);
  await browser.close();
})();
