// app/(routes)/checkout/page.jsx
import { Suspense } from 'react'
import CheckoutClient from './checkout-client'
import { CheckoutSkeleton } from './components/checkout-skeleton'
import { auth } from '@/app/(auth)/auth'
import { redirect } from 'next/navigation'




export default async function CheckoutPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="flex-grow md:mt-16">

        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutClient token={session?.accessToken} userId={session?.user?.id}/>
        </Suspense>

    </main>
  )
}