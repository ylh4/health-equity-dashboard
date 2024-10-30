import { Activity } from 'lucide-react'

export default function Logo() {
  return (
    <div className="flex items-center">
      <Activity className="h-8 w-8 mr-2 text-primary" />
      <div className="flex flex-col">
        <span className="text-xl font-bold text-primary">Health Equity Dashboard</span>
        <span className="text-sm text-muted-foreground">Monthly Insights</span>
      </div>
    </div>
  )
}