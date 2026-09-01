import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { VideoEmbed } from "@/components/VideoEmbed";
import { SalaryCalendar } from "@/components/SalaryCalendar";
import { HijriConverter } from "@/components/HijriConverter";
import { AgeCalculator } from "@/components/AgeCalculator";
import { AgeDifference } from "@/components/AgeDifference";
import { PregnancyCalculator } from "@/components/PregnancyCalculator";
import { MenstrualCycleCalculator } from "@/components/MenstrualCycleCalculator";
import { EventCountdown } from "@/components/EventCountdown";
import { ZakatCalculator } from "@/components/ZakatCalculator";
import { BMICalculator } from "@/components/BMICalculator";

export const mdxComponents: MDXComponents = {
  a: ({ href = "", children, ...rest }) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return (
        <Link href={href} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  },
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img loading="lazy" decoding="async" {...props} />
  ),
  // Media
  Image,
  VideoEmbed,
  // Interactive tools available in any MDX article
  SalaryCalendar,
  HijriConverter,
  AgeCalculator,
  AgeDifference,
  PregnancyCalculator,
  MenstrualCycleCalculator,
  EventCountdown,
  ZakatCalculator,
  BMICalculator,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...mdxComponents, ...components };
}
