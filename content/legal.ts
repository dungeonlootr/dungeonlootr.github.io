import { integrations } from "@/config/integrations";
import { siteConfig } from "@/config/site";
import type { SeoPageDefinition } from "@/config/types";

const privacyIntegrationParagraphs: string[] = [];

if (integrations.analytics.provider === "pirsch") {
  privacyIntegrationParagraphs.push(
    "Pirsch audience measurement is enabled to understand aggregate page usage. Pirsch processes visits under its own privacy terms.",
  );
}

if (integrations.ads.provider === "adsterra-native") {
  privacyIntegrationParagraphs.push(
    "Adsterra Native advertising is enabled. Adsterra may process technical request information and applies its own privacy policy.",
  );
}

if (integrations.socialBar) {
  privacyIntegrationParagraphs.push(
    "Adsterra Social Bar advertising is enabled and may display floating ads. Adsterra may process technical request information and applies its own privacy policy.",
  );
}

export const legalPages: SeoPageDefinition[] = [
  {
    enabled: true,
    slug: "about",
    pageType: "legal",
    navLabel: "About",
    title: "About",
    description: `Learn about ${siteConfig.siteName}, its player-focused guides, update practices and independent status.`,
    keywords: ["about game wiki"],
    primaryKeyword: "about this game resource",
    secondaryKeywords: [],
    searchIntent: "Learn who maintains this independent resource",
    priority: "P2",
    navVisible: false,
    hero: { heading: `About ${siteConfig.siteName}`, lead: "A focused, independent guide for Dungeon Lootr players." },
    sections: [
      { id: "mission", heading: "Our Purpose", paragraphs: ["Help players find focused explanations, practical routes and easy-to-scan game information."] },
      { id: "standards", heading: "Updates and Corrections", paragraphs: ["Time-sensitive pages show an update date, and corrections are made when game patches change a code, class, Aspect or link."] },
      { id: "independence", heading: "Independent Status", paragraphs: ["This fan-made resource is not the game developer, publisher or platform owner and does not imply official endorsement."] },
    ],
    relatedSlugs: ["copyright"],
    lastReviewed: "2026-09-04",
  },
  {
    enabled: false,
    slug: "contact",
    pageType: "legal",
    navLabel: "Contact",
    title: "Contact",
    description: `Contact ${siteConfig.siteName} to report factual corrections, attribution concerns, copyright questions or technical site issues.`,
    keywords: ["game wiki contact"],
    primaryKeyword: "contact",
    secondaryKeywords: [],
    searchIntent: "Contact the editorial team",
    priority: "P2",
    navVisible: false,
    hero: { heading: "Contact", lead: "Use the configured public contact method for corrections and site questions." },
    sections: [
      {
        id: "contact-method",
        heading: "How to Reach Us",
        paragraphs: siteConfig.contact.email || siteConfig.contact.url
          ? ["Use the contact link shown in the footer and include the page URL, the issue and a supporting source when possible."]
          : ["No public contact method has been configured yet. Add one before launch so readers can report corrections."],
      },
      { id: "useful-report", heading: "What to Include", paragraphs: ["Share the affected page, the incorrect detail, the current game version and a link or screenshot that shows the issue."] },
    ],
    relatedSlugs: ["about", "copyright"],
    lastReviewed: "2026-09-04",
  },
  {
    enabled: true,
    slug: "privacy",
    pageType: "legal",
    navLabel: "Privacy",
    title: "Privacy Policy",
    description: `Read the privacy policy for ${siteConfig.siteName}, including enabled measurement or advertising services.`,
    keywords: ["game wiki privacy"],
    primaryKeyword: "privacy policy",
    secondaryKeywords: [],
    searchIntent: "Understand site privacy practices",
    priority: "P2",
    navVisible: false,
    hero: { heading: "Privacy Policy", lead: "A plain-language summary of the data this static site and its enabled services may process." },
    sections: [
      { id: "site-data", heading: "Data This Site Collects", paragraphs: ["The static site does not provide accounts, comments or a database for storing visitor submissions."] },
      {
        id: "integrations",
        heading: "Optional Third-Party Services",
        paragraphs: privacyIntegrationParagraphs.length
          ? privacyIntegrationParagraphs
          : ["No audience measurement or advertising integration is currently enabled."],
      },
      { id: "external-links", heading: "External Links", paragraphs: ["A link to another website is governed by that website's own terms and privacy practices."] },
      { id: "changes", heading: "Policy Changes", paragraphs: ["This page and its update date change whenever the site's integrations or data practices change."] },
    ],
    relatedSlugs: ["terms"],
    lastReviewed: "2026-09-07",
  },
  {
    enabled: true,
    slug: "terms",
    pageType: "legal",
    navLabel: "Terms",
    title: "Terms of Use",
    description: `Read the terms for using the independent guides, class tables, code lists and reference information published on ${siteConfig.siteName}.`,
    keywords: ["game wiki terms"],
    primaryKeyword: "terms of use",
    secondaryKeywords: [],
    searchIntent: "Read site terms",
    priority: "P2",
    navVisible: false,
    hero: { heading: "Terms of Use", lead: "Conditions for using this independent guide and reference website." },
    sections: [
      { id: "informational", heading: "Informational Use", paragraphs: ["Content is provided for general game information and may change when the game is updated."] },
      { id: "accuracy", heading: "Game Updates", paragraphs: ["Game information can change after patches; current in-game menus and official announcements take priority for live play."] },
      { id: "acceptable-use", heading: "Acceptable Use", paragraphs: ["Do not misuse the site, interfere with access or reproduce substantial original content without permission."] },
    ],
    relatedSlugs: ["privacy", "copyright"],
    lastReviewed: "2026-09-04",
  },
  {
    enabled: true,
    slug: "copyright",
    pageType: "legal",
    navLabel: "Copyright",
    title: "Copyright and Attribution",
    description: `Review copyright, trademark, media ownership and attribution information for the independent ${siteConfig.siteName} resource.`,
    keywords: ["game wiki copyright"],
    primaryKeyword: "copyright and attribution",
    secondaryKeywords: [],
    searchIntent: "Understand rights and attribution",
    priority: "P2",
    navVisible: false,
    hero: { heading: "Copyright and Attribution", lead: "Ownership and reporting guidance for editorial content, game names and media." },
    sections: [
      { id: "editorial", heading: "Original Editorial Content", paragraphs: ["Original explanations, page organization and site design remain protected unless a separate license says otherwise."] },
      { id: "game-rights", heading: "Game and Platform Rights", paragraphs: ["Game names, trademarks, screenshots and related assets belong to their respective owners. Their use does not imply endorsement."] },
      { id: "report", heading: "Rights Concerns", paragraphs: ["A rights concern should identify the exact page, the protected work and proof of ownership."] },
    ],
    relatedSlugs: ["terms"],
    lastReviewed: "2026-09-04",
  },
];
