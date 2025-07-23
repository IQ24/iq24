import { AITransparencyDashboard } from '@/components/dashboard/ai-transparency-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Transparency Center | IQ24.ai',
  description: 'Complete visibility and control over your AI-powered growth engine',
};

export default function AITransparencyPage() {
  return <AITransparencyDashboard />;
}