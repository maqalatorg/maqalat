import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { VideoEmbed } from "@/components/VideoEmbed";

/**
 * Global MDX component overrides. Available in every .mdx article
 * WITHOUT needing to import.
 */
export const mdxComponents: MDXComponents = {
  // Prevent full page reload on internal links; open externals in new tab
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
  // Native <img> with lazy loading (works for GIF/SVG/webp too)
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img loading="lazy" decoding="async" {...props} />
  ),
  // Custom components accessible directly in MDX without imports
  Image,
  VideoEmbed,
};

/**
 * Required by @next/mdx — returns the merged components map.
 * See: https://nextjs.org/docs/app/building-your-application/configuring/mdx
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...mdxComponents, ...components };
}
