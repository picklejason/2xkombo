'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/?message=Welcome back! Login successful')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/signup?message=Error creating account')
  }

  revalidatePath('/', 'layout')
  redirect('/signup?message=Account created! Check your email to confirm your signup')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login?message=Successfully signed out')
}


export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  
  if (password !== confirmPassword) {
    redirect('/auth/reset-password?message=Passwords do not match')
  }
  
  if (password.length < 6) {
    redirect('/auth/reset-password?message=Password must be at least 6 characters')
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect('/auth/reset-password?message=Error updating password')
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Password updated successfully')
}
