import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BatteryIcon, WifiIcon, ActivityIcon } from "lucide-react"

export default function RobotStatus() {
  // Modify the RobotStatus component to show disconnected status
  // Mock robot status data
  const status = {
    batteryLevel: 0,
    connectionStatus: "Disconnected",
    activeTask: "None",
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
            <WifiIcon className="mr-2 text-red-500" />
            <span className="text-red-500">Status: {status.connectionStatus}</span>
          </div>
          <div className="flex items-center">
            <ActivityIcon className="mr-2" />
            <span>Active Task: {status.activeTask}</span>
          </div>
        </div>
        <div className="mt-2 text-sm text-red-500">Not connected to robot. Status information is simulated.</div>
      </CardContent>
    </Card>
  )
}
