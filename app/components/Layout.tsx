import type React from "react"
import { Responsive, WidthProvider } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

const ResponsiveGridLayout = WidthProvider(Responsive)

interface LayoutProps {
  children: React.ReactNode
  layout: any[]
  onLayoutChange: (layout: any) => void
}

export default function Layout({ children, layout, onLayoutChange }: LayoutProps) {
  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: layout }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={30}
      onLayoutChange={onLayoutChange}
    >
      {children}
    </ResponsiveGridLayout>
  )
}
