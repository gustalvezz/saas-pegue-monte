import PushNotificationManager from '@/components/PushNotificationManager'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PushNotificationManager />
      {children}
    </>
  )
}
