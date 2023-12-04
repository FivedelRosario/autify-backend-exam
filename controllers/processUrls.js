const { fetchAndSaveAsset, extractMetadata, downloadAssets } = require('./fetchAssets');
const { exec } = require('child_process');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const fetchPageAndAssets = async (url) => {
    try {
        const response = await axios.get(url);
        const hostname = new URL(url).hostname;
        const directory = path.join('./sites/', hostname);
        await fs.mkdir(directory, { recursive: true });

        let html = response.data;
        html = await downloadAssets(html, url, directory);

        const filePath = path.join(directory, 'index.html');
        await fs.writeFile(filePath, html);
        await fs.writeFile(filePath, html);
        console.log(`Page and assets saved to ${directory}`);

        openHtmlFile(filePath);
    } catch (error) {
        console.error(`Error processing ${url}:`, error.message);
    }
};


const processUrl = async (url, metadataFlag) => {
    try {
        const html = await fetchPageAndAssets(url.trim()); 
        if (metadataFlag) {
            const metadata = await extractMetadata(html); 
            console.log(`site: ${url}`);
            console.log(`num_links: ${metadata.numLinks}`);
            console.log(`images: ${metadata.numImages}`);
            console.log(`last_fetch: ${metadata.lastFetch}`);
        }
    } catch (error) {
        console.error(`Error processing ${url}:`, error.message);
    }
};


const openHtmlFile = (filePath) => {
    const openCommand = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${openCommand} ${filePath}`, (err) => {
        if (err) {
            console.error(`Failed to open ${filePath}:`, err);
        }
    });
};

module.exports = { processUrl };
