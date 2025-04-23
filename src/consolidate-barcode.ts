import fs from "fs";
import path from "path";
import { isValidEAN13 } from "./isValidEAN13";

const productDir = path.join(__dirname, "../output/product");
const barcodeDir = path.join(__dirname, "../output/barcode");
const outputFile = path.join(__dirname, "../output/consolidated.json");

const consolidateBarcodes = () => {
  const productFiles = fs.readdirSync(productDir);
  const barcodeFiles = fs.readdirSync(barcodeDir);
  const consolidatedData: Record<string, any> = {};
  let count = 0;
  let validCount = 0;
  let invalidCount = 0;
  let noBarcodeCount = 0;
  let duplicateCount = 0;

  barcodeFiles.forEach((barcodeFile) => {
    if (barcodeFile.endsWith("-barcode.json")) {
      const barcodeFilePath = path.join(barcodeDir, barcodeFile);
      const barcodeData = JSON.parse(fs.readFileSync(barcodeFilePath, "utf-8"));
      const sourceName = barcodeFile.replace("-barcode.json", "");

      if (productFiles.includes(`${sourceName}.json`)) {
        const productFilePath = path.join(productDir, `${sourceName}.json`);
        const productData = JSON.parse(
          fs.readFileSync(productFilePath, "utf-8")
        );

        productData.forEach((item: any) => {
          const link = item.link;
          const barcode = barcodeData[link];
          const isValid = isValidEAN13(barcode);

          if (barcode) {
            if (!consolidatedData[barcode]) {
              consolidatedData[barcode] = {
                validEAN13: isValid,
              };
              count++;
              isValid ? validCount++ : invalidCount++;
            }
            if (consolidatedData[barcode][sourceName]) {
              duplicateCount++;
            }
            consolidatedData[barcode][sourceName] = { ...item };
          } else {
            noBarcodeCount++;
          }
        });
      }
    }
  });

  const sortedData = Object.keys(consolidatedData)
    .sort()
    .reduce((acc, key) => {
      acc[key] = consolidatedData[key];
      return acc;
    }, {} as Record<string, any>);

  fs.writeFileSync(outputFile, JSON.stringify(sortedData, null, 2));

  console.log(`Consolidated ${count} data written to ${outputFile}`);
  console.log(`Valid barcodes: ${validCount}`);
  console.log(`Invalid barcodes: ${invalidCount}`);
  console.log(`No barcode found: ${noBarcodeCount}`);
  console.log(`Duplicate barcodes: ${duplicateCount}`);
};

consolidateBarcodes();
