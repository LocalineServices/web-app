/**
 * Swagger UI API Documentation endpoint
 * GET /api/docs - Displays interactive API documentation
 */

import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger';

// Generate the HTML for Swagger UI using npm packages
function generateSwaggerHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation - Translations API</title>
  <link rel="stylesheet" href="/swagger-ui/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="/swagger-ui/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="/swagger-ui/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    window.onload = function() {
      const spec = ${JSON.stringify(swaggerSpec)};
      
      window.ui = SwaggerUIBundle({
        spec: spec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
  `.trim();
}

export async function GET() {
  const html = generateSwaggerHTML();
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
