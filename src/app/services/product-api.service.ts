import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';

import type { ProductSearchResponse, ProductSuggestion } from '../models/product-suggestion';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://world.openfoodfacts.org/cgi/search.pl';

  async search(term: string): Promise<ProductSuggestion[]> {
    // firstValueFrom spustí požadavek a umožní počkat na odpověď pomocí await.
    const response = await firstValueFrom(
      this.http
        .get<ProductSearchResponse>(this.apiUrl, {
          // HttpClient připojí parametry za otazník v URL.
          params: {
            search_terms: term,
            search_simple: 1,
            json: 1,
            page_size: 10,
            fields: 'code,product_name,brands',
          },
        })
        .pipe(timeout(10000)),
    );

    return toSuggestions(response);
  }
}

// Z odpovědi vezmeme jen produkty s názvem a odstraníme duplicitní názvy.
export function toSuggestions(response: ProductSearchResponse): ProductSuggestion[] {
  const suggestions: ProductSuggestion[] = [];

  for (const product of response.products ?? []) {
    const name = product.product_name?.trim();
    if (!name || suggestions.some((item) => item.name === name)) {
      continue;
    }

    suggestions.push({
      code: product.code ?? name,
      name,
      brand: product.brands?.split(',')[0]?.trim() ?? '',
    });
  }

  return suggestions.slice(0, 5);
}
