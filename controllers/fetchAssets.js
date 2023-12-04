const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

const fetchAndSaveAsset = async (assetUrl, directory, subfolder) => {
    try {
        const assetDirectory = path.join(directory, subfolder);
        await fs.mkdir(assetDirectory, { recursive: true });

        const response = await axios.get(assetUrl, { responseType: 'arraybuffer' });
        const parsedUrl = new URL(assetUrl);
        const assetName = path.basename(parsedUrl.pathname);
        const assetPath = path.join(assetDirectory, assetName);
        await fs.writeFile(assetPath, response.data);

        
        return path.join(subfolder, assetName); 
    } catch (error) {
        console.error(`Error fetching asset ${assetUrl}:`, error.message);
        return null;
    }
};

const extractMetadata = async (url) => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const numLinks = $('a').length;
        const numImages = $('img').length;
        const lastFetch = new Date().toUTCString();

        return { numLinks, numImages, lastFetch };
    } catch (error) {
        console.error(`Error fetching metadata for ${url}:`, error.message);
        return null;
    }
};

const downloadAssets = async (html, baseUrl, directory) => {
    const $ = cheerio.load(html);

    const assetPromises = [];

    $('img').each((_, elem) => {
        const src = $(elem).attr('src');
        if (src) {
            const fullUrl = new URL(src, baseUrl).toString();
            assetPromises.push(
                fetchAndSaveAsset(fullUrl, directory, 'images').then(localPath => {
                    if (localPath) $(elem).attr('src', localPath);
                })
            );
        }
    });

    $('link[rel="stylesheet"]').each((_, elem) => {
        const href = $(elem).attr('href');
        if (href) {
            const fullUrl = new URL(href, baseUrl).toString();
            assetPromises.push(
                fetchAndSaveAsset(fullUrl, directory, 'css').then(localPath => {
                    if (localPath) $(elem).attr('href', localPath);
                })
            );
        }
    });

    $('script[src]').each((_, elem) => {
        const src = $(elem).attr('src');
        if (src) {
            const fullUrl = new URL(src, baseUrl).toString();
            assetPromises.push(
                fetchAndSaveAsset(fullUrl, directory, 'js').then(localPath => {
                    if (localPath) $(elem).attr('src', localPath);
                })
            );
        }
    });

    await Promise.all(assetPromises);

    return $.html();
};

module.exports = { fetchAndSaveAsset, downloadAssets, extractMetadata };