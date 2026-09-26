import { create } from 'zustand'

interface OnboardingState {
  firstName: string
  setFirstName: (value: string) => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  firstName: '',
  setFirstName: (firstName) => set({ firstName }),
}))
