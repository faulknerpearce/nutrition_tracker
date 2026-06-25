import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'
import { useEffect, useRef, useState } from 'react'
import type { MappedBarcodeProduct } from '../lib/openFoodFacts'
import { lookupBarcodeProduct, ProductNotFoundError } from '../lib/openFoodFacts'
import { inputBase, labelBase } from '../lib/styles'
import Modal from './Modal'

interface BarcodeScannerModalProps {
  onProductFound: (product: MappedBarcodeProduct) => void
  onClose: () => void
}

export default function BarcodeScannerModal({
  onProductFound,
  onClose,
}: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const lookupInFlightRef = useRef(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookingUp, setLookingUp] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')

  const stopCamera = () => {
    controlsRef.current?.stop()
    controlsRef.current = null
    BrowserMultiFormatReader.releaseAllStreams()
  }

  const lookupBarcode = async (barcode: string) => {
    if (lookupInFlightRef.current) return
    lookupInFlightRef.current = true
    setLookingUp(true)
    setLookupError(null)
    stopCamera()

    try {
      const product = await lookupBarcodeProduct(barcode)
      onProductFound(product)
    } catch (err) {
      if (err instanceof ProductNotFoundError) {
        setLookupError('Product not found. Try another barcode or add the entry manually.')
      } else {
        setLookupError(err instanceof Error ? err.message : 'Failed to look up product')
      }
      lookupInFlightRef.current = false
      setLookingUp(false)
    }
  }

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader
    let cancelled = false

    async function startCamera() {
      if (!videoRef.current) return
      try {
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (cancelled || lookupInFlightRef.current || !result) return
            const text = result.getText()?.trim()
            if (text && /^\d{8,14}$/.test(text)) {
              void lookupBarcode(text)
            }
          },
        )
        if (cancelled) {
          controls.stop()
          return
        }
        controlsRef.current = controls
        setCameraError(null)
      } catch {
        if (!cancelled) {
          setCameraError('Camera access denied or unavailable. Enter the barcode manually below.')
        }
      }
    }

    void startCamera()

    return () => {
      cancelled = true
      stopCamera()
    }
    // lookupBarcode closes over stable refs; mount-only camera setup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleManualLookup = () => {
    const barcode = manualBarcode.trim()
    if (!/^\d{8,14}$/.test(barcode)) {
      setLookupError('Enter a valid 8–14 digit barcode')
      return
    }
    void lookupBarcode(barcode)
  }

  return (
    <Modal titleId="barcode-scanner-title" onClose={onClose} size="wide">
      <h3
        id="barcode-scanner-title"
        style={{
          fontFamily: "'Space Grotesk','Inter',sans-serif",
          fontSize: 22,
          fontWeight: 600,
          margin: '0 0 4px 0',
        }}
      >
        Scan Barcode
      </h3>
      <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 20px 0' }}>
        Point your camera at a food product barcode, or enter the number manually.
      </p>

      {lookupError && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          {lookupError}
        </div>
      )}

      <div
        style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          background: '#18181b',
          aspectRatio: '4 / 3',
          marginBottom: 20,
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: cameraError ? 'none' : 'block',
          }}
          muted
          playsInline
        />
        {cameraError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: 24,
              textAlign: 'center',
              color: '#a1a1aa',
              fontSize: 13,
            }}
          >
            {cameraError}
          </div>
        )}
        {lookingUp && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.55)',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              gap: 10,
            }}
          >
            <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
            Looking up product...
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="manual-barcode" style={labelBase}>
          Barcode number
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            id="manual-barcode"
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 012345678905"
            style={{ ...inputBase, flex: 1 }}
            disabled={lookingUp}
          />
          <button
            type="button"
            onClick={handleManualLookup}
            disabled={lookingUp || manualBarcode.trim().length < 8}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: '1px solid #134e4b',
              background: '#134e4b',
              color: 'white',
              fontSize: 13,
              fontWeight: 500,
              cursor: lookingUp ? 'not-allowed' : 'pointer',
              opacity: lookingUp || manualBarcode.trim().length < 8 ? 0.6 : 1,
              flexShrink: 0,
            }}
          >
            Lookup
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: 12,
          border: '1px solid #e4e4e7',
          background: 'white',
          color: '#52525b',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>
    </Modal>
  )
}