import { motion } from 'framer-motion';

export function FloatingMediaCard() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
      className="absolute -bottom-6 right-6 z-20 w-48 rotate-[-5deg] rounded-3xl bg-pastel-lilac p-4 shadow-xl sm:w-56"
    >
      <div className="flex flex-col items-center justify-center gap-3">
        {/* SVG Progress Ring */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/40">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="46"
              fill="transparent"
              stroke="white"
              strokeWidth="8"
              strokeDasharray="289"
              strokeDashoffset="60" /* Approx 80% filled */
              strokeLinecap="round"
            />
          </svg>
          {/* Play Button */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
            <svg className="ml-1 h-4 w-4 text-forest" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-extrabold text-forest">Circulatory System</p>
          <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-forest/70">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
            Keep watching 00:30
          </div>
        </div>
      </div>
    </motion.div>
  );
}