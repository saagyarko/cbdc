"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('bank_staff');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, password, role }),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.replace('/login'), 1200);
    } else {
      const data = await res.json();
      setError(data.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        <Input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 rounded border">
          <option value="bank_staff">Bank Staff</option>
          <option value="auditor">Auditor</option>
          <option value="admin">Admin</option>
        </select>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Account created! Redirecting to login...</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
        <div className="text-center text-sm mt-2">
          Already have an account?{' '}
          <Link href="/login" className="text-primary underline">Sign in</Link>
        </div>
      </form>
    </div>
  );
} 