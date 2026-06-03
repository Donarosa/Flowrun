import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics } from '@/lib/profile'
import { SobreVosForm } from './form'

export default async function SobreVosPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const data = await getProfileWithMetrics(user.id)
  const profile = data?.profile

  // El trigger de Supabase popula profiles.name desde raw_user_meta_data.full_name
  // si el provider lo trae (Google). Si el usuario nunca editó el campo y aún
  // matchea ese valor, mostramos la hint "Lo trajimos de Google".
  const initialName = profile?.name ?? ''
  const nameFromProvider = initialName.length > 0

  return (
    <SobreVosForm
      initialName={initialName}
      initialAge={profile?.age ?? null}
      initialCountry={profile?.country ?? null}
      initialGender={profile?.gender ?? null}
      nameFromProvider={nameFromProvider}
    />
  )
}
