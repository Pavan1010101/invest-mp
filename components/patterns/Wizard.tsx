/**
 * SISMP — Multi-Step Wizard Pattern
 * Reusable wizard with step indicator, per-step validation, and progress saving.
 * Used by the registration flow and any future multi-step forms.
 */
'use client';

import React, { useState, useCallback, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  validate?: () => boolean | Promise<boolean>;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void | Promise<void>;
  storageKey?: string; // localStorage key for progress saving
  submitLabel?: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
  backLabel?: string;
  nextLabel?: string;
}

export function Wizard({
  steps,
  onComplete,
  storageKey,
  submitLabel = 'Submit Registration',
  submittingLabel = 'Submitting...',
  isSubmitting = false,
  backLabel = 'Back',
  nextLabel = 'Next',
}: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isValidating, setIsValidating] = useState(false);

  // Restore progress from localStorage
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.currentStep != null) setCurrentStep(data.currentStep);
        if (data.completedSteps) setCompletedSteps(new Set(data.completedSteps));
      }
    } catch {
      // Silently ignore corrupt storage
    }
  }, [storageKey]);

  // Save progress to localStorage
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          currentStep,
          completedSteps: Array.from(completedSteps),
        })
      );
    } catch {
      // Storage might be full or unavailable
    }
  }, [storageKey, currentStep, completedSteps]);

  const goToStep = useCallback((index: number) => {
    if (index <= currentStep || completedSteps.has(index - 1)) {
      setCurrentStep(index);
    }
  }, [currentStep, completedSteps]);

  const handleNext = useCallback(async () => {
    const step = steps[currentStep];

    // Validate current step if validator exists
    if (step.validate) {
      setIsValidating(true);
      try {
        const isValid = await step.validate();
        if (!isValid) {
          setIsValidating(false);
          return;
        }
      } catch {
        setIsValidating(false);
        return;
      }
      setIsValidating(false);
    }

    // Mark step as completed
    setCompletedSteps((prev) => new Set([...prev, currentStep]));

    // Go to next step or submit
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await onComplete();
      // Clear saved progress on successful completion
      if (storageKey) localStorage.removeItem(storageKey);
    }
  }, [currentStep, steps, onComplete, storageKey]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="w-full">
      {/* Step Indicator */}
      <nav aria-label="Registration progress" className="mb-8">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = completedSteps.has(index);
            const isAccessible = index <= currentStep || completedSteps.has(index - 1);

            return (
              <li key={step.id} className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}>
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  disabled={!isAccessible}
                  className={cn(
                    'flex items-center gap-3 group transition-all duration-200',
                    isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {/* Step circle */}
                  <span
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold shrink-0',
                      'transition-all duration-200',
                      isCompleted && 'bg-primary text-white',
                      isActive && !isCompleted && 'bg-primary text-white ring-4 ring-primary-100 dark:ring-primary-900',
                      !isActive && !isCompleted && 'bg-background text-foreground-muted border-2 border-border',
                      isAccessible && !isActive && !isCompleted && 'group-hover:border-primary-200'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {/* Step label */}
                  <span className="hidden sm:block">
                    <span
                      className={cn(
                        'block text-sm font-medium',
                        isActive ? 'text-primary' : 'text-foreground-muted'
                      )}
                    >
                      {step.title}
                    </span>
                    {step.description && (
                      <span className="block text-xs text-foreground-subtle mt-0.5">
                        {step.description}
                      </span>
                    )}
                  </span>
                </button>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 hidden sm:block">
                    <div
                      className={cn(
                        'h-0.5 rounded-full transition-colors duration-300',
                        isCompleted ? 'bg-primary' : 'bg-border'
                      )}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="animate-fade-in" key={currentStep}>
        {steps[currentStep]?.content}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          {backLabel}
        </Button>

        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <span className="hidden sm:inline">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        <Button
          variant={isLastStep ? 'accent' : 'primary'}
          onClick={handleNext}
          isLoading={isValidating || isSubmitting}
          disabled={isValidating || isSubmitting}
        >
          {isLastStep ? (isSubmitting ? submittingLabel : submitLabel) : nextLabel}
        </Button>
      </div>
    </div>
  );
}
