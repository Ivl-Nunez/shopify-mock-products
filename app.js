const axios = require('axios');
const faker = require('faker');
const fs = require('fs');
const pexels = require('./pexels');
const datamuse = require('./datamuse');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Generate a CSV file for Shopify
async function generateShopifyCsv(category, numProducts) {
  const products = [];
  const similarWords = await datamuse.getRelatedWords(category);

  // Creaetes mock products, CSV file and adds them to it
  for (let i = 0; i < numProducts; i++) {
    const imageUrl = await getImageUrl(similarWords[i], i);
    const product = createMockProduct(similarWords[i], imageUrl);
    products.push(product);
  }

  const csvWriter = createCsvWriter({
    path: 'shopify_products.csv',
    header: [
      { id: 'Handle', title: 'Handle' },
      { id: 'Title', title: 'Title' },
      { id: 'Body', title: 'Body (HTML)' },
      { id: 'Vendor', title: 'Vendor' },
      { id: 'Type', title: 'Type' },
      { id: 'Tags', title: 'Tags' },
      { id: 'ImageSrc', title: 'Image Src' },
    ],
  });

  csvWriter.writeRecords(products).then(() => {
    console.log('Shopify CSV file generated successfully!');
  });
}

// Create a mock product object
function createMockProduct(similarWord, imageUrl) {
  return {
    Handle: faker.helpers.slugify(faker.commerce.productName()),
    Title: similarWord,
    Body: `<p>${faker.lorem.paragraph()}</p>`,
    Vendor: faker.company.companyName(),
    Type: similarWord,
    Tags: `${similarWord},${faker.commerce.department()}`,
    ImageSrc: imageUrl,
  };
}

// Get a random image URL from Pexels
async function getImageUrl(category, index) {
  const images = await pexels.searchImages(category, numProducts);
  return images.length ? images[index].src.small : '';
}

// Run the script with a category and number of products as arguments
const category = process.argv[2] || 'Electronics';
const numProducts = parseInt(process.argv[3]) || 10;

if (isNaN(numProducts)) {
  console.error('Invalid number of products');
  process.exit(1);
}

generateShopifyCsv(category, numProducts);
