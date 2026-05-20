import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics } from '@/lib/profile'
import { SobreVosForm } from './form'

export default async function SobreVosPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const data = await getProfileWithMetrics(user.id)
  const profile = data?.profile

  return (
    <SobreVosForm
      initialName={profile?.name ?? ''}
      initialAge={profile?.age ?? null}
      initialCountry={profile?.country ?? null}
      initialGender={profile?.gender ?? null}
    />
  )
}
