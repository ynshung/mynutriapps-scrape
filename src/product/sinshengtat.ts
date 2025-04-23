import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const URLS: string[] = [
  "https://www.sinshengtatonline.com.my/barangan-kering?limit=1000",
  "https://www.sinshengtatonline.com.my/barangan-runcit?limit=1000",
  "https://www.sinshengtatonline.com.my/barangan-segar?limit=1000",
  "https://www.sinshengtatonline.com.my/beku-sejuk?limit=1000",
  "https://www.sinshengtatonline.com.my/minuman?limit=1000",
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let allProducts: Array<{ name: string; link: string; image: string; price: string }> = [];

  for (const url of URLS) {
    console.log(`Scraping ${url}`);
    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1024 });

    const products = await page.$$eval(".frame", (frames) => {
      return frames.map((frame) => {
        const nameElement = frame.querySelector(".product-name a");
        const imgElement = frame.querySelector(".item-img img.first-img");
        const priceElement = frame.querySelector(".price-new");

        return {
          name: nameElement?.textContent?.trim() || "",
          link: (nameElement as HTMLAnchorElement)?.href || "",
          image: imgElement?.getAttribute("data-lazy") || imgElement?.getAttribute("src") || "",
          price: priceElement?.textContent?.trim() || "",
        };
      });
    });

    allProducts = allProducts.concat(products);
  }

  const outputPath = path.resolve(__dirname, "../../output/sinshengtat.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));

  console.log(`Results saved to ${outputPath}`);
  await browser.close();
})();
