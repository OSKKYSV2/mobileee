import type { ShoppingItem } from './shopping-item';
import { CATEGORIES } from './shopping-item';

export type ItemFilter = 'all' | 'open' | 'bought';

export interface CategoryGroup {
  category: string;
  items: ShoppingItem[];
}

export function filterItems(items: ShoppingItem[], filter: ItemFilter): ShoppingItem[] {
  if (filter === 'open') {
    return items.filter((item) => !item.bought);
  }

  if (filter === 'bought') {
    return items.filter((item) => item.bought);
  }

  return items;
}

// Seskupí položky podle kategorie v pořadí, v jakém chodíme obchodem (pořadí CATEGORIES).
export function groupByCategory(items: ShoppingItem[]): CategoryGroup[] {
  const groups: CategoryGroup[] = [];

  for (const category of CATEGORIES) {
    const inCategory = items.filter((item) => item.category === category);
    if (inCategory.length > 0) {
      groups.push({ category, items: inCategory });
    }
  }

  // Neznámou kategorii (např. ze starší verze aplikace) zařadíme na konec.
  const unknown = items.filter((item) => !CATEGORIES.includes(item.category));
  if (unknown.length > 0) {
    groups.push({ category: 'Bez kategorie', items: unknown });
  }

  return groups;
}

export function countOpen(items: ShoppingItem[]): number {
  return items.filter((item) => !item.bought).length;
}
