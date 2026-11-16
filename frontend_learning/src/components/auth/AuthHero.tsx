import { motion } from 'framer-motion';

export function AuthHero({ title }: { title: string }) {
  const avatars = [
    { seed: 'Felix', bg: 'bg-pastel-pink', pos: 'top-10 left-8 sm:left-16' },
    { seed: 'Aneka', bg: 'bg-pastel-mint', pos: 'top-24 right-12 sm:right-24' },
    { seed: 'Jack', bg: 'bg-pastel-yellow', pos: 'top-36 left-1/2 -translate-x-1/2' },
  ];

  return (
    <div className="relative overflow-hidden bg-auth-bg pt-16 pb-32 text-center rounded-b-[3rem]">
      {/* Decorative glowing dots */}
      <div className="absolute top-10 right-10 h-4 w-4 rounded-full bg-pastel-lilac opacity-50 blur-sm" />
      <div className="absolute top-40 left-8 h-3 w-3 rounded-full bg-white opacity-40" />
      <div className="absolute bottom-20 right-20 h-5 w-5 rounded-full bg-pastel-mint opacity-40 blur-sm" />
      
      {/* Floating Avatars */}
      <div className="relative mx-auto h-48 w-full max-w-sm">
        {avatars.map((avatar, i) => (
          <motion.div
            key={avatar.seed}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`absolute ${avatar.pos} flex h-20 w-20 items-center justify-center rounded-full ${avatar.bg} shadow-lg ring-4 ring-white/10`}
          >
            <img
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${avatar.seed}&backgroundColor=transparent`}
              alt="Student avatar"
              className="h-16 w-16"
            />
          </motion.div>
        ))}
      </div>

      {/* Headline */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 mt-6 px-4 text-3xl font-extrabold text-white sm:text-4xl"
      >
        {title}
      </motion.h1>

      {/* Floating Card */}
      <FloatingMediaCard />
    </div>
  );
}

// Need to import the card we just made
import { FloatingMediaCard } from './FloatingMediaCard';