'use client';

import React, { useState } from 'react';
import { useApiKeys } from '@/hooks/useApiKeys';
import { copyToClipboard, formatDate, formatTimeAgo, maskApiKey } from '@/utils/utils';
import type { ApiKey } from '@/types/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface ApiKeyManagerTabProps {
  userId?: string | null;
  onKeySelect?: (key: string) => void;
}

export function ApiKeyManagerTab({ userId, onKeySelect }: ApiKeyManagerTabProps) {
  const { keys, loading, error, createKey, linkSession, revokeKey, refreshKeys } =
    useApiKeys(userId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>('Production Dispatcher');
  const [newKeySession, setNewKeySession] = useState<string>('default');
  const [creating, setCreating] = useState<boolean>(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // For linking session modal
  const [linkModalKey, setLinkModalKey] = useState<ApiKey | null>(null);
  const [linkSessionInput, setLinkSessionInput] = useState<string>('default');
  const [linking, setLinking] = useState<boolean>(false);

  // For revoke confirm modal
  const [revokeModalKey, setRevokeModalKey] = useState<ApiKey | null>(null);
  const [revoking, setRevoking] = useState<boolean>(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      await createKey(newKeyName.trim(), newKeySession.trim() || undefined);
      setIsCreateModalOpen(false);
      setNewKeyName('Production Dispatcher');
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (key: ApiKey) => {
    const success = await copyToClipboard(key.key);
    if (success) {
      setCopiedKeyId(key.id);
      setTimeout(() => setCopiedKeyId(null), 2000);
      if (onKeySelect) onKeySelect(key.key);
    }
  };

  const handleLinkSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkModalKey || !linkSessionInput.trim()) return;
    setLinking(true);
    try {
      await linkSession(linkModalKey.id, linkSessionInput.trim());
      setLinkModalKey(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLinking(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokeModalKey) return;
    setRevoking(true);
    try {
      await revokeKey(revokeModalKey.id);
      setRevokeModalKey(null);
    } catch (err) {
      console.error(err);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <Card
        title="CRYPTOGRAPHIC API KEY CONSOLE"
        subtitle="MANAGE TELEGRAPHIC ACCESS CREDENTIALS"
        variant="tint"
        headerAction={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + MINT NEW API KEY
          </Button>
        }
      >
        <p className="font-serif text-sm text-[#524d43] leading-relaxed">
          API Keys authenticate all HTTP REST calls to the WhatsApp gateway. Every key is prefixed with <span className="font-mono font-bold text-[#1a1a1a]">_ars_2k03_</span> and can be linked to a specific WhatsApp phone session or operate on the default session.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] font-mono text-xs font-bold">
            ! ERROR: {error}
          </div>
        )}
      </Card>

      {/* Keys Ledger Table */}
      <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] overflow-hidden">
        <div className="border-b-2 border-[#1a1a1a] px-4 py-3 bg-[#ede5d3] flex items-center justify-between">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
            ISSUED KEYS REGISTRY ({keys.length})
          </span>
          <Button variant="secondary" size="sm" onClick={refreshKeys} className="text-xs py-1">
            ⟳ REFRESH
          </Button>
        </div>

        {loading && keys.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-[#524d43]">
            LOADING CRYPTOGRAPHIC LEDGER...
          </div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="font-serif text-base text-[#524d43]">
              No API Keys have been issued for this account.
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
            >
              MINT YOUR FIRST KEY
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1a1a1a] bg-[#f4efe2] text-xs font-mono uppercase text-[#1a1a1a]">
                  <th className="p-3 border-r border-[#1a1a1a]">NAME / LABEL</th>
                  <th className="p-3 border-r border-[#1a1a1a]">CRYPTOGRAPHIC KEY</th>
                  <th className="p-3 border-r border-[#1a1a1a]">LINKED SESSION</th>
                  <th className="p-3 border-r border-[#1a1a1a]">LAST USED</th>
                  <th className="p-3 border-r border-[#1a1a1a]">STATUS</th>
                  <th className="p-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a] text-xs font-mono">
                {keys.map((k) => (
                  <tr
                    key={k.id}
                    className={`hover:bg-[#f4efe2] transition-colors ${!k.isActive ? 'opacity-60 bg-[#fae8e8]/20' : ''
                      }`}
                  >
                    <td className="p-3 border-r border-[#1a1a1a] font-bold text-[#1a1a1a]">
                      {k.name}
                      <div className="text-[10px] text-[#524d43] font-normal">
                        Issued: {formatDate(k.createdAt)}
                      </div>
                    </td>

                    <td className="p-3 border-r border-[#1a1a1a]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1a1a1a] select-all">
                          {maskApiKey(k.key)}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopy(k)}
                          className="text-[10px] px-2 py-0.5"
                        >
                          {copiedKeyId === k.id ? '✓ COPIED' : 'COPY'}
                        </Button>
                      </div>
                    </td>

                    <td className="p-3 border-r border-[#1a1a1a]">
                      <Badge variant={k.sessionId ? 'emerald' : 'neutral'}>
                        {k.sessionId || 'default'}
                      </Badge>
                    </td>

                    <td className="p-3 border-r border-[#1a1a1a] text-[#524d43]">
                      {formatTimeAgo(k.lastUsedAt)}
                    </td>

                    <td className="p-3 border-r border-[#1a1a1a]">
                      <Badge variant={k.isActive ? 'emerald' : 'burgundy'}>
                        {k.isActive ? 'ACTIVE' : 'REVOKED'}
                      </Badge>
                    </td>

                    <td className="p-3 text-right space-x-2">
                      {k.isActive && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLinkModalKey(k);
                              setLinkSessionInput(k.sessionId || 'default');
                            }}
                            className="text-[10px] px-2 py-0.5"
                          >
                            LINK SESSION
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRevokeModalKey(k)}
                            className="text-[10px] px-2 py-0.5 text-[#7a2020] border-[#7a2020] hover:bg-[#fae8e8]"
                          >
                            REVOKE
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mint Key Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="MINT NEW CRYPTOGRAPHIC KEY"
        subtitle="GENERATES A UNIQUE _ars_2k03_ ACCESS TOKEN"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="KEY LABEL / APPARATUS NAME"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="e.g. Production Dispatcher"
            helperText="A human-readable identifier for this token"
            required
          />

          <Input
            label="TARGET WHATSAPP SESSION ID (OPTIONAL)"
            value={newKeySession}
            onChange={(e) => setNewKeySession(e.target.value)}
            placeholder="default"
            isMono
            helperText="Leave as 'default' or enter an existing session identifier"
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button type="submit" variant="primary" isLoading={creating}>
              MINT KEY NOW
            </Button>
          </div>
        </form>
      </Modal>

      {/* Link Session Modal */}
      <Modal
        isOpen={!!linkModalKey}
        onClose={() => setLinkModalKey(null)}
        title="LINK WHATSAPP SESSION TO KEY"
        subtitle={`TARGET KEY: ${linkModalKey?.name}`}
      >
        <form onSubmit={handleLinkSession} className="space-y-4">
          <Input
            label="TARGET SESSION ID"
            value={linkSessionInput}
            onChange={(e) => setLinkSessionInput(e.target.value)}
            placeholder="default"
            isMono
            required
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLinkModalKey(null)}
            >
              CANCEL
            </Button>
            <Button type="submit" variant="emerald" isLoading={linking}>
              SAVE LINK
            </Button>
          </div>
        </form>
      </Modal>

      {/* Revoke Confirm Modal */}
      <Modal
        isOpen={!!revokeModalKey}
        onClose={() => setRevokeModalKey(null)}
        title="CONFIRM KEY REVOCATION"
        subtitle={`TARGET KEY: ${revokeModalKey?.name}`}
      >
        <div className="space-y-4">
          <p className="font-serif text-sm text-[#7a2020] font-bold">
            WARNING: Revoking this key will immediately prevent all clients using this token from dispatching messages. This action cannot be reversed.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRevokeModalKey(null)}
            >
              CANCEL
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleRevokeConfirm}
              isLoading={revoking}
            >
              REVOKE PERMANENTLY
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
