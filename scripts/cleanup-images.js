import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const imagesDir = path.join(rootDir, 'public', 'images');

async function cleanupImages() {
  console.log('Starting image cleanup process...');
  
  try {
    // Connect to the database
    const db = await open({
      filename: path.join(rootDir, 'database.sqlite'),
      driver: sqlite3.Database
    });
    
    // Get all images from the database
    const events = await db.all('SELECT imageUrl FROM events WHERE imageUrl IS NOT NULL');
    
    // Extract image filenames from URLs
    const databaseImages = new Set(
      events
        .map(event => event.imageUrl)
        .filter(url => url) // Filter out null/undefined
        .map(url => url.replace('/images/', '')) // Extract filename from URL
    );
    
    console.log(`Found ${databaseImages.size} images in the database`);
    
    // Check if images directory exists
    if (!fs.existsSync(imagesDir)) {
      console.log('Images directory does not exist');
      return;
    }
    
    // Get all image files in the directory
    const files = fs.readdirSync(imagesDir);
    console.log(`Found ${files.length} files in the images directory`);
    
    // Find orphaned images (files that exist but are not in the database)
    const orphanedImages = files.filter(file => !databaseImages.has(file));
    console.log(`Found ${orphanedImages.length} orphaned images`);
    
    // Delete orphaned images
    let deletedCount = 0;
    for (const file of orphanedImages) {
      const filePath = path.join(imagesDir, file);
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`Deleted: ${file}`);
      } catch (err) {
        console.error(`Error deleting ${file}: ${err.message}`);
      }
    }
    
    console.log(`Cleanup complete. Deleted ${deletedCount} orphaned images.`);
    
    await db.close();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupImages(); 