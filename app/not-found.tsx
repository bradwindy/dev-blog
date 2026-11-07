import { SiteNav } from "@/components/site-nav";

export default function NotFound() {
  return (
    <div className="sub">
      <SiteNav />
      <h1>Not found</h1>
      <p className="lede">There&apos;s nothing at this address. The old blog is gone for now.</p>
    </div>
  );
}
