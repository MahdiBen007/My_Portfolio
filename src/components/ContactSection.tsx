import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useRef, useState, useCallback } from 'react';
import {
  Send,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const RATE_LIMIT_KEY = 'contact_rate_limit';
const RATE_LIMIT_MAX = 1;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

const checkClientRateLimit = (phone: string): boolean => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) return true;
    const records: { phone: string; timestamp: number }[] = JSON.parse(stored);
    const now = Date.now();
    const recent = records.filter(
      (r) => r.phone === phone && now - r.timestamp < RATE_LIMIT_WINDOW_MS
    );
    return recent.length < RATE_LIMIT_MAX;
  } catch {
    return true;
  }
};

const recordSubmission = (phone: string) => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const records: { phone: string; timestamp: number }[] = stored ? JSON.parse(stored) : [];
    const now = Date.now();
    const cleaned = records.filter((r) => now - r.timestamp < RATE_LIMIT_WINDOW_MS);
    cleaned.push({ phone, timestamp: now });
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(cleaned));
  } catch {
    // localStorage unavailable
  }
};

const sanitizeInput = (value: string): string => {
  return value
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 5000);
};

type ContactSectionProps = {
  title?: string;
  subtitle?: string;
};

export const ContactSection = ({ title, subtitle }: ContactSectionProps) => {
  const { t, isRTL } = useLanguage();
  const { data } = usePortfolioData();
  const { personalData } = data;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<{
    status: 'idle' | 'sending' | 'success' | 'error' | 'rate_limited';
    message?: string;
  }>({ status: 'idle' });
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  const normalizeWhatsApp = (raw: string) => {
    if (!raw) return '';
    const trimmed = raw.trim();
    if (trimmed.startsWith('http')) return trimmed;
    const digits = trimmed.replace(/[^0-9]/g, '');
    if (!digits) return '';
    return `https://wa.me/${digits}`;
  };

  const socialLinks = [
    { icon: Github, href: personalData.github, label: 'GitHub' },
    { icon: Linkedin, href: personalData.linkedin, label: 'LinkedIn' },
    { icon: Mail, href: personalData.email ? `mailto:${personalData.email}` : '', label: 'Email' },
    { icon: MessageCircle, href: normalizeWhatsApp(personalData.whatsapp), label: 'WhatsApp' },
  ].filter((link) => Boolean(link.href && link.href.trim().length > 0));

  const contactCards = [
    {
      icon: Mail,
      titleAr: 'البريد الإلكتروني',
      titleEn: 'Email',
      valueAr: personalData.email,
      valueEn: personalData.email,
      hintAr: 'للتواصل الرسمي أو طلب عرض سعر',
      hintEn: 'For official inquiries and project quotes',
      href: `mailto:${personalData.email}`,
      external: false,
    },
    {
      icon: Phone,
      titleAr: 'رقم الهاتف',
      titleEn: 'Phone',
      valueAr: personalData.phone,
      valueEn: personalData.phone,
      hintAr: 'متاح للمكالمات في أوقات العمل',
      hintEn: 'Available for calls during business hours',
      href: `tel:${personalData.phone.replace(/\s+/g, '')}`,
      external: false,
    },
    {
      icon: MapPin,
      titleAr: 'الموقع',
      titleEn: 'Location',
      valueAr: personalData.location,
      valueEn: personalData.locationEn,
      hintAr: 'العمل عن بعد أو حضوريا حسب الاتفاق',
      hintEn: 'Remote or on-site depending on agreement',
      href: '',
      external: false,
    },
  ].filter((card) => {
    const value =
      (card.valueAr ?? '').toString().trim() ||
      (card.valueEn ?? '').toString().trim();
    return value.length > 0;
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = sanitizeInput(formData.name);
    const trimmedPhone = formData.phone.replace(/\s/g, '');
    const trimmedMessage = sanitizeInput(formData.message);

    if (trimmedName.length < 2 || trimmedName.length > 100 || trimmedMessage.length < 10) {
      setSubmitState({
        status: 'error',
        message: t('يرجى ملء جميع الحقول بشكل صحيح.', 'Please fill in all fields correctly.'),
      });
      return;
    }

    const phoneRegex = /^0[567]\d{8}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setSubmitState({
        status: 'error',
        message: t(
          'رقم الهاتف يجب أن يبدأ بـ 05 أو 06 أو 07 ويكون 10 أرقام.',
          'Phone must start with 05, 06, or 07 and be 10 digits.'
        ),
      });
      return;
    }

    if (!checkClientRateLimit(trimmedPhone)) {
      setSubmitState({
        status: 'rate_limited',
        message: t('لقد أرسلت رسالة اليوم بهذا الرقم. حاول غداً.', 'You already sent a message today. Try again tomorrow.'),
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ status: 'sending' });
    try {
      const { error } = await supabase.from('messages').insert({
        name: trimmedName,
        email: '',
        phone: trimmedPhone,
        subject: null,
        message: trimmedMessage,
      });

      if (error) throw error;

      recordSubmission(trimmedPhone);
      setFormData({ name: '', phone: '', message: '' });
      setSubmitState({
        status: 'success',
        message: t('تم إرسال رسالتك بنجاح.', 'Your message has been sent successfully.'),
      });
      setTimeout(() => {
        setSubmitState({ status: 'idle' });
      }, 1600);
    } catch {
      setSubmitState({
        status: 'error',
        message: t('لم يتم إرسال الرسالة، حاول مرة أخرى.', 'Message was not sent. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, formData, t]);

  return (
    <section id="contact" className="relative py-[clamp(48px,8vw,112px)]" ref={ref}>
      <div className="container mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="section-header text-center mb-10 sm:mb-16"
        >
          <h2 className="section-title">{title ?? t('تواصل معي', 'Get In Touch')}</h2>
          <p className="section-subtitle mx-auto">
            {subtitle ?? t('هل لديك مشروع في ذهنك؟ دعنا نتحدث!', "Have a project in mind? Let's talk!")}
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-6 lg:gap-10 items-start">
          <motion.aside
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.15, ease: EASE_OUT }}
            className="space-y-3 sm:space-y-4 sm:col-span-5 lg:col-span-4"
          >
            <div className="glass-card rounded-3xl p-5 sm:p-6 md:p-7 relative overflow-hidden text-center">
              <div className={`absolute -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl pointer-events-none ${isRTL ? '-left-16' : '-right-16'}`} />
              <span className="pill-badge text-xs mb-4 mx-auto">
                {t('ابدأ متجرك الآن', 'Start Your Store Now')}
              </span>
              <h3 className="text-[1.35rem] leading-tight font-bold">
                {t('احصل على متجرك الخاص', 'Get Your Own Store')}
              </h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {t(
                  'تواصل معنا للحصول على عرض سعر مخصص وابدأ رحلتك في عالم التجارة الإلكترونية.',
                  'Contact us for a custom quote and start your e-commerce journey.'
                )}
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {contactCards.map((card, index) => {
                const Icon = card.icon;
                const cardBody = (
                  <div className="glass-card rounded-2xl p-3.5 sm:p-4 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          {t(card.titleAr, card.titleEn)}
                        </p>
                        <p className="font-semibold mt-1">{t(card.valueAr, card.valueEn)}</p>
                        <p className="text-sm text-muted-foreground mt-1">{t(card.hintAr, card.hintEn)}</p>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <motion.div
                    key={card.titleEn}
                    initial={{ opacity: 0, y: 14 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.24 + index * 0.12, ease: EASE_OUT }}
                  >
                    {card.href ? (
                      <a
                        href={card.href}
                        target={card.external ? '_blank' : undefined}
                        rel={card.external ? 'noopener noreferrer' : undefined}
                        className="block"
                        aria-label={card.titleEn}
                      >
                        {cardBody}
                      </a>
                    ) : (
                      cardBody
                    )}
                  </motion.div>
                );
              })}
            </div>

          </motion.aside>

          <div className="space-y-4 sm:col-span-7 lg:col-span-8">
            <motion.form
              initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.95, delay: 0.2, ease: EASE_OUT }}
              onSubmit={handleSubmit}
              className="glass-card rounded-3xl p-6 md:p-8 lg:p-10 space-y-6"
            >
              <div className="flex flex-col items-center text-center">
                <span className="pill-badge text-xs">{t('نموذج التواصل', 'Contact Form')}</span>
                <h3 className="mt-4 text-2xl font-bold">
                  {t('أخبرنا عن متجرك', 'Tell Us About Your Store')}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {t(
                    'اكتب تفاصيل متجرك وسنقدم لك الحل المناسب وخطة التنفيذ.',
                    'Share your store details and we will reply with the right approach and execution plan.'
                  )}
                </p>
              </div>

              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder={t('الاسم', 'Your Name')}
                  className="form-input h-12 text-base"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  required
                />
                <input
                  type="tel"
                  placeholder={t('رقم الهاتف', 'Phone Number')}
                  className="form-input h-12 text-base"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  pattern="0[567][0-9]{8}"
                  maxLength={10}
                  required
                />
              </div>

              <textarea
                placeholder={t('رسالتك', 'Your Message')}
                className="form-input min-h-[140px] sm:min-h-[180px] resize-none text-base"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />

              <motion.button
                type="submit"
                className="btn-primary btn-shine h-12 sm:h-12 w-full inline-flex items-center justify-center gap-2 text-base disabled:opacity-70"
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-5 h-5" />
                {t('إرسال الرسالة', 'Send Message')}
              </motion.button>
            </motion.form>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT }}
          className="mx-auto mt-6 sm:mt-8 grid w-full max-w-2xl grid-cols-4 gap-2.5 sm:gap-3"
        >
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="glass-card rounded-xl sm:rounded-2xl h-11 sm:h-12 flex items-center justify-center hover:border-primary/60 transition-all min-w-[44px] min-h-[44px]"
                whileHover={{ scale: 1.06, y: -3 }}
                whileTap={{ scale: 0.96 }}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.a>
            );
          })}
        </motion.div>
        <AnimatePresence>
          {submitState.status !== 'idle' && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ y: 20, scale: 0.96, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 10, scale: 0.98, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-night-start/95 via-night-mid/95 to-night-end/95 p-8 text-center shadow-2xl shadow-black/40"
              >
                {submitState.status === 'sending' && (
                  <>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {t('جارٍ إرسال الرسالة', 'Sending your message')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                      {t('يرجى الانتظار قليلًا...', 'Please wait a moment...')}
                    </p>
                  </>
                )}

                {submitState.status === 'success' && (
                  <>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/15">
                      <CheckCircle2 className="h-7 w-7 text-emerald-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {t('تم الإرسال!', 'Message sent!')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">{submitState.message}</p>
                  </>
                )}

                {(submitState.status === 'error' || submitState.status === 'rate_limited') && (
                  <>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-400/40 bg-red-400/10">
                      <AlertTriangle className="h-7 w-7 text-red-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {submitState.status === 'rate_limited'
                        ? t('تم تجاوز الحد', 'Rate Limited')
                        : t('تعذر الإرسال', 'Failed to send')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">{submitState.message}</p>
                    <button
                      type="button"
                      onClick={() => setSubmitState({ status: 'idle' })}
                      className="mt-5 inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      {t('حسنًا', 'Okay')}
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};



