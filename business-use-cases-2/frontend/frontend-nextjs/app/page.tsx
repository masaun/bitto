'use client';

import Link from 'next/link';
import { CATEGORIES, getCategoryColor } from '@/lib/stacks';

export default function Home() {
  return (
    <div>
      <h1>Stacks Smart Contracts Dashboard</h1>
      <p>2400 contracts organized across 8 categories (300 per category)</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        {CATEGORIES.map((category) => (
          <Link key={category} href={`/contracts/${category}`}>
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: getCategoryColor(category),
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              <h2 style={{ margin: '0 0 0.5rem 0', textTransform: 'capitalize' }}>
                {category}
              </h2>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                300 contracts
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>About</h3>
        <p>
          This frontend provides interactive access to 2400 Clarity smart contracts deployed on the Stacks blockchain,
          organized into 8 categories:
        </p>
        <ul>
          <li><strong>Auction</strong>: Sealed-bid, Dutch, English auctions and settlement mechanisms</li>
          <li><strong>Treasury</strong>: Fund management, capital pools, and liquidity vaults</li>
          <li><strong>Governance</strong>: DAOs, voting systems, and policy enforcement</li>
          <li><strong>API</strong>: Integration gateways, routers, and adapters</li>
          <li><strong>Automation</strong>: Workflow engines, schedulers, and task executors</li>
          <li><strong>Compliance</strong>: KYC, AML, regulatory monitoring, and enforcement</li>
          <li><strong>OTC</strong>: Over-the-counter trading, clearing, and settlement</li>
          <li><strong>Revenue</strong>: Distribution pools, fee managers, and royalty engines</li>
        </ul>
      </div>
    </div>
  );
}
