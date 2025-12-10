// contexts/SidebarCollapseContext.js
'use client'
import { createContext, useContext, useState } from 'react'

const SidebarCollapseContext = createContext()

export function SidebarCollapseProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <SidebarCollapseContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarCollapseContext.Provider>
  )
}

export const useSidebarCollapse = () => useContext(SidebarCollapseContext)