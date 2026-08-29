import {
  CalendarDays,
  GraduationCap,
  HeartPulse,
  TrendingUp,
  Car,
  BookOpen,
  Globe,
  Shirt,
  Folder,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  CalendarDays,
  GraduationCap,
  HeartPulse,
  TrendingUp,
  Car,
  BookOpen,
  Globe,
  Shirt,
};

export function ClusterIcon({
  name,
  className,
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = ICONS[name] || Folder;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}
