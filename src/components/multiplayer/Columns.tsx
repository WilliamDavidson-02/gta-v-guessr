import { ColumnDef } from "@tanstack/react-table";
import { Games } from "./GamesTable";
import { Button } from "../ui/button";

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
    id: "actions",
    cell: ({ row }) => {
      const game = row.original;

      return (
        <div className="flex justify-end">
          <Button
            onClick={() => console.log(game)}
            variant="secondary"
            type="button"
          >
            <span>Join</span>
          </Button>
        </div>
      );
    },
  },
];
