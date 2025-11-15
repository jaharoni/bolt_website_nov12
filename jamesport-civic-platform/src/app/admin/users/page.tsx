import Link from "next/link";
import { fetchUsers } from "@/lib/repositories/userRepository";

export default async function AdminUsersPage() {
  const users = await fetchUsers();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Subscribers</h1>
          <p className="text-slate-600">{users.length} residents opted in.</p>
        </div>
        <Link
          href="/admin/users/export"
          className="rounded-full bg-[#0b4f6c] px-5 py-3 text-sm font-semibold text-white"
        >
          Export CSV
        </Link>
      </div>
      <div className="mt-6 overflow-auto rounded-2xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Alerts</th>
              <th className="px-4 py-3">Volunteer</th>
              <th className="px-4 py-3">Confirmed</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100 text-slate-700">
                <td className="px-4 py-3 font-semibold">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.phone ?? "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {Object.entries(user.alertPrefs)
                    .filter(([, value]) => value)
                    .map(([key]) => key)
                    .join(", ") || "—"}
                </td>
                <td className="px-4 py-3">{user.volunteerRole ?? "—"}</td>
                <td className="px-4 py-3">{user.confirmed ? "Yes" : "Pending"}</td>
                <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
