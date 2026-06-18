/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryType = 'agentic-delivery' | 'saas-digital-products' | 'workforce-adoption' | 'general-ai';

export interface NewsFeedItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  category: CategoryType;
  content: string;
  impactScore: number; // 1 to 10
}

export interface DigestConfig {
  keywords: string[];
  frequency: 'twice-weekly' | 'daily' | 'weekly';
  recipientEmail: string;
  sources: string[];
}

export interface DigestHistory {
  id: string;
  sentAt: string;
  itemIds: string[];
  subject: string;
  aiSummaryText: string;
  recipient: string;
  status: 'delivered' | 'failed';
}

export interface StepGuideNode {
  id: string;
  title: string;
  duration: string;
  shortDesc: string;
  details: string[];
  icon: string;
}
