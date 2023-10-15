"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';

import { extractPrice } from '../utils';

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
         
        //all images present in a object where key is image url and value is the image dimension array
        //example {"https://m.media-amazon.com.jpg":[450,450], "https://m.media-amazon.com.jpg":[450,550]}
        const images = 
            $('#imgBlkFront').attr('data-a-dynamic-image') || 
            $('#landingImage').attr('data-a-dynamic-image') ||
            '{}'

        //take only image object keys i.e., the image url's
        //example {https://m.media-amazon.com.jpg, https://m.media-amazon.com.jpg}
        const imageUrls = Object.keys(JSON.parse(images));    
        
        console.log("Title --> ", title);
        console.log("current Price --> ", currentPrice);
        console.log("original Price --> ", originalPrice);
        console.log(outOfStock);
        console.log("Images --> " , images);
        
        
        
        
        
    } catch (error : any) {
        console.log(`Scraping error : ${error}`);
    }
}