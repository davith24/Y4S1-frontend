import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/redux/hook";
import { User } from "@/redux/slices/authSlice";
import { fetchUserData } from "@/redux/slices/authThunk";
import { RootState } from "@/redux/store";
import { getToken } from "@/utils/HelperFunctions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";

const passwordChangeSchema = z
  .object({
    old_password: z.string(),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters in length")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one digit")
      .regex(/[@$!%*#?&]/, "Password must contain at least one special character"),
    cf_new_password: z.string(),
  })
  .refine((data) => data.new_password === data.cf_new_password, {
    message: "Passwords don't match",
    path: ["cf_new_password"], // path of error
  });

const SettingPage = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const [user, setUser] = useState<User | null>(null);
  const [errMsg, setErrMsg] = useState<string>("");
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [isResetingPassword, setIsResetingPassword] = useState<boolean>(false);

  const passwordForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
  });

  function onSubmitPassword(values: z.infer<typeof passwordChangeSchema>) {
    setErrMsg("");
    if (values.new_password !== values.cf_new_password) {
      passwordForm.setError("cf_new_password", { message: "Password does not match" });
      return;
    }

    setIsChangingPassword(true);

    const reqBody = {
      old_password: values.old_password,
      new_password: values.new_password,
    };

    fetch(`${import.meta.env.VITE_SERVER_URL}/user/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(reqBody),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message == "New Password can not be same as Old Password") {
          setErrMsg("New password can not be same as old password");
        }

        if (data.message == "Incorrect Old Password") {
          setErrMsg("Incorrect old password");
        }

        if (data.status == 200) {
          toast({
            title: "Password Changed",
            description: "Password has been changed successfully",
            variant: "success",
          });
        }

        if (data.status == 500) {
          toast({
            title: "Error",
            description: "Something went wrong",
            variant: "destructive",
          });
        }
      })
      .finally(() => setIsChangingPassword(false));
  }

  const handleResetPassword = () => {
    setIsResetingPassword(true);
    fetch(`${import.meta.env.VITE_SERVER_URL}/password/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ email: user?.email }),
    })
      .then((res) => {
        if (res.status == 200) {
          toast({
            title: "Reset Password",
            description: "An email has been sent to you with instructions on how to reset your password.",
            variant: "success",
          });
        } else {
          toast({
            title: "Error",
            description: "Something went wrong",
            variant: "destructive",
          });
        }
      })
      .finally(() => setIsResetingPassword(false));
  };

  const [postParams] = useSearchParams("");

  const myParams = postParams.get("section");

  const handleFetchUser = async () => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/${auth.userData.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
      });
  };

  useEffect(() => {
    handleFetchUser();
  }, [auth]);

  if (!user) {
    return <h1>Loading</h1>;
  }

  return (
    user && (
      <div className="flex w-full mb-10">
        <div className="w-1/5 hidden md:flex flex-col my-10">
          <Link
            to={"/profile/setting?section=profile_setting"}
            className={cn("font-semibold", myParams === "profile_setting" || !myParams ? "underline" : "")}
          >
            Profile Setting
          </Link>
        </div>

        {myParams === "profile_setting" || !myParams ? (
          <div className="md:w-4/5 lg:w-3/5  xl:w-2/5">
            <h1 className="text-xl font-bold mt-10">Profile Setting</h1>
            <Separator className="mt-3 mb-8 " />

            {user ? (
              <div className="space-y-16">
                <div>
                  <h1 className="my-5 text-lg font-semibold">General Information</h1>
                  <div className="space-y-6">
                    <div className="flex items-center gap-10">
                      <Label className="w-1/2">Email</Label>
                      <div className="w-full">
                        <p className="float-start">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <Label className="w-1/2">First Name</Label>
                      <div className="w-full">
                        <p className="float-start">{user.first_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <Label className="w-1/2">Last Name</Label>
                      <div className="w-full">
                        <p className="float-start">{user.last_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex justify-end mt-5">
                    <EditUserPfDialog user={user} handleFetchUserInfo={handleFetchUser} />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold mt-10">Credential Setting</h1>
                  <Separator className="mt-3 mb-8 " />

                  <h1 className="text-lg font-bold">Change Password</h1>
                  <div className="mb-10 mt-5">
                    <p className="font-semibold">Password must meet the following criteria:</p>
                    <ul className="text-slate-500 ml-2 space-y-1 my-2 text-sm">
                      <li>1. Must be at least 8 characters in length</li>
                      <li>2. Must contain at least one lowercase letter</li>
                      <li>3. Must contain at least one uppercase letter</li>
                      <li>4. Must contain at least one digit</li>
                      <li>5. Must contain at least one special character (@, $, !, %, *, #, ?, &)</li>
                    </ul>
                  </div>

                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-2 relative ">
                      <FormField
                        control={passwordForm.control}
                        name="old_password"
                        render={({ field }) => (
                          <>
                            <FormItem className="flex items-center gap-10">
                              <FormLabel className="w-1/2">Old Password</FormLabel>
                              <FormControl>
                                <Input placeholder="*********" type="password" {...field} />
                              </FormControl>
                            </FormItem>
                            <div className="flex justify-end">
                              <FormMessage className="w-fit" />
                            </div>
                          </>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="new_password"
                        render={({ field }) => (
                          <>
                            <FormItem className="flex items-center gap-10">
                              <FormLabel className="w-1/2">New Password</FormLabel>
                              <FormControl>
                                <Input placeholder="*********" type="password" {...field} />
                              </FormControl>
                            </FormItem>
                            <div className="flex justify-end">
                              <FormMessage className="w-fit" />
                            </div>
                          </>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="cf_new_password"
                        render={({ field }) => (
                          <>
                            <FormItem className="flex items-center gap-10">
                              <FormLabel className="w-1/2">Confirm New Password</FormLabel>
                              <FormControl>
                                <Input placeholder="*********" type="password" {...field} />
                              </FormControl>
                            </FormItem>
                            <div className="flex justify-end">
                              <FormMessage className="w-fit" />
                            </div>
                          </>
                        )}
                      />

                      <div className="flex justify-center">{errMsg ? <p className="text-red-500">{errMsg}</p> : ""}</div>

                      <div className="w-full flex justify-end pt-5">
                        {isChangingPassword ? (
                          <Button variant="secondary" disabled={isChangingPassword}>
                            Loading...
                          </Button>
                        ) : (
                          <Button type="submit">Change Password</Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </div>
                <div>
                  <h1 className="text-lg font-bold">Reset Password</h1>
                  <p className="text-sm text-muted-foreground">
                    If you have forgotten your password and need to reset it, please click the button below. An email will be sent to you with
                    instructions on how to reset your password.
                  </p>
                  <Button variant="destructive" className="mt-5 float-end" onClick={() => handleResetPassword()} disabled={isResetingPassword}>
                    {isResetingPassword ? "Loading..." : "Reset Password"}
                  </Button>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        ) : (
          ""
        )}
      </div>
    )
  );
};

const EditUserPfDialog = ({ user, handleFetchUserInfo }: { user: User; handleFetchUserInfo: Function }) => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const generalChangeSchema = z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  });

  const generalForm = useForm<z.infer<typeof generalChangeSchema>>({
    resolver: zodResolver(generalChangeSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
    },
  });

  function onSubmitGeneral(values: z.infer<typeof generalChangeSchema>) {
    if (!values.first_name && !values.last_name) {
      return;
    }
    fetch(`${import.meta.env.VITE_SERVER_URL}/user/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((data) => {
        setOpen(false);
        handleFetchUserInfo();
        dispatch(fetchUserData());
      });
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild>
        <Button variant="default">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] lg:max-w-screen-sm">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>

        <Form {...generalForm}>
          <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-4 ">
            <FormField
              control={generalForm.control}
              name="first_name"
              render={({ field }) => (
                <FormItem className="flex items-center gap-10">
                  <FormLabel className="w-1/3">First Name</FormLabel>
                  <div className="w-2/3 space-y-2">
                    <FormControl>
                      <Input placeholder="" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={generalForm.control}
              name="last_name"
              render={({ field }) => (
                <FormItem className="flex items-center gap-10">
                  <FormLabel className="w-1/3">Last Name</FormLabel>
                  <div className="w-2/3 space-y-2">
                    <FormControl>
                      <Input placeholder="" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <DialogTrigger asChild>
              <Button type="submit" className="float-end">
                Save Changes
              </Button>
            </DialogTrigger>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SettingPage;
