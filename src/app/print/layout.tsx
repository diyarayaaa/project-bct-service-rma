export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-white dark:text-zinc-950">
      {children}
    </div>
  );
}
