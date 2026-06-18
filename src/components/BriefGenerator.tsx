/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Sparkles, Check, Clipboard, CalendarCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { DigestHistory, NewsFeedItem } from '../types';

interface BriefGeneratorProps {
  selectedIds: string[];
  recipientEmail: string;
  onSetRecipientEmail: (email: string) => void;
  reportMarkdown: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onSendEmail: (subject: string) => Promise<boolean>;
  isSending: boolean;
  history: DigestHistory[];
  needsAuth: boolean;
  onLogin: () => void;
  newsItems: NewsFeedItem[];
}

export default function BriefGenerator({
  selectedIds,
  recipientEmail,
  onSetRecipientEmail,
  reportMarkdown,
  isGenerating,
  onGenerate,
  onSendEmail,
  isSending,
  history,
  needsAuth,
  onLogin,
  newsItems
}: BriefGeneratorProps) {
  const [customSubject, setCustomSubject] = useState('Enterprise Technology Advisory Digest: Agentic Delivery & Team topologies');
  const [copied, setCopied] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Robust internal Markdown to HTML parser for high durability
  const renderMarkdownText = (md: string) => {
    if (!md) return null;
    
    const lines = md.split('\n');
    return (
      <div className="font-sans text-xs text-slate-700 space-y-4 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;

          // Headers using Design HTML's beautiful left-border marker
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-sans font-bold text-slate-900 border-l-4 border-blue-500 pl-3 leading-tight mt-6 first:mt-0">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-sans font-extrabold text-sm text-slate-900 border-l-4 border-blue-600 pl-3.5 leading-tight mt-8 first:mt-0">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={idx} className="font-sans font-black text-base text-slate-900 border-l-4 border-blue-700 pl-4 leading-tight mt-8 first:mt-0">
                {trimmed.replace('# ', '')}
              </h2>
            );
          }

          // Bullet points
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const rawContent = trimmed.substring(2);
            return (
              <ul key={idx} className="list-disc pl-5 space-y-1">
                <li className="text-slate-650">
                  {parseInlineFormatting(rawContent)}
                </li>
              </ul>
            );
          }

          // Numbered lists
          const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
          if (numMatch) {
            return (
              <ol key={idx} className="list-decimal pl-5 space-y-1">
                <li className="text-slate-650">
                  {parseInlineFormatting(numMatch[2])}
                </li>
              </ol>
            );
          }

          // Default paragraph
          return (
            <p key={idx} className="text-slate-650 font-sans tracking-wide">
              {parseInlineFormatting(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  const parseInlineFormatting = (text: string) => {
    // Basic bold parsing: **text** -> strong
    const parts = text.split('**');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-slate-850 font-mono text-[10px] bg-slate-100 border border-slate-200/60 px-1 py-0.5 rounded">{part}</strong>;
      }
      return part;
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyHtml = () => {
    // Generate beautiful styled table/layout markup identical to the system email
    const selectedItems = newsItems.filter(it => selectedIds.includes(it.id));
    const referencesHtml = selectedItems.length > 0 
      ? `
  <!-- Original References Section -->
  <div style="margin-top: 30px; padding-top: 15px; border-top: 1px dashed #e5e7eb;">
    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #4b5563; font-weight: 700; margin: 0 0 10px 0;">Verified References & Original Sources:</p>
    <ul style="padding-left: 20px; margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
      ${selectedItems.map(item => `
        <li style="margin-bottom: 8px;">
          <strong style="color: #111827;">${item.source}</strong>: 
          <a href="${item.url}" target="_blank" rel="noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 500;">
            ${item.title}
          </a>
        </li>
      `).join('')}
    </ul>
  </div>
      `
      : '';

    const styledHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937; background-color: #ffffff; border: 1px solid #f3f4f6; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <!-- Header -->
  <div style="border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px;">
    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #2563eb; font-weight: bold; margin: 0 0 5px 0;">Executive Technology Intelligence Briefing</p>
    <h1 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 5px 0;">Agentic Delivery News Digest</h1>
    <p style="font-size: 12px; color: #6b7280; margin: 0;">Digest pre-compiled for: <b>${recipientEmail}</b></p>
  </div>

  <!-- Body Output -->
  <div style="font-size: 14px; line-height: 1.6; color: #374151;">
    ${reportMarkdown
      .replace(/### (.*)/g, '<h3 style="font-size: 15px; font-weight: bold; color: #111827; margin: 24px 0 10px 0; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #111827; background-color: #f3f4f6; padding: 1px 4px; border-radius: 4px; font-family: monospace; font-size: 12px;">$1</strong>')
      .replace(/\*- (.*)/g, '<li style="margin-bottom: 6px; list-style-type: square; margin-left: 15px;">$1</li>')
      .replace(/\n/g, '<br />')}
  </div>

  ${referencesHtml}

  <!-- Footer -->
  <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; text-align: center;">
    <p style="margin: 0 0 5px 0;">This transmission is private and belongs to the configured dashboard recipient.</p>
    <p style="margin: 0;">&copy; 2026 Agentic Delivery Systems Ltd. All rights reserved.</p>
  </div>
</div>
    `.trim();

    navigator.clipboard.writeText(styledHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const dispatchEmail = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (needsAuth) {
        setErrorMsg('Please connect your Gmail account via Google Auth first.');
        return;
      }
      const success = await onSendEmail(customSubject);
      if (success) {
        setSuccessMsg(`Advisory Digest Dispatched successfully to ${recipientEmail}!`);
      } else {
        setErrorMsg('Failed to send email. Check API configurations or try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while dispatching newsletter.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-150 pb-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" /> Executive Digest Builder
          </h2>
          <p className="text-xs text-slate-500 font-medium">Compose customized digests using selected news cards</p>
        </div>
      </div>

      {/* Recipient Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recipient Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={recipientEmail}
              onChange={e => onSetRecipientEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:bg-white outline-none text-slate-800 font-sans font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5 col-span-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Newsletter Subject Line</label>
          <input
            type="text"
            value={customSubject}
            onChange={e => setCustomSubject(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white outline-none text-slate-800 font-sans font-medium"
          />
        </div>
      </div>

      {/* Controls Container */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
        <button
          onClick={onGenerate}
          disabled={isGenerating || selectedIds.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-950 text-white rounded-lg hover:bg-slate-800 transition-all font-sans font-bold text-xs disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-500" />}
          {isGenerating ? 'AI Architect Reasoning...' : 'Draft Digest with Gemini'}
        </button>

        {reportMarkdown && (
          <>
            <button
              onClick={dispatchEmail}
              disabled={isSending}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 transition-all rounded-lg font-sans font-bold text-xs disabled:bg-blue-300 cursor-pointer shadow-md text-nowrap"
            >
              <Mail className="w-3.5 h-3.5" />
              {isSending ? 'Dispatching...' : 'Email Digest via Gmail'}
            </button>

            <button
              onClick={handleCopyHtml}
              className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-305 text-blue-700 hover:bg-blue-50/40 border-blue-200 transition-all rounded-lg font-sans font-bold text-xs cursor-pointer shadow-xs text-nowrap"
            >
              {copiedHtml ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Mail className="w-3.5 h-3.5 text-blue-600" />}
              {copiedHtml ? 'HTML Copied!' : 'Copy HTML Newsletter'}
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all rounded-lg font-sans font-semibold text-xs cursor-pointer shadow-xs text-nowrap"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy markdown'}
            </button>
          </>
        )}

        {selectedIds.length === 0 && (
          <p className="text-[10px] text-slate-400 font-bold ml-auto animate-pulse uppercase tracking-wider">
            Select 1+ intelligence cards below to activate draft tool
          </p>
        )}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-lg text-xs font-semibold">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-150 text-red-808 rounded-lg text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-red-600" />
          {errorMsg}
          {needsAuth && (
            <button onClick={onLogin} className="underline text-red-900 font-bold ml-auto cursor-pointer">
              Login Google Auth
            </button>
          )}
        </div>
      )}

      {/* Draft Workspace Board */}
      {reportMarkdown ? (
        <div className="border border-slate-200 rounded-xl bg-slate-50/20 shadow-sm max-h-[480px] overflow-y-auto">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">AI Generated Draft Preview</span>
            <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-full">Gemini 2.5 Active</span>
          </div>
          <div className="p-6">{renderMarkdownText(reportMarkdown)}</div>
        </div>
      ) : (
        <div className="h-64 border border-dashed border-slate-350 bg-slate-50/50 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-slate-300 animate-pulse" />
          <h4 className="text-slate-650 font-bold text-xs">No draft currently generated</h4>
          <p className="text-[11px] text-slate-400 max-w-sm">
            Check target intelligence logs below, click select checkbox targets, and hit "Draft Digest" to trigger professional analysis.
          </p>
        </div>
      )}

      {/* Dispatch History log */}
      {history.length > 0 && (
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4" /> Digest Dispatch History Logs
          </h4>
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {history.map(hist => (
              <div key={hist.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg text-xs bg-slate-50/60 leading-tight">
                <div>
                  <p className="font-semibold text-slate-800 truncate max-w-[280px]">{hist.subject}</p>
                  <p className="text-[10px] text-slate-400">To {hist.recipient} • Sent {new Date(hist.sentAt).toLocaleString()}</p>
                </div>
                <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                  hist.status === 'delivered' ? 'bg-emerald-55 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-850 border border-red-100'
                }`}>
                  {hist.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
