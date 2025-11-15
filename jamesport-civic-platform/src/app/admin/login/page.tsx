import { adminLogin } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-semibold text-slate-900">Admin login</h1>
      <p className="mt-2 text-slate-600">Restricted to Jamesport Civic Association board members.</p>
      <form action={adminLogin} className="mt-6 space-y-4">
        <label className="text-base font-semibold text-slate-700" htmlFor="password">
          Dashboard password
        </label>
        <Input id="password" name="password" type="password" required minLength={6} />
        <Button type="submit">Sign in</Button>
      </form>
    </div>
  );
}
