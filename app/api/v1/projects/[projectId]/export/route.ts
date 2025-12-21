import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify project access
    if (auth.isApiKey && auth.projectId !== projectId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json-flat';
    const localesParam = searchParams.get('locales') || '';
    const includeEmpty = searchParams.get('includeEmpty') === 'true';
    
    const localeCodes = localesParam.split(',').filter(Boolean);

    if (localeCodes.length === 0) {
      return NextResponse.json({ error: 'No locales specified' }, { status: 400 });
    }

    // Get all terms with their translations using Prisma
    const terms = await prisma.term.findMany({
      where: { projectId },
      include: {
        translations: {
          where: {
            locale: {
              code: { in: localeCodes }
            }
          },
          include: {
            locale: true
          }
        }
      },
      orderBy: { value: 'asc' }
    });

    // Build translations array from Prisma result
    const translations = terms.flatMap(term =>
      localeCodes.map(localeCode => {
        const translation = term.translations.find(t => t.locale.code === localeCode);
        return {
          term_id: term.id,
          term_value: term.value,
          locale_code: localeCode,
          value: translation?.value || null
        };
      })
    );

    // Build export data based on format
    let exportData: string;
    let contentType: string;
    let filename: string;

    if (format === 'json-flat') {
      const data: Record<string, Record<string, string>> = {};
      localeCodes.forEach(code => {
        data[code] = {};
      });

      translations.forEach(t => {
        if (t.value || includeEmpty) {
          data[t.locale_code][t.term_value] = t.value || '';
        }
      });

      exportData = JSON.stringify(data, null, 2);
      contentType = 'application/json';
      filename = `translations.json`;
    } else if (format === 'json-nested') {
      const data: Record<string, Record<string, unknown>> = {};
      localeCodes.forEach(code => {
        data[code] = {};
      });

      translations.forEach(t => {
        if (t.value || includeEmpty) {
          const parts = t.term_value.split('.');
          let current: Record<string, unknown> = data[t.locale_code];
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = {};
            }
            current = current[parts[i]] as Record<string, unknown>;
          }
          current[parts[parts.length - 1]] = t.value || '';
        }
      });

      exportData = JSON.stringify(data, null, 2);
      contentType = 'application/json';
      filename = `translations.json`;
    } else if (format === 'csv') {
      const headers = ['key', ...localeCodes];
      const rows = [headers.join(',')];

      const termMap: Record<string, Record<string, string>> = {};
      translations.forEach(t => {
        if (!termMap[t.term_value]) {
          termMap[t.term_value] = {};
        }
        termMap[t.term_value][t.locale_code] = t.value || '';
      });

      Object.entries(termMap).forEach(([key, localeValues]) => {
        if (includeEmpty || Object.values(localeValues).some(v => v)) {
          const row = [
            `"${key}"`,
            ...localeCodes.map(code => `"${(localeValues[code] || '').replace(/"/g, '""')}"`)
          ];
          rows.push(row.join(','));
        }
      });

      exportData = rows.join('\n');
      contentType = 'text/csv';
      filename = `translations.csv`;
    } else if (format === 'yaml') {
      const data: Record<string, Record<string, unknown>> = {};
      localeCodes.forEach(code => {
        data[code] = {};
      });

      translations.forEach(t => {
        if (t.value || includeEmpty) {
          const parts = t.term_value.split('.');
          let current: Record<string, unknown> = data[t.locale_code];
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = {};
            }
            current = current[parts[i]] as Record<string, unknown>;
          }
          current[parts[parts.length - 1]] = t.value || '';
        }
      });

      // Simple YAML serialization
      const yamlLines: string[] = [];
      Object.entries(data).forEach(([locale, translations]) => {
        yamlLines.push(`${locale}:`);
        const renderYaml = (obj: Record<string, unknown>, indent = 2): void => {
          Object.entries(obj).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              yamlLines.push(`${' '.repeat(indent)}${key}:`);
              renderYaml(value as Record<string, unknown>, indent + 2);
            } else {
              yamlLines.push(`${' '.repeat(indent)}${key}: "${value}"`);
            }
          });
        };
        renderYaml(translations);
      });

      exportData = yamlLines.join('\n');
      contentType = 'application/x-yaml';
      filename = `translations.yaml`;
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to export translations' },
      { status: 500 }
    );
  }
}
