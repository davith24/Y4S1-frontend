import { getToken } from "@/utils/HelperFunctions";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AutoComplete, Option } from "../ui/auto-complete";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";

const TransferOwnerDialog = ({ group }) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={() => setOpen(!isOpen)}>
      <DialogTrigger asChild>
        <Button variant={"destructive"}>Transfer ownership</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="my-3 flex items-center">Transfer ownership</DialogTitle>
          <DialogDescription>
            Search for a user to transfer the ownership of this group. The user will have full control over the group.
          </DialogDescription>

          <div className="flex flex-col gap-2 min-h-[300px] max-h-[300px]  overflow-auto pr-2">
            <UserContent group={group} isOpen={isOpen} setOpen={setOpen} />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default TransferOwnerDialog;

const UserContent = ({ group, isOpen, setOpen }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [value, setValue] = useState<Option>();

  const handleFetchUsers = () => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_SERVER_URL}/group/member/${group.id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const members = data.members;
        console.log(members);
        const transformedUsers = [];
        for (let i = 0; i < members.length; i++) {
          const member = members[i];
          if (member.user_id == group.owner_id) {
            continue; // skip the owner (current user)
          }
          transformedUsers.push({
            value: member.user_id,
            label: member.email,
          });
        }
        setUsers(transformedUsers);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    handleFetchUsers();
  }, []);

  return (
    <div className="not-prose mt-4  flex flex-col gap-4 justify-between h-full">
      <AutoComplete
        options={users}
        emptyMessage="No resulsts."
        placeholder="Find something"
        isLoading={isLoading}
        onValueChange={setValue}
        value={value}
      />

      <div className="flex gap-5 justify-end">
        <Button variant="outline" onClick={() => setOpen(!isOpen)}>
          Cancel
        </Button>
        {!value ? (
          <Button variant="destructive" disabled={!value}>
            Transfer
          </Button>
        ) : (
          <TransferAlertDialog group={group} selectedUser={value} />
        )}
      </div>
    </div>
  );
};

const TransferAlertDialog = ({ group, selectedUser }) => {
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  const handleTransferOwnership = () => {
    if (loading) return;

    setError(false);
    setErrorMessage("");
    if (!password) {
      setError(true);
      setErrorMessage("Password is required.");
      return;
    }

    setLoading(true);
    fetch(`${import.meta.env.VITE_SERVER_URL}/group/transfer/${group.id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ new_owner_id: selectedUser?.value, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status == 401) {
          setError(true);
          setErrorMessage("Invalid password.");
        }
        if (data.status == 200) {
          toast({
            title: "Ownership transferred successfully.",
            variant: "success",
          });

          setOpen(!isOpen);
          window.location.reload();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setOpen(!isOpen)}>
      <DialogTrigger asChild>
        <Button variant={"destructive"}>Transfer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="my-3 flex items-center">Transfer ownership</DialogTitle>
          <DialogDescription>Are you sure you want to transfer the ownership of this group to {selectedUser?.label}?</DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="password">Enter your password</Label>
          <Input
            id="password"
            placeholder="**************"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{errorMessage}</p>}

          <div className="flex gap-5 justify-end mt-5">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={loading} onClick={() => handleTransferOwnership()}>
              {loading ? "Loading..." : "Confirm"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
