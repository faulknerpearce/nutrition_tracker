import {
  mapOpenFoodFactsToEntry,
  type MappedBarcodeProduct,
  type OpenFoodFactsProduct,
} from '@nutrition-tracker/shared'

export type { MappedBarcodeProduct }

export class ProductNotFoundError extends Error {
  constructor(barcode: string) {
    super(`No product found for barcode ${barcode}`)
    this.name = 'ProductNotFoundError'
  }
}

export async function lookupBarcodeProduct(barcode: string): Promise<MappedBarcodeProduct> {
  const normalized = barcode.trim()
  const response = await fetch(`/api/product/${encodeURIComponent(normalized)}`)

  if (response.status === 404) {
    throw new ProductNotFoundError(normalized)
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? 'Failed to look up product')
  }

  const data = (await response.json()) as {
    found: boolean
    product?: OpenFoodFactsProduct
  }

  if (!data.found || !data.product) {
    throw new ProductNotFoundError(normalized)
  }

  return mapOpenFoodFactsToEntry(data.product, normalized)
}