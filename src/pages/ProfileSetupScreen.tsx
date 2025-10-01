// Profile setup/edit page with controlled form bound to profile data.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { COMMON_MAJORS, YEARS, COMMON_INTERESTS, PRONOUNS_OPTIONS, COMMUTER_STATUS_OPTIONS, ProfileFormData } from '@/types';

export function ProfileSetupScreen() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValues: ProfileFormData = useMemo(() => ({
    name: profile?.name || '',
    age: profile?.age || 18,
    ageRangeMin: profile?.ageRangeMin || 18,
    ageRangeMax: profile?.ageRangeMax || 24,
    major: profile?.major || '',
    year: profile?.year || 'Freshman',
    pronouns: profile?.pronouns || '',
    commuterStatus: profile?.commuterStatus || undefined,
    interests: profile?.interests || [],
    classes: profile?.classes || [],
    bio: profile?.bio || '',
  }), [profile]);

  const [form, setForm] = useState<ProfileFormData>(initialValues);
  const [classInput, setClassInput] = useState('');

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const handleChange = (field: keyof ProfileFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setForm((prev) => {
      const set = new Set(prev.interests);
      if (set.has(interest)) {
        set.delete(interest);
      } else {
        set.add(interest);
      }
      return { ...prev, interests: Array.from(set) };
    });
  };

  const addClass = (className: string) => {
    if (className.trim()) {
      setForm((prev) => ({
        ...prev,
        classes: [...new Set([...prev.classes, className.trim()])]
      }));
      setClassInput('');
    }
  };

  const removeClass = (className: string) => {
    setForm((prev) => ({
      ...prev,
      classes: prev.classes.filter(c => c !== className)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!form.name || !form.major || !form.age) {
      setError('Please fill in all required fields (Name, Age, Major)');
      return;
    }
    
    setSaving(true);
    setError(null);
    try {
      const result = await apiService.updateProfile(form);
      
      // Refresh the profile in AuthContext to get latest data
      await refreshProfile();
      
      // Small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/profile', { replace: true });
    } catch (err: any) {
      console.error('Profile save error:', err.response?.data || err);
      const errorMsg = err.response?.data?.error?.fieldErrors 
        ? JSON.stringify(err.response.data.error.fieldErrors)
        : err.response?.data?.error || err?.message || 'Failed to save profile';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary-50">
      <Header title="Profile Setup" />

      <div className="flex-1 overflow-y-auto pb-20">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-4">
          <Card>
            <h3 className="font-semibold text-secondary-900 mb-4">Basic Info</h3>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Full Name"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
              <Input
                type="number"
                label="Age"
                min={16}
                max={100}
                value={form.age}
                onChange={(e) => handleChange('age', Number(e.target.value))}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  label="Looking for: Min Age"
                  min={16}
                  max={100}
                  value={form.ageRangeMin}
                  onChange={(e) => handleChange('ageRangeMin', Number(e.target.value))}
                />
                <Input
                  type="number"
                  label="Looking for: Max Age"
                  min={16}
                  max={100}
                  value={form.ageRangeMax}
                  onChange={(e) => handleChange('ageRangeMax', Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <select
                  className="block w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={form.major}
                  onChange={(e) => handleChange('major', e.target.value)}
                >
                  <option value="">Select Major</option>
                  {COMMON_MAJORS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  className="block w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={form.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="block w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={form.pronouns || ''}
                  onChange={(e) => handleChange('pronouns', e.target.value || undefined)}
                >
                  <option value="">Pronouns (Optional)</option>
                  {PRONOUNS_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  className="block w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={form.commuterStatus || ''}
                  onChange={(e) => handleChange('commuterStatus', e.target.value as any || undefined)}
                >
                  <option value="">Living Status (Optional)</option>
                  {COMMUTER_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Bio</label>
                <textarea
                  className="block w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  rows={4}
                  placeholder="Tell others about yourself"
                  value={form.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-secondary-900 mb-4">Interests</h3>
            <p className="text-sm text-secondary-600 mb-3">Select your interests (click to toggle)</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    form.interests.includes(interest)
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {form.interests.length > 0 && (
              <p className="text-sm text-secondary-600 mt-3">
                Selected: {form.interests.length} interest{form.interests.length !== 1 ? 's' : ''}
              </p>
            )}
          </Card>

          <Card>
            <h3 className="font-semibold text-secondary-900 mb-4">Classes</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a class (e.g., CS 201)"
                  value={classInput}
                  onChange={(e) => setClassInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addClass(classInput);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => addClass(classInput)}
                  disabled={!classInput.trim()}
                >
                  Add
                </Button>
              </div>
              {form.classes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.classes.map((c) => (
                    <span key={c} className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-100 text-secondary-800 text-sm">
                      {c}
                      <button
                        type="button"
                        className="ml-2 text-secondary-700 hover:text-secondary-900"
                        aria-label={`Remove ${c}`}
                        onClick={() => removeClass(c)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {error && (
            <Card className="border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </Card>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="ml-auto">
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      
    </div>
  );
}


