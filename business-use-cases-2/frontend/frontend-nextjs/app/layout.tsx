export const metadata = {
  title: 'Stacks Contracts',
  description: 'Interactive frontend for 2400 Stacks smart contracts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <nav style={{ borderBottom: '1px solid #eee', padding: '1rem' }}>
          <a href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ⚙️ Stacks Contracts
          </a>
        </nav>
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
