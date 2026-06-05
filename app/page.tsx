import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 animate-[slowZoom_20s_infinite_alternate_linear]" />
      <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-transparent to-obsidian opacity-90" />
      
      <div className="relative z-10 max-w-4xl">
        <h1 className="font-cinzel text-5xl md:text-7xl font-normal tracking-[0.02em] leading-tight mb-6 animate-[fadeInUp_1s_forwards]">
          Precision <br />
          <span className="text-crimson">Engineered.</span>
        </h1>
        
        <p className="font-inter text-lg md:text-xl font-light text-ash leading-relaxed mb-12 max-w-2xl mx-auto opacity-0 animate-[fadeInUp_1s_0.2s_forwards]">
          The ultimate tire configurator for the world's most demanding exotic and luxury vehicles. Authorize your specifications with our VIP Concierge.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 opacity-0 animate-[fadeInUp_1s_0.4s_forwards]">
          <Button variant="prestige">Enter Configurator</Button>
          <Button variant="ghost">Client Portal</Button>
        </div>
      </div>
    </div>
  );
}