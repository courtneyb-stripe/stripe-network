/**
 * AccountDetail — Placeholder screen for account detail view.
 */

import { useParams } from 'react-router-dom'

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="h-full w-full p-6" data-name="AccountDetail">
      <h1 className="font-heading-xlarge text-default">Account {id ?? '—'}</h1>
    </div>
  )
}
