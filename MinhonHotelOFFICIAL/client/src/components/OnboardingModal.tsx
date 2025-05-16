import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import InfographicSteps from './InfographicSteps';
import { useAssistant } from '@/context/AssistantContext';
import { t } from '@/i18n';
import { FaPhoneAlt, FaQuestionCircle, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';

const BLUE_LAGOON_COLORS = {
  primary: '#79DBDC',
  secondary: '#79DCDC',
  accent: '#559A9A',
  light: '#E2FFFF',
  lighter: '#C6FFFF',
};

const OnboardingModal: React.FC = () => {
  const assistantContext = useAssistant();
  const language = (assistantContext as any)?.language || 'en';
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const handleShowGuide = () => setOpen(true);

  return (
    <>
      <button
        onClick={handleShowGuide}
        className="fixed top-4 right-4 z-[60] bg-white/90 hover:bg-[#E2FFFF] text-[#559A9A] rounded-full shadow-lg p-2 transition-colors"
        aria-label="Show Guide"
        style={{ fontSize: 28 }}
      >
        <FaQuestionCircle />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        {open ? <div className="fixed inset-0 z-40 bg-[#559A9A]/40" /> : null}
        <DialogContent
          className="sm:max-w-md z-50 rounded-2xl shadow-2xl border-0 p-0 min-h-[520px] max-h-[95vh] overflow-y-auto"
          style={{ background: `linear-gradient(135deg, ${BLUE_LAGOON_COLORS.light} 60%, ${BLUE_LAGOON_COLORS.lighter})` }}
        >
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-2xl font-bold text-[#559A9A] mb-1">
              {t('onboarding_title', language)}
            </DialogTitle>
            <DialogDescription className="text-base text-[#559A9A] mb-2">
              {t('onboarding_description', language)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6 gap-6 w-full">
            {/* Step 1 */}
            <div className="flex flex-col items-center w-full px-4 py-2 bg-white/90 rounded-xl shadow border border-[#E2FFFF]">
              <div className="rounded-full bg-[#79DBDC] shadow-lg flex items-center justify-center mb-2" style={{ width: 56, height: 56 }}>
                <FaPhoneAlt size={28} color="#fff" />
              </div>
              <span className="text-[#559A9A] font-semibold text-base text-center">{t('onboarding_step1', language)}</span>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center w-full px-4 py-2 bg-white/90 rounded-xl shadow border border-[#E2FFFF]">
              <div className="rounded-full bg-[#79DCDC] shadow-lg flex items-center justify-center mb-2" style={{ width: 56, height: 56 }}>
                <FaCheckCircle size={28} color="#fff" />
              </div>
              <span className="text-[#559A9A] font-semibold text-base text-center">{t('onboarding_step2', language)}</span>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center w-full px-4 py-2 bg-white/90 rounded-xl shadow border border-[#E2FFFF]">
              <div className="rounded-full bg-[#C6FFFF] shadow-lg flex items-center justify-center mb-2" style={{ width: 56, height: 56 }}>
                <FaPaperPlane size={28} color="#559A9A" />
              </div>
              <span className="text-[#559A9A] font-semibold text-base text-center">{t('onboarding_step3', language)}</span>
            </div>
          </div>
          <DialogFooter className="flex justify-end">
            <Button
              onClick={handleClose}
              className="px-6 py-2 text-base font-semibold rounded-lg shadow-md"
              style={{ background: BLUE_LAGOON_COLORS.primary, color: '#fff' }}
            >
              {t('start_using', language)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnboardingModal; 