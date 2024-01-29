import { ColumnDef } from "@tanstack/react-table";
import { Games } from "./GamesTable";
import JoinAction from "./JoinAction";

export const columns: ColumnDef<Games>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "level",
    header: "Level",
  },
  {
    accessorKey: "region",
    header: "Region",
    cell: ({ row }) => {
      const formatted = (row.getValue("region") as string).replace("_", " ");

      return <div className="capitalize">{formatted}</div>;
    },
  },
  {
    accessorKey: "players",
    header: () => <div className="text-center">Players</div>,
    cell: ({ row }) => {
      const { users } = row.original;

      return <div className="text-center">{users.length}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <JoinAction game={row.original} />,
  },
];
