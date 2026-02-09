import React, { useRef, useEffect, useState } from 'react';
import SignaturePadLib from 'signature_pad';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  label: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  required?: boolean;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  label,
  value,
  onChange,
  required = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePadLib | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d')?.scale(ratio, ratio);

      signaturePadRef.current = new SignaturePadLib(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
      });

      signaturePadRef.current.addEventListener('endStroke', () => {
        setIsEmpty(signaturePadRef.current?.isEmpty() ?? true);
      });

      // Load existing signature if provided
      if (value) {
        signaturePadRef.current.fromDataURL(value);
        setIsEmpty(false);
      }
    }

    return () => {
      signaturePadRef.current?.off();
    };
  }, []);

  useEffect(() => {
    if (value && signaturePadRef.current && signaturePadRef.current.isEmpty()) {
      signaturePadRef.current.fromDataURL(value);
      setIsEmpty(false);
    }
  }, [value]);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setIsEmpty(true);
    onChange('');
  };

  const handleSave = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const dataUrl = signaturePadRef.current.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="border rounded-md overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-32 cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
        >
          <Eraser className="h-4 w-4 mr-1" />
          Clear
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={isEmpty}
        >
          <Check className="h-4 w-4 mr-1" />
          Confirm Signature
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;
