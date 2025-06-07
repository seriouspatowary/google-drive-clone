import React from 'react'
import { Children } from '@/props/types'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from '@/components/custom/app-sidebar'
import DashboardHeader from '@/components/custom/header'

const Layout = ({children}:Children) => {
    return (
        <main>
            <SidebarProvider>
            <AppSidebar />
           <div className='w-full px-5'>
                     <DashboardHeader/>
                    <div className='bg-primary/5 w-full min-h-[calc(100vh-80px)] rounded-lg p-5'>
                      {children}
                    </div>
            </div>
            </SidebarProvider>
         </main>
    )
}

export default Layout