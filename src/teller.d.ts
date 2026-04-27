// Type declaration for the Teller Connect CDN script (cdn.teller.io/connect/connect.js)

interface TellerEnrollment {
  accessToken: string;
  user: { id: string };
  enrollment: {
    id: string;
    institution: { name: string };
  };
  signatures?: string[];
}

interface TellerConnectOptions {
  applicationId: string;
  environment?: 'sandbox' | 'development' | 'production';
  products?: string[];
  onInit?: () => void;
  onSuccess: (enrollment: TellerEnrollment) => void;
  onExit?: () => void;
  onFailure?: (error: unknown) => void;
}

interface TellerConnectInstance {
  open: () => void;
}

interface TellerConnectStatic {
  setup(options: TellerConnectOptions): TellerConnectInstance;
}

declare const TellerConnect: TellerConnectStatic;
