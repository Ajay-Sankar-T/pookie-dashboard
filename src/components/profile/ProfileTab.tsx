'use client';

import React, { useState } from 'react';
import { usePookie } from '@/context/PookieContext';
import { PookieAvatar } from '../ui/PookieAvatar';
import { Button } from '../ui/Button';
import { findMemberById } from '@/lib/members';
import { WAIFU_AVATARS, waifuAvatarPath, waifuDisplayName } from '@/lib/waifu-avatars';
import { Mail, Wallet2, LogOut, Pencil, Check, Image as ImageIcon } from 'lucide-react';

export const ProfileTab: React.FC = () => {
  const { currentUser, friends, logout, memberProfiles, setMyUpiId, setMyAvatarImage } = usePookie();

  const member = currentUser ? findMemberById(currentUser.id) : undefined;
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [upiDraft, setUpiDraft] = useState('');
  const [isPickingAvatar, setIsPickingAvatar] = useState(false);

  if (!currentUser) return null;

  const savedUpi = memberProfiles[currentUser.id]?.upiId || '';

  const startEdit = () => {
    setUpiDraft(savedUpi);
    setIsEditingUpi(true);
  };

  const handleSaveUpi = () => {
    if (!upiDraft.trim()) return;
    setMyUpiId(upiDraft.trim());
    setIsEditingUpi(false);
  };

  return (
    <div className="space-y-6">
      {/* Identity card */}
      <div className="pookie-holo-border relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-pookie-blush/60 to-[#FFEBF3] border-2 border-pookie-soft p-6 shadow-pookie text-center">
        <div className="inline-flex mb-2 relative">
          <PookieAvatar
            emoji={currentUser.avatarEmoji}
            imageSrc={currentUser.avatarImage ? waifuAvatarPath(currentUser.avatarImage) : undefined}
            name={currentUser.name}
            size="2xl"
          />
          <button
            onClick={() => setIsPickingAvatar((v) => !v)}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-white border border-pookie-soft shadow-pookie-sm text-pookie-primary active:scale-90 transition-all"
            title="Change profile picture"
            aria-label="Change profile picture"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-xl font-black text-pookie-text font-kawaii mt-1">{currentUser.name}</h2>
        {member && (
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-pookie-muted mt-1">
            <Mail className="w-3.5 h-3.5" /> {member.email}
          </p>
        )}

        {isPickingAvatar && (
          <div className="mt-4 pt-4 border-t border-pookie-soft/60 animate-pop-in">
            <p className="text-[11px] font-black uppercase text-pookie-muted tracking-wider mb-2.5">
              Pick your picture
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-w-sm mx-auto">
              {WAIFU_AVATARS.map((filename) => {
                const isChosen = currentUser.avatarImage === filename;
                return (
                  <button
                    key={filename}
                    onClick={() => {
                      setMyAvatarImage(filename);
                      setIsPickingAvatar(false);
                    }}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all active:scale-90 ${
                      isChosen ? 'border-pookie-primary ring-2 ring-pookie-soft' : 'border-pookie-soft/60'
                    }`}
                    title={waifuDisplayName(filename)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={waifuAvatarPath(filename)}
                      alt={waifuDisplayName(filename)}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    {isChosen && (
                      <span className="absolute inset-0 bg-pookie-primary/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* UPI ID */}
      <div className="p-4 rounded-3xl bg-white border border-pookie-soft shadow-pookie-sm">
        <p className="text-xs font-black uppercase text-pookie-muted tracking-wider mb-2 flex items-center gap-1.5">
          <Wallet2 className="w-3.5 h-3.5" /> Your UPI ID
        </p>
        {isEditingUpi ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={upiDraft}
              onChange={(e) => setUpiDraft(e.target.value)}
              placeholder="yourname@upi"
              className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-pookie-soft text-base sm:text-sm font-semibold text-pookie-text focus:outline-none focus:ring-2 focus:ring-pookie-primary"
              autoFocus
            />
            <button
              onClick={handleSaveUpi}
              className="p-2.5 rounded-2xl bg-pookie-primary text-white active:scale-90 transition-all shrink-0"
              aria-label="Save UPI ID"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-pookie-blush/60 border border-pookie-soft text-left active:scale-[0.98] transition-all"
          >
            <span className="text-sm font-bold text-pookie-text font-mono">
              {savedUpi || 'Not set yet'}
            </span>
            <Pencil className="w-3.5 h-3.5 text-pookie-muted shrink-0" />
          </button>
        )}
      </div>

      {/* Squad roster */}
      <div>
        <p className="text-[11px] font-black uppercase text-pookie-muted tracking-wider px-1 mb-2">
          The Pookie Blinders
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {friends.map((f) => (
            <div
              key={f.id}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border ${
                f.id === currentUser.id
                  ? 'bg-pookie-blush border-pookie-primary'
                  : 'bg-white border-pookie-soft'
              }`}
            >
              <PookieAvatar
                emoji={f.avatarEmoji}
                imageSrc={f.avatarImage ? waifuAvatarPath(f.avatarImage) : undefined}
                name={f.name}
                size="md"
              />
              <span className="text-sm font-bold text-pookie-text truncate">{f.name}</span>
              {f.id === currentUser.id && (
                <span className="ml-auto text-[9px] font-black uppercase text-pookie-primary">You</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        size="md"
        fullWidth
        leftIcon={<LogOut className="w-4 h-4" />}
        onClick={logout}
      >
        Log out
      </Button>
    </div>
  );
};
