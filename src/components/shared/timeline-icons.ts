import {
  Activity,
  ClipboardCheck,
  ClipboardList,
  Dumbbell,
  Flag,
  Send,
  Target,
} from 'lucide-react';
import type { TimelineEventType } from '@/lib/types';

export const timelineIcon: Record<TimelineEventType, typeof Activity> = {
  ASSESSMENT: ClipboardCheck,
  REFERRAL: Send,
  PROGRAM: ClipboardList,
  EXERCISE: Dumbbell,
  MILESTONE: Flag,
  KPI: Activity,
  GOAL: Target,
};
