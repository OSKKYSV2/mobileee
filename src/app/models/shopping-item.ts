export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  bought: boolean;
  createdAt: string;
  // Název souboru s fotkou v úložišti telefonu, nebo null bez fotky.
  photoFile: string | null;
}

export const CATEGORIES = [
  'Ovoce a zelenina',
  'Pečivo',
  'Mléčné výrobky',
  'Maso a uzeniny',
  'Trvanlivé potraviny',
  'Nápoje',
  'Drogerie',
  'Ostatní',
];
