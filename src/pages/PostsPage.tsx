import PostsContainer from "@/components/PostsContainer";
import { supabase } from "@/lib/supabase";
import { getToken } from "@/utils/HelperFunctions";
import { LoaderCircle, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PostsPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const tag = useParams().tag;

  const handleFetchPosts = () => {

  console.log(getToken());
    fetch(`${import.meta.env.VITE_SERVER_URL}/post`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  };


  supabase.channel("change_posts").on("postgres_changes", { event: "*", schema: "public", table: "posts" }, handleFetchPosts).subscribe();

  useEffect(() => {
    if (window.location.href.includes(tag)) {
      setPosts([]);
      setIsLoading(true);
      handleFetchPosts();
    }
  }, [tag]);

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex flex-col justify-center items-center gap-2">
        <LoaderCircle className="w-10 h-10 text-gray-400 animate-spin" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoading && posts?.length === 0) {
    return (
      <div className="w-full h-[80vh] flex flex-col justify-center items-center gap-2">
        <SearchX className="w-10 h-10 text-gray-400" />
        <h1>No posts found.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-[100vh]">
      <PostsContainer posts={posts} />
    </div>
  );
};

export default PostsPage;
