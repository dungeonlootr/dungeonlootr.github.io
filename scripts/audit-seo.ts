import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { siteConfig } from "../config/site";
import type { HomePageDefinition, SeoPageDefinition } from "../config/types";
import { homePage } from "../content/home";
import { enabledCorePages, enabledPages } from "../content/registry";
import { pagePlainText, termCount, wordCount } from "../lib/content";
import { absoluteUrl } from "../lib/urls";

const output = join(process.cwd(), "out");
const errors: string[] = [];

function collectHtml(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? collectHtml(path) : path.endsWith(".html") ? [path] : [];
  });
}

function count(html: string, pattern: RegExp) {
  return (html.match(pattern) ?? []).length;
}

function routeForFile(path: string) {
  const local = relative(output, path).split(sep).join("/");
  if (local === "index.html") return "/";
  if (local.endsWith("/index.html")) return `/${local.slice(0, -"/index.html".length)}/`;
  return `/${local}`;
}

function hrefs(html: string) {
  return [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((match) => ({
    href: match[1],
    text: match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  }));
}

function normalizeInternalHref(href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  const withoutQuery = href.split(/[?#]/)[0];
  const base = siteConfig.hosting.basePath.replace(/\/+$/, "");
  const route = base && withoutQuery.startsWith(`${base}/`) ? withoutQuery.slice(base.length) : withoutQuery;
  return route || "/";
}

if (!existsSync(output)) {
  console.error("SEO audit failed: out/ does not exist. Run the production build first.");
  process.exit(1);
}

const expectedRoutes = new Set(["/", ...enabledPages.map((page) => `/${page.slug}/`)]);
const files = collectHtml(output).filter((path) => {
  const route = routeForFile(path);
  const isFrameworkFallback = route === "/404/" || route === "/_not-found/" || route === "/404.html" || route === "/_not-found.html";
  const isGoogleSearchConsoleVerification = /^\/google[a-z0-9]+\.html$/i.test(route);
  return !isFrameworkFallback && !isGoogleSearchConsoleVerification;
});
const actualRoutes = new Set(files.map(routeForFile));

for (const route of expectedRoutes) if (!actualRoutes.has(route)) errors.push(`${route}: expected static page is missing`);
for (const route of actualRoutes) if (!expectedRoutes.has(route)) errors.push(`${route}: generated HTML has no enabled registry page`);

const knownRoutes = new Set(["/", ...enabledPages.map((page) => `/${page.slug}/`)]);
const seenTitles = new Map<string, string>();
const seenDescriptions = new Map<string, string>();
const pagesByRoute = new Map<string, HomePageDefinition | SeoPageDefinition>([
  ["/", homePage],
  ...enabledPages.map((page) => [`/${page.slug}/`, page] as const),
]);

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const route = routeForFile(file);
  const page = pagesByRoute.get(route);
  const h1Count = count(html, /<h1\b/gi);
  if (h1Count !== 1) errors.push(`${route}: expected one H1, found ${h1Count}`);
  if (!/<h2\b/i.test(html)) errors.push(`${route}: no H2 found`);
  const firstH2 = html.search(/<h2\b/i);
  const firstH3 = html.search(/<h3\b/i);
  if (firstH3 >= 0 && (firstH2 < 0 || firstH3 < firstH2)) errors.push(`${route}: H3 appears before the first H2`);
  if (!/<meta\s+name=["']description["'][^>]+content=["'][^"']{40,}["']/i.test(html) && !/<meta\s+content=["'][^"']{40,}["'][^>]+name=["']description["']/i.test(html)) errors.push(`${route}: meta description missing or too short`);
  for (const field of ["canonical", "og:title", "og:description", "og:url", "twitter:card"]) {
    if (!html.toLowerCase().includes(field)) errors.push(`${route}: metadata field missing: ${field}`);
  }
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  if (!title) errors.push(`${route}: title element missing`);
  else if (seenTitles.has(title)) errors.push(`${route}: duplicate title also used by ${seenTitles.get(title)}`);
  else seenTitles.set(title, route);
  const description = html.match(/<meta\s+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta\s+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1];
  if (description) {
    if (seenDescriptions.has(description)) errors.push(`${route}: duplicate description also used by ${seenDescriptions.get(description)}`);
    else seenDescriptions.set(description, route);
  }
  const canonical = html.match(/<link\s+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<link\s+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1];
  const expectedCanonical = page ? absoluteUrl(page.slug) : null;
  if (expectedCanonical && canonical !== expectedCanonical) errors.push(`${route}: canonical must be ${expectedCanonical}, found ${canonical ?? "missing"}`);
  const robots = html.match(/<meta\s+name=["']robots["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta\s+content=["']([^"']+)["'][^>]+name=["']robots["']/i)?.[1];
  const expectedRobot = siteConfig.readyForLaunch && page?.pageType !== "legal" ? "index" : "noindex";
  if (!robots?.toLowerCase().includes(expectedRobot)) errors.push(`${route}: robots must include ${expectedRobot}`);
  for (const image of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(image[1])) errors.push(`${route}: image without alt attribute`);
  }
  for (const link of hrefs(html)) {
    const internal = normalizeInternalHref(link.href);
    if (!internal || /\.[a-z0-9]+$/i.test(internal)) continue;
    const normalized = internal.endsWith("/") ? internal : `${internal}/`;
    if (!knownRoutes.has(normalized)) errors.push(`${route}: broken internal link ${link.href}`);
  }
  const visibleText = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ");
  const forbiddenVisibleText = /\b(source pack|fact pack|confidence|evidence|internal review|editorial audit|SEO audit|SERP|QA|TODO|placeholder|hallucination|AI generated|unverified|could not find|cannot confirm|unable to confirm|not enough information|not enough evidence|last reviewed)\b/i;
  const forbiddenMatch = visibleText.match(forbiddenVisibleText)?.[0];
  if (forbiddenMatch) errors.push(`${route}: public copy contains internal wording: ${forbiddenMatch}`);
  if (/https:\/\/example\.github\.io/i.test(html)) errors.push(`${route}: example GitHub Pages domain remains in HTML`);
  if (/https:\/\/dungeonlootr\.github\.io\/dungeon-lootr\//i.test(html)) errors.push(`${route}: project base path remains in HTML`);
}

const homeHtml = readFileSync(join(output, "index.html"), "utf8");
const homeLinks = hrefs(homeHtml);
for (const page of enabledCorePages.filter((page) => page.priority === "P0" || page.priority === "P1")) {
  const target = `/${page.slug}/`;
  const matches = homeLinks.filter((link) => {
    const href = normalizeInternalHref(link.href);
    return href === target || href === target.slice(0, -1);
  });
  if (matches.length < 1) errors.push(`home: ${target} needs at least one crawlable internal link`);
}

function reportDensity(page: HomePageDefinition | SeoPageDefinition) {
  const text = pagePlainText(page);
  const words = wordCount(text);
  for (const target of page.densityTargets ?? []) {
    const density = words ? (termCount(text, target.term) / words) * 100 : 0;
    const status = density >= target.min && density <= target.max ? "within target" : "review suggested";
    console.log(`Density ${page.slug || "home"} · ${target.term}: ${density.toFixed(2)}% (${target.min}-${target.max}%, ${status})`);
  }
}

reportDensity(homePage);
enabledPages.forEach(reportDensity);

const sitemap = readFileSync(join(output, "sitemap.xml"), "utf8");
for (const route of ["", "codes/", "aspects/", "tier-list/", "classes/", "trello/"]) {
  const expected = absoluteUrl(route);
  if (!sitemap.includes(`<loc>${expected}</loc>`)) errors.push(`sitemap: missing ${expected}`);
}
for (const legal of enabledPages.filter((page) => page.pageType === "legal")) {
  if (sitemap.includes(`<loc>${absoluteUrl(legal.slug)}</loc>`)) errors.push(`sitemap: legal page must be excluded: ${legal.slug}`);
}

if (errors.length) {
  console.error("SEO audit failed:\n" + [...new Set(errors)].map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`SEO audit passed for ${files.length} generated HTML pages.`);
