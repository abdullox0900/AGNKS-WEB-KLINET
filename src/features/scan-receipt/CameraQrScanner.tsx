import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'

interface CameraQrScannerProps {
  onDetect: (text: string) => void
  paused?: boolean
}

/** Browser-only QR scanner used when the webapp is opened outside Telegram, where
 * tg.showScanQrPopup() isn't available. Uses the `qr-scanner` library (worker-based,
 * prefers the native BarcodeDetector API when the browser has one) instead of a
 * hand-rolled getUserMedia+decode loop. Requires a secure context (https, or
 * localhost) — browsers hide navigator.mediaDevices otherwise.
 *
 * The camera stream is opened by hand (rather than letting qr-scanner call
 * getUserMedia itself) so we can ask for continuous autofocus — qr-scanner
 * reuses an existing `video.srcObject` instead of requesting its own stream
 * when one is already set before `start()`. Without this, phones default to a
 * fixed/slow-hunting focus which is the main reason close-up receipt QR codes
 * take a long time (or never) come into focus. */
export function CameraQrScanner({ onDetect, paused }: CameraQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (paused || !videoRef.current) return
    detectedRef.current = false
    setReady(false)
    let cancelled = false

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Bu brauzer kamerani qo'llamaydi")
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            // @ts-expect-error focusMode/focusDistance aren't in the standard lib.dom types yet
            advanced: [{ focusMode: 'continuous' }],
          },
        })
        if (cancelled || !videoRef.current) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        videoRef.current.srcObject = stream

        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            if (detectedRef.current || cancelled) return
            detectedRef.current = true
            scanner.stop()
            onDetect(result.data)
          },
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 25,
          },
        )
        scannerRef.current = scanner
        await scanner.start()
        if (!cancelled) setReady(true)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : String(err)
        setError(
          /permission|denied|NotAllowed/i.test(message)
            ? 'Kameraga ruxsat berilmadi — brauzer sozlamalaridan ruxsat bering'
            : /NotFound/i.test(message)
              ? 'Kamera topilmadi'
              : "Kamerani ochib bo'lmadi (https yoki localhost kerak)",
        )
      }
    }

    start()

    return () => {
      cancelled = true
      scannerRef.current?.stop()
      scannerRef.current?.destroy()
      scannerRef.current = null
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [paused, onDetect])

  return (
    <div className="rounded-3xl bg-[var(--color-surface)] p-3" style={{ boxShadow: 'var(--shadow-float)' }}>
      <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-2xl bg-black">
        {error ? (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-[13px] text-[var(--color-danger)]">
            {error}
          </div>
        ) : (
          <>
            <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
            {(!ready || paused) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-[1px]">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                <p className="text-[13px] font-medium text-white">
                  {paused ? 'Yuborilmoqda…' : 'Kamera ochilmoqda…'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      {!error && (
        <p className="pt-3 text-center text-[13px] text-[var(--color-ink-secondary)]">
          Chekdagi QR kodni ramka ichiga joylang — avtomatik aniqlanadi
        </p>
      )}
    </div>
  )
}
