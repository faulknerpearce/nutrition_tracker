/// <reference types="@cloudflare/workers-types" />

const OFF_FIELDS = [
  'product_name',
  'brands',
  'nutriments',
  'serving_size',
  'serving_quantity',
  'quantity',
].join(',')

const BARCODE_PATTERN = /^\d{8,14}$/

export const onRequest: PagesFunction = async (context) => {
  const rawBarcode = context.params.barcode
  const barcode = Array.isArray(rawBarcode) ? rawBarcode[0] : rawBarcode
  if (!barcode || !BARCODE_PATTERN.test(barcode)) {
    return Response.json({ error: 'Invalid barcode' }, { status: 400 })
  }

  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${OFF_FIELDS}`

  try {
    const offResponse = await fetch(url, {
      headers: {
        'User-Agent': 'NutritionTracker/1.0 (https://github.com/faulknerpearce/nutrition_tracker)',
        Accept: 'application/json',
      },
    })

    if (!offResponse.ok) {
      return Response.json({ error: 'Product lookup failed' }, { status: 502 })
    }

    const data = (await offResponse.json()) as {
      status?: number
      product?: Record<string, unknown>
    }

    if (data.status !== 1 || !data.product) {
      return Response.json({ found: false }, { status: 404 })
    }

    return Response.json(
      { found: true, product: data.product },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      },
    )
  } catch {
    return Response.json({ error: 'Product lookup failed' }, { status: 502 })
  }
}