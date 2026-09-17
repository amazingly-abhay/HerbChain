import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Share2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface QRCodeDisplayProps {
  batchId: string;
  herbName: string;
  size?: number;
}

export default function QRCodeDisplay({ batchId, herbName, size = 200 }: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const verifyUrl = `${window.location.origin}/verify/${batchId}`;

  const handleDownload = useCallback(() => {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 32;
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2 + 60;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, padding, padding, size, size);

      ctx.fillStyle = '#1A1A2E';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(herbName, canvas.width / 2, size + padding + 24);

      ctx.fillStyle = '#6B7280';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(batchId, canvas.width / 2, size + padding + 44);

      const link = document.createElement('a');
      link.download = `HerbChain-QR-${batchId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [batchId, herbName, size]);

  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>QR Code - ${batchId}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;">
          <div>${svgData}</div>
          <h2 style="margin-top:16px;">${herbName}</h2>
          <p style="color:#6B7280;">${batchId}</p>
          <p style="color:#9CA3AF;font-size:12px;">${verifyUrl}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [batchId, herbName, verifyUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `HerbChain - ${herbName}`,
          text: `Verify ${herbName} batch: ${batchId}`,
          url: verifyUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(verifyUrl);
    }
  }, [batchId, herbName, verifyUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="h-1.5 bg-gradient-to-r from-herb-green-500 to-herb-green-700" />

      <div className="p-6 flex flex-col items-center">
        <div ref={qrRef} className="bg-white p-4 rounded-lg border border-gray-100">
          <QRCodeSVG
            value={verifyUrl}
            size={size}
            level="H"
            includeMargin={false}
            bgColor="#FFFFFF"
            fgColor="#1A1A2E"
          />
        </div>

        <div className="mt-4 text-center">
          <h3 className="font-semibold text-gray-900">{herbName}</h3>
          <p className="text-sm text-gray-500 mt-1 font-mono">{batchId}</p>
        </div>

        <div className="flex gap-2 mt-5 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="w-4 h-4" />}
            className="flex-1"
          >
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
            className="flex-1"
          >
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            leftIcon={<Share2 className="w-4 h-4" />}
            className="flex-1"
          >
            Share
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
