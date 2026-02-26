'use client';

import Link from 'next/link';
import { use, useState, useEffect } from 'react';

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = use(params);
  const category = resolvedParams.category;
  
  const categoryInfo: { [key: string]: { color: string; count: number } } = {
    auction: { color: '#FF6B6B', count: 300 },
    treasury: { color: '#4ECDC4', count: 300 },
    governance: { color: '#45B7D1', count: 300 },
    api: { color: '#FFA07A', count: 300 },
    automation: { color: '#98D8C8', count: 300 },
    compliance: { color: '#F7DC6F', count: 300 },
    otc: { color: '#BB8FCE', count: 300 },
    revenue: { color: '#85C1E2', count: 300 },
  };

  const info = categoryInfo[category] || { color: '#95A5A6', count: 0 };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ padding: '1rem', backgroundColor: info.color, color: 'white', borderRadius: '8px', marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', textTransform: 'capitalize' }}>{category} Contracts</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>{info.count} contracts in this category</p>
      </div>

      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Click on a contract to interact with it. Each contract provides access to initialize, execute actions, settle, and query operations.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {Array.from({ length: info.count }).map((_, i) => {
          const names = generateContractNames(category, info.count);
          return (
            <Link key={i} href={`/contracts/${category}/${names[i]}`}>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#f9f9f9',
                  border: `2px solid ${info.color}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  color: '#333',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = info.color;
                  el.style.color = 'white';
                  el.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = '#f9f9f9';
                  el.style.color = '#333';
                  el.style.transform = 'translateY(0)';
                }}
              >
                <p style={{ margin: '0', fontWeight: 'bold', fontSize: '0.9rem', wordBreak: 'break-word' }}>
                  {names[i]}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function generateContractNames(category: string, count: number): string[] {
  const prefixes: { [key: string]: string[] } = {
    auction: ['sealed', 'english', 'dutch', 'reverse', 'batch', 'vickrey', 'timed', 'flash', 'multi-item', 'blind'],
    treasury: ['strategic', 'tactical', 'operational', 'capital', 'fund', 'vault', 'reserve', 'emergency', 'development', 'contingency'],
    governance: ['global', 'regional', 'local', 'voting', 'proposal', 'dao', 'multi-sig', 'timelock', 'access-control', 'policy'],
    api: ['rest', 'graphql', 'grpc', 'websocket', 'webhook', 'v1', 'v2', 'stable', 'beta', 'alpha'],
    automation: ['immediate', 'scheduled', 'delayed', 'recurring', 'conditional', 'event-driven', 'time-driven', 'data-driven', 'rule-based', 'ml-powered'],
    compliance: ['kyc', 'aml', 'sanctions', 'verification', 'validation', 'audit', 'review', 'monitoring', 'enforcement', 'reporting'],
    otc: ['spot', 'forward', 'swap', 'option', 'desk', 'broker', 'clearing', 'settling', 'bilateral', 'multilateral'],
    revenue: ['subscription', 'transaction', 'usage', 'licensing', 'rental', 'commission', 'royalty', 'marketing', 'referral', 'affiliate'],
  };

  const suffixes = ['contract', 'system', 'manager', 'engine', 'broker', 'handler', 'processor', 'tracker', 'monitor', 'controller'];
  const names: string[] = [];
  const prefix = prefixes[category] || prefixes.auction;

  for (let i = 0; i < count; i++) {
    const p = prefix[i % prefix.length];
    const s = suffixes[(i / prefix.length) % suffixes.length];
    names.push(`${p}-${s}-${i}`);
  }

  return names;
}
