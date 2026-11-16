import { motion } from 'framer-motion';

interface RoleToggleProps {
  role: 'student' | 'teacher';
  onChange: (role: 'student' | 'teacher') => void;
}

export function RoleToggle({ role, onChange }: RoleToggleProps) {
  return (
    <div className="flex rounded-full bg-gray-100 p-1 relative">
      {(['student', 'teacher'] as const).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`relative flex-1 rounded-full py-2.5 text-sm font-bold transition-colors z-10 ${
            role === r ? 'text-forest' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {role === r && (
            <motion.div
              layoutId="role-pill"
              // UPDATED: Sliding background uses the new Lilac
              className="absolute inset-0 rounded-full bg-pastel-lilac shadow-sm -z-10"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          {r === 'student' ? 'Student' : 'Teacher'}
        </button>
      ))}
    </div>
  );
}