"use client";

import { ResidentProfile } from "@/lib/types";
import { Button, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

const SubscribersTable = ({ residents }: { residents: ResidentProfile[] }) => {
  const exportCsv = () => {
    const header = ["Name", "Email", "Phone", "Volunteer role", "Confirmed"];
    const rows = residents.map((resident) => [
      resident.name,
      resident.email,
      resident.phone ?? "",
      resident.volunteerRole ?? "",
      resident.confirmed ? "Yes" : "No",
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "residents.csv";
    link.click();
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-brand-primary">
          Subscribers
        </h3>
        <Button size="sm" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Volunteer role</Th>
              <Th>Confirmed</Th>
            </Tr>
          </Thead>
          <Tbody>
            {residents.map((resident) => (
              <Tr key={resident.id}>
                <Td>{resident.name}</Td>
                <Td>{resident.email}</Td>
                <Td>{resident.phone ?? "—"}</Td>
                <Td>{resident.volunteerRole ?? "—"}</Td>
                <Td>{resident.confirmed ? "Yes" : "No"}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
};

export default SubscribersTable;
