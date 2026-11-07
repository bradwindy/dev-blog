import { SiteNav } from "@/components/site-nav";

export default function Home() {
  return (
    <div className="home">
      <h1>Bradley Windybank</h1>
      <p>Software engineer in Auckland. I build iOS apps, websites and MCP servers.</p>
      <SiteNav big />
    </div>
  );
}
