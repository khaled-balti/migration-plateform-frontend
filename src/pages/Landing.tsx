import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  GitBranch, Shield, Zap, ArrowRight, ChevronRight,
  Cpu, Globe, Lock, BarChart3, Terminal, Layers,
  HelpCircle, X, Info, AlertTriangle
} from "lucide-react";
import { useAuth } from "../providers/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Token Info Modal ────────────────────────────────────────────────── */
function TokenInfoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d1a] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Migration Instructions</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
              {/* Token Roles */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                  <Info className="h-4 w-4" />
                  <h4>Required Token Roles & Scopes</h4>
                </div>
                <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-white font-medium mb-1">GitHub Personal Access Token (classic)</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><code className="text-indigo-300">repo</code> (Full control of private repositories)</li>
                      <li><code className="text-indigo-300">workflow</code> (Update GitHub Action workflows)</li>
                      <li><code className="text-indigo-300">admin:org</code> (If migrating to an organization)</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-white font-medium mb-1">GitLab Access Token</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><code className="text-indigo-300">api</code> (Complete read/write access)</li>
                      <li><code className="text-indigo-300">read_repository</code> & <code className="text-indigo-300">write_repository</code></li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-white font-medium mb-1">Jenkins API Token</p>
                    <p>Requires an API Token generated in your user profile with read and job execution permissions.</p>
                  </div>
                </div>
              </section>

              {/* Warnings */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <h4>Important Warnings</h4>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/80 leading-relaxed">
                  <p className="font-bold text-amber-400 mb-1">Expiration Date Verification</p>
                  <p>
                    Always check the expiration date of your tokens. Expired tokens will cause migration 
                    failures and credential synchronization errors. We recommend using tokens with 
                    at least 30 days of validity remaining.
                  </p>
                </div>
              </section>
            </div>

            <div className="border-t border-white/5 bg-white/[0.02] px-6 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/20"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Tiny canvas particle system ───────────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 60;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
      }

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

/* ─── Feature card ───────────────────────────────────────────────────── */
function Feature({ icon: Icon, title, desc, delay }: {
  icon: React.ElementType; title: string; desc: string; delay: string;
}) {
  return (
    <div
      className="group relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm
                 hover:border-indigo-500/40 hover:bg-white/10 transition-all duration-300 cursor-default"
      style={{ animationDelay: delay }}
    >
      <div className="mb-4 w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20
                      flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <h3 className="font-semibold text-white mb-1.5 text-sm">{title}</h3>
      <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─── Badge pill ─────────────────────────────────────────────────────── */
function BadgePill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                     bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
      {text}
    </span>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export function LandingPage() {
  const { user } = useAuth();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#060610] text-white overflow-x-hidden font-sans">
      <TokenInfoModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      {/* ── Keyframe styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes float-slow   { 0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)} }
        @keyframes float-mid    { 0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)} }
        @keyframes glow-pulse   { 0%,100%{opacity:.5}50%{opacity:1} }
        @keyframes slide-up     { from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none} }
        @keyframes fade-in      { from{opacity:0}to{opacity:1} }
        @keyframes spin-slow    { to{transform:rotate(360deg)} }
        .anim-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .anim-float-mid  { animation: float-mid  4s ease-in-out infinite; }
        .anim-glow       { animation: glow-pulse 3s ease-in-out infinite; }
        .anim-slide-up   { animation: slide-up   0.7s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-fade-in    { animation: fade-in    0.8s ease both; }
        .anim-spin-slow  { animation: spin-slow  18s linear infinite; }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between
                      px-6 md:px-12 py-4 border-b border-white/5 backdrop-blur-md bg-[#060610]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight text-lg">Move to GitHub</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            title="Migration Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          {!user ? (
            <>
              <Link to="/login"
                className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/register"
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500
                           text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40">
                Get started
              </Link>
            </>
          ) : (
            <Link to="/app"
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500
                         text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40">
              Dashboard
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-12 px-4">
        <ParticleCanvas />

        {/* Coloured blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl anim-glow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-600/15 blur-3xl anim-glow pointer-events-none" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-indigo-500/5 anim-spin-slow pointer-events-none" />

        {/* Spinning ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[900px] h-[900px] rounded-full border border-dashed border-white/[0.03] anim-spin-slow" style={{ animationDirection: "reverse" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
          <div className="anim-slide-up" style={{ animationDelay: ".1s" }}>
            <BadgePill text="Jenkins → GitHub Actions, automated" />
          </div>

          <h1 className="anim-slide-up text-5xl md:text-7xl font-black tracking-tight leading-none"
              style={{ animationDelay: ".2s" }}>
            <span className="text-white">Migrate pipelines.</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Ship faster.
            </span>
          </h1>

          <p className="anim-slide-up max-w-xl text-slate-400 text-lg leading-relaxed"
             style={{ animationDelay: ".35s" }}>
            The intelligent multi-tenant migration platform for DevOps teams.
            Automate the migration of Jenkins pipelines to GitHub Actions in minutes—
            with built-in secret injection, dry-run previews, and audit trails.
          </p>

          <div className="anim-slide-up flex flex-col sm:flex-row gap-4" style={{ animationDelay: ".5s" }}>
            {!user ? (
              <>
                <Link to="/register"
                  className="group flex items-center justify-center gap-2 px-8 py-3.5
                             bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl
                             shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50
                             transition-all duration-200">
                  Start migrating free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login"
                  className="flex items-center justify-center gap-2 px-8 py-3.5
                             border border-white/10 hover:border-white/25 text-slate-300 hover:text-white
                             font-semibold rounded-2xl backdrop-blur-sm bg-white/5
                             transition-all duration-200">
                  Sign in to dashboard
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <Link to="/app"
                className="group flex items-center justify-center gap-2 px-8 py-3.5
                           bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl
                           shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50
                           transition-all duration-200">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          {/* Mini stat bar */}
          <div className="anim-fade-in flex items-center gap-8 pt-4 border-t border-white/5 w-full justify-center"
               style={{ animationDelay: ".7s" }}>
            {[
              { n: "10×", label: "Faster migration" },
              { n: "100%", label: "Secret isolation" },
              { n: "Zero", label: "Manual YAML edits" },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <div className="text-xl font-black text-white">{n}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating code window */}
        <div className="anim-float-slow anim-fade-in relative z-10 mt-16 mx-auto max-w-2xl w-full
                        rounded-2xl border border-white/10 bg-[#0d0d1a] shadow-2xl shadow-indigo-500/10 overflow-hidden"
             style={{ animationDelay: ".9s" }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-slate-500 font-mono">migrated-pipeline.yml</span>
          </div>
          <pre className="p-5 text-xs font-mono leading-relaxed text-slate-400 overflow-x-auto">
{`name: CI Pipeline (Migrated)
on: [push]

env:
  API_KEY: \${{ secrets.MY_API_KEY }}
  DB_PASS: \${{ secrets.DB_PASSWORD }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build & Test
        run: make build test
      - name: Deploy
        run: ./deploy.sh
        env:
          GH_TOKEN: \${{ secrets.DEPLOY_TOKEN }}`}
          </pre>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <BadgePill text="What's included" />
            <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-white">
              Everything your team needs
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto text-sm">
              From credential isolation to real-time streaming logs — all the power,
              none of the complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: "Automated Dry-Run", desc: "Preview your GitHub Actions workflow before committing a single byte to production.", delay: "0s" },
              { icon: Lock, title: "Secret Isolation", desc: "Per-tenant secret mapping files ensure credentials never leak across organizations.", delay: "0.05s" },
              { icon: Terminal, title: "Live Log Streaming", desc: "Watch migration output in real-time with colour-coded stdout/stderr.", delay: "0.1s" },
              { icon: Layers, title: "Batch Migration", desc: "Select multiple Jenkins pipelines and migrate them all in one click.", delay: "0.15s" },
              { icon: Shield, title: "Permission-Gated", desc: "RBAC ensures only authorized users can sync, dry-run, or approve migrations.", delay: "0.2s" },
              { icon: BarChart3, title: "Audit Trail", desc: "Every action — sync, migrate, credential push — is recorded in the activity history.", delay: "0.25s" },
              { icon: Globe, title: "Multi-Tenant", desc: "Each company gets its own isolated data, secrets, and integration credentials.", delay: "0.3s" },
              { icon: GitBranch, title: "GitLab & Jenkins", desc: "Sync repositories from GitLab and pipelines from Jenkins with a single click.", delay: "0.35s" },
              { icon: Cpu, title: "Credential Migration", desc: "Push Jenkins credentials directly to GitHub Actions Secrets automatically.", delay: "0.4s" },
            ].map(props => <Feature key={props.title} {...props} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl border border-indigo-500/20 bg-gradient-to-br
                          from-indigo-600/10 via-violet-600/5 to-transparent p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                Ready to migrate?
              </h2>
              <p className="text-slate-400 mb-8 text-sm max-w-md mx-auto">
                Register your company in seconds. Your first admin account unlocks
                every feature immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!user ? (
                  <>
                    <Link to="/register"
                      className="group inline-flex items-center justify-center gap-2 px-8 py-3
                                 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl
                                 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all">
                      Create your account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/login"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3
                                 border border-white/10 hover:border-white/25 text-slate-300 hover:text-white
                                 font-semibold rounded-2xl transition-all">
                      Sign in
                    </Link>
                  </>
                ) : (
                  <Link to="/app"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-3
                               bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl
                               shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all">
                    Access Dashboard
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Move to GitHub. Built for DevOps teams who ship fast.
      </footer>
    </div>
  );
}
