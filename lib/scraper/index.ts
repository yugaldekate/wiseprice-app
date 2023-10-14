"use server"

export async function scrapeAmazonProduct(url: string){
    if(!url) return;

    // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_81866a6e-zone-pricewise:ghjwbz1egm3b -k https://lumtest.com/myip.json

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
        
    } catch (error : any) {
        console.log(`Scraping error : ${error}`);
    }
}