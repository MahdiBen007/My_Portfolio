import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SectionVisibility {
  pricing: boolean;
  demo: boolean;
  portfolio: boolean;
  services: boolean;
}

interface SectionVisibilityContextType {
  sections: SectionVisibility;
  setSectionVisible: (section: keyof SectionVisibility, visible: boolean) => void;
}

const SectionVisibilityContext = createContext<SectionVisibilityContextType | undefined>(undefined);

export const SectionVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [sections, setSections] = useState<SectionVisibility>({
    pricing: false,
    demo: false,
    portfolio: false,
    services: true,
  });

  const setSectionVisible = useCallback((section: keyof SectionVisibility, visible: boolean) => {
    setSections(prev => ({ ...prev, [section]: visible }));
  }, []);

  return (
    <SectionVisibilityContext.Provider value={{ sections, setSectionVisible }}>
      {children}
    </SectionVisibilityContext.Provider>
  );
};

export const useSectionVisibility = () => {
  const context = useContext(SectionVisibilityContext);
  if (!context) {
    throw new Error('useSectionVisibility must be used within SectionVisibilityProvider');
  }
  return context;
};
