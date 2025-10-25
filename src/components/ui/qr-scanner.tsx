// File path: src/components/ui/qr-scanner.tsx
"use client"

import { useEffect, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, Loader2 } from "lucide-react"

// Define component props interface
interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

// Scanner DOM element ID
const QR_READER_ID = "qr-reader-element";

export function QrScanner({ onScanSuccess, onClose }: QrScannerProps) {
  const [scanStatus, setScanStatus] = useState<"loading" | "success" | "error" | "idle">("loading");
  const [statusText, setStatusText] = useState("Starting camera...");

  useEffect(() => {
    // Ensure it only runs in the browser
    if (typeof window === "undefined") {
      return;
    }

    // Scanner configuration
    const config = {
      fps: 10,
      qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
        // Ensure the viewfinder is responsive
        const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.75;
        return {
          width: size,
          height: size,
        };
      },
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
    };

    // Create new scanner instance
    const scanner = new Html5QrcodeScanner(QR_READER_ID, config, false);

    // Scan success callback
    const handleSuccess = (decodedText: string) => {
      setScanStatus("success");
      setStatusText("Scan Successful!");
      
      // Stop scanning
      scanner.clear();
      
      // Delay 500ms before calling parent's onScanSuccess
      // This gives user time to see the "Success!" message
      setTimeout(() => {
        onScanSuccess(decodedText);
      }, 500);
    };

    // Scan error callback
    const handleError = (errorMessage: string) => {
      // Ignore the most common "QR code not found" error, only report serious errors
        if (errorMessage.includes("No QR code found")) {
          console.error("QR Scanner Error:", errorMessage);
          setScanStatus("error");
          setStatusText("Failed to start camera. Please check permissions.");
        }
    };
    
    // Start rendering
    scanner.render(handleSuccess, handleError);
    // Assume rendering starts successfully, set status to idle immediately.
    // The handleError callback will update status if there's an issue.
    setScanStatus("idle");
    setStatusText("Point your camera at a QR code");

    // Cleanup: stop and clear scanner when component unmounts
    return () => {
      console.log("Cleaning up QR scanner...");
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner on unmount:", error);
      });
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm">
      {/* 1. Top bar (close button) */}
      <div className="flex w-full items-center justify-end p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white rounded-full hover:text-white hover:bg-white/10"
          aria-label="Close scanner"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* 2. Scanner viewport */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4">
        {/* This is the DOM element where the scanner is mounted */}
        <div 
          id={QR_READER_ID} 
          className="w-full max-w-md md:max-w-lg rounded-lg overflow-hidden"
        >
          {/* html5-qrcode library will inject <video> element here */}
        </div>

        {/* 3. Status indicator */}
        <div className="mt-4 flex items-center justify-center space-x-2 p-4 bg-black/30 rounded-lg">
          {scanStatus === "loading" && (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          )}
          {scanStatus === "success" && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          <p className="text-base font-medium text-white">{statusText}</p>
        </div>
      </div>
    </div>
  );
}