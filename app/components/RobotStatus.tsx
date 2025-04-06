import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BatteryIcon, WifiIcon, ActivityIcon } from "lucide-react"

export default function RobotStatus() {
  // Mock robot status data
  const status = {
    batteryLevel: 75,
    connectionStatus: "Connected",
    activeTask: "Mapping",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Robot Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <BatteryIcon className="mr-2" />
            <span>Battery: {status.batteryLevel}%</span>
          </div>
          <div className="flex items-center">
            <WifiIcon className="mr-2" />
            <span>Status: {status.connectionStatus}</span>
          </div>
          <div className="flex items-center">
            <ActivityIcon className="mr-2" />
            <span>Active Task: {status.activeTask}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

