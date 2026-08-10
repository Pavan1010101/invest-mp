/**
 * SISMP — Queue + Detail Pattern Component
 * Master pattern for data-dense staff screens (Approvals, CRM, Pavilions, etc.).
 * Left pane: search, filters, list/queue table.
 * Right pane: selected item record detail, action toolbar, tabs, and audit log.
 */
'use client';

import React, { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface QueueItem {
  id: string;
  [key: string]: any;
}

interface QueueDetailProps<T extends QueueItem> {
  title: string;
  subtitle?: string;
  items: T[];
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  renderListItem: (item: T, isSelected: boolean) => ReactNode;
  renderDetail: (item: T) => ReactNode;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  filterOptions?: { key: string; label: string; options: { value: string; label: string }[] }[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (filterKey: string, value: string) => void;
  emptyState?: ReactNode;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
}

export function QueueDetail<T extends QueueItem>({
  title,
  subtitle,
  items,
  selectedId,
  onSelectItem,
  renderListItem,
  renderDetail,
  searchPlaceholder = 'Search records...',
  onSearchChange,
  filterOptions,
  activeFilters,
  onFilterChange,
  emptyState,
  primaryAction,
  secondaryActions,
}: QueueDetailProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const selectedItem = items.find((item) => item.id === selectedId) || (items.length > 0 ? items[0] : null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (onSearchChange) onSearchChange(q);
  };

  const handleSelect = (id: string) => {
    onSelectItem(id);
    setShowMobileDetail(true);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background">
      {/* Top Bar / Header Chrome */}
      <div className="h-16 px-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-foreground-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {secondaryActions}
          {primaryAction}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Queue List */}
        <div
          className={cn(
            'w-full lg:w-[420px] xl:w-[460px] flex flex-col border-r border-border bg-surface shrink-0 transition-all duration-300',
            showMobileDetail ? 'hidden lg:flex' : 'flex'
          )}
        >
          {/* Search & Filter Toolbar */}
          <div className="p-4 border-b border-border space-y-3 bg-surface">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle pointer-events-none" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      if (onSearchChange) onSearchChange('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {filterOptions && filterOptions.length > 0 && (
                <Button
                  variant={showFilters ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="shrink-0"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Filter Drawer */}
            {showFilters && filterOptions && (
              <div className="p-3 bg-background rounded-lg border border-border space-y-2 animate-fade-in text-xs">
                {filterOptions.map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground-muted">{opt.label}:</span>
                    <select
                      value={activeFilters?.[opt.key] || ''}
                      onChange={(e) => onFilterChange?.(opt.key, e.target.value)}
                      className="px-2 py-1 rounded border border-border bg-surface text-foreground focus:outline-none text-xs"
                    >
                      <option value="">All</option>
                      {opt.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* List Counter */}
          <div className="px-4 py-2 bg-background border-b border-border/60 text-xs font-medium text-foreground-muted flex justify-between items-center">
            <span>Showing {items.length} records</span>
          </div>

          {/* Queue Items Scroll View */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {items.length === 0 ? (
              <div className="p-8 text-center text-foreground-muted text-sm">
                {emptyState || 'No records found matching criteria'}
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={cn(
                    'p-4 cursor-pointer transition-all duration-150 relative border-l-4',
                    (selectedItem?.id === item.id)
                      ? 'bg-primary-50/70 border-primary shadow-sm'
                      : 'bg-surface border-transparent hover:bg-background'
                  )}
                >
                  {renderListItem(item, selectedItem?.id === item.id)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Record Detail */}
        <div
          className={cn(
            'flex-1 flex flex-col bg-background overflow-hidden',
            !showMobileDetail ? 'hidden lg:flex' : 'flex'
          )}
        >
          {/* Mobile Back Header */}
          <div className="lg:hidden h-12 px-4 border-b border-border bg-surface flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileDetail(false)}
            >
              <ChevronLeft className="w-4 h-4" /> Back to Queue
            </Button>
          </div>

          {/* Detail View Container */}
          {selectedItem ? (
            <div className="flex-1 overflow-y-auto p-6">
              {renderDetail(selectedItem)}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-foreground-muted">
              Select an item from the queue to view full details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
