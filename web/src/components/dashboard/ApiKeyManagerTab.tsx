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
  const { keys, loading, error, createKey, deleteKey, refreshKeys } = useApiKeys(userId);

  // Create Key Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [keyName, setKeyName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [createdKeyCopied, setCreatedKeyCopied] = useState<boolean>(false);

  // Table Row Copy State
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Delete Confirmation Modal States
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleOpenCreateModal = () => {
    setKeyName('');
    setCreatedKey(null);
    setCreatedKeyCopied(false);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreatedKey(null);
    setKeyName('');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = keyName.trim() || 'My API Key';
    setIsCreating(true);
    try {
      const newKey = await createKey(finalName);
      if (newKey?.key) {
        setCreatedKey(newKey.key);
        if (onKeySelect) onKeySelect(newKey.key);
      } else {
        handleCloseCreateModal();
      }
    } catch (err) {
      console.error('Failed to create API key:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyNewKey = async () => {
    if (!createdKey) return;
    const success = await copyToClipboard(createdKey);
    if (success) {
      setCreatedKeyCopied(true);
      setTimeout(() => setCreatedKeyCopied(false), 2500);
    }
  };

  const handleRowCopy = async (k: ApiKey) => {
    const success = await copyToClipboard(k.key);
    if (success) {
      setCopiedKeyId(k.id);
      setTimeout(() => setCopiedKeyId(null), 2000);
      if (onKeySelect) onKeySelect(k.key);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!keyToDelete) return;
    setIsDeleting(true);
    try {
      await deleteKey(keyToDelete.id);
      setKeyToDelete(null);
    } catch (err) {
      console.error('Failed to delete API key:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Clean Top Action Bar */}
      <Card
        title="API KEYS"
        subtitle="AUTHENTICATION CREDENTIALS FOR REST API"
        variant="tint"
        headerAction={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={refreshKeys}
              disabled={loading}
              className="text-xs"
            >
              ⟳ REFRESH
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              className="text-xs"
            >
              + CREATE API KEY
            </Button>
          </div>
        }
      >
        <p className="font-serif text-sm text-[#524d43] leading-relaxed">
          Use secret API keys to authenticate HTTP requests to send WhatsApp messages and OTPs from your applications.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] font-mono text-xs font-bold">
            ! ERROR: {error}
          </div>
        )}
      </Card>

      {/* Keys List Table */}
      <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] overflow-hidden">
        <div className="border-b-2 border-[#1a1a1a] px-4 py-3 bg-[#ede5d3] flex items-center justify-between">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
            YOUR API KEYS ({keys.length})
          </span>
          <span className="text-[11px] font-mono text-[#524d43]">
            1 Connected Device Link
          </span>
        </div>

        {loading && keys.length === 0 ? (
          <div className="p-12 text-center font-mono text-xs text-[#524d43] flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
            <span>LOADING KEYS...</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#1a1a1a] bg-[#f4efe2] flex items-center justify-center text-[#1a1a1a]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg text-[#1a1a1a]">No API Keys generated yet</h4>
              <p className="font-serif text-sm text-[#524d43] mt-1 max-w-md mx-auto">
                Create an API key to authenticate requests from your backend server or external applications.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
            >
              + CREATE YOUR FIRST API KEY
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1a1a1a] bg-[#f4efe2] text-xs font-mono uppercase text-[#1a1a1a]">
                  <th className="p-3.5 border-r border-[#1a1a1a]">NAME</th>
                  <th className="p-3.5 border-r border-[#1a1a1a]">SECRET KEY</th>
                  <th className="p-3.5 border-r border-[#1a1a1a]">CREATED</th>
                  <th className="p-3.5 border-r border-[#1a1a1a]">LAST USED</th>
                  <th className="p-3.5 border-r border-[#1a1a1a]">STATUS</th>
                  <th className="p-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a] text-xs font-mono">
                {keys.map((k) => (
                  <tr
                    key={k.id}
                    className="hover:bg-[#f4efe2] transition-colors"
                  >
                    <td className="p-3.5 border-r border-[#1a1a1a] font-bold text-[#1a1a1a]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1b4332]" />
                        <span>{k.name || 'Unnamed Key'}</span>
                      </div>
                    </td>

                    <td className="p-3.5 border-r border-[#1a1a1a]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#1a1a1a] font-bold select-all bg-[#ede5d3] px-2 py-0.5 border border-[#1a1a1a]/30">
                          {maskApiKey(k.key)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRowCopy(k)}
                          className="px-2 py-0.5 text-[11px] font-mono font-bold border border-[#1a1a1a] bg-[#fbf8f1] hover:bg-[#ede5d3] text-[#1a1a1a] shadow-[1px_1px_0px_#1a1a1a] transition-all cursor-pointer"
                          title="Copy API Key"
                        >
                          {copiedKeyId === k.id ? '✓ COPIED' : 'COPY'}
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5 border-r border-[#1a1a1a] text-[#524d43]">
                      {formatDate(k.createdAt)}
                    </td>

                    <td className="p-3.5 border-r border-[#1a1a1a] text-[#524d43]">
                      {k.lastUsedAt ? formatTimeAgo(k.lastUsedAt) : 'Never'}
                    </td>

                    <td className="p-3.5 border-r border-[#1a1a1a]">
                      <Badge variant={k.isActive ? 'emerald' : 'burgundy'}>
                        {k.isActive ? 'ACTIVE' : 'REVOKED'}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setKeyToDelete(k)}
                        className="px-2.5 py-1 text-[11px] font-mono font-bold border border-[#7a2020] text-[#7a2020] bg-transparent hover:bg-[#fae8e8] shadow-[1px_1px_0px_#7a2020] transition-all cursor-pointer"
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Reveal API Key Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title={createdKey ? 'API KEY GENERATED' : 'CREATE API KEY'}
        subtitle={
          createdKey
            ? 'COPY YOUR NEW SECRET KEY NOW'
            : 'AUTHENTICATE YOUR WHATSAPP API REQUESTS'
        }
      >
        {!createdKey ? (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <Input
              label="KEY NAME"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g. My Website, Production Server, E-commerce App"
              helperText="Give this key a descriptive name to identify where it is used"
              required
              autoFocus
            />

            <div className="pt-3 flex justify-end gap-3 border-t border-[#1a1a1a]/20">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreateModal}
              >
                CANCEL
              </Button>
              <Button type="submit" variant="primary" isLoading={isCreating}>
                CREATE KEY
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#fef3c7] border-2 border-[#b45309] text-[#78350f] text-xs font-serif leading-relaxed">
              <span className="font-bold">⚠️ Please copy your secret key now.</span> For security reasons, you will not be able to view the full key again.
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#1a1a1a] uppercase mb-1">
                SECRET API KEY
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdKey}
                  className="w-full bg-[#ede5d3] border-2 border-[#1a1a1a] p-2.5 font-mono text-xs font-bold text-[#1a1a1a] select-all shadow-[2px_2px_0px_#1a1a1a]"
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleCopyNewKey}
                  className="whitespace-nowrap px-4 py-2.5 text-xs"
                >
                  {createdKeyCopied ? '✓ COPIED!' : 'COPY'}
                </Button>
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-[#1a1a1a]/20">
              <Button
                type="button"
                variant="primary"
                onClick={handleCloseCreateModal}
              >
                DONE
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!keyToDelete}
        onClose={() => setKeyToDelete(null)}
        title="DELETE API KEY"
        subtitle={`CONFIRM REMOVAL FOR: ${keyToDelete?.name}`}
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] text-xs font-serif leading-relaxed">
            <span className="font-bold">Warning:</span> Are you sure you want to delete <span className="font-bold underline">{keyToDelete?.name}</span>? Any external applications or services using this API key will immediately stop working.
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-[#1a1a1a]/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => setKeyToDelete(null)}
              disabled={isDeleting}
            >
              CANCEL
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              className="bg-[#7a2020] hover:bg-[#5a1515] border-[#1a1a1a] text-white"
            >
              DELETE PERMANENTLY
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
