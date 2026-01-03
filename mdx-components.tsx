import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/callout";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Callout,
  };
}
