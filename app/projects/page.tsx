import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = { title: "Projects" };

type Project = { name: string; text: string; links: [label: string, href: string][] };

const PROJECTS: Project[] = [
  {
    name: "Trig",
    text: "Offline topo maps of New Zealand for iPhone. Record tracks, and find huts, campsites and weather with no signal.",
    links: [["App Store", "https://apps.apple.com/app/id6811446089"], ["trigmaps.nz", "https://trigmaps.nz"]],
  },
  {
    name: "NZ MCP collection",
    text: "Nine read-only MCP servers on one Cloudflare Worker. They give AI assistants New Zealand public data from GeoNet, LINZ, Stats NZ, Te Papa, NZTA, DigitalNZ and more.",
    links: [["Source on GitHub", "https://github.com/bradwindy/iolab-mcp-collection"]],
  },
  {
    name: "NZ Speed Cameras",
    text: "An interactive map of every fixed speed camera in New Zealand, using data from NZTA.",
    links: [["speedcameras.co.nz", "https://www.speedcameras.co.nz"]],
  },
  {
    name: "NZ Images",
    text: "A slideshow of random photos and artwork from New Zealand archives, libraries and museums, pulled from DigitalNZ.",
    links: [
      ["nzimages.iolab.nz", "https://nzimages.iolab.nz/"],
      ["Site source", "https://github.com/bradwindy/nzimage-web"],
      ["API source", "https://github.com/bradwindy/nzimageapi-lambda"],
    ],
  },
];

const GAMES: Project[] = [
  {
    name: "Tank Tangle",
    text: "Retro pixel maze tank battles for 2 to 12 players. Ricochet shots and blow up the walls.",
    links: [["Play", "https://tanktangle.bradwindy.workers.dev"], ["Source", "https://github.com/bradwindy/tanktangle"]],
  },
  {
    name: "Puckagon",
    text: "Neon air hockey for 2 to 12 players. Every player adds a side to the table.",
    links: [["Play", "https://puckagon.bradwindy.workers.dev"], ["Source", "https://github.com/bradwindy/puckagon"]],
  },
  {
    name: "RC Riot",
    text: "PS1-style RC car kart racing for up to 12 players, against friends and bots.",
    links: [["Play", "https://rcriot.bradwindy.workers.dev"], ["Source", "https://github.com/bradwindy/rcriot"]],
  },
];

function Entry({ project, as: Heading }: { project: Project; as: "h2" | "h3" }) {
  return (
    <>
      <Heading>{project.name}</Heading>
      <p>{project.text}</p>
      <div className="links">
        {project.links.map(([label, href]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </div>
    </>
  );
}

export default function Projects() {
  return (
    <div className="sub tall">
      <SiteNav />
      <h1>Projects</h1>
      {PROJECTS.map((p) => (
        <Entry key={p.name} project={p} as="h2" />
      ))}
      <h2 className="sec">Games</h2>
      <p>
        Multiplayer browser games. Share a link and play with friends, no install or account. They run on Cloudflare Workers and Durable
        Objects.
      </p>
      {GAMES.map((p) => (
        <Entry key={p.name} project={p} as="h3" />
      ))}
      <h2 className="sec">More at IOLab</h2>
      <p>IOLab is where I put my weirder experiments and side projects.</p>
      <div className="links">
        <a href="https://iolab.nz">iolab.nz</a>
      </div>
    </div>
  );
}
