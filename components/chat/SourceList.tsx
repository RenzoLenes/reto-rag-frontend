'use client';

import { Source } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SourceListProps {
  sources: Source[];
}

export function SourceList({ sources }: SourceListProps) {
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  if (sources.length === 0) return null;

  const toggleExpanded = (sourceId: string) => {
    setExpandedSource(expandedSource === sourceId ? null : sourceId);
  };

  // 🔹 Agrupar por documento
  const grouped = sources.reduce<Record<string, { fileName: string; documentId: string; pages: Source[] }>>(
    (acc, src) => {
      if (!acc[src.documentId]) {
        acc[src.documentId] = {
          fileName: src.fileName,
          documentId: src.documentId,
          pages: [],
        };
      }
      acc[src.documentId].pages.push(src);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
        <FileText className="h-3 w-3" />
        <span className="font-medium">Sources ({Object.keys(grouped).length})</span>
      </div>

      {Object.values(grouped).map((doc) => {
        const isExpanded = expandedSource === doc.documentId;

        // ordenar páginas por número
        const sortedPages = [...doc.pages].sort((a, b) => a.page - b.page);

        return (
          <Card key={doc.documentId} className="p-3 bg-gray-50 border-gray-200">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-3 w-3 text-gray-500 flex-shrink-0" />
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {doc.fileName}
                  </p>
                  <span className="text-xs text-gray-500">
                    Pages {sortedPages.map((p) => p.page).join(', ')}
                  </span>
                </div>

                {sortedPages.map((page) => (
                  <div
                    key={`${doc.documentId}-${page.page}`}
                    className={cn(
                      'text-xs text-gray-600 leading-relaxed',
                      isExpanded ? '' : 'line-clamp-2'
                    )}
                  >
                    {page.excerpt}
                  </div>
                ))}

                <div className="flex items-center justify-end">
                  {(sortedPages.some((p) => (p.excerpt?.length ?? 0) > 150)) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1 text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => toggleExpanded(doc.documentId)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          More
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
