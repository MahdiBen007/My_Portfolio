import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Send,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
  MapPin,
} from 'lucide-react';
import { personalData } from '@/data/portfolio-data';
import { useLanguage } from '@/contexts/LanguageContext';

export const ContactSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  const socialLinks = [
    { icon: Github, href: personalData.github, label: 'GitHub' },
    { icon: Linkedin, href: personalData.linkedin, label: 'LinkedIn' },
    { icon: Mail, href: `mailto:${personalData.email}`, label: 'Email' },
    { icon: MessageCircle, href: personalData.whatsapp, label: 'WhatsApp' },
  ];

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
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <section id="contact" className="relative py-[clamp(64px,8vw,112px)]" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="text-center mb-16"
        >
          <h2 className="section-title">{t('تواصل معي', 'Get In Touch')}</h2>
          <p className="section-subtitle mx-auto">
            {t('هل لديك مشروع في ذهنك؟ دعنا نتحدث!', "Have a project in mind? Let's talk!")}
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-6 lg:gap-10 items-start">
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.15, ease: EASE_OUT }}
            className="space-y-4 sm:col-span-5 lg:col-span-4"
          >
            <div className="glass-card rounded-3xl p-6 md:p-7 relative overflow-hidden text-center">
              <div className="absolute -top-20 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
              <span className="pill-badge text-xs mb-4 mx-auto">
                {t('متاح للعمل الحر', 'Available for freelance')}
              </span>
              <h3 className="text-[1.35rem] leading-tight font-bold">
                {t('حول فكرتك إلى منتج رقمي', 'Turn your idea into a digital product')}
              </h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {t(
                  'اختر وسيلة التواصل المناسبة لك، وسأعود إليك بخطة واضحة وخطوات تنفيذ عملية.',
                  'Pick the contact method that suits you best, and I will get back with a clear execution plan.'
                )}
              </p>
            </div>

            <div className="space-y-3">
              {contactCards.map((card, index) => {
                const Icon = card.icon;
                const cardBody = (
                  <div className="glass-card rounded-2xl p-4 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
                        <Icon className="h-5 w-5" />
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
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.95, delay: 0.2, ease: EASE_OUT }}
              onSubmit={handleSubmit}
              className="glass-card rounded-3xl p-6 md:p-8 lg:p-10 space-y-6"
            >
              <div className="flex flex-col items-center text-center">
                <span className="pill-badge text-xs">{t('نموذج التواصل', 'Contact Form')}</span>
                <h3 className="mt-4 text-2xl font-bold">
                  {t('احكِ لي عن مشروعك', 'Tell me about your project')}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {t(
                    'اكتب تفاصيل الفكرة وسأتواصل معك بالحل المناسب وخطة التنفيذ.',
                    'Share your idea details and I will reply with the right approach and execution plan.'
                  )}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder={t('الاسم', 'Your Name')}
                  className="form-input h-12"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder={t('البريد الإلكتروني', 'Your Email')}
                  className="form-input h-12"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <textarea
                placeholder={t('رسالتك', 'Your Message')}
                className="form-input min-h-[180px] resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />

              <motion.button
                type="submit"
                className="btn-primary btn-shine h-12 w-full inline-flex items-center justify-center gap-2 text-base"
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
          className="mx-auto mt-8 grid w-full max-w-2xl grid-cols-4 gap-3"
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
                className="glass-card rounded-2xl h-12 flex items-center justify-center hover:border-primary/60 transition-all"
                whileHover={{ scale: 1.06, y: -3 }}
                whileTap={{ scale: 0.96 }}
              >
                <Icon className="w-5 h-5" />
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
