interface ProductDataType {
  product: {
    images: {
      [key: string]: {
        imgid: string;
        sizes: {
          400: {
            h: number;
            w: number;
          };
          full: {
            h: number;
            w: number;
          };
        };
      };
    };
  };
};

interface ImageData {
  imgid: string;
  h: number;
  w: number;
};

interface ProductImages {
  barcode: string;
  front?: ImageData;
  nutrition?: ImageData;
  ingredients?: ImageData;
  productId?: number;
  [key: string]: ImageData | number | string | undefined;
}export function filterKeyList(keyList: string[]): string[] {
  const validPrefixes = ["front", "nutrition", "ingredients"];
  const prioritySuffixes = ["_en", "_ms"];  

  return validPrefixes.map(prefix => {
    const keys = keyList.filter(k => k.startsWith(prefix));
    return prioritySuffixes.map(suffix => keys.find(k => k.endsWith(suffix)))
      .find(k => k) || keys[0];
  }).filter(k => k); 
}

function getProductImageUrl(barcode: string, imgid: string, thumbnail = true): string {
  const paddedBarcode = barcode.toString().padStart(13, '0');
    const match = paddedBarcode.match(/^(...)(...)(...)(.*)$/);
  
  if (!match) {
      throw new Error("Invalid barcode format");
  }
  
  const [, part1, part2, part3, part4] = match;
  
  return `https://openfoodfacts-images.s3.eu-west-3.amazonaws.com/data/${part1}/${part2}/${part3}/${part4}/${imgid}${thumbnail ? '.400' : ''}.jpg`;
}


const offImg = async (barcode: string) => {
  const productImage: ProductImages = {
    barcode,
  };
  const imageDataUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?product_type=food&fields=images`;
  const response = await fetch(imageDataUrl);
  const data: ProductDataType = await response.json();
  const keyList = filterKeyList(Object.keys(data.product.images));


  keyList.forEach((key) => {
    const imageData = data.product.images[key];
    productImage[key.split("_")[0]] = {
      imgid: imageData.imgid,
      h: imageData.sizes["400"].h,
      w: imageData.sizes["400"].w,
    } as ImageData;
  });

  return productImage;
};

const main = async () => {
  const barcode = "9556041608251";
  const productImage = await offImg(barcode);
  console.log(productImage);
  console.log(getProductImageUrl(barcode, productImage.front?.imgid || "", true));
  console.log(getProductImageUrl(barcode, productImage.nutrition?.imgid || "", true));
  console.log(getProductImageUrl(barcode, productImage.ingredients?.imgid || "", true));
};

main();
