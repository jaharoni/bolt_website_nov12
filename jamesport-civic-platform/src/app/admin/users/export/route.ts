import { fetchUsers } from "@/lib/repositories/userRepository";

export async function GET() {
  const users = await fetchUsers();
  const header = ["name", "email", "phone", "alerts", "volunteer_role", "confirmed", "created_at"].join(",");
  const rows = users.map((user) =>
    [
      user.name,
      user.email,
      user.phone ?? "",
      Object.entries(user.alertPrefs)
        .filter(([, value]) => value)
        .map(([key]) => key)
        .join("|"),
      user.volunteerRole ?? "",
      user.confirmed ? "true" : "false",
      user.createdAt,
    ]
      .map((value) => `"${value.replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=users-${Date.now()}.csv`,
    },
  });
}
