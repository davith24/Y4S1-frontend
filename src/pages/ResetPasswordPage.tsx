import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { removeToken } from "@/utils/HelperFunctions";
import { zodResolver } from "@hookform/resolvers/zod";
import { set } from "lodash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters in length")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one digit")
      .regex(/[@$!%*#?&]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const ResetPasswordPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const [checkingToken, setCheckingToken] = useState<boolean>(true);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);

  const token = searchParams.get("r_tkn");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const errors = form.formState.errors;

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Handle form submission here
    const reqBody = {
      token: token,
      password: data.password,
    };

    fetch(`${import.meta.env.VITE_SERVER_URL}/password/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    })
      .then((res) => {
        if (res.status == 200) {
          toast({
            title: "Password reset successfully.",
            description: "You can now login with your new password.",
            variant: "success",
          });
          navigate("/login");
        } else {
          toast({
            title: "Failed to reset password.",
            variant: "destructive",
            description: "Please try again later.",
          });
          handleCheckToken();
        }
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Failed to reset password.",
          variant: "destructive",
          description: "Please try again later.",
        });
        handleCheckToken();
      });
  };

  const handleCheckToken = () => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/password/checktoken`, {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status == 200) {
          console.log("Token is valid");
          setIsTokenValid(true);
        } else {
          // Token is invalid
          removeToken();
          setIsTokenValid(false);
        }
      })
      .finally(() => setCheckingToken(false));
  };

  useEffect(() => {
    removeToken();
    setCheckingToken(true);
    handleCheckToken();
  }, []);

  if (checkingToken) {
    return (
      <div className="flex flex-col space-y-5 w-screen h-screen bg-gray-50 justify-center items-center">
        <h1 className="text-4xl font-bold text-primary">ΜΣRΛΚΙ</h1>
        <h1 className="text-2xl font-semibold">Checking Token</h1>
        <p className="max-w-[400px] text-muted-foreground text-center">Please wait while we check the token.</p>
      </div>
    );
  }

  if (!token || (!checkingToken && !isTokenValid)) {
    return (
      <div className="flex flex-col space-y-5 w-screen h-screen bg-gray-50 justify-center items-center">
        <h1 className="text-4xl font-bold text-primary">ΜΣRΛΚΙ</h1>
        <h1 className="text-2xl font-semibold">Invalid Link</h1>
        <p className="max-w-[400px] text-muted-foreground text-center">
          The link you've used is invalid or expired. Please request a new link to reset your password.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-5 w-screen h-screen bg-gray-50 justify-center items-center">
      <h1 className="text-4xl font-bold text-primary">ΜΣRΛΚΙ</h1>
      <h1 className="text-2xl font-semibold">Reset Password</h1>
      <p className="max-w-[400px] text-muted-foreground text-center">
        Please enter your new password. We recommend using a strong password that you're not using elsewhere.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">New Password</Label>
          <Input id="password" type="password" placeholder="***********" {...form.register("password")} required />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" placeholder="***********" {...form.register("confirmPassword")} required />
          {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <div className="">
          <p className="font-semibold">Password must meet the following criteria:</p>
          <ul className="text-slate-500 ml-2 space-y-1 my-2 text-sm">
            <li>1. Must be at least 8 characters in length</li>
            <li>2. Must contain at least one lowercase letter</li>
            <li>3. Must contain at least one uppercase letter</li>
            <li>4. Must contain at least one digit</li>
            <li>5. Must contain at least one special character (@, $, !, %, *, #, ?, &)</li>
          </ul>
        </div>

        <Button type="submit" className="w-full mt-5">
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
