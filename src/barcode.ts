import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

interface Item {
  name: string;
  link: string;
  barcode?: string | null;
}

(async () => {
  const inputName = process.argv[2]; // Accept input file path as a parameter
  if (!inputName) {
    console.error("Please provide the input JSON file path as a parameter.");
    process.exit(1);
  }
  const querySelector = process.argv[3]; // Accept query selector as a parameter
  if (!querySelector) {
    console.error("Please provide the query selector as a parameter.");
    process.exit(1);
  }

  const disableJS = process.argv[4] === "true"; // Accept a parameter to disable JavaScript
  console.log(`JavaScript rendering is ${disableJS ? "disabled" : "enabled"}.`);

  const barcodeFilePath = path.resolve(
    __dirname,
    `../output/barcode/${inputName}-barcode.json`
  );
  const originalFilePath = path.resolve(
    __dirname,
    `../output/product/${inputName}.json`
  );

  let typedData: Item[];
  let barcodeMap: Record<string, string | null> = {};

  if (fs.existsSync(barcodeFilePath)) {
    console.log(`Reading barcode map from ${barcodeFilePath}`);
    barcodeMap = JSON.parse(fs.readFileSync(barcodeFilePath, "utf-8"));
  }

  console.log(`Reading original data from ${originalFilePath}`);
  typedData = JSON.parse(fs.readFileSync(originalFilePath, "utf-8"));

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set JavaScript rendering based on the parameter
  await page.setJavaScriptEnabled(!disableJS);

  for (const [index, item] of typedData.entries()) {
    const { name, link } = item;

    if (barcodeMap[link]) {
      continue;
    }

    try {
      console.log(`Processing ${index + 1}/${typedData.length}: ${name}`);
      await page.goto(link, { waitUntil: "domcontentloaded" });
      const fetchedBarcode = await page.$eval(
        querySelector,
        (el) => el.textContent?.trim() || null
      );

      if (fetchedBarcode) {
        barcodeMap[link] = fetchedBarcode;
      } else {
        console.log(`No barcode found for ${name}`);
        barcodeMap[link] = null;
      }
    } catch (error) {
      console.error(`Failed to fetch barcode for ${name}:`, error.message);
      barcodeMap[link] = null;
    }

    // Save progress every 10 elements
    if ((index + 1) % 10 === 0 || index === typedData.length - 1) {
      fs.writeFile(barcodeFilePath, JSON.stringify(barcodeMap, null, 2), "utf-8", (err) => {
        if (err) {
          console.error(`Error saving data to ${barcodeFilePath}:`, err.message);
        }
      });
    }
  }

  console.log(`Final barcode map saved to ${barcodeFilePath}`);
  await browser.close();
})();
