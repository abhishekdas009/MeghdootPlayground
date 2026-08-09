const fs = require('fs');
const path = 'D:/MeghdootPlayground/frontend/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const quickActionGood = `function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  gradient,
  iconBg,
  delay,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <Link href={href} className="block h-full">
        <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-900/10 bg-card/55 p-5 shadow-none backdrop-blur-xl transition-all duration-300 hover:border-blue-300/30 hover:bg-card/70 dark:border-white/10">
          <div className={cn("absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100", gradient)} />

          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                iconBg
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-foreground transition-colors duration-200">
                {title}
              </p>
              <p className="mt-1 truncate text-sm font-medium text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted opacity-0 transition-all duration-300 group-hover:opacity-100">
              <ChevronRight className="h-5 w-5 text-foreground" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Live Pulse Indicator ─────────────────────────────────────────────

function LiveIndicator({ isLive }: { isLive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}`;

const lines = content.split('\n');
const before = lines.slice(0, 261).join('\n');
const after = lines.slice(289).join('\n');
fs.writeFileSync(path, before + '\n' + quickActionGood + '\n' + after);
console.log('Fixed');
