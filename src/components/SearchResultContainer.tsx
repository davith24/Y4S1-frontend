import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { getToken } from "@/utils/HelperFunctions";
import { AlertTriangle, Ellipsis, Pen, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import SavePostDialog from "./dialogs/SavePostDialog";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";

const SearchResultContainer = ({ searchQuery }) => {
  return (
    <div className="space-y-2">
      <UsersContainer searchQuery={searchQuery} />
      <GroupsContainer searchQuery={searchQuery} />
      <PostsContainer searchQuery={searchQuery} />
    </div>
  );
};

const UsersContainer = ({ searchQuery }) => {
  const [users, setUsers]: any[] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeMoreClicked, setIsSeeMoreClicked] = useState<boolean>(false);

  const handleFetchUsers = () => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/search/user?term=${searchQuery}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
      })
      .finally(() => setIsLoading(false));
  };

  const handleFetchRandomUsers = () => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/random/user`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (searchQuery.length < 1) {
      setIsLoading(true);
      handleFetchRandomUsers();
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.length < 2) return;
    setIsLoading(true);
    setIsSeeMoreClicked(false);
    handleFetchUsers();
  }, [searchQuery]);

  return (
    <section className="">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Users:</h1>
        {users.length > 0 && !isSeeMoreClicked && (
          <Button className="text-sm text-primary" variant="ghost" size={"sm"} onClick={() => setIsSeeMoreClicked(true)}>
            See more
          </Button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 py-2 pb-4">
        {isLoading
          ? [1, 2, 3, 4].map((_, i) => {
              return (
                <div className="flex items-center space-x-4 border p-2 rounded-lg" key={i}>
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              );
            })
          : users?.slice(0, isSeeMoreClicked ? users.length : 4)?.map((user: any, index: number) => {
              return <UserCard user={user} key={index} />;
            })}
      </div>
    </section>
  );
};

const UserCard = ({ user }) => {
  const navigate = useNavigate();
  return (
    <DialogTrigger asChild key={user} onClick={() => navigate(`/user/${user.id}`)} className="hover:bg-gray-50">
      <div className="group min-w-64 gap-2 relative flex p-2 items-center border rounded-lg overflow-hidden cursor-pointer">
        <img
          className="w-12 h-12 rounded-full object-cover bg-gray-300"
          src={user.pf_img_url || "https://i.pinimg.com/564x/9e/c9/19/9ec919468e1ed8af1002b551f5950a94.jpg"}
          alt=""
        />
        <div className="">
          <h1 className="text-sm ">{user.first_name + " " + user.last_name}</h1>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
    </DialogTrigger>
  );
};

const GroupsContainer = ({ searchQuery }) => {
  const [groups, setGroups]: any[] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeMoreClicked, setIsSeeMoreClicked] = useState<boolean>(false);

  const handleFetchGroups = () => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/search/group?` + new URLSearchParams({ term: searchQuery }), {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => setGroups(data.groups))
      .finally(() => setIsLoading(false));
  };

  const handleFetchRandomGroups = () => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/random/group`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setGroups(data.groups);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (searchQuery.length < 1) {
      setIsLoading(true);
      handleFetchRandomGroups();
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.length < 2) return;
    setIsLoading(true);
    setIsSeeMoreClicked(false);
    handleFetchGroups();
  }, [searchQuery]);
  return (
    <section className="">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Groups:</h1>
        {groups.length > 0 && !isSeeMoreClicked && (
          <Button className="text-sm text-primary" variant="ghost" size={"sm"} onClick={() => setIsSeeMoreClicked(true)}>
            See more
          </Button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 py-2 pb-4">
        {isLoading
          ? [1, 2, 3, 4].map((_, i) => {
              return (
                <div className="flex items-center space-x-4 border p-2 rounded-lg" key={i}>
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              );
            })
          : groups?.slice(0, isSeeMoreClicked ? groups.length : 4)?.map((group: any, index: number) => {
              return <GroupCard group={group} key={index} />;
            })}
      </div>
    </section>
  );
};

const GroupCard = ({ group }) => {
  const navigate = useNavigate();
  return (
    <DialogTrigger asChild key={group} onClick={() => navigate(`/group/${group.id}`)}>
      <div className="group min-w-64 gap-2 relative flex p-2 items-center border rounded-lg overflow-hidden cursor-pointer">
        <img
          className="w-12 h-12 rounded-full object-cover bg-gray-300"
          src={group.img_url || "https://i.pinimg.com/564x/9e/c9/19/9ec919468e1ed8af1002b551f5950a94.jpg"}
          alt=""
        />
        <div className="space-y-1">
          <h1 className="text-sm ">{group.title}</h1>
          <p className="text-xs text-muted-foreground">
            {group.status} - {group.member_count || 0} members
          </p>
        </div>
      </div>
    </DialogTrigger>
  );
};

const PostsContainer = ({ searchQuery }) => {
  const [posts, setPosts]: any[] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleRemovePosts = (postId: number) => {
    const updatedPosts = [posts].filter((post) => post.id !== postId);
    setPosts(updatedPosts);
  };

  const handleFetchPosts = () => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/search/post?term=${searchQuery}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
      })
      .finally(() => setIsLoading(false));
  };

  const handleFetchRandomPosts = () => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/random/post`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (searchQuery.length < 1) {
      setIsLoading(true);
      handleFetchRandomPosts();
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.length < 2) return;
    setIsLoading(true);
    handleFetchPosts();
  }, [searchQuery]);

  return (
    <section className="">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Posts:</h1>
      </div>
      {isLoading ? (
        <div className="my-5 columns-2  md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-5 gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5 space-y-1 sm:space-y-2 md:space-y-3 lg:space-y-4 xl:space-y-5 mt-3">
          {Array.from({ length: 10 }, (_, index) => {
            return <Skeleton className={cn("min-h-[200px] rounded-xl")} key={index} />;
          })}
        </div>
      ) : (
        <div className="columns-2  md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-5 gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5 space-y-1 sm:space-y-2 md:space-y-3 lg:space-y-4 xl:space-y-5 mt-3">
          {posts?.map((post: any, index: number) => {
            return <PostCard post={post} handleRemovePosts={handleRemovePosts} key={index} />;
          })}
        </div>
      )}
    </section>
  );
};

