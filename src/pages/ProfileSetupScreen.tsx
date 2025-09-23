// Profile setup/edit page with controlled form bound to profile data.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { COMMON_MAJORS, YEARS, ProfileFormData } from '@/types';

export function ProfileSetupScreen() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValues: ProfileFormData = useMemo(() => ({
    name: profile?.name || '',
    age: profile?.age || 18,
    ageRangeMin: profile?.ageRangeMin || 18,
    ageRangeMax: profile?.ageRangeMax || 24,
    major: profile?.major || '',
    year: profile?.year || 'Freshman',
    interests: profile?.interests || [],
    classes: profile?.classes || [],
    bio: profile?.bio || '',
  }), [profile]);

  const [form, setForm] = useState<ProfileFormData>(initialValues);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const handleChange = (field: keyof ProfileFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: 'interests' | 'classes', value: string) => {
    setForm((prev) => {
      const set = new Set(prev[field]);
      if (set.has(value)) set.delete(value); else set.add(value);
      return { ...prev, [field]: Array.from(set) };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiService.updateProfile(form);
      navigate('/profile');
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile');
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
            <div className="space-y-2">
              <Input
                placeholder="Add an interest and press Enter"
                value={''}
                onChange={() => {}}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = target.value.trim();
                    if (value) {
                      handleChange('interests', Array.from(new Set([...(form.interests || []), value])));
                      target.value = '';
                    }
                  }
                }}
              />
              {form.interests?.length ? (
                <div className="flex flex-wrap gap-2">
                  {form.interests.map((i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-sm">
                      {i}
                      <button
                        type="button"
                        className="ml-2 text-primary-700 hover:text-primary-900"
                        aria-label={`Remove ${i}`}
                        onClick={() => handleChange('interests', form.interests.filter((x) => x !== i))}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-secondary-900 mb-4">Classes</h3>
            <div className="space-y-2">
              <Input
                placeholder="Add a class (e.g., CS 201) and press Enter"
                value={''}
                onChange={() => {}}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = target.value.trim();
                    if (value) {
                      handleChange('classes', Array.from(new Set([...(form.classes || []), value])));
                      target.value = '';
                    }
                  }
                }}
              />
              {form.classes?.length ? (
                <div className="flex flex-wrap gap-2">
                  {form.classes.map((c) => (
                    <span key={c} className="px-3 py-1 rounded-full bg-secondary-100 text-secondary-800 text-sm">
                      {c}
                    </span>
                  ))}
                </div>
              ) : null}
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


