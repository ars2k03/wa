'use client';

import React, { useRef, useState } from 'react';
import { useOtpTemplate } from '@/hooks/useOtpTemplate';
import { DEFAULT_OTP_TEMPLATE, OTP_TEMPLATE_LIMITS, validateOtpTemplate } from '@/utils/otpTemplate';
import type { OtpTemplate, OtpTemplateContent } from '@/types/types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { WhatsAppPreview } from '../docs/WhatsAppPreview';

const PREVIEW_CODE = '482910';

const toContent = (t: OtpTemplate | null): OtpTemplateContent =>
  t
    ? { body: t.body, footer: t.footer, showCopyButton: t.showCopyButton, copyButtonText: t.copyButtonText }
    : DEFAULT_OTP_TEMPLATE;

const sameContent = (a: OtpTemplateContent, b: OtpTemplateContent) =>
  a.body.trim() === b.body.trim() &&
  (a.footer?.trim() || '') === (b.footer?.trim() || '') &&
  a.showCopyButton === b.showCopyButton &&
  (!a.showCopyButton || a.copyButtonText.trim() === b.copyButtonText.trim());

function FieldLabel({ htmlFor, label, count, max }: { htmlFor: string; label: string; count?: number; max?: number }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] font-mono flex justify-between"
    >
      <span>{label}</span>
      {max !== undefined && (
        <span className={`tabular-nums ${count! > max ? 'text-[#7a2020]' : 'text-[#524d43]'}`}>
          {count}/{max}
        </span>
      )}
    </label>
  );
}

const inputClass =
  'w-full px-3.5 py-2.5 bg-[#ffffff] border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder-[#8c8270] focus:outline-none focus:shadow-[2px_2px_0px_#1a1a1a] transition-all';

