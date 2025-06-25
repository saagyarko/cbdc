// src/app/dashboard/fraud-detection/page.tsx
import { FraudDetectionPanel } from '@/components/fraud-detection/fraud-detection-panel';

export default function FraudDetectionPage() {
  return (
    <div className="space-y-6">
      <FraudDetectionPanel />
      {/* TODO: Add a section for recent alerts or a table of past analyses */}
    </div>
  );
}
