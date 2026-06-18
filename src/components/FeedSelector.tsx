/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NewsFeedItem, CategoryType } from '../types';
import { Check, Filter, Search, Award, Flame, Plus, X } from 'lucide-react';

interface FeedSelectorProps {
  newsItems: NewsFeedItem[];
  selectedIds: string[];
  onChangeSelection: (ids: string[]) => void;
  keywords: string[];
  onAddKeyword: (kw: string) => void;
  onRemoveKeyword: (kw: string) => void;
}

export default function FeedSelector({
  newsItems,
  selectedIds,
  onChangeSelection,
  keywords,
  onAddKeyword,
  onRemoveKeyword
}: FeedSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTags: { value: CategoryType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Updates' },
    { value: 'agentic-delivery', label: 'Agentic Delivery' },
    { value: 'workforce-adoption', label: 'Workforce Adoption' },
    { value: 'saas-digital-products', label: 'Digital SaaS Platforms' }
  ];

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onChangeSelection(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onChangeSelection([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    const visibleItems = filteredNews.map(item => item.id);
    const allSelected = visibleItems.every(id => selectedIds.includes(id));
    if (allSelected) {
      onChangeSelection(selectedIds.filter(id => !visibleItems.includes(id)));
    } else {
      const union = Array.from(new Set([...selectedIds, ...visibleItems]));
      onChangeSelection(union);
    }
  };

  const filteredNews = newsItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Categories banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Tag Selectors */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {filterTags.map(tag => (
              <button
                key={tag.value}
                onClick={() => setSelectedCategory(tag.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === tag.value
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search news or insights..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-slate-800 focus:bg-white transition-all outline-none text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Dynamic Keywords Controller */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Target Keywords
          </span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {keywords.map(kw => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-700 font-bold uppercase tracking-wide"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => onRemoveKeyword(kw)}
                  className="text-blue-400 hover:text-blue-900 transition-all cursor-pointer rounded-full ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Add keyword..."
                value={newKeywordInput}
                onChange={e => setNewKeywordInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newKeywordInput.trim()) {
                    onAddKeyword(newKeywordInput.trim());
                    setNewKeywordInput('');
                  }
                }}
                className="border border-slate-200 bg-slate-50 rounded px-2 py-1 text-[11px] focus:bg-white outline-none w-24 focus:w-36 transition-all text-slate-800 font-medium"
              />
              <button
                type="button"
                onClick={() => {
                  if (newKeywordInput.trim()) {
                    onAddKeyword(newKeywordInput.trim());
                    setNewKeywordInput('');
                  }
                }}
                className="p-1 bg-slate-900 text-white rounded hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid List Headers / Actions */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
          >
            {filteredNews.every(item => selectedIds.includes(item.id)) ? 'Deselect All' : 'Select All Visible'}
          </button>
          <span className="text-slate-350">|</span>
          <p className="text-xs text-slate-500 font-semibold font-sans">
            Showing <strong className="text-slate-800">{filteredNews.length}</strong> updates • <strong className="text-blue-600 font-bold">{selectedIds.length}</strong> selected for briefing
          </p>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNews.map(item => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => handleToggleSelect(item.id)}
              className={`group flex flex-col justify-between p-6 bg-white border rounded-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'border-blue-500 shadow-sm shadow-blue-50 bg-blue-50/5'
                  : 'border-slate-200 hover:border-slate-350 hover:shadow-xs'
              }`}
            >
              <div className="space-y-3.5">
                {/* Header Metadata */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 group-hover:bg-slate-100/50 group-hover:text-slate-600 transition-all">
                    {item.source}
                  </span>
                  
                  {/* Select Indicators / Impact score */}
                  <div className="flex items-center gap-2">
                    {item.impactScore >= 8 && (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 bg-rose-50 text-[10px] font-mono font-bold text-rose-650 border border-rose-100 rounded">
                        <Flame className="w-3 h-3 fill-rose-500 stroke-rose-600 shrink-0" />
                        CORE {item.impactScore}/10
                      </span>
                    )}
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border border-slate-200 group-hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                {/* News Title */}
                <h3 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(item.url, '_blank', 'noopener,noreferrer');
                  }}
                  className={`font-sans font-bold text-sm tracking-tight leading-snug hover:text-blue-600 hover:underline transition-colors ${isSelected ? 'text-blue-900 font-extrabold' : 'text-slate-800'}`}
                >
                  {item.title}
                </h3>

                {/* News Summary */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans font-normal">
                  {item.summary}
                </p>
              </div>

              {/* Footer Section */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold font-sans">Published {item.publishedAt}</span>
                <div className="flex items-center gap-3">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 font-bold hover:underline hover:text-blue-800 transition-colors flex items-center gap-0.5"
                  >
                    Read Source ↗
                  </a>
                  <span className="capitalize font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                    {item.category.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredNews.length === 0 && (
          <div className="col-span-full py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
            <p className="text-slate-500 text-xs font-semibold">No industry updates found matching search criteria.</p>
            <p className="text-slate-400 text-[11px]">Click "Sync News" above to trigger a fresh Gemini-powered feed sync!</p>
          </div>
        )}
      </div>
    </div>
  );
}
