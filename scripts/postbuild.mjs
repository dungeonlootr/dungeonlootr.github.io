import { writeFileSync } from "node:fs";
import { join } from "node:path";

const output = join(process.cwd(), "out");
writeFileSync(join(output, ".nojekyll"), "", "utf8");

const customDomain = process.env.NEXT_PUBLIC_CUSTOM_DOMAIN?.trim();
if (customDomain) writeFileSync(join(output, "CNAME"), `${customDomain}\n`, "utf8");

console.log(customDomain ? `Static output prepared with CNAME ${customDomain}.` : "Static output prepared for GitHub Pages.");
