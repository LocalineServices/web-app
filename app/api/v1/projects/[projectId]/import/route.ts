import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { authenticateRequest, isAuthorized } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions (editor or admin)
    if (!isAuthorized(request.method, auth.apiKeyRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify project access
    if (auth.isApiKey && auth.projectId !== projectId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const format = formData.get('format') as string;
    const localeCode = formData.get('localeCode') as string;
    const updateExisting = formData.get('updateExisting') === 'true';

    if (!file || !format || !localeCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get locale using Prisma
    const locale = await prisma.locale.findFirst({
      where: {
        projectId,
        code: localeCode
      }
    });

    if (!locale) {
      return NextResponse.json({ error: 'Locale not found' }, { status: 404 });
    }

    // Read file content
    const content = await file.text();
    let translations: Record<string, string> = {};

    // Parse based on format
    if (format === 'json') {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      // Handle both flat and nested JSON
      const flattenObject = (obj: Record<string, unknown>, prefix = ''): Record<string, string> => {
        let result: Record<string, string> = {};
        for (const key in obj) {
          const value = obj[key];
          const newKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            result = { ...result, ...flattenObject(value as Record<string, unknown>, newKey) };
          } else {
            result[newKey] = String(value);
          }
        }
        return result;
      };
      translations = flattenObject(parsed);
    } else if (format === 'csv') {
      const lines = content.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      // Find key column and locale column
      const keyIndex = headers.findIndex(h => h.toLowerCase() === 'key');
      const localeIndex = headers.findIndex(h => h === localeCode || h.toLowerCase() === 'value');
      
      if (keyIndex === -1) {
        return NextResponse.json({ error: 'CSV must have a "key" column' }, { status: 400 });
      }

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (values.length > keyIndex) {
          const key = values[keyIndex];
          const value = localeIndex !== -1 ? values[localeIndex] : values[1];
          if (key && value) {
            translations[key] = value;
          }
        }
      }
    } else if (format === 'yaml') {
      // Simple YAML parsing (supports basic key: value format)
      const lines = content.split('\n');
      let currentPath: string[] = [];
      
      for (const line of lines) {
        const trimmed = line.trimStart();
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        const indent = line.length - trimmed.length;
        const colonIndex = trimmed.indexOf(':');
        
        if (colonIndex !== -1) {
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
          
          // Adjust path based on indent
          const level = Math.floor(indent / 2);
          currentPath = currentPath.slice(0, level);
          
          if (value) {
            // It's a leaf node
            const fullKey = [...currentPath, key].join('.');
            translations[fullKey] = value;
          } else {
            // It's a parent node
            currentPath.push(key);
          }
        }
      }
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

    // Import translations
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const [termValue, translationValue] of Object.entries(translations)) {
      // Find or create term
      let term = await prisma.term.findFirst({
        where: {
          projectId,
          value: termValue
        }
      });

      const isNewTerm = !term;
      
      if (!term) {
        term = await prisma.term.create({
          data: {
            id: nanoid(),
            projectId,
            value: termValue
          }
        });
      }

      // Check if translation exists
      const existing = await prisma.translation.findFirst({
        where: {
          termId: term.id,
          localeId: locale.id
        }
      });

      if (existing) {
        if (updateExisting) {
          await prisma.translation.update({
            where: { id: existing.id },
            data: { value: translationValue }
          });
          updated++;
        } else {
          skipped++;
        }
      } else {
        await prisma.translation.create({
          data: {
            id: nanoid(),
            termId: term.id,
            localeId: locale.id,
            value: translationValue
          }
        });
        if (isNewTerm) {
          created++;
        } else {
          updated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        total: Object.keys(translations).length,
        created,
        updated,
        skipped,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to import translations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
