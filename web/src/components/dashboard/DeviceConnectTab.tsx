'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWhatsAppSession } from '@/hooks/useWhatsAppSession';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DeviceConnectTabProps {
  userId?: string;
}

export function DeviceConnectTab({ userId }: DeviceConnectTabProps) {
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const autoInitedRef = useRef<boolean>(false);

  const {
    status,
    qr,
    phoneNumber,
    loading,
    error,
    initSession,
    deleteSession,
    refreshStatus,
  } = useWhatsAppSession('default');

  // Automatically request QR code on first load if disconnected
  useEffect(() => {
    if (!autoInitedRef.current && status === 'disconnected' && !qr && !loading) {
      autoInitedRef.current = true;
      initSession(userId);
    }
  }, [status, qr, loading, userId, initSession]);

  const handleInit = () => {
    initSession(userId);
  };

  const handleDisconnect = async () => {
    const confirm = window.confirm(
      'Are you sure you want to disconnect this WhatsApp device? You will need to scan QR code again to reconnect.',
    );
    if (!confirm) return;

    setIsDisconnecting(true);
    try {
      await deleteSession();
    } finally {
      setIsDisconnecting(false);
    }
  };

  // ----------------------------------------------------
  // STATE 1: ALREADY CONNECTED (EXPANSIVE FULL-WIDTH VIEW)
  // ----------------------------------------------------
  if (status === 'connected') {
    return (
      <div className="w-full space-y-6">
        {error && (
          <div className="p-4 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] font-mono text-xs font-bold shadow-[3px_3px_0px_#7a2020]">
            ! ERROR: {error}
          </div>
        )}

        <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] overflow-hidden">
          {/* Header Top Bar */}
          <div className="border-b-2 border-[#1a1a1a] bg-[#ede5d3] px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#eaf3eb] border-2 border-[#2e6930] flex items-center justify-center text-xl text-[#2e6930] font-bold shrink-0">
                ✓
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-serif font-black text-xl sm:text-2xl text-[#1a1a1a] tracking-tight">
                    WhatsApp Device Linked
                  </h2>
                </div>
                <p className="font-serif text-xs sm:text-sm text-[#524d43] mt-0.5">
                  Your mobile apparatus is actively connected and ready to transmit automated messages
                </p>
              </div>
            </div>

            <Badge variant="emerald" rotate="right">
              ACTIVE &amp; ONLINE
            </Badge>
          </div>

          {/* Main Grid: Left Connected Number details (7 cols), Right Controls (5 cols) */}
          <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left 7 Columns: Big Phone Number & Status */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="border-3 border-[#1a1a1a] bg-[#ede5d3] p-6 sm:p-8 shadow-[4px_4px_0px_#1a1a1a] space-y-4">
                <div className="flex items-center justify-between border-b border-[#1a1a1a]/20 pb-2">
                  <span className="font-mono text-xs font-black uppercase tracking-widest text-[#524d43]">
                    ACTIVE DISPATCH SENDER
                  </span>
                  <span className="font-mono text-[10px] font-bold bg-[#2e6930] text-[#fbf8f1] px-2 py-0.5 border border-[#1a1a1a]">
                    PRIMARY PHONE
                  </span>
                </div>

                <div className="font-mono text-3xl sm:text-4xl md:text-5xl font-black text-[#1a1a1a] tracking-wider py-1 select-all">
                  {phoneNumber
                    ? phoneNumber.startsWith('+')
                      ? phoneNumber
                      : `+${phoneNumber}`
                    : 'Active Mobile'}
                </div>

                <div className="pt-2 border-t border-[#1a1a1a]/20 flex items-center gap-2 text-xs sm:text-sm font-mono text-[#2e6930] font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2e6930] animate-pulse shrink-0" />
                  <span>Real-time gateway is live — ready to dispatch OTP and transactional alerts.</span>
                </div>
              </div>

              {/* Informational reassurance */}
              <div className="p-4 bg-[#eaf3eb] border-2 border-[#2e6930] text-xs font-mono text-[#2e6930] flex items-center gap-3">
                <span className="text-xl">🔒</span>
                <span>
                  All communications sent via this phone use end-to-end encryption through the WhatsApp multi-device protocol.
                </span>
              </div>
            </div>

            {/* Right 5 Columns: Specs & Actions */}
            <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-[#ede5d3]/50 border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] space-y-6">
              <div className="space-y-4">
                <div className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a] border-b-2 border-[#1a1a1a] pb-2">
                  CONNECTION PARAMETERS
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[#1a1a1a]/20">
                    <span className="text-[#524d43]">DEVICE CAPACITY:</span>
                    <span className="font-bold text-[#1a1a1a]">1 ACTIVE DEVICE</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1a1a1a]/20">
                    <span className="text-[#524d43]">GATEWAY PROTOCOL:</span>
                    <span className="font-bold text-[#1a1a1a]">MULTI-DEVICE WIRE</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1a1a1a]/20">
                    <span className="text-[#524d43]">SECURITY ENCRYPTION:</span>
                    <span className="font-bold text-[#2e6930]">END-TO-END</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#524d43]">SERVICE STATE:</span>
                    <span className="font-bold text-[#2e6930]">DISPATCH READY</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t-2 border-[#1a1a1a] flex flex-col sm:flex-row items-center gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={refreshStatus}
                  className="w-full sm:w-auto text-xs"
                  title="Verify socket health"
                >
                  ⟳ REFRESH STATUS
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={handleDisconnect}
                  isLoading={isDisconnecting}
                  className="w-full sm:w-auto text-xs text-[#7a2020] border-[#7a2020] hover:bg-[#fae8e8]"
                >
                  DISCONNECT DEVICE
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STATE 2: NOT CONNECTED (EXPANSIVE FULL-WIDTH QR SCAN VIEW)
  // ----------------------------------------------------
  return (
    <div className="w-full space-y-6">
      {error && (
        <div className="p-4 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] font-mono text-xs font-bold shadow-[3px_3px_0px_#7a2020]">
          ! ERROR: {error}
        </div>
      )}

      <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] overflow-hidden">
        {/* Header Top Bar */}
        <div className="border-b-2 border-[#1a1a1a] bg-[#ede5d3] px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif font-black text-xl sm:text-2xl text-[#1a1a1a] tracking-tight">
              Link Your WhatsApp Account
            </h2>
            <p className="font-serif text-xs sm:text-sm text-[#524d43] mt-0.5">
              Connect your phone to automate OTP verification codes and transactional dispatches
            </p>
          </div>

          <Badge variant={status === 'qr_ready' ? 'amber' : 'ink'}>
            {status === 'qr_ready' ? 'READY TO SCAN' : 'WAITING FOR QR'}
          </Badge>
        </div>

        {/* Content Grid: Left Instructions (7 cols), Right QR Card (5 cols) */}
        <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (7 cols): Step-by-Step Instructions */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#7a2020]">
                QUICK SETUP GUIDE
              </span>
              <h3 className="font-serif font-black text-lg sm:text-xl text-[#1a1a1a] mt-1">
                Link your phone in 4 simple steps:
              </h3>
            </div>

            <ol className="space-y-3.5 font-serif text-sm text-[#1a1a1a]">
              <li className="flex items-start gap-3.5 p-3.5 bg-[#ede5d3]/40 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]">
                <span className="font-mono font-black text-xs bg-[#1a1a1a] text-[#fbf8f1] w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <div className="font-bold text-sm">Open WhatsApp</div>
                  <p className="text-xs text-[#524d43] mt-0.5">Launch the WhatsApp application on your primary mobile phone.</p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 p-3.5 bg-[#ede5d3]/40 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]">
                <span className="font-mono font-black text-xs bg-[#1a1a1a] text-[#fbf8f1] w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <div className="font-bold text-sm">Navigate to Linked Devices</div>
                  <p className="text-xs text-[#524d43] mt-0.5">
                    Tap <strong>Settings</strong> (on iPhone) or <strong>Menu (⋮)</strong> (on Android), then choose <strong>Linked Devices</strong>.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 p-3.5 bg-[#ede5d3]/40 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]">
                <span className="font-mono font-black text-xs bg-[#1a1a1a] text-[#fbf8f1] w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <div className="font-bold text-sm">Tap &quot;Link a Device&quot;</div>
                  <p className="text-xs text-[#524d43] mt-0.5">Authenticate with fingerprint, Face ID, or your phone PIN to open the camera.</p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 p-3.5 bg-[#ede5d3]/40 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]">
                <span className="font-mono font-black text-xs bg-[#1a1a1a] text-[#fbf8f1] w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <div className="font-bold text-sm">Point Camera at the Screen</div>
                  <p className="text-xs text-[#524d43] mt-0.5">Scan the QR code shown on the right. The dashboard will automatically update once linked.</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Right Column (5 cols): QR Code Authenticator Station */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-[#ede5d3] border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a]">
            <div className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a] mb-4">
              AUTHENTICATION QR CODE
            </div>

            {/* QR Card Frame */}
            <div className="border-3 border-[#1a1a1a] bg-[#ffffff] p-4 shadow-[4px_4px_0px_#1a1a1a] w-72 h-72 sm:w-80 sm:h-80 flex flex-col items-center justify-center relative">
              {loading || status === 'connecting' ? (
                <div className="space-y-3 text-center">
                  <div className="w-10 h-10 border-4 border-[#1a1a1a] border-t-[#7a2020] rounded-full animate-spin mx-auto" />
                  <div className="font-mono text-xs text-[#524d43] font-bold">
                    GENERATING SECURE QR...
                  </div>
                </div>
              ) : qr ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qr}
                    alt="WhatsApp QR Code"
                    className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                  />
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  <div className="font-serif text-sm text-[#524d43]">
                    No active QR code generated.
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleInit}
                    isLoading={loading}
                  >
                    GENERATE QR CODE
                  </Button>
                </div>
              )}
            </div>

            {qr && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2 font-mono text-[11px] text-[#2e6930] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#2e6930] animate-ping" />
                  Listening for camera scan...
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInit}
                  isLoading={loading}
                  className="text-xs"
                >
                  ⟳ REFRESH QR CODE
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
