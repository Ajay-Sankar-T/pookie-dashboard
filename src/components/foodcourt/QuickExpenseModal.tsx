'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePookie } from '@/context/PookieContext';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { AmountInput } from '../ui/AmountInput';
import { CategoryChip } from '../ui/CategoryChip';
import { PookieAvatar } from '../ui/PookieAvatar';
import { CATEGORIES } from '@/lib/sample-data';
import { CategoryType, SplitItem } from '@/types';
import { toPaise, toRupees, formatCurrency, calculateEqualSplit, validateSplits } from '@/lib/currency';
import { Heart, Sparkles, Check, Users, ShieldCheck } from 'lucide-react';

export const QuickExpenseModal: React.FC = () => {
  const {
    isQuickExpenseOpen,
    closeQuickExpense,
    quickExpensePreset,
    friends,
    circles,
    activeCircleId,
    addTransaction,
    currentUser,
    currentUserId,
  } = usePookie();

  const me = currentUser!;

  // Form states
  const [payerId, setPayerId] = useState<string>(currentUserId || '');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [includeMeInSplit, setIncludeMeInSplit] = useState<boolean>(false);
  const [category, setCategory] = useState<CategoryType>('burger');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [selectedCircleId, setSelectedCircleId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize form state only when the sheet actually OPENS (or a fresh
  // preset is handed to an already-open sheet) — NOT on every render where
  // `friends`/`activeCircleId` happen to get a new reference (e.g. from the
  // background 25s poll), which was silently wiping out in-progress edits.
  const wasOpenRef = useRef(false);
  const lastPresetRef = useRef(quickExpensePreset);
  useEffect(() => {
    const justOpened = isQuickExpenseOpen && !wasOpenRef.current;
    const presetChanged = isQuickExpenseOpen && quickExpensePreset !== lastPresetRef.current;
    wasOpenRef.current = isQuickExpenseOpen;
    lastPresetRef.current = quickExpensePreset;

    if (isQuickExpenseOpen && (justOpened || presetChanged)) {
      if (quickExpensePreset) {
        setPayerId(quickExpensePreset.payerId || me.id);
        if (quickExpensePreset.targetFriendIds && quickExpensePreset.targetFriendIds.length > 0) {
          setSelectedFriends(quickExpensePreset.targetFriendIds);
        } else {
          // Default first other friend
          const firstOther = friends.find((f) => f.id !== currentUserId);
          setSelectedFriends(firstOther ? [firstOther.id] : []);
        }
        if (quickExpensePreset.category) {
          setCategory(quickExpensePreset.category as CategoryType);
        }
        if (quickExpensePreset.amountRupees) {
          setAmountStr(quickExpensePreset.amountRupees);
        }
        if (quickExpensePreset.title) {
          setCustomTitle(quickExpensePreset.title);
        }
        setSelectedCircleId(quickExpensePreset.circleId ?? activeCircleId ?? '');
        setErrorMsg(null);
        return;
      } else {
        // Sensible defaults
        setPayerId(me.id);
        const firstOther = friends.find((f) => f.id !== currentUserId);
        setSelectedFriends(firstOther ? [firstOther.id] : []);
        setIncludeMeInSplit(false);
        setCategory('burger');
        setCustomTitle('');
        setAmountStr('');
        setSplitMode('equal');
        setCustomShares({});
      }
      setSelectedCircleId(activeCircleId || '');
      setErrorMsg(null);
    }
  }, [isQuickExpenseOpen, quickExpensePreset, friends, activeCircleId]);

  const totalPaise = toPaise(amountStr);

  // List of participants who share the cost
  const participants = useMemo(() => {
    const list = [...selectedFriends];
    if (includeMeInSplit && !list.includes(me.id)) {
      list.push(me.id);
    }
    return list;
  }, [selectedFriends, includeMeInSplit]);

  // Calculated splits
  const calculatedSplits: SplitItem[] = useMemo(() => {
    if (participants.length === 0 || totalPaise <= 0) return [];

    if (splitMode === 'equal') {
      const shares = calculateEqualSplit(totalPaise, participants.length);
      return participants.map((id, index) => ({
        friendId: id,
        amountPaise: shares[index],
      }));
    } else {
      // Custom splits
      return participants.map((id) => ({
        friendId: id,
        amountPaise: toPaise(customShares[id] || '0'),
      }));
    }
  }, [participants, totalPaise, splitMode, customShares]);

  // Toggle friend in participants
  const toggleFriend = (id: string) => {
    if (selectedFriends.includes(id)) {
      if (selectedFriends.length === 1 && !includeMeInSplit) {
        // Keep at least one friend
        return;
      }
      setSelectedFriends((prev) => prev.filter((fId) => fId !== id));
    } else {
      setSelectedFriends((prev) => [...prev, id]);
    }
  };

  const handleCustomShareChange = (friendId: string, val: string) => {
    setCustomShares((prev) => ({
      ...prev,
      [friendId]: val,
    }));
  };

  const splitEvenly = () => {
    const shares = calculateEqualSplit(totalPaise, participants.length);
    const next: Record<string, string> = {};
    participants.forEach((id, index) => {
      next[id] = toRupees(shares[index]).toString();
    });
    setCustomShares(next);
  };

  // Live feedback for uneven (custom) splits
  const customSplitCheck =
    splitMode === 'custom' && totalPaise > 0 ? validateSplits(totalPaise, calculatedSplits) : null;

  // Live confirmation preview
  const previewInfo = useMemo(() => {
    const isMePayer = payerId === me.id;
    const payerFriend = friends.find((f) => f.id === payerId) || me;
    const catMeta = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
    const displayTitle = customTitle.trim() || catMeta.label;

    if (totalPaise <= 0 || participants.length === 0) {
      return null;
    }

    if (isMePayer) {
      // I paid
      const otherSplits = calculatedSplits.filter((s) => s.friendId !== me.id);
      const totalOwedToMe = otherSplits.reduce((acc, s) => acc + s.amountPaise, 0);

      const targetNames = otherSplits.map(
        (s) => friends.find((f) => f.id === s.friendId)?.name || 'Pookie'
      );

      let summaryText = '';
      if (targetNames.length === 1) {
        summaryText = `${targetNames[0]} owes you ${formatCurrency(totalOwedToMe)} 💕`;
      } else if (targetNames.length > 1) {
        summaryText = `${targetNames.join(' & ')} owe you ${formatCurrency(totalOwedToMe)} total 💕`;
      } else {
        summaryText = 'You treated yourself! ✨';
      }

      return {
        title: displayTitle,
        emoji: catMeta.emoji,
        subline: `You got ${targetNames.join(', ') || 'yourself'}`,
        summary: summaryText,
        amount: formatCurrency(totalPaise),
      };
    } else {
      // Someone else paid
      const mySplit = calculatedSplits.find((s) => s.friendId === me.id);
      const myShare = mySplit ? mySplit.amountPaise : 0;

      return {
        title: displayTitle,
        emoji: catMeta.emoji,
        subline: `${payerFriend.name} got ${participants.length > 1 ? 'everyone' : 'you'}`,
        summary:
          myShare > 0
            ? `You owe ${payerFriend.name} ${formatCurrency(myShare)} 🥺`
            : `${payerFriend.name} covered it! ✨`,
        amount: formatCurrency(totalPaise),
      };
    }
  }, [payerId, friends, category, customTitle, totalPaise, participants, calculatedSplits]);

  // Submit expense
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPaise <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }
    if (participants.length === 0) {
      setErrorMsg('Please pick at least one Pookie');
      return;
    }

    if (splitMode === 'custom' && customSplitCheck && !customSplitCheck.isValid) {
      const diff = customSplitCheck.differencePaise;
      setErrorMsg(
        diff > 0
          ? `Still need to allocate ${formatCurrency(diff)} more`
          : `Allocated ${formatCurrency(Math.abs(diff))} too much — trim it down`
      );
      return;
    }

    const catMeta = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
    const finalTitle = customTitle.trim() || `${catMeta.label} treat 🎀`;

    addTransaction({
      title: finalTitle,
      category,
      amountPaise: totalPaise,
      payerId,
      splits: calculatedSplits,
      date: new Date().toISOString(),
      note: customTitle.trim() ? `${catMeta.label}` : undefined,
      circleId: selectedCircleId || undefined,
    });

    closeQuickExpense();
  };

  const otherFriends = friends.filter((f) => f.id !== currentUserId);

  return (
    <BottomSheet
      isOpen={isQuickExpenseOpen}
      onClose={closeQuickExpense}
      title="I Got You 💕"
      subtitle="Record in under 10 seconds"
      emoji="🍔"
      maxHeight="max-h-[92vh]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Who paid? */}
        <div>
          <label className="block text-xs font-black uppercase text-pookie-muted tracking-wider mb-2.5">
            Step 1 · Who paid?
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPayerId(me.id)}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-sm transition-all duration-150 active:scale-95 border ${
                payerId === me.id
                  ? 'bg-gradient-to-r from-pookie-primary to-[#FF5E9E] text-white border-pink-400 shadow-pookie scale-[1.02]'
                  : 'bg-white text-pookie-text border-pookie-soft hover:bg-pookie-blush'
              }`}
            >
              <span>💕</span>
              <span>Me</span>
            </button>

            <div className="relative">
              <select
                value={payerId === me.id ? '' : payerId}
                onChange={(e) => {
                  if (e.target.value) setPayerId(e.target.value);
                }}
                className={`w-full py-3 px-4 rounded-2xl font-black text-base sm:text-sm appearance-none transition-all duration-150 cursor-pointer border focus:outline-none ${
                  payerId !== me.id
                    ? 'bg-gradient-to-r from-rose-500 to-[#F43F85] text-white border-rose-400 shadow-pookie'
                    : 'bg-white text-pookie-text border-pookie-soft hover:bg-pookie-blush'
                }`}
              >
                <option value="" disabled className="text-gray-400">
                  🥺 Someone else...
                </option>
                {otherFriends.map((f) => (
                  <option key={f.id} value={f.id} className="text-pookie-text bg-white">
                    {f.avatarEmoji} {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Who was it for? */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-black uppercase text-pookie-muted tracking-wider">
              Step 2 · Who was it for?
            </label>
            <button
              type="button"
              onClick={() => setIncludeMeInSplit(!includeMeInSplit)}
              className={`text-xs font-bold px-2.5 py-1 rounded-xl transition-all border ${
                includeMeInSplit
                  ? 'bg-pookie-blush text-pookie-dark border-pookie-soft font-black'
                  : 'bg-white text-pookie-muted border-dashed border-pookie-soft hover:text-pookie-text'
              }`}
            >
              {includeMeInSplit ? '✓ Split with me too' : '+ Include myself'}
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
            {otherFriends.map((friend) => {
              const isSelected = selectedFriends.includes(friend.id);
              return (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => toggleFriend(friend.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black shrink-0 transition-all active:scale-95 border ${
                    isSelected
                      ? 'bg-pookie-blush border-pookie-primary text-pookie-dark ring-2 ring-pookie-soft shadow-xs'
                      : 'bg-white text-pookie-text border-pookie-soft hover:bg-pookie-blush/60'
                  }`}
                >
                  <PookieAvatar emoji={friend.avatarEmoji} name={friend.name} imageSrc={friend.avatarImage ? `/waifu/${encodeURIComponent(friend.avatarImage)}` : undefined} size="xs" />
                  <span>{friend.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-pookie-dark stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: What did you get? */}
        <div>
          <label className="block text-xs font-black uppercase text-pookie-muted tracking-wider mb-2.5">
            Step 3 · What did you get?
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                selected={category === cat.id}
                onClick={() => setCategory(cat.id)}
              />
            ))}
          </div>

          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Custom note (e.g. Extra fries, Peri peri spice)"
            className="w-full mt-2.5 px-4 py-2.5 rounded-2xl bg-white border border-pookie-soft text-base sm:text-sm font-semibold text-pookie-text placeholder-pookie-muted/50 focus:outline-none focus:ring-2 focus:ring-pookie-primary"
          />
        </div>

        {/* Step 4: Amount */}
        <div>
          <label className="block text-xs font-black uppercase text-pookie-muted tracking-wider mb-2">
            Step 4 · Amount in ₹
          </label>
          <AmountInput value={amountStr} onChange={setAmountStr} placeholder="0" autoFocus />
        </div>

        {/* Step 5: Optional Split Options */}
        {participants.length > 1 && totalPaise > 0 && (
          <div className="p-4 rounded-3xl bg-pookie-blush/60 border border-pookie-soft space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-pookie-dark tracking-wider">
                Split among {participants.length} Pookies
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-pookie-soft">
                <button
                  type="button"
                  onClick={() => setSplitMode('equal')}
                  className={`text-[11px] font-black px-2.5 py-1 rounded-lg transition-all ${
                    splitMode === 'equal'
                      ? 'bg-pookie-primary text-white shadow-xs'
                      : 'text-pookie-muted hover:text-pookie-text'
                  }`}
                >
                  Equal
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode('custom')}
                  className={`text-[11px] font-black px-2.5 py-1 rounded-lg transition-all ${
                    splitMode === 'custom'
                      ? 'bg-pookie-primary text-white shadow-xs'
                      : 'text-pookie-muted hover:text-pookie-text'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {splitMode === 'equal' ? (
              <p className="text-xs font-bold text-pookie-muted flex items-center gap-1.5">
                <span>✨</span> Each person pays{' '}
                <strong className="text-pookie-text font-mono text-sm">
                  {formatCurrency(Math.floor(totalPaise / participants.length))}
                </strong>
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={splitEvenly}
                    className="text-[11px] font-black text-pookie-primary hover:text-pookie-dark transition-colors"
                  >
                    Start from equal split
                  </button>
                </div>
                {participants.map((pId) => {
                  const friend = friends.find((f) => f.id === pId) || me;
                  return (
                    <div key={pId} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PookieAvatar emoji={friend.avatarEmoji} name={friend.name} imageSrc={friend.avatarImage ? `/waifu/${encodeURIComponent(friend.avatarImage)}` : undefined} size="xs" />
                        <span className="text-xs font-bold text-pookie-text">{friend.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-pookie-muted">₹</span>
                        <input
                          type="number"
                          value={customShares[pId] || ''}
                          onChange={(e) => handleCustomShareChange(pId, e.target.value)}
                          placeholder="0"
                          className="w-20 px-2.5 py-1 text-right text-base sm:text-xs font-mono font-bold rounded-xl border border-pookie-soft focus:outline-none focus:ring-1 focus:ring-pookie-primary"
                        />
                      </div>
                    </div>
                  );
                })}

                {customSplitCheck && (
                  <div
                    className={`mt-1 flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-black ${
                      customSplitCheck.isValid
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}
                  >
                    <span>Allocated {formatCurrency(totalPaise - customSplitCheck.differencePaise)} of {formatCurrency(totalPaise)}</span>
                    {!customSplitCheck.isValid && (
                      <span>
                        {customSplitCheck.differencePaise > 0
                          ? `${formatCurrency(customSplitCheck.differencePaise)} left`
                          : `${formatCurrency(Math.abs(customSplitCheck.differencePaise))} over`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 6: Confirmation Preview Card */}
        {previewInfo && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-white via-pookie-blush/80 to-white border-2 border-pookie-soft shadow-pookie-sm animate-pop-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{previewInfo.emoji}</span>
                <div>
                  <h4 className="text-sm font-black text-pookie-text">{previewInfo.title}</h4>
                  <p className="text-[11px] font-semibold text-pookie-muted">{previewInfo.subline}</p>
                </div>
              </div>
              <span className="text-lg font-black text-pookie-dark font-mono">
                {previewInfo.amount}
              </span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-pookie-soft/60 flex items-center gap-1.5 text-xs font-black text-pookie-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{previewInfo.summary}</span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <p className="text-xs font-bold text-rose-500 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl text-center">
            {errorMsg}
          </p>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!!customSplitCheck && !customSplitCheck.isValid}
          leftIcon={<Heart className="w-5 h-5 fill-white stroke-white" />}
        >
          Add to Pookie 🎀
        </Button>
      </form>
    </BottomSheet>
  );
};

