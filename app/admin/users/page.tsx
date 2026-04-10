import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateUserRole } from './actions'
import InviteForm from './InviteForm'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const [{ data: stores }, { data: partners }] = await Promise.all([
    admin.from('stores').select('*').order('id'),
    admin
      .from('profiles')
      .select('*, stores(name)')
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Partners</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Invite and manage Culinary Selling Partner accounts.
        </p>
      </div>

      {/* Invite Form */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">
          Invite a new partner
        </h2>
        <InviteForm stores={stores ?? []} />
      </div>

      {/* Partners List */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          All partners
        </h2>

        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                <th className="px-4 py-3 font-medium text-zinc-600">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-600">Email</th>
                <th className="px-4 py-3 font-medium text-zinc-600">Store</th>
                <th className="px-4 py-3 font-medium text-zinc-600">Role</th>
                <th className="px-4 py-3 font-medium text-zinc-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {partners?.map((partner) => {
                const isCurrentUser = partner.id === currentUser?.id
                const isAdmin = partner.role === 'admin'

                return (
                  <tr key={partner.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {partner.full_name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-zinc-400">(you)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{partner.email}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {(partner.stores as { name: string } | null)?.name ?? partner.store_id}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          isAdmin
                            ? 'bg-zinc-900 text-white'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {partner.role}
                      </span>
                      {partner.must_change_password && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!isCurrentUser && (
                        <form action={updateUserRole}>
                          <input type="hidden" name="user_id" value={partner.id} />
                          <input
                            type="hidden"
                            name="role"
                            value={isAdmin ? 'chef' : 'admin'}
                          />
                          <button
                            type="submit"
                            className="text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-900 transition-colors"
                          >
                            {isAdmin ? 'Remove admin' : 'Make admin'}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {(!partners || partners.length === 0) && (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              No partners yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
