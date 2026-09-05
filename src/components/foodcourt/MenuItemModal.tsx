'use client';

import React, { useEffect, useState } from 'react';
import { usePookie } from '@/context/PookieContext';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { CATEGORIES } from '@/lib/sample-data';
import { MenuItem } from '@/lib/menu';
import { Trash2 } from 'lucide-react';

interface MenuItemModalProps {
  /** Item being edited, or null to add a new one. */
  item: MenuItem | null;
  /** Section to default into when adding a fresh item from within a specific tab. */
  defaultSection?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MenuItemModal: React.FC<MenuItemModalProps> = ({ item, defaultSection, isOpen, onClose }) => {
  const { addMenuItem, updateMenuItem, deleteMenuItem, menu, showToast } = usePookie();
  const sections = Array.from(new Set(menu.map((m) => m.section)));

  const [name, setName] = useState('');
  const [priceRupees, setPriceRupees] = useState('');
  const [section, setSection] = useState('');
  const [customSection, setCustomSection] = useState('');
  const [category, setCategory] = useState('meal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(item?.name || '');
    setPriceRupees(item ? String(item.priceRupees) : '');
    setSection(item?.section || defaultSection || sections[0] || '');
    setCustomSection('');
    setCategory(item?.category || 'meal');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSection = (customSection.trim() || section).trim();
    const price = Number(priceRupees);

    if (!name.trim()) return showToast('Give it a name first 🥺');
    if (!finalSection) return showToast('Pick or type a section 🥺');
    if (!Number.isFinite(price) || price <= 0) return showToast('Enter a valid price 🥺');

    setIsSubmitting(true);
    if (item) {
      await updateMenuItem(item.id, {
        name: name.trim(),
        priceRupees: price,
        category,
        section: finalSection,
      });
    } else {
      await addMenuItem({ name: name.trim(), priceRupees: price, category, section: finalSection });
    }
    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm(`Remove "${item.name}" from the menu?`)) return;
    await deleteMenuItem(item.id);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Menu Item' : 'Add Menu Item'}
      subtitle={item ? item.name : 'New canteen item'}
      emoji={item ? '✏️' : '➕'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-black uppercase text-pookie-muted tracking-wider mb-1.5">
            Item Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Paneer Butter Masala"
            className="w-full px-4 py-3 rounded-2xl bg-white border border-pookie-soft text-base sm:text-sm font-semibold text-pookie-text placeholder-pookie-muted/50 focus:outline-none focus:ring-2 focus:ring-pookie-primary"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-pookie-muted tracking-wider mb-1.5">
            Price in ₹
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={priceRupees}
            onChange={(e) => setPriceRupees(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-3 rounded-2xl bg-white border border-pookie-soft text-base sm:text-sm font-black font-mono text-pookie-text placeholder-pookie-muted/50 focus:outline-none focus:ring-2 focus:ring-pookie-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-pookie-muted tracking-wider mb-1.5">
            Section
          </label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white border border-pookie-soft text-base sm:text-sm font-semibold text-pookie-text focus:outline-none focus:ring-2 focus:ring-pookie-primary mb-2"
          >
            {sections.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={customSection}
            onChange={(e) => setCustomSection(e.target.value)}
            placeholder="...or type a new section"
            className="w-full px-4 py-2.5 rounded-2xl bg-white border border-dashed border-pookie-soft text-base sm:text-sm font-semibold text-pookie-text placeholder-pookie-muted/50 focus:outline-none focus:ring-2 focus:ring-pookie-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-pookie-muted tracking-wider mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                  category === c.id
                    ? 'bg-pookie-primary text-white shadow-xs'
                    : 'bg-white text-pookie-muted border border-pookie-soft hover:text-pookie-text'
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isSubmitting}>
            {item ? 'Save Changes' : 'Add to Menu'}
          </Button>
          {item && (
            <Button
              type="button"
              variant="danger"
              size="md"
              fullWidth
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={handleDelete}
            >
              Remove Item
            </Button>
          )}
        </div>
      </form>
    </BottomSheet>
  );
};
