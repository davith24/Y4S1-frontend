import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { removeToken } from "@/utils/HelperFunctions";
import { zodResolver } from "@hookform/resolvers/zod";
import { set } from "lodash";
import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email(),
});

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSent, setIsSent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });
  const errors = form.formState.errors;
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Handle form submission here
    const reqBody = {
      email: data.email,
    };

    setIsLoading(true);

    fetch(`${import.meta.env.VITE_SERVER_URL}/password/email`, {
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
          setIsSent(true);
        } else {
          toast({
            title: "Failed to reset password.",
            variant: "destructive",
            description: "Please try again later.",
          });
          setIsSent(false);
        }
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Failed to reset password.",
          variant: "destructive",
          description: "Please try again later.",
        });
        setIsSent(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    removeToken();
  }, []);

  if (isSent) {
    return (
      <div className="flex flex-col space-y-5 w-screen h-screen bg-gray-50 justify-center items-center">
        <h1 className="text-4xl font-bold text-primary">ΜΣRΛΚΙ</h1>
        <MailCheck className="w-20 h-20 text-primary" />
        <h1 className="text-2xl font-semibold">Reset Password Link Sent</h1>
        <p className="max-w-[400px] text-muted-foreground text-center">
          Reset password link has been sent to your email address. Please follow the instructions in the email to reset your password.
        </p>
        <Link to={"/login"}>
          <Button className="w-full">Back to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-5 w-screen h-screen bg-gray-50 justify-center items-center">
      <h1 className="text-4xl font-bold text-primary">ΜΣRΛΚΙ</h1>
      <h1 className="text-2xl font-semibold">Forgot Your Password?</h1>
      <p className="max-w-[400px] text-muted-foreground text-center">Enter your email address below to reset your password.</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 w-[400px] pt-10">
        <div className="grid gap-2">
          <Label htmlFor="email">Your email</Label>
          <Input id="email" type="email" placeholder="user@example.com" {...form.register("email")} required />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full mt-5" disabled={isLoading}>
          {isLoading ? "Loading..." : "Send Reset Link"}
        </Button>
      </form>
      <Link to={"/login"} className="text-sm text-primary">
        Back to Login
      </Link>
    </div>
  );
};

export default ForgotPasswordPage;
