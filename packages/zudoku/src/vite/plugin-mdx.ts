import rehypeMetaAsAttributes from "@lekoarts/rehype-meta-as-attributes";
import mdx, { type Options } from "@mdx-js/rollup";
import withToc from "@stefanprobst/rehype-extract-toc";
import withTocExport from "@stefanprobst/rehype-extract-toc/mdx";
import path from "node:path";
import rehypeSlug from "rehype-slug";
import remarkComment from "remark-comment";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { visit } from "unist-util-visit";
import { Plugin } from "vite";
import { ZudokuPluginOptions } from "../config/config.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rehypeCodeBlockPlugin = () => (tree: any) => {
  visit(tree, "element", (node, index, parent) => {
    if (node.tagName === "code") {
      node.properties.inline = parent?.tagName !== "pre";
    }
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const remarkLinkRewritePlugin = () => (tree: any) => {
  visit(tree, "link", (node) => {
    if (!node.url) return;

    if (!node.url.startsWith("http") && !node.url.startsWith("/")) {
      node.url = path.join("../", node.url);
    }

    node.url = node.url.replace(/\.mdx?(#.*?)?/, "$1");
  });
};

export type DevPortalPluginOptions = {
  mode: ZudokuPluginOptions["mode"];
  remarkPlugins?: Options["remarkPlugins"];
  rehypePlugins?: Options["rehypePlugins"];
};

const viteMdxPlugin = (config: ZudokuPluginOptions): Plugin => {
  return {
    enforce: "pre",
    ...mdx({
      providerImportSource:
        config.mode === "internal" || config.mode === "standalone"
          ? "@mdx-js/react"
          : "zudoku/components",
      remarkPlugins: [
        remarkComment,
        remarkGfm,
        remarkFrontmatter,
        remarkMdxFrontmatter,
        remarkDirective,
        remarkDirectiveRehype,
        remarkLinkRewritePlugin,
        ...(config.build?.remarkPlugins ?? []),
      ],
      rehypePlugins: [
        rehypeSlug,
        rehypeCodeBlockPlugin,
        rehypeMetaAsAttributes,
        withToc,
        withTocExport,
        ...(config.build?.rehypePlugins ?? []),
      ],
    }),
    name: "zudoku-mdx-plugin",
  };
};

export default viteMdxPlugin;