const PostCard = ({ post, handleRemovePosts }) => {
  const auth = useSelector((state: RootState) => state.auth);
  const [report, setReport] = useState<string>("");
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmitReport = () => {
    if (report.trim().length == 0) {
      toast({
        title: "Report cannot be empty.",
        description: "Please provide a reason for reporting this post.",
        variant: "destructive",
      });
      return;
    }
    // handle report
    const reqBody = {
      user_id: auth.userData.id,
      post_id: post.id,
      reason: report,
    };

    fetch(`${import.meta.env.VITE_SERVER_URL}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(reqBody),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status == 200) {
          setIsReportOpen(false);
          setReport("");
          toast({
            title: "Reported successfully.",
            description: "Your report has been submitted. Post will be reviewed by our team.",
            variant: "success",
          });
        } else {
          toast({
            title: "Failed to report.",
            description: "Please try again later.",
            variant: "destructive",
          });
        }
      });

    // close dialog
  };

  const handleDeletePost = () => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/post/${post.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status == 200) {
          handleRemovePosts(post.id);
          toast({
            title: "Post deleted successfully.",
            variant: "success",
          });
          setIsDeleteOpen(false);
        } else {
          toast({
            title: "Failed to delete post.",
            variant: "destructive",
          });
        }
      });
  };

  return (
    <DialogTrigger asChild>
      <div className="group relative border-[1px] rounded-2xl overflow-hidden cursor-pointer">
        <SavePostDialog postId={post.id} isSaved={post.is_saved} type="icon" />

        <div className="hidden group-hover:flex absolute bottom-3 left-3 z-10 gap-2 items-center" onClick={() => navigate(`/user/${post.user_id}`)}>
          <Avatar className="w-6 h-6">
            <AvatarImage src={post.user_pf_img_url} alt="@shadcn" className="object-cover w-full h-full" />
            <AvatarFallback>PF</AvatarFallback>
          </Avatar>

          <div className="flex flex-col text-white">
            <h1 className="font-medium text-sm line-clamp-1 truncate">@{post.first_name + " " + post.last_name}</h1>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute w-8 h-5 bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 group-hover:bg-white"
            >
              <Ellipsis className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {auth.userData.id == post.user_id || auth.userData.role == "admin" ? (
              <>
                <DropdownMenuItem asChild>
                  <Link to={`/post/edit/${post.id}`} className="w-full py-0 text-left cursor-pointer">
                    <div className="flex gap-2 justify-start items-center py-1">
                      <Pen className="w-4 h-4" />
                      <span>Edit</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Dialog open={isDeleteOpen} onOpenChange={() => setIsDeleteOpen(!isDeleteOpen)}>
                    <DialogTrigger asChild>
                      <div className="flex gap-2 justify-start items-center py-2 px-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm">
                        <Trash className="w-4 h-4" />
                        <span>Delete</span>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Delete Post</DialogTitle>
                      <DialogDescription>Are you sure you want to delete this post? This action cannot be undone.</DialogDescription>
                      <div className="flex gap-5 justify-end">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(!isDeleteOpen)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeletePost()}>
                          Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild>
                <Dialog open={isReportOpen} onOpenChange={() => setIsReportOpen(!isReportOpen)}>
                  <DialogTrigger asChild>
                    <div className="flex gap-2 justify-start items-center py-2 px-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Report</span>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Report Post</DialogTitle>
                    <DialogDescription>If you believe this post violates our community guidelines, please report it.</DialogDescription>
                    <div className="flex flex-col gap-5">
                      <Textarea
                        placeholder="Add reason here."
                        className="border-2 min-h-[150px]"
                        value={report}
                        onChange={(e) => setReport(e.target.value)}
                      />
                      <Button variant="default" className="w-full font-semibold" onClick={() => handleSubmitReport()}>
                        Report
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div onClick={() => navigate(`/post/${post.id}`)}>
          <img
            className="w-full bg-gray-300"
            src={post.img_url || "https://i.pinimg.com/564x/9e/c9/19/9ec919468e1ed8af1002b551f5950a94.jpg"}
            alt=""
          />
          <div className="hidden group-hover:flex">
            <div className="absolute top-0 left-0 w-full h-full opacity-80 bg-gradient-to-t from-black to-[#80808050]" />
          </div>
        </div>
      </div>
    </DialogTrigger>
  );
};

export default SearchResultContainer;
