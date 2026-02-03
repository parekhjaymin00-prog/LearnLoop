import { Hero } from "@/components/landing/hero";
import { Domains } from "@/components/landing/domains";
import Link from "next/link";
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <Hero />
        <Domains />

        {/* How It Works Section - Keeping it simple directly here for now or could componentize */}
        <section id="how-it-works" className="py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Simple, structured, and effective learning.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full text-primary font-bold text-2xl">1</div>
                <h3 className="text-xl font-bold">Choose a Skill</h3>
                <p className="text-muted-foreground">Select your area of interest from our structured skills.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full text-primary font-bold text-2xl">2</div>
                <h3 className="text-xl font-bold">Share & Explore</h3>
                <p className="text-muted-foreground">Post resources, ask questions, or browse curated content.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full text-primary font-bold text-2xl">3</div>
                <h3 className="text-xl font-bold">Learn Together</h3>
                <p className="text-muted-foreground">Engage in focused discussions and grow your expertise.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why LearnLoop Section */}
        <section id="why-learnloop" className="py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Why LearnLoop?</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <h3 className="font-bold">Structured Discussions</h3>
                      <p className="text-muted-foreground">No more endless scrolling. Content is organized by skill and topic.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <h3 className="font-bold">Community Driven</h3>
                      <p className="text-muted-foreground">Curated by learners and experts like you.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <h3 className="font-bold">Focus on Growth</h3>
                      <p className="text-muted-foreground">Tools and features designed to help you actually learn.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-background p-8 rounded-2xl shadow-lg border">
                <div className="text-center space-y-4">
                  <div className="text-6xl text-primary">∞</div>
                  <h3 className="text-2xl font-bold">Join the Loop</h3>
                  <p className="text-muted-foreground">Start your structured learning journey today.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground leading-loose text-center md:text-left">
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">Terms</Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
