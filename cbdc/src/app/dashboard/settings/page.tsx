// src/app/dashboard/settings/page.tsx
import { SettingsPanel } from '@/components/settings/settings-panel';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 font-headline">Settings</h1>
      <SettingsPanel />
    </div>
  );
}
