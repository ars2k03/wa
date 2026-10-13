'use client';

import React from 'react';
import { Card } from '../ui/Card';

const FEATURES = [
  {
    colNo: 'COL. 01',
    title: 'MULTI-TENANT SESSION ISOLATION',
    desc: 'Each user operates in sovereign isolation. Connect distinct personal or enterprise WhatsApp numbers with unique session keys stored securely in Upstash Redis.',
    tag: 'ARCHITECTURE',
  },
  {
    colNo: 'COL. 02',
    title: 'ZERO PER-DISPATCH SURCHARGES',
    desc: 'Bypass costly SMS telco aggregators and recurring markups. Send unlimited OTP codes and notifications across WhatsApp using your own phone plans.',
    tag: 'ECONOMICS',
  },
  {
    colNo: 'COL. 03',
    title: 'NATIVE BAILEYS WEBSOCKET PROTOCOL',
    desc: 'Built directly upon the battle-tested Baileys engine. End-to-end Signal protocol encryption maintained with real-time socket keep-alive and automatic reconnection.',
    tag: 'PROTOCOL',
  },
  {
    colNo: 'COL. 04',
    title: 'CRYPTOGRAPHIC KEY MINTING',
    desc: 'Issue unique keys starting with _ars_2k03_ prefix. Link keys to specific phone sessions or switch endpoints on the fly with zero client reconfiguration.',
    tag: 'SECURITY',
  },
  {
    colNo: 'COL. 05',
    title: 'PERMANENT AUDIT LEDGER',
    desc: 'Every dispatch is etched into PostgreSQL with unique message IDs, recipient numbers, exact timestamps, and delivery success indicators.',
    tag: 'COMPLIANCE',
  },
  {
    colNo: 'COL. 06',
    title: 'RESTFUL DEVELOPER INTEGRATION',
    desc: 'Integrate into any backend in less than 5 minutes. Simple JSON payloads over HTTP POST with header-based authorization across Node, Python, Go & PHP.',
    tag: 'DEVELOPER EXPERIENCE',
  },
];

export function FeatureGrid() {
  return (
    <section className="border-b-3 border-[#1a1a1a] bg-[#f4efe2] px-4 py-16">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="font-mono text-xs font-bold text-[#7a2020] uppercase tracking-widest">
            SECTION II: EDITORIAL COLUMNS & CAPABILITIES
          </div>
          <h3 className="font-serif text-3xl sm:text-5xl font-black text-[#1a1a1a] uppercase tracking-tight">
            ENGINEERED FOR RESILIENCE AND SPEED
          </h3>
          <p className="font-serif text-sm sm:text-base text-[#524d43]">
            A thorough breakdown of the mechanical features powering high-throughput telegraphic notifications.
          </p>
        </div>

        {/* 3-Column Newspaper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <Card
              key={idx}
              title={feature.title}
              subtitle={feature.colNo}
              variant="cream"
              className="flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <p className="font-serif text-sm text-[#1a1a1a] leading-relaxed">
                  {feature.desc}
                </p>
                <div className="pt-3 border-t border-[#1a1a1a] flex justify-between items-center text-xs font-mono text-[#524d43]">
                  <span className="font-bold text-[#7a2020]">TAG: {feature.tag}</span>
                  <span>REF #{100 + idx}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
