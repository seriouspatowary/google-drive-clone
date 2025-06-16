"use client";

import React, { ChangeEvent, useState } from 'react'
import { Button } from '../ui/button'
import { RiFileAddFill } from '@remixicon/react'
import {useMutation, useQueryClient} from "@tanstack/react-query"
import { toast } from 'sonner';
import axios from 'axios';
import { File } from '@/lib/database/schema/file.model';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { P } from './p';

const UploadButton = () => {

    const queryClient = useQueryClient();

    const [fileProgress, setFileProgress] = useState<Record<string, number>>({})
    const [isUploading, setIsUploading] = useState(false)

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await axios.post("/api/v1/files/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
                const total = progressEvent.total || 1;
                const loaded = progressEvent.loaded;
                const percent = Math.round((loaded / total) * 100);
                setFileProgress(prev => ({
                    ...prev,
                    [file.name]:percent
                }))
            }
        })

        return res.data;
    }

    const mutation = useMutation({
        mutationFn: uploadFile,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["files", data.category] })
            
            toast(data?.message,
                {description:  data?.description}
            )
        },
        onError: (c) => {
            toast(c.name,
                {
                    description: c.message
                    
                }
            )
        },

        onSettled: () => {
             setIsUploading(false)
        }
    })

   

    const handlechange = async (e: ChangeEvent<HTMLInputElement>) => {

        const files = Array.from(e.target.files || []);
        
        if (!files.length) {
            toast("No file selected", {
                description: "Please Select a file to upload"
            });
            return;
        }

        const progressMap: Record<string, number> = {}
        
        files.forEach(file => {
            progressMap[file.name] = 0
        })

        setFileProgress(progressMap);
        setIsUploading(true);


        await Promise.all(files.map((file) => mutation.mutateAsync(file)))

    }
   return (
       <>
            {isUploading &&
        Object.entries(fileProgress).map(([fileName, progress], i) => (
          <TooltipProvider key={i}>
            <Tooltip>
              <TooltipTrigger>
                <div className="relative size-9 rounded-full flex items-center justify-center drop-shadow-md cursor-default animate-pulse">
                  <svg
                    className="absolute w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <circle
                      className="text-gray-300"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      r="16"
                      cx="18"
                      cy="18"
                    />
                    <circle
                      className="text-primary"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="transparent"
                      r="16"
                      cx="18"
                      cy="18"
                      strokeDasharray="100"
                      strokeDashoffset={100 - progress}
                    />
                  </svg>
                  <P className="text-xs text-primary font-bold">{progress}%</P>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <P className="text-xs font-bold">{fileName}</P>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
              <Button
               onClick={() => {
                document.getElementById("file-upload")?.click();
                }}><RiFileAddFill />Upload</Button>
                <input type="file"  className='hidden' id='file-upload' multiple onChange={handlechange}/>
      
           </>
  )
}

export default UploadButton