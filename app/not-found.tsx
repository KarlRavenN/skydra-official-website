import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-20">
      <Container size="sm" className="text-center space-y-6">
        <span className="font-heading text-8xl font-black tracking-widest text-primary/80">
          404
        </span>
        <h1 className="text-3xl font-black uppercase tracking-wider text-white">
          BAR NOT FOUND
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The event or page you are looking for has been moved, archived, or never existed in the SKYDRA arena.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Link href="/">
            <Button variant="primary">Back to Arena Home</Button>
          </Link>
          <Link href="/events">
            <Button variant="outline">Browse Events</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
