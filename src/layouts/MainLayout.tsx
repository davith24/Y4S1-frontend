import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAppDispatch } from "@/redux/hook";
import { fetchUserData } from "@/redux/slices/authThunk";
import { getToken } from "@/utils/HelperFunctions";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import useSWR from "swr";

const MainLayout = () => {
  const dispatch = useAppDispatch();

  const handleFetchUser = async () => {
    console.log("fetching user data");
    dispatch(fetchUserData());
  };
  supabase.channel("user_invite").on("postgres_changes", { event: "*", schema: "public", table: "group_invites" }, handleFetchUser).subscribe();
  supabase.channel("user_request").on("postgres_changes", { event: "*", schema: "public", table: "group_requests" }, handleFetchUser).subscribe();
  supabase.channel("user_follower").on("postgres_changes", { event: "*", schema: "public", table: "user_followers" }, handleFetchUser).subscribe();

  useEffect(() => {
    dispatch(fetchUserData());
  }, []);
  return (
    <div className="w-full relative">
      <header className=" w-full h-[8dvh] sticky top-0 z-50 flex items-center bg-card px-5 md:px-10">
        <Navbar />
      </header>

      <main className="px-5 md:px-10">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
