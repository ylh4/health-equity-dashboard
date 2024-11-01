import { Activity } from 'lucide-react'

export default function Logo() {
  return (
    <div className="flex items-center">
      <Activity className="h-8 w-8 mr-2 text-primary" />
      <div className="flex flex-col">
        <span className="text-xl font-bold text-primary">Health Equity Dashboard</span>
        <span className="text-sm text-muted-foreground">Monthly Insights</span>
        <a
          href="https://unchcs-my.sharepoint.com/:w:/g/personal/u390093_unch_unc_edu/EUnZq6xSEwBMsFB_Crod85sBo9yR7xbyfEqx-Z7iowl0sA?e=rYFMth"
          className="text-xs text-muted-foreground"
          style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', color: 'gray', textDecoration: 'none' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Request Access to the Dashboard or
        </a>
        <a
          href="https://insights.unch.unc.edu/#/site/UNCHCS/views/HealthEquityDashboard/HomePage?:iid=1"
          className="text-xs text-muted-foreground"
          style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', color: 'gray', textDecoration: 'none' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to the Dashboard
        </a>
      </div>
    </div>
  )
}