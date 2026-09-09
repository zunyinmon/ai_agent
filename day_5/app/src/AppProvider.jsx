import { createContext, useContext, useState } from "react"
import App from "./App"

const AppContext = createContext()

export default function AppProvider(){
  const [openDrawer, setOpenDrawer] = useState(false)

  return (
    <AppContext.Provider value={{ openDrawer, setOpenDrawer }}>
      <App />
    </AppContext.Provider>
  )
}
export function useApp(){
    return useContext(AppContext)
    }