export type ServiceId = 'branding' | 'web' | 'ecommerce' | 'ai' | 'software' | 'merch';

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceBenefit {
  title: string;
  description: string;
}

export interface ServiceProcessStep {
  phase: string;
  title: string;
  description: string;
}

export interface ServiceDetail {
  id: ServiceId;
  title: string;
  tagline: string;
  description: string;
  color: string;
  iconName: string;
  benefits: ServiceBenefit[];
  process: ServiceProcessStep[];
  faq: ServiceFAQ[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  category: string;
  serviceId: ServiceId;
  description: string;
  result: string;
  imageUrl: string;
  tags: string[];
}

export interface BlogArticle {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  content: string;
  imageUrl: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  content: string;
  avatarUrl: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
