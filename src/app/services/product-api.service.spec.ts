import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductApiService, toSuggestions } from './product-api.service';

describe('ProductApiService', () => {
  let service: ProductApiService;
  const getMock = vi.fn();

  beforeEach(() => {
    getMock.mockReset();

    // Místo skutečného HttpClient použijeme mock, test tak nechodí na internet.
    TestBed.configureTestingModule({
      providers: [ProductApiService, { provide: HttpClient, useValue: { get: getMock } }],
    });

    service = TestBed.inject(ProductApiService);
  });

  it('should send the search term and return suggestions', async () => {
    getMock.mockReturnValue(
      of({ products: [{ code: '1', product_name: 'Mléko polotučné', brands: 'Madeta, Jihočeské' }] }),
    );

    const result = await service.search('mléko');

    expect(result).toEqual([{ code: '1', name: 'Mléko polotučné', brand: 'Madeta' }]);
    expect(getMock).toHaveBeenCalledWith(
      'https://world.openfoodfacts.org/cgi/search.pl',
      expect.objectContaining({
        params: expect.objectContaining({ search_terms: 'mléko', json: 1 }),
      }),
    );
  });

  it('should pass a network error to the caller', async () => {
    getMock.mockReturnValue(throwError(() => new Error('offline')));

    await expect(service.search('mléko')).rejects.toThrow('offline');
  });
});

describe('toSuggestions', () => {
  it('should skip products without a name and duplicate names', () => {
    const result = toSuggestions({
      products: [
        { code: '1', product_name: 'Rohlík' },
        { code: '2', product_name: '  ' },
        { code: '3' },
        { code: '4', product_name: 'Rohlík' },
      ],
    });

    expect(result).toEqual([{ code: '1', name: 'Rohlík', brand: '' }]);
  });

  it('should return at most five suggestions', () => {
    const products = Array.from({ length: 8 }, (_, index) => ({
      code: String(index),
      product_name: `Produkt ${index}`,
    }));

    expect(toSuggestions({ products })).toHaveLength(5);
  });
});
