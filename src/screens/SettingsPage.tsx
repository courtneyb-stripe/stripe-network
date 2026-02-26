/**
 * Settings full page — Same content as Settings modal; left nav and global nav are hidden by Shell.
 * Account name and Settings heading live in the panel main content area (account name above heading).
 */

import { useParams, useLocation, useNavigate } from 'react-router-dom'
import SettingsPanel from '../components/SettingsPanel'
import { getAccountById } from '../data/mockAccounts'
import { slugToDisplayName } from '../utils/string'

export default function SettingsPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as { sectionId?: string } | null
  const mockAccount = getAccountById(id)
  const accountStatus = mockAccount?.status
  const accountName = mockAccount?.name ?? (id ? slugToDisplayName(id) : '—')

  const handleBack = () => navigate(id ? `/network/${id}` : '/network')

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col bg-surface" data-name="SettingsPage">
      <SettingsPanel
        initialSectionId={state?.sectionId}
        accountStatus={accountStatus}
        accountName={accountName}
        closeLabel="Back"
        onClose={handleBack}
        fullPage
      />
    </div>
  )
}
