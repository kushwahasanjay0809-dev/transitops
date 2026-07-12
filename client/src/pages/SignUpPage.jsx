import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;

    let text = 'Weak';
    let color = 'var(--color-danger)';
    if (score >= 4) {
      text = 'Strong';
      color = 'var(--color-success)';
    } else if (score >= 2) {
      text = 'Medium';
      color = 'var(--color-warning)';
    }

    return { score, text, color };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    // Frontend Validations
    const errors = {};
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!email.trim()) {
      errors.email = 'Email is required';
    }
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        fullName,
        email,
        password,
        confirmPassword,
      });

      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      if (err.response?.data?.errors) {
        // Map field validation errors from backend Zod
        const serverErrors = {};
        err.response.data.errors.forEach((currErr) => {
          serverErrors[currErr.field] = currErr.message;
        });
        setFieldErrors(serverErrors);
      } else {
        const message = err.response?.data?.message || 'Registration failed. Please try again.';
        setGeneralError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background:
          'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.1), transparent 60%), var(--bg-primary)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          animation: 'slideUp 0.4s ease',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)',
            }}
          >
            <Truck size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Transit<span style={{ color: 'var(--color-primary-light)' }}>Ops</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Transport Operations Platform
          </p>
        </div>

        {/* SignUp Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            Create your account
          </h2>

          {generalError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                color: 'var(--color-danger-light)',
              }}
            >
              <AlertCircle size={16} />
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="Rajesh Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoFocus
                autoComplete="name"
                style={{
                  borderColor: fieldErrors.fullName ? 'var(--color-danger)' : undefined
                }}
              />
              {fieldErrors.fullName && (
                <div style={{ color: 'var(--color-danger-light)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {fieldErrors.fullName}
                </div>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="rajesh.sharma@transitops.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  borderColor: fieldErrors.email ? 'var(--color-danger)' : undefined
                }}
              />
              {fieldErrors.email && (
                <div style={{ color: 'var(--color-danger-light)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {fieldErrors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{
                    paddingRight: '2.5rem',
                    borderColor: fieldErrors.password ? 'var(--color-danger)' : undefined
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 0,
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <div style={{ color: 'var(--color-danger-light)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {fieldErrors.password}
                </div>
              )}

              {/* Password Strength Indicator */}
              {password && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Password Strength:</span>
                    <span style={{ color: passwordStrength.color, fontWeight: 600 }}>{passwordStrength.text}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          backgroundColor: level <= passwordStrength.score ? passwordStrength.color : 'var(--bg-tertiary)',
                          borderRadius: '2px',
                          transition: 'background-color 0.2s ease',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{
                    paddingRight: '2.5rem',
                    borderColor: fieldErrors.confirmPassword ? 'var(--color-danger)' : undefined
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 0,
                  }}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <div style={{ color: 'var(--color-danger-light)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {fieldErrors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginBottom: '1.25rem' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18 }} />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>
              Sign In
            </Link>
          </div>

          {/* Live Demo link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Live Demo: <a href="https://transitops-orpin.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-light)', textDecoration: 'underline' }}>transitops-orpin.vercel.app</a>
          </div>
        </div>
      </div>
    </div>
  );
}
