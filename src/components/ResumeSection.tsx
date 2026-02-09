import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Download,
  ExternalLink,
  Briefcase,
  Award,
  MapPin,
  Mail,
  FileText,
} from 'lucide-react';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';
import { useLanguage } from '@/contexts/LanguageContext';

type ResumeSectionProps = {
  title?: string;
  subtitle?: string;
};

export const ResumeSection = ({ title, subtitle }: ResumeSectionProps) => {
  const { t, isRTL } = useLanguage();
  const { data } = usePortfolioData();
  const { personalData } = data;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  const hasCv = Boolean(personalData.cvLink);

  return (
    <section id="resume" className="relative py-[clamp(64px,8vw,112px)]" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="section-header text-center mb-16"
        >
          <h2 className="section-title">
            {title ?? t('السيرة الذاتية', 'Professional Resume')}
          </h2>
          <p className="section-subtitle mx-auto">
            {subtitle ?? t(
              'عرض احترافي مختصر للسيرة مع روابط التحميل والمعاينة.',
              'A professional summary with quick access to view or download your resume.'
            )}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE_OUT }}
            className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden"
          >
            <div className="absolute -top-24 -left-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl overflow-hidden border border-white/10 bg-black/30">
                <img
                  src={personalData.profileImageUrl || '/hero-portrait.png'}
                  alt={t('الصورة الشخصية', 'Profile portrait')}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {t('الملف المهني', 'Career Profile')}
                </p>
                <h3 className="text-xl font-semibold text-white">
                  {t(personalData.name, personalData.nameEn)}
                </h3>
                <p className="text-sm text-slate-300">
                  {t(personalData.title, personalData.titleEn)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">{t('سنوات خبرة', 'Years Exp.')}</p>
                <p className="text-lg font-semibold text-white">{personalData.stats.yearsExperience}+</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">{t('مشاريع منجزة', 'Projects')}</p>
                <p className="text-lg font-semibold text-white">{personalData.stats.projectsCompleted}+</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">{t('عملاء سعداء', 'Clients')}</p>
                <p className="text-lg font-semibold text-white">{personalData.stats.happyClients}+</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">{t('الموقع', 'Location')}</p>
                <p className="text-sm font-semibold text-white">
                  {t(personalData.location, personalData.locationEn)}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>{personalData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{t(personalData.location, personalData.locationEn)}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE_OUT }}
            className="glass-card rounded-3xl p-6 md:p-8"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {t('الملف الكامل', 'Full Resume')}
                </p>
                <h3 className="text-2xl font-semibold text-white">
                  {t('تحميل أو معاينة السيرة', 'Download or View Resume')}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed mb-6">
              {t(
                'يمكنك فتح السيرة الذاتية بصيغة PDF أو تحميلها مباشرة للمشاركة.',
                'Open the resume as PDF or download it directly for sharing.'
              )}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href={hasCv ? personalData.cvLink : '#'}
                target="_blank"
                rel="noreferrer"
                className={`btn-primary btn-shine inline-flex items-center justify-center gap-2 h-12 ${
                  hasCv ? '' : 'pointer-events-none opacity-50'
                }`}
              >
                <ExternalLink className="h-4 w-4" />
                {t('معاينة السيرة', 'View Resume')}
              </a>
              <a
                href={hasCv ? personalData.cvLink : '#'}
                target="_blank"
                rel="noreferrer"
                className={`btn-secondary inline-flex items-center justify-center gap-2 h-12 ${
                  hasCv ? '' : 'pointer-events-none opacity-50'
                }`}
              >
                <Download className="h-4 w-4" />
                {t('تحميل PDF', 'Download PDF')}
              </a>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {t('خبرة احترافية', 'Professional Experience')}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t('ملخص واضح للمناصب', 'Clear timeline of roles')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {t('إنجازات ومهارات', 'Skills & Achievements')}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t('مقاييس واضحة للقيمة', 'Value-driven highlights')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
