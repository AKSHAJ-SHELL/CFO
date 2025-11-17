'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface BetaFeatureToggleProps {
  featureId: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

/**
 * BetaFeatureToggle component for individual feature toggles
 */
export default function BetaFeatureToggle({ featureId, enabled, onToggle }: BetaFeatureToggleProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-background-main rounded">
      <Label htmlFor={`toggle-${featureId}`} className="text-sm text-text-dark capitalize cursor-pointer">
        {featureId.replace('-', ' ')}
      </Label>
      <Switch
        id={`toggle-${featureId}`}
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label={`Toggle ${featureId}`}
      />
    </div>
  );
}

