import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useRegister } from '../hooks/useRegister';
import { useTeacherRegister } from '../hooks/useTeacherRegister';
import { AuthInput } from '../../../components/auth/AuthInput';
import { RoleToggle } from '../../../components/auth/RoleToggle';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export default function Register() {
  const { login, loading: loginLoading } = useAuth();
  const { register: registerStudent, error: studentError, fieldErrors: studentFields } = useRegister();
  const { register: registerTeacher, error: teacherError, fieldErrors: teacherFields } = useTeacherRegister();

  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [qualifications, setQualifications] = useState('');
  
  const [localError, setLocalError] = useState<string | null>(null);
  
  const loading = loginLoading;
  const error = role === 'student' ? studentError : teacherError;
  const fieldErrors = role === 'student' ? studentFields : teacherFields;

  async function handleStudentSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (password !== confirmPassword) { setLocalError('Passwords do not match.'); return; }
    try {
      await registerStudent({ email, full_name: fullName, password });
      await login(email, password);
    } catch { /* handled by hooks */ }
  }

  async function handleTeacherNext(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!fullName || !email || !password) { setLocalError('Please fill all fields.'); return; }
    if (password !== confirmPassword) { setLocalError('Passwords do not match.'); return; }
    setDirection(1);
    setStep(2);
  }

  async function handleTeacherFinalSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!bio || !qualifications) { setLocalError('Please fill in all professional details.'); return; }
    try {
      await registerTeacher({ email, full_name: fullName, password, bio, qualifications });
      await login(email, password);
    } catch { /* handled by hooks */ }
  }

  function handleRoleChange(newRole: 'student' | 'teacher') {
    setRole(newRole);
    setStep(1); // reset step if they switch
    setLocalError(null);
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Role Toggle */}
      <div className="mb-8">
        <RoleToggle role={role} onChange={handleRoleChange} />
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        {role === 'student' && (
          <motion.form
            key="student"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onSubmit={handleStudentSubmit}
            className="flex-1 space-y-4"
          >
            <AuthInput id="full_name" label="Full Name" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} error={fieldErrors.full_name} disabled={loading} required />
            <AuthInput id="email" label="Email" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} disabled={loading} required />
            <AuthInput id="password" label="Password" type="password" placeholder="Min. 10 characters" value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} disabled={loading} required />
            <AuthInput id="confirm_password" label="Confirm Password" type="password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} required />
            
            {(localError || error) && <p className="text-center text-sm font-bold text-red-500">{localError ?? error}</p>}

            {/* UPDATED BUTTON COLOR */}
            <motion.button 
              whileTap={{ scale: 0.96 }} 
              type="submit" 
              disabled={loading} 
              className="mt-6 w-full rounded-full bg-pastel-lilac py-4 text-base font-extrabold text-forest shadow-lg transition-colors hover:bg-[#c99cff] disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </motion.button>
          </motion.form>
        )}

        {role === 'teacher' && step === 1 && (
          <motion.form
            key="teacher-step1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onSubmit={handleTeacherNext}
            className="flex-1 space-y-4"
          >
            <AuthInput id="full_name" label="Full Name" placeholder="John Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} required />
            <AuthInput id="email" label="Email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
            <AuthInput id="password" label="Password" type="password" placeholder="Min. 10 characters" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required />
            <AuthInput id="confirm_password" label="Confirm Password" type="password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} required />
            
            {localError && <p className="text-center text-sm font-bold text-red-500">{localError}</p>}

            {/* UPDATED BUTTON COLOR */}
            <motion.button 
              whileTap={{ scale: 0.96 }} 
              type="submit" 
              className="mt-6 w-full rounded-full bg-pastel-lilac py-4 text-base font-extrabold text-forest shadow-lg transition-colors hover:bg-[#c99cff]"
            >
              Next Step
            </motion.button>
          </motion.form>
        )}

        {role === 'teacher' && step === 2 && (
          <motion.form
            key="teacher-step2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onSubmit={handleTeacherFinalSubmit}
            className="flex-1 space-y-4"
          >
            <div className="mb-2 rounded-2xl bg-forest-tint p-3 text-xs font-bold text-forest">
              Teacher Application
            </div>
            <AuthInput id="bio" label="Short Biography" placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} error={fieldErrors.bio} disabled={loading} required />
            <AuthInput id="qualifications" label="Qualifications" placeholder="Degrees, certifications..." value={qualifications} onChange={(e) => setQualifications(e.target.value)} error={fieldErrors.qualifications} disabled={loading} required />
            
            {(localError || error) && <p className="text-center text-sm font-bold text-red-500">{localError ?? error}</p>}

            <div className="mt-6 flex gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => { setDirection(-1); setStep(1); }}
                className="w-1/3 rounded-full border-2 border-gray-200 bg-white py-3.5 text-base font-extrabold text-gray-500 transition-colors hover:bg-gray-50"
              >
                Back
              </motion.button>
              {/* UPDATED BUTTON COLOR */}
              <motion.button 
                whileTap={{ scale: 0.96 }} 
                type="submit" 
                disabled={loading} 
                className="w-2/3 rounded-full bg-pastel-lilac py-3.5 text-base font-extrabold text-forest shadow-lg transition-colors hover:bg-[#c99cff] disabled:opacity-70"
              >
                {loading ? 'Submitting...' : 'Complete Application'}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-8 text-center text-sm font-semibold text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-extrabold text-forest hover:text-accent transition">
          Sign In
        </Link>
      </div>
    </div>
  );
}