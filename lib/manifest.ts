import fs from "fs";
import path from "path";

const MANIFEST_PATH = path.join(process.cwd(), "posted-manifest.json");

interface Manifest {
  postedSlugs: string[];
  lastUpdated: string;
}

export function getManifest(): Manifest {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { postedSlugs: [], lastUpdated: new Date().toISOString() };
  }

  const content = fs.readFileSync(MANIFEST_PATH, "utf-8");
  return JSON.parse(content);
}

export function saveManifest(manifest: Manifest): void {
  manifest.lastUpdated = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

export function isPostAlreadyPosted(slug: string): boolean {
  const manifest = getManifest();
  return manifest.postedSlugs.includes(slug);
}

export function markPostAsPosted(slug: string): void {
  const manifest = getManifest();
  if (!manifest.postedSlugs.includes(slug)) {
    manifest.postedSlugs.push(slug);
    saveManifest(manifest);
  }
}

export function getNewPosts(allSlugs: string[]): string[] {
  const manifest = getManifest();
  return allSlugs.filter((slug) => !manifest.postedSlugs.includes(slug));
}
