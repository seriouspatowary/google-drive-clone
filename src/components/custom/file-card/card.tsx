import { IFile } from '@/lib/database/schema/file.model';
import { cn, formatFileSize } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
} from "../../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import FileMenu from './menu';
import { P } from '../p';
import { format } from 'date-fns';


const FileCard = ({ file }: { file: IFile }) => {
  
  const { name, size, createdAt, userInfo, category } = file;

  const requiredName = `${name.slice(0, 16)}... ${name.split(".")[1]}`;

  const formatSize = formatFileSize(size);

  return (
  <Card className='w-full max-h-60 border-none shadow-none drop-shadow-xl'>
  <CardHeader>
        <div className='flex items-center gap-4 justify-between'>
          <Avatar>
            <AvatarImage src={`/${category}.png`} />
            <AvatarFallback>{name.slice(0,2)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-end gap-4 justify-between w-full">
          <FileMenu />
          <P>{formatSize}</P>
        </div>
        </div>
        
  </CardHeader>
  <CardContent>
        <P size="large" weight="bold" className={cn(category === "image" && "cursor-pointer")}
          onClick={() => {
            if (category === "image") {
              console.log("image");
           }
        }}
        >
          {requiredName}
        </P>

        <P size="small" variant="muted" weight="light">{format(createdAt, "dd-MM-yyyy")}</P>
        
        <P size="small" variant="muted" weight="light">Uploaded By:<b>{userInfo.name}</b></P>
    </CardContent>

</Card>
  )
}

export default FileCard;

