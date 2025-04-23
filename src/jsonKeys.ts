import * as fs from 'fs';
import * as path from 'path';

// Path to the JSON file
const jsonFilePath = path.resolve(__dirname, '../output/consolidated.json');
// Path to the output CSV file
const csvFilePath = path.resolve(__dirname, '../output/barcode.csv');

// Read the JSON file
fs.readFile(jsonFilePath, 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }

  try {
    const jsonData = JSON.parse(data);
    const keys = Object.keys(jsonData);

    // Prepare CSV content
    const csvRows = [['Key', 'validEAN13']]; // Header row

    keys.forEach((key) => {
      const validEAN13 = jsonData[key]?.validEAN13; // Extract validEAN13 or use empty string if not present
      csvRows.push([key, validEAN13]);
    });

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');

    // Write CSV content to file
    fs.writeFile(csvFilePath, csvContent, 'utf-8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing CSV file:', writeErr);
        return;
      }
      console.log('CSV file written successfully:', csvFilePath);
    });
  } catch (parseErr) {
    console.error('Error parsing JSON file:', parseErr);
  }
});
