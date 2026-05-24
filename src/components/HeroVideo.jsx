import { useI18n } from '../lib/i18n.jsx';

export default function HeroVideo() {
  const { t } = useI18n();

  return (
    <section className="relative w-full h-[70vh] max-h-[600px] overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/library-girl.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay — keeps text readable without covering page below */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-paper" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-tight drop-shadow-lg">
          {t('hero.title')}
        </h1>
        <p className="mt-4 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed drop-shadow">
          {t('hero.subtitle')}
        </p>
      </div>
    </section>
  );
}
