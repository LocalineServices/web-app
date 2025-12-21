/**
 * Copy Swagger UI assets from node_modules to public folder
 * Cross-platform script for postinstall
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'node_modules', 'swagger-ui-dist');
const targetDir = path.join(__dirname, '..', 'public', 'swagger-ui');

const filesToCopy = [
  'swagger-ui.css',
  'swagger-ui-bundle.js',
  'swagger-ui-standalone-preset.js'
];

try {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy each file
  filesToCopy.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied ${file} to public/swagger-ui/`);
    } else {
      console.warn(`Warning: ${file} not found in swagger-ui-dist`);
    }
  });

  console.log('Swagger UI assets copied successfully');
} catch (error) {
  // Fail silently - this might run before swagger-ui-dist is installed
  console.warn('Note: Swagger UI assets will be copied after installing dependencies');
  process.exit(0);
}
