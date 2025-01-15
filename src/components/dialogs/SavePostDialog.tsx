import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getToken } from "@/utils/HelperFunctions";
import { Check, Pin, Search, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import CreateFolderDialog from "./CreateFolderDialog";

const SavePostDialog = ({ postId, isSaved, type }: { postId: number; isSaved: boolean; type: string }) => {
  const [isSavedPost, setIsSavedPost] = useState<boolean>(isSaved);

  const [fetchNewFolders, setFetchNewFolders] = useState<boolean>(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {type == "icon" ? (
          isSavedPost ? (
            <Button
              variant={"default"}
              size={"sm"}
              className={cn("hidden absolute top-3 right-3 z-10 group-hover:flex hover:border-primary bg-primary text-white rounded-full")}
            >
              <h1 className="font-semibold">Saved</h1>
            </Button>
          ) : (
            <Button variant={"secondary"} size={"sm"} className={cn("hidden absolute top-3 right-3 z-10 rounded-full group-hover:flex")}>
              <h1 className="font-semibold">Save</h1>
            </Button>
          )
        ) : (
          <button
            className={cn(
              "w-1/2 border-r flex items-center justify-center py-3 group hover:bg-gray-50 text-gray-500",
              isSavedPost && "text-red-500 bg-red-50 hover:bg-red-100"
            )}
          >
            <Pin className="w-5 h-5" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] lg:max-w-screen-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center">My Folder</DialogTitle>
        </DialogHeader>
        <div className="min-h-[400px] max-h-[400px]  overflow-auto pr-2">
          <FolderContent postId={postId} setIsSavedPost={setIsSavedPost} fetchNewFolders={fetchNewFolders} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FolderContent = ({ postId, setIsSavedPost, fetchNewFolders }) => {
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleSave = (folder) => {
    const reqBody = {
      post_id: postId,
      folder_id: [folder.id],
    };

    // update is_saved value of this folder in folder state
    setFolders((prev) => {
      return prev.map((f) => {
        if (f.id == folder.id) {
          return { ...f, is_saved: !f.is_saved };
        }
        return f;
      });
    });

    fetch(`${import.meta.env.VITE_SERVER_URL}/post/savepost`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status == 200) {
          // change is saved value of this folder in folder state

          handleFetchFolders();
        }
      });
  };
  const handleFetchFolders = () => {
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_SERVER_URL}/folder/post/${postId}`, { method: "GET", headers: { Authorization: `Bearer ${getToken()}` } })
      .then((res) => res.json())
      .then((data) => {
        setFolders(data.folders);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    handleFetchFolders();
  }, [postId, fetchNewFolders]);

  useEffect(() => {
    const isAllFoldersNotSaved = folders.every((f) => f.is_saved == false);
    if (isAllFoldersNotSaved) {
      setIsSavedPost(false);
    } else {
      setIsSavedPost(true);
    }
  }, [folders]);
  if (folders.length == 0 && !isLoading) {
    return (
      <div>
        <div className="flex gap-2 mb-2">
          <div className="relative w-full mr-auto">
            <Input placeholder="Search folders..." className="pr-10 " />
            <Search className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600 w-5" />
          </div>

          <CreateFolderDialog handleFetchFolders={handleFetchFolders} type="button" />
        </div>
        <div className="h-[300px] flex flex-col justify-center items-center gap-5">
          <SearchX className="w-16 h-16 text-gray-400" />
          <h1>No Folder Found</h1>
        </div>
      </div>
    );
  }

  if (folders.length == 0 && isLoading) {
    return (
      <div>
        <div className="flex gap-2 mb-2">
          <div className="relative w-full mr-auto">
            <Input placeholder="Search folders..." className="pr-10 " />
            <Search className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600 w-5" />
          </div>
        </div>
        <div className="h-[300px] flex justify-center items-center">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="flex gap-2 mb-2">
        <div className="relative w-full mr-auto">
          <Input placeholder="Search folders..." className="pr-10 " />
          <Search className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600 w-5" />
        </div>

        <CreateFolderDialog handleFetchFolders={handleFetchFolders} type="button" />
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {folders.map((folder, index) => {
          return (
            <div
              key={index}
              className="w-full border grid grid-cols-12 items-center rounded-lg gap-3 p-3 hover:bg-slate-100 cursor-pointer"
              onClick={() => handleSave(folder)}
            >
              <div className="col-span-1 text-primary flex justify-center items-center bg-slate-50 border w-7 h-7 rounded">
                {folder.is_saved && <Check />}
              </div>

              <h1 className="text-lg col-span-11">{folder.title}</h1>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default SavePostDialog;
