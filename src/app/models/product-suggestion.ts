// Část odpovědi Open Food Facts, kterou používáme.
export interface ProductSearchResponse {
  products: { code?: string; product_name?: string; brands?: string }[];
}

export interface ProductSuggestion {
  code: string;
  name: string;
  brand: string;
}
