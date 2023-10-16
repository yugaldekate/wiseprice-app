"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';

import { extractPrice, extractCurrency, extractDescription } from '../utils';

export async function scrapeAmazonProduct(url: string){
    if(!url) return;

    
    //Brightdata Proxy Configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);

    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;

    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password : password,
        },
        host:'brd.superproxy.io',
        port: port,
        rejectUnauthorized: false,
    }

    try {

        // Fetch the product page
        const response = await axios.get(url, options);

        //parse the HTML page
        const $ = cheerio.load(response.data);
        
        // Extract the product title
        const title = $('#productTitle').text().trim();

        //extract the product current price
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('.a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
        );
        
        //extract the product original price
        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        );

        //check the product is outOfStock
        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';
         
        // all images present in a object where key is image url and value is the image dimension array
        // example {"https://m.media-amazon.com.jpg":[450,450], "https://m.media-amazon.com.jpg":[450,550]}
        const images = 
            $('#imgBlkFront').attr('data-a-dynamic-image') || 
            $('#landingImage').attr('data-a-dynamic-image') ||
            '{}'

        //take only image object keys i.e., the image url's
        //example {https://m.media-amazon.com.jpg, https://m.media-amazon.com.jpg}
        const imageUrls = Object.keys(JSON.parse(images));    

        const currency = extractCurrency($('.a-price-symbol'));

        //remove '-' or '%' signs from the discount e.g -12% to 12
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");

        const description = extractDescription($)
        
        // Constructed data object with scraped information
        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            category: 'category',
            reviewsCount:100,
            stars: 4.5,
            isOutOfStock: outOfStock,
            description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
        }
        
        return data;
        
    } catch (error : any) {
        console.log(`Scraping error : ${error}`);
    }
}