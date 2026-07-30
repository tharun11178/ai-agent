declare module 'html5-qrcode' {
  export class Html5Qrcode {
    constructor(elementId: string, config?: any);
    start(
      cameraConfig: any,
      configuration: any,
      qrCodeSuccessCallback: (decodedText: string, result: any) => void,
      qrCodeErrorCallback?: (errorMessage: string) => void
    ): Promise<null>;
    stop(): Promise<void>;
    clear(): void;
    scanFile(imageFile: File, showImage?: boolean): Promise<string>;
    isScanning: boolean;
  }
  export class Html5QrcodeScanner {
    constructor(elementId: string, config: any, verbose: boolean);
    render(onSuccess: (decodedText: string, result: any) => void, onError?: (errorMessage: string) => void): void;
    clear(): Promise<void>;
  }
}
