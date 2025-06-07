"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { paragraphVariants } from "./p";
import { cn } from "@/lib/utils";


const Dashboardbreadcrumb = () => {

    const pathname = usePathname();
    const paths = pathname.split("/").filter(path => path !== "")

  return (
        <Breadcrumb>
            <BreadcrumbList>
              {
                  paths.length > 1 && paths.map((path, i) => {
                      const isLast = i === paths.length - 1
                      const currentPath = paths.find((_, index)=> index === i)
                      return (
                          <div key={i} className="flex items-center justify-start gap-3">
                              {
                                  !isLast ?
                                      (<><BreadcrumbItem>
                                          <BreadcrumbLink className={cn(paragraphVariants({ size: "small", weight: "medium" }), "capitalize")} href={`/${currentPath}`}>
                                          {path}
                                          </BreadcrumbLink>
                                      </BreadcrumbItem>
                                          <BreadcrumbSeparator/>
                                      
                                      </>) :
                                      (<><BreadcrumbItem>
                                          <BreadcrumbPage className={cn(paragraphVariants({ size: "small", weight: "bold" }), "capitalize")}>
                                          {path}
                                          </BreadcrumbPage>
                                      </BreadcrumbItem>
                                      
                                      </>)
                              }
                          </div>
                      )
                  })
              }
            </BreadcrumbList>
        </Breadcrumb>

  )
}

export default Dashboardbreadcrumb;