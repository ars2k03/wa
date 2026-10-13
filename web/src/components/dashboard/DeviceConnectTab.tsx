'use client';

import React, { useState } from 'react';
import { useWhatsAppSession } from '@/hooks/useWhatsAppSession';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

interface DeviceConnectTabProps {
  userId?: string;
  onSessionLinked?: (sessionId: string) => void;
}

export function DeviceConnectTab({ userId }: DeviceConnectTabProps) {
  const [activeSessionInput, setActiveSessionInput] = useState<string>('default');
  const [phoneForPairing, setPhoneForPairing] = useState<string>('');
  const [usePhonePairing, setUsePhonePairing] = useState<boolean>(false);

  const {
    sessionId,
    setSessionId,
    status,
    qr,
    phoneNumber,
    loading,
    error,
    pairingCode,
    pairingLoading,
    initSession,
    requestPairing,
    deleteSession,
    refreshStatus,
  } = useWhatsAppSession(activeSessionInput);

  const handleSwitchSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSessionInput.trim()) {
      setSessionId(activeSessionInput.trim());
    }
  };

  const handleInit = () => {
    initSession(userId);
  };

  const handlePairingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneForPairing.trim()) {
      requestPairing(phoneForPairing.trim());
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="emerald" rotate="left">
            CONNECTED: {phoneNumber || 'ACTIVE'}
          </Badge>
        );
      case 'qr_ready':
        return (
          <Badge variant="amber" rotate="right">
            READY TO SCAN QR
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="amber">
            CONNECTING...
          </Badge>
        );
      case 'disconnected':
      default:
        return (
          <Badge variant="ink">
            DISCONNECTED
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Session Switcher */}
      <Card
        title="WHATSAPP APPARATUS LINK CONSOLE"
        subtitle="ESTABLISH BAILEYS WEBSOCKET WIRE CONNECTION"
        variant="tint"
        headerAction={getStatusBadge()}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <form onSubmit={handleSwitchSession} className="flex items-center gap-2 w-full md:w-auto">
            <div className="w-56">
              <Input
                label="SESSION IDENTIFIER"
                value={activeSessionInput}
                onChange={(e) => setActiveSessionInput(e.target.value)}
                isMono
                placeholder="default"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" className="mt-5">
              SWITCH
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={refreshStatus}
              title="Refresh connection status"
            >
              ⟳ POLL STATUS
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleInit}
              isLoading={loading}
            >
              INITIALIZE SESSION
            </Button>
            {status === 'connected' && (
              <Button
                variant="outline"
                size="sm"
                onClick={deleteSession}
                className="text-[#7a2020] border-[#7a2020] hover:bg-[#fae8e8]"
              >
                DISCONNECT
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] font-mono text-xs font-bold">
            ! ERROR: {error}
          </div>
        )}
      </Card>

      {/* Main Connection Interface: QR or Pairing Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: QR Code Scanner Frame */}
        <div className="lg:col-span-7">
          <Card
            title="AUTHENTICATION TELEGRAM (QR SCANNER)"
            subtitle="POINT WHATSAPP &gt; LINKED DEVICES AT THE SCREEN"
            variant="cream"
          >
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-5">
              {/* Photo Frame / Engraving Frame */}
              <div className="relative border-4 border-[#1a1a1a] bg-[#fbf8f1] p-4 shadow-[6px_6px_0px_#1a1a1a] max-w-xs w-full aspect-square flex flex-col items-center justify-center">
                {status === 'connected' ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#eaf3eb] border-2 border-[#2e6930] flex items-center justify-center text-3xl font-bold text-[#2e6930]">
                      ✓
                    </div>
                    <div className="font-serif font-black text-xl text-[#2e6930] uppercase">
                      DEVICE LINKED
                    </div>
                    <div className="font-mono text-xs text-[#524d43]">
                      NUMBER: {phoneNumber || 'ACTIVE CLIENT'}
                    </div>
                    <Badge variant="emerald" rotate="left">
                      ACTIVE & DISPATCHING
                    </Badge>
                  </div>
                ) : qr ? (
                  <div className="space-y-3 w-full flex flex-col items-center">
                    {/* Rendered Base64 QR Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qr}
                      alt="WhatsApp Web QR Code"
                      className="w-56 h-56 object-contain border border-[#1a1a1a]"
                    />
                    <div className="font-mono text-[11px] text-[#524d43] uppercase tracking-wider">
                      AUTO-REFRESHING EVERY 20 SECONDS
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-4">
                    <div className="font-serif text-base text-[#524d43]">
                      No active QR code generated.
                    </div>
                    <Button variant="primary" size="sm" onClick={handleInit} isLoading={loading}>
                      GENERATE QR CODE
                    </Button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="max-w-md text-left font-serif text-xs text-[#524d43] space-y-1.5 border-t border-[#1a1a1a] pt-4 w-full">
                <div className="font-mono font-bold text-[#1a1a1a] uppercase">
                  PROCEDURE FOR OPERATOR:
                </div>
                <div>1. Open WhatsApp on your mobile telephone apparatus.</div>
                <div>2. Navigate to Settings &gt; Linked Devices.</div>
                <div>3. Tap &quot;Link a Device&quot; and point camera directly at the code above.</div>
                <div>4. The status indicator will turn emerald upon cryptographic handshake.</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Numerical 8-Digit Pairing Code Method */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            title="ALTERNATIVE: 8-DIGIT PAIRING PIN"
            subtitle="DIRECT TELEPHONE HANDSHAKE"
            variant="tint"
          >
            <div className="space-y-4">
              <p className="font-serif text-sm text-[#524d43]">
                If your optical camera apparatus is unavailable, obtain an 8-character alphanumeric pairing code sent directly to your phone.
              </p>

              <form onSubmit={handlePairingSubmit} className="space-y-3">
                <Input
                  label="TELEPHONE NUMBER (WITH COUNTRY CODE)"
                  value={phoneForPairing}
                  onChange={(e) => setPhoneForPairing(e.target.value)}
                  placeholder="+8801700000000"
                  isMono
                  helperText="Format: +[Country Code][Number]"
                  required
                />

                <Button
                  type="submit"
                  variant="dark"
                  size="md"
                  className="w-full"
                  isLoading={pairingLoading}
                >
                  REQUEST 8-DIGIT PIN
                </Button>
              </form>

              {pairingCode && (
                <div className="mt-4 p-4 border-2 border-[#1a1a1a] bg-[#fbf8f1] shadow-[3px_3px_0px_#1a1a1a] text-center space-y-2">
                  <div className="font-mono text-xs uppercase text-[#524d43] tracking-widest">
                    OFFICIAL PAIRING PIN CODE
                  </div>
                  <div className="font-mono text-3xl font-black tracking-[0.25em] text-[#7a2020] select-all py-1 bg-[#ede5d3] border border-[#1a1a1a]">
                    {pairingCode}
                  </div>
                  <p className="font-serif text-xs text-[#524d43]">
                    Enter this PIN on WhatsApp when prompted on your mobile screen.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Technical Reference Box */}
          <div className="border-2 border-[#1a1a1a] bg-[#ede5d3] p-4 text-xs font-mono space-y-2">
            <div className="font-bold text-[#1a1a1a] border-b border-[#1a1a1a] pb-1">
              SYSTEM DIAGNOSTICS:
            </div>
            <div className="flex justify-between">
              <span className="text-[#524d43]">TARGET SESSION:</span>
              <span className="font-bold text-[#1a1a1a]">{sessionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#524d43]">LINK STATUS:</span>
              <span className="font-bold text-[#1a1a1a] uppercase">{status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#524d43]">PHONE REGISTERED:</span>
              <span className="font-bold text-[#1a1a1a]">{phoneNumber || 'NONE'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
