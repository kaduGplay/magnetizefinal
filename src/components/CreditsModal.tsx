import InsufficientCreditsModal from "./InsufficientCreditsModal";

export const SINGLE_PLAN = {
  id: "lifetime-unlimited",
  name: "Plano Vitalício",
  amountCents: 1490,
  credits: 999999,
  isLifetime: true,
  isPremium: true,
} as const;

const QUICK_PLAN = {
  id: "credit-pack-500",
  name: "500 Créditos",
  amountCents: 990,
  credits: 500,
  isLifetime: false,
  isPremium: false,
} as const;

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreditsModal = ({ isOpen, onClose }: CreditsModalProps) => (
  <InsufficientCreditsModal
    isOpen={isOpen}
    onClose={onClose}
    onBuyCredits={onClose}
    currentCredits={0}
    requiredCredits={100}
  />
);

export default CreditsModal;
