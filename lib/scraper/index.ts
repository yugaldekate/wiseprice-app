"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';

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
        
        
        
        
    } catch (error : any) {
        console.log(`Scraping error : ${error}`);
    }
}