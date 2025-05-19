// src/global.d.ts
declare module 'html5-qrcode' {
  export class Html5Qrcode {
    constructor(elementId: string);
    start(
      cameraIdOrConfig: string | { facingMode: 'environment' | 'user' },
      config: { fps?: number; qrbox?: number },
      qrCodeSuccessCallback: (decodedText: string) => void,
      qrCodeErrorCallback?: (errorMessage: string) => void
    ): Promise<void>;
    stop(): Promise<void>;
    // you can add more method/type signatures as you need them
  }
}