export function OtpTemplateTab() {
  const { template, loading, error, saveTemplate, resetToDefault } = useOtpTemplate();

  // Draft being edited; null means "not touched yet", so it follows whatever is saved
  const [draft, setDraft] = useState<OtpTemplateContent | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const saved = toContent(template);
  const current = draft ?? saved;
  const isCustom = template !== null;
  const isDirty = !sameContent(current, saved);
  const validationError = validateOtpTemplate(current);

  const update = (patch: Partial<OtpTemplateContent>) => {
    setDraft({ ...current, ...patch });
    setSaveError(null);
    setSavedNotice(false);
  };

  const insertCode = () => {
    const token = '{{code}}';
    const el = bodyRef.current;
    const start = el?.selectionStart ?? current.body.length;
    const end = el?.selectionEnd ?? current.body.length;
    update({ body: current.body.slice(0, start) + token + current.body.slice(end) });
    // Put the cursor right after the inserted token
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveTemplate({
        body: current.body.trim(),
        footer: current.footer?.trim() || null,
        showCopyButton: current.showCopyButton,
        copyButtonText: current.copyButtonText.trim() || DEFAULT_OTP_TEMPLATE.copyButtonText,
      });
      setDraft(null);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error && err.message ? err.message : 'Failed to save OTP template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetConfirm = async () => {
    setIsResetting(true);
    try {
      await resetToDefault();
      setDraft(null);
      setSaveError(null);
      setIsResetOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error && err.message ? err.message : 'Failed to reset OTP template');
      setIsResetOpen(false);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {error && (
        <div className="p-3 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] font-mono text-xs font-bold">
          ! ERROR: {error}
        </div>
      )}

      {loading ? (
        <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] p-12 text-center font-mono text-xs text-[#524d43] flex flex-col items-center justify-center space-y-3">
          <div className="w-6 h-6 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          <span>LOADING TEMPLATE...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
          {/* Editor */}
          <form
            onSubmit={handleSave}
            className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] p-6 space-y-5 min-w-0"
          >
            <div className="border-b-2 border-[#1a1a1a] pb-3 flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
                MESSAGE EDITOR
              </span>
              {/* Always rendered so the header never changes size */}
              <span
                className={`font-mono text-[11px] font-bold text-[#b45309] ${isDirty ? '' : 'invisible'}`}
                aria-hidden={!isDirty}
              >
                ● UNSAVED CHANGES
              </span>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel
                htmlFor="otp-body"
                label="MESSAGE"
                count={current.body.length}
                max={OTP_TEMPLATE_LIMITS.body}
              />
              <textarea
                id="otp-body"
                ref={bodyRef}
                value={current.body}
                onChange={(e) => update({ body: e.target.value })}
                rows={7}
                placeholder={'Your ShopBD login code is *{{code}}*'}
                className={`${inputClass} font-mono text-sm resize-y`}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={insertCode}
                  className="px-2 py-0.5 text-[11px] font-mono font-bold border border-[#b45309]/50 bg-[#fef3c7] hover:bg-[#fde68a] text-[#78350f] cursor-pointer"
                >
                  + INSERT {'{{code}}'}
                </button>
                <span className="font-mono text-[11px] text-[#524d43]">
                  Required. Formatting: *bold* _italic_ ~strike~ ```mono```
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel
                htmlFor="otp-footer"
                label="FOOTER (OPTIONAL)"
                count={current.footer?.length ?? 0}
                max={OTP_TEMPLATE_LIMITS.footer}
              />
              <input
                id="otp-footer"
                type="text"
                value={current.footer ?? ''}
                onChange={(e) => update({ footer: e.target.value })}
                placeholder="e.g. This code expires in 5 minutes"
                className={`${inputClass} font-serif text-base`}
              />
              <p className="text-xs text-[#524d43] font-mono">Small grey text under the message. Leave empty for none.</p>
            </div>

            {/* Copy Button */}
            <div className="p-4 bg-[#f4efe2] border-2 border-[#1a1a1a]/20 space-y-3">
              <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
                <span>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] font-mono">
                    COPY CODE BUTTON
                  </span>
                  <span className="block font-serif text-xs text-[#524d43] mt-0.5">
                    One tap copies the code, so users don&apos;t have to type it.
                  </span>
                </span>
                <span className="relative inline-flex shrink-0">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={current.showCopyButton}
                    onChange={(e) => update({ showCopyButton: e.target.checked })}
                    className="peer sr-only"
                  />
                  <span className="w-11 h-6 border-2 border-[#1a1a1a] bg-[#ede5d3] peer-checked:bg-[#2e6930] transition-colors peer-focus-visible:shadow-[2px_2px_0px_#1a1a1a]" />
                  <span className="absolute top-1 left-1 w-4 h-4 bg-[#1a1a1a] peer-checked:bg-[#fbf8f1] peer-checked:translate-x-5 transition-transform" />
                </span>
              </label>

              {current.showCopyButton && (
                <div className="flex flex-col gap-1.5 pt-3 border-t border-[#1a1a1a]/15">
                  <label
                    htmlFor="otp-button-select"
                    className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] font-mono flex justify-between"
                  >
                    <span>BUTTON TYPE</span>
                    <span className="text-[#1b4332] font-mono text-[11px] font-bold">1 OPTION AVAILABLE</span>
                  </label>
                  <div className="relative">
                    <select
                      id="otp-button-select"
                      value={current.copyButtonText || 'Copy Code'}
                      onChange={(e) => update({ copyButtonText: e.target.value })}
                      className="w-full appearance-none px-3.5 py-2.5 pr-12 bg-[#ffffff] border-2 border-[#1a1a1a] font-mono text-xs font-bold uppercase tracking-wider text-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] focus:outline-none focus:shadow-[3px_3px_0px_#7a2020] transition-all cursor-pointer"
                    >
                      <option value="Copy Code">COPY CODE</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 border-l-2 border-[#1a1a1a] bg-[#f4efe2] text-[#1a1a1a]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status slot: always takes the same space, only its content and colour change,
                so the buttons below never jump when an error or "saved" notice appears. */}
            {(() => {
              const errorText = saveError || (isDirty ? validationError : null);
              const tone = errorText
                ? 'bg-[#fae8e8] border-[#7a2020] text-[#7a2020]'
                : savedNotice
                  ? 'bg-[#eef7ee] border-[#1b4332] text-[#1b4332]'
                  : 'bg-transparent border-[#1a1a1a]/15 text-[#524d43]';
              return (
                <div
                  role="status"
                  aria-live="polite"
                  className={`min-h-[46px] flex items-center p-3 border-2 font-mono text-xs font-bold transition-colors ${tone}`}
                >
                  {errorText
                    ? `! ${errorText}`
                    : savedNotice
                      ? '✓ SAVED. Your next OTP will use this message.'
                      : isDirty
                        ? '✓ Looks good. Save to start using it.'
                        : isCustom
                          ? 'Your custom template is active.'
                          : 'The default message is active.'}
                </div>
              );
            })()}

            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#1a1a1a]/20">
              {isCustom ? (
                <button
                  type="button"
                  onClick={() => setIsResetOpen(true)}
                  className="px-2.5 py-1 text-[11px] font-mono font-bold border border-[#7a2020] text-[#7a2020] bg-transparent hover:bg-[#fae8e8] shadow-[1px_1px_0px_#7a2020] transition-all cursor-pointer"
                >
                  RESET TO DEFAULT
                </button>
              ) : (
                <span className="font-mono text-[11px] text-[#524d43]">Edit the default above to start.</span>
              )}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDraft(null);
                    setSaveError(null);
                  }}
                  disabled={!isDirty || isSaving}
                >
                  DISCARD
                </Button>
                <Button type="submit" variant="primary" isLoading={isSaving} disabled={!isDirty || !!validationError}>
                  SAVE TEMPLATE
                </Button>
              </div>
            </div>
          </form>

          {/* Live Preview */}
          <div className="space-y-2 lg:sticky lg:top-4">
            <div className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
              LIVE PREVIEW
            </div>
            <WhatsAppPreview otp={PREVIEW_CODE} template={current} markers={false} height={600} />
            <p className="font-mono text-[11px] text-[#524d43] text-center">
              Example code {PREVIEW_CODE}. Real messages use the code from each API request.
            </p>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetOpen}
        onClose={() => !isResetting && setIsResetOpen(false)}
        title="RESET TO DEFAULT"
        subtitle="DELETE YOUR CUSTOM TEMPLATE"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] text-xs font-serif leading-relaxed">
            <span className="font-bold">Warning:</span> Your custom template will be deleted and every OTP will use the
            default message again.
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-[#1a1a1a]/20">
            <Button type="button" variant="outline" onClick={() => setIsResetOpen(false)} disabled={isResetting}>
              CANCEL
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleResetConfirm}
              isLoading={isResetting}
              className="bg-[#7a2020] hover:bg-[#5a1515] border-[#1a1a1a] text-white"
            >
              RESET TO DEFAULT
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
