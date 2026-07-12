import React from 'react';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder Cards */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Metric {i}</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">+12,345</div>
              <p className="text-xs text-muted-foreground">+19% from last month</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">Reports Data</h3>
          <p className="text-sm text-muted-foreground">Manage your reports here.</p>
        </div>
        <div className="p-6 pt-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">ID</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-2 align-middle">#{row}00{row}</td>
                    <td className="p-2 align-middle">Item {row}</td>
                    <td className="p-2 align-middle">Active</td>
                    <td className="p-2 align-middle">2026-07-12</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
