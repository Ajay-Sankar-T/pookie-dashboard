'use client';

import React, { useState, useMemo } from 'react';
import { usePookie } from '@/context/PookieContext';
import { Transaction, SplitItem } from '@/types';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { AmountInput } from '../ui/AmountInput';
import { PookieAvatar } from '../ui/PookieAvatar';
import { CATEGORIES } from '@/lib/sample-data';
import { formatCurrency, toPaise, toRupees, validateSplits } from '@/lib/currency';
import { Trash2, Edit3, Users, Check, X } from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  const { friends, deleteTransaction, updateTransaction, currentUser } = usePookie();
  const me = currentUser!;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editPayerId, setEditPayerId] = useState('');
  const [editAmountStr, setEditAmountStr] = useState('');
  const [editShares, setEditShares] = useState<Record<string, string>>({});

  const catMeta = transaction
    ? CATEGORIES.find((c) => c.id === transaction.category) || CATEGORIES[CATEGORIES.length - 1]
    : CATEGORIES[0];

  const editAmountPaise = toPaise(editAmountStr);
  const editSplits: SplitItem[] = useMemo(
    () =>
      Object.entries(editShares).map(([friendId, val]) => ({
        friendId,
        amountPaise: toPaise(val || '0'),
      })),
    [editShares]
  );
  const splitCheck = useMemo(
    () => (transaction && !transaction.isSettlement ? validateSplits(editAmountPaise, editSplits) : null),
    [transaction, editAmountPaise, editSplits]
  );

  if (!transaction) return null;

  const payer =
    transaction.payerId === me.id
      ? me
      : friends.find((f) => f.id === transaction.payerId) || me;

  const handleStartEdit = () => {
    setEditTitle(transaction.title);
    setEditNote(transaction.note || '');
    setEditPayerId(transaction.payerId);
    setEditAmountStr(toRupees(transaction.amountPaise).toString());
    const shares: Record<string, string> = {};
    transaction.splits.forEach((s) => {
      shares[s.friendId] = toRupees(s.amountPaise).toString();
    });
    setEditShares(shares);
    setIsEditing(true);
  };

  const handleShareChange = (friendId: string, val: string) => {
    setEditShares((prev) => ({ ...prev, [friendId]: val }));
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    if (editAmountPaise <= 0) return;
    if (splitCheck && !splitCheck.isValid) return;

    updateTransaction({
      ...transaction,
      title: editTitle.trim(),
      note: editNote.trim() || undefined,
      payerId: editPayerId || transaction.payerId,
      amountPaise: editAmountPaise,
      splits: transaction.isSettlement ? transaction.splits : editSplits,
      ...(transaction.isSettlement && transaction.settlementDetails
        ? {
            settlementDetails: {
              ...transaction.settlementDetails,
              settledAmountPaise: editAmountPaise,
            },
          }
        : {}),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Delete this expense? Balances will be recalculated.')) {
      deleteTransaction(transaction.id);
      onClose();
    }
  };

  const otherFriends = friends.filter((f) => f.id !== me.id);

  return (
    <BottomSheet
      isOpen={!!transaction}
      onClose={() => {
        setIsEditing(false);
        onClose();
      }}
      title={isEditing ? 'Edit Expense' : 'Expense Details'}
      subtitle={new Date(transaction.date).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      })}
      emoji={catMeta.emoji}
      maxHeight="max-h-[92vh]"
    >
      <div className="space-y-5">
        {/* Main Amount & Icon Badge */}
        <div className="text-center p-5 rounded-3xl bg-gradient-to-br from-white via-pookie-blush to-[#FFF0F6] border border-pookie-soft shadow-pookie-sm">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-2 border border-pookie-soft shadow-xs"
               style={{ backgroundColor: catMeta.color }}>
            <span>{catMeta.emoji}</span>
          </div>

          {isEditing ? (
            <div className="space-y-2 mt-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Expense title"
                className="w-full text-center px-4 py-2 font-black text-pookie-text text-base rounded-2xl border border-pookie-soft focus:outline-none focus:ring-2 focus:ring-pookie-primary"
              />
              <input
                type="text"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Add a note"
                className="w-full text-center px-4 py-1.5 font-semibold text-pookie-muted text-base sm:text-xs rounded-xl border border-pookie-soft focus:outline-none focus:ring-2 focus:ring-pookie-primary"
              />
            </div>
          ) : (
            <>
              <h3 className="text-lg sm:text-xl font-black text-pookie-text tracking-tight">
                {transaction.title}
              </h3>
              {transaction.note && (
                <p className="text-xs font-semibold text-pookie-muted mt-0.5">{transaction.note}</p>
              )}
            </>
          )}

          {isEditing ? (
            <div className="mt-3">
              <AmountInput value={editAmountStr} onChange={setEditAmountStr} />
            </div>
          ) : (
            <p className="text-3xl font-black text-pookie-dark font-mono mt-3">
              {formatCurrency(transaction.amountPaise)}
            </p>
          )}
        </div>

        {/* Payer info */}
        <div className="p-4 rounded-2xl bg-white border border-pookie-soft flex items-center justify-between">
          <span className="text-xs font-black uppercase text-pookie-muted tracking-wider">
            Paid by:
          </span>
          {isEditing ? (
            <select
              value={editPayerId}
              onChange={(e) => setEditPayerId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-pookie-soft bg-white text-xs font-black text-pookie-text focus:outline-none focus:ring-2 focus:ring-pookie-primary"
            >
              <option value={me.id}>💕 Me</option>
              {otherFriends.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.avatarEmoji} {f.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1.5">
              <PookieAvatar emoji={payer.avatarEmoji} name={payer.name} imageSrc={payer.avatarImage ? `/waifu/${encodeURIComponent(payer.avatarImage)}` : undefined} size="xs" />
              <span className="text-xs font-black text-pookie-text">{payer.name}</span>
            </div>
          )}
        </div>

        {/* Splits breakdown */}
        {!transaction.isSettlement && (isEditing ? editSplits.length > 0 : transaction.splits.length > 0) && (
          <div className="space-y-2">
            <p className="text-xs font-black uppercase text-pookie-muted tracking-wider px-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Split Details</span>
            </p>
            <div className="space-y-1.5">
              {(isEditing ? Object.keys(editShares) : transaction.splits.map((s) => s.friendId)).map(
                (friendId) => {
                  const friend =
                    friendId === me.id ? me : friends.find((f) => f.id === friendId) || me;
                  const original = transaction.splits.find((s) => s.friendId === friendId);
                  return (
                    <div
                      key={friendId}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border border-pookie-soft/70 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <PookieAvatar emoji={friend.avatarEmoji} name={friend.name} imageSrc={friend.avatarImage ? `/waifu/${encodeURIComponent(friend.avatarImage)}` : undefined} size="xs" />
                        <span className="font-bold text-pookie-text">{friend.name}</span>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-pookie-muted font-bold">₹</span>
                          <input
                            type="number"
                            value={editShares[friendId] || ''}
                            onChange={(e) => handleShareChange(friendId, e.target.value)}
                            className="w-20 px-2 py-1 text-right text-base sm:text-xs font-mono font-bold rounded-xl border border-pookie-soft focus:outline-none focus:ring-1 focus:ring-pookie-primary"
                          />
                        </div>
                      ) : (
                        <span className="font-black font-mono text-pookie-dark">
                          {formatCurrency(original?.amountPaise || 0)}
                        </span>
                      )}
                    </div>
                  );
                }
              )}
            </div>
            {isEditing && splitCheck && (
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-black ${
                  splitCheck.isValid
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}
              >
                <span>Allocated {formatCurrency(editAmountPaise - splitCheck.differencePaise)} of {formatCurrency(editAmountPaise)}</span>
                {!splitCheck.isValid && (
                  <span>
                    {splitCheck.differencePaise > 0
                      ? `${formatCurrency(splitCheck.differencePaise)} left`
                      : `${formatCurrency(Math.abs(splitCheck.differencePaise))} over`}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Settlement indicator if applicable */}
        {transaction.isSettlement && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
            ✨ This was a debt settlement transaction.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2">
          {isEditing ? (
            <>
              <Button
                variant="primary"
                size="md"
                fullWidth
                leftIcon={<Check className="w-4 h-4" />}
                disabled={editAmountPaise <= 0 || (!!splitCheck && !splitCheck.isValid)}
                onClick={handleSaveEdit}
              >
                Save Changes
              </Button>
              <Button
                variant="ghost"
                size="md"
                leftIcon={<X className="w-4 h-4" />}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                leftIcon={<Edit3 className="w-4 h-4" />}
                onClick={handleStartEdit}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="md"
                leftIcon={<Trash2 className="w-4 h-4 text-rose-500" />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
