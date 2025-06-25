"use client";
import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { logAuditAction } from '@/lib/audit-log';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  if (session?.user) {
    router.replace('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });
    if (res?.ok) {
      logAuditAction({
        user: username,
        action: 'Login',
        details: 'User logged in successfully',
      });
      router.replace('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold mb-2">Sign In</h1>
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
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <Button type="submit" className="w-full">Sign In</Button>
        <div className="text-center text-sm mt-2">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary underline">Create an account</Link>
        </div>
      </form>
    </div>
  );
} 