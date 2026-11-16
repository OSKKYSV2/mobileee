import { describe, expect, it } from 'vitest';

import { countOpen, filterItems, groupByCategory } from './list-utils';
import type { ShoppingItem } from './shopping-item';

function item(id: string, category: string, bought = false): ShoppingItem {
  return {
    id,
    name: id,
    quantity: 1,
    category,
    bought,
    createdAt: '2026-11-16T10:00:00.000Z',
    photoFile: null,
  };
}

describe('list-utils', () => {
  const milk = item('mleko', 'Mléčné výrobky');
  const bread = item('chleba', 'Pečivo', true);
  const soap = item('mydlo', 'Drogerie');
  const items = [soap, milk, bread];

  it('should keep all items for the "all" filter', () => {
    expect(filterItems(items, 'all')).toEqual(items);
  });

  it('should keep only items to buy for the "open" filter', () => {
    expect(filterItems(items, 'open')).toEqual([soap, milk]);
  });

  it('should keep only bought items for the "bought" filter', () => {
    expect(filterItems(items, 'bought')).toEqual([bread]);
  });

  it('should group items in the shop order of categories', () => {
    const groups = groupByCategory(items);

    expect(groups.map((group) => group.category)).toEqual(['Pečivo', 'Mléčné výrobky', 'Drogerie']);
    expect(groups[1].items).toEqual([milk]);
  });

  it('should put an unknown category at the end', () => {
    const odd = item('neco', 'Neznámá');

    const groups = groupByCategory([odd, milk]);

    expect(groups.at(-1)).toEqual({ category: 'Bez kategorie', items: [odd] });
  });

  it('should count items that are not bought yet', () => {
    expect(countOpen(items)).toBe(2);
    expect(countOpen([])).toBe(0);
  });
});
