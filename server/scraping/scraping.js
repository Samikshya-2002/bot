// const axios = require("axios");
require("dotenv").config();
const cheerio = require("cheerio");
const puppeteer = require('puppeteer');
const scrapingbee = require('scrapingbee');
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
const NodeCache = require('node-cache');
const fs = require('fs');

async function scrapeDynamicContent() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('https://quotus.co.in/', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);  // Adjust as needed for rotating content
  
    const content = await page.evaluate(() => {
        // Replace '.your-selector' with the correct selector
        return Array.from(document.querySelectorAll('.your-selector')).map(el => el.innerText);
    });
  
    await browser.close();
    return content.join('\n');
  }
  
  // Modified scrapeQuotus function
  // async function scrapeQuotus(query) {
  // const cachedResult = cache.get(query);
  // if (cachedResult) return cachedResult;
  
  // try {
  //   const { data } = await axios.get("https://quotus.co.in/");
  //   const $ = cheerio.load(data);
  //   let result = "";
    
  //   $("div").each((_, elem) => {
  //     const text = $(elem).text();
  //     if (text.toLowerCase().includes(query.toLowerCase())) result += text.trim() + "\n";
  //   });
    
  //   // If no result, use Puppeteer as a fallback for dynamic content
  //   if (!result) result = await scrapeDynamicContent();
  
  //   cache.set(query, result || "No relevant information found.");
  //   return result || "No relevant information found.";
  // } catch {
  //   return "Could not retrieve information.";
  // }
  // }
  // Modified scrapeQuotus function with ScrapingBee fallback
  // async function scrapeQuotus(query) {
  //   const cachedResult = cache.get(query);
  //   if (cachedResult) return cachedResult;
  
  //   try {
  //     // const { data } = await axios.get("https://quotus.co.in/");
  //     const {data} = query;
  //     const $ = cheerio.load(data);
  //     let result = "";
      
  //     $("div").each((_, elem) => {
  //       const text = $(elem).text();
  //       if (text.toLowerCase().includes(query.toLowerCase())) result += text.trim() + "\n";
  //     });
      
  //     if (!result) result = await scrapeDynamicContent();
  //     cache.set(query, result || "No relevant information found.");
  //     console.log("cheerio called")
  //     return result || "No relevant information found.";
  //   } catch (axiosError) {
  //     console.error("Axios failed.");
  //     // const scrapingbeeResult = await scrapeWithScrapingBee("https://quotus.co.in/");
  //     // return scrapingbeeResult;
  //   }
  // }
  // process.env.SCRAPINGBEE_API_KEY
  // async function scrapeQuotus(htmlContent) {
  //   const cacheKey = JSON.stringify(htmlContent);
  //   // const cachedResult = cache.get(htmlContent);
  //   const cachedResult = cache.get(cacheKey);
  //   if (cachedResult) return cachedResult;
  
  //   try {
  //     const $ = cheerio.load(htmlContent);  // Load the HTML content into Cheerio
  //     // let result = "";
  //     let structuredData = {
  //       divs: new Set(),
  //       headings: new Set(),
  //       paragraphs: new Set(),
  //       links: new Set()
  //     };
  
  //     // Extract relevant text from the HTML content using Cheerio
  //     $("div").each((_, elem) => {
  //       const divText = $(elem).text().trim();
  //       if (divText) structuredData.divs.add(divText); 
  //       // if (text.toLowerCase()) {  // Adjust query condition
  //       //   result += text + "\n";
  //       // }
  //     });
  
  //     $("h1, h2, h3, h4, h5, h6").each((_, elem) => {
  //       structuredData.headings.add($(elem).text().trim()); // Add unique headings
  //     });
    
  //     // Extracting paragraphs
  //     $("p").each((_, elem) => {
  //       structuredData.paragraphs.add($(elem).text().trim()); // Add unique paragraphs
  //     });
    
  //     // Extracting links
  //     $("a").each((_, elem) => {
  //       const linkText = $(elem).text().trim();
  //       const linkHref = $(elem).attr('href');
  //       // structuredData.links.add(JSON.stringify({ text: linkText, href: linkHref })); // Add unique links
  //       if (linkText && linkHref) structuredData.links.add(JSON.stringify({ text: linkText, href: linkHref }));
  //     });
  
  //     // structuredData.divs = Array.from(structuredData.divs);
  //     // structuredData.headings = Array.from(structuredData.headings);
  //     // structuredData.paragraphs = Array.from(structuredData.paragraphs);
  //     // structuredData.links = Array.from(structuredData.links).map(link => JSON.parse(link)); // Parse link objects back
  //     structuredData = {
  //       divs: Array.from(structuredData.divs),
  //       headings: Array.from(structuredData.headings),
  //       paragraphs: Array.from(structuredData.paragraphs),
  //       links: Array.from(structuredData.links)
  //     };
  
  
  //     const filePath = path.join(__dirname, '../data/scrapedData.json');
  //     fs.writeFileSync(filePath, JSON.stringify(structuredData, null, 2), 'utf8');
  
  //     // If no relevant text is found, you can process dynamic content if necessary
  //     // if (!result) result = await scrapeDynamicContent();
      
  //     // Cache the result for future use
  //     // cache.set(htmlContent, result || "No relevant information found.");
  //     // cache.set(htmlContent, structuredData || "No relevant information found.");
  //     cache.set(cacheKey, structuredData || "No relevant information found.");
  
  //     console.log("Cheerio processed the HTML content.");
  //     // return result || "No relevant information found.";
  //     return structuredData || "No relevant information found.";
      
  //   } catch (axiosError) {
  //     console.error("Error in Cheerio processing:", axiosError);
  //     return "Error processing the HTML content.";
  //   }
  // }
  async function scrapeQuotus(htmlContent) {
    const cacheKey = JSON.stringify(htmlContent);
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) return cachedResult;
  
    try {
      // Log the HTML content length to verify we're receiving data
      console.log('HTML Content Length:', htmlContent.length);
      
      const $ = cheerio.load(htmlContent);
      
      let structuredData = {
        divs: new Set(),
        headings: new Set(),
        paragraphs: new Set(),
        links: new Set(),
        images:new Set()
      };
  
      // Add logging to check what's being found
      console.log('Processing divs...');
      // $("div").each((index, elem) => {
      //   const divText = $(elem).text().trim();
      //   if (divText) {
      //     structuredData.divs.add(divText);
      //     console.log(`Found div ${index + 1}:`, divText.substring(0, 50) + '...');
      //   }
      // });
      $("div").each((_, elem) => {
        if (!$(elem).closest('nav').length && !$(elem).hasClass('navbar')) {
          const divText = $(elem).text().trim();
          if (divText) structuredData.divs.add(divText);
        }
      });
  
      console.log('Processing headings...');
      $("h1, h2, h3, h4, h5, h6").each((index, elem) => {
        const headingText = $(elem).text().trim();
        if (headingText) {
          structuredData.headings.add(headingText);
          console.log(`Found heading ${index + 1}:`, headingText);
        }
      });
  
      console.log('Processing paragraphs...');
      $("p").each((index, elem) => {
        const paragraphText = $(elem).text().trim();
        if (paragraphText) {
          structuredData.paragraphs.add(paragraphText);
          console.log(`Found paragraph ${index + 1}:`, paragraphText.substring(0) + '...');
        }
      });
  
      console.log('Processing links...');
      $("a").each((index, elem) => {
        const linkText = $(elem).text().trim();
        const linkHref = $(elem).attr('href');
        if (linkText && linkHref) {
          structuredData.links.add(JSON.stringify({ text: linkText, href: linkHref }));
          console.log(`Found link ${index + 1}:`, linkText, linkHref);
        }
      });
  
  
      $("img").each((_, elem) => {
        const imgSrc = $(elem).attr('src');
        const imgAlt = $(elem).attr('alt') || "No description";
        structuredData.images.add(JSON.stringify({ src: imgSrc, alt: imgAlt }));
      });
  
      // Log the counts before conversion
      console.log('Set sizes before conversion:', {
        divs: structuredData.divs.size,
        headings: structuredData.headings.size,
        paragraphs: structuredData.paragraphs.size,
        links: structuredData.links.size,
        images: structuredData.images.size
      });
  
      // Convert Sets to Arrays
      structuredData = {
        divs: Array.from(structuredData.divs),
        headings: Array.from(structuredData.headings),
        paragraphs: Array.from(structuredData.paragraphs),
        links: Array.from(structuredData.links).map(link => {
          try {
            return JSON.parse(link);
          } catch (e) {
            console.error('Error parsing link:', link);
            return null;
          }
        }).filter(link => link !== null),
        images: Array.from(structuredData.images).map(img => JSON.parse(img))
      };
  
      // Log the final structure
      console.log('Final array lengths:', {
        divs: structuredData.divs.length,
        headings: structuredData.headings.length,
        paragraphs: structuredData.paragraphs.length,
        links: structuredData.links.length
      });
  
      const filePath = path.join(__dirname, '../data/scrapedData.json');
      fs.writeFileSync(filePath, JSON.stringify(structuredData, null, 2), 'utf8');
      console.log('Data written to file:', filePath);
  
      cache.set(cacheKey, structuredData || "No relevant information found.");
  
      return structuredData || "No relevant information found.";
  
    } catch (error) {
      console.error("Error in Cheerio processing:", error);
      console.error("Stack trace:", error.stack);
      return "Error processing the HTML content.";
    }
  }
  
  const scrapingbeeClient = new scrapingbee.ScrapingBeeClient(process.env.SCRAPINGBEE_API_KEY);
  
  async function scrapeWithScrapingBee(url) {
    try {
      const response = await scrapingbeeClient.get({
        url: url,
        params: {
          // 'timeout': 140000,
          // 'extract_rules': {exclude:['.navbar']},
          // 'block_resources': 'True',
          // 'ai_query': query,
  
        }, // Add any ScrapingBee parameters if needed
      });
  //     const htmlContent = response.data.toString('utf-8');
  // console.log("RESPONSE>DATA", htmlContent);
  
  //     // console.log("RESPONSE>DATA",response.data)
  //     // return response.data;
  //     return htmlContent;
  var decoder = new TextDecoder('utf-8');
  var text = decoder.decode(response.data);
  // const content = $('body').text();
  console.log("RESPONSE>DATA",text);
  // return content.trim();
  const cheeryquotus = scrapeQuotus(text);
  return cheeryquotus;
  // return text;
    } catch (error) {
      console.error("ScrapingBee Error:", error);
      return "Could not retrieve information.";
    }
  }