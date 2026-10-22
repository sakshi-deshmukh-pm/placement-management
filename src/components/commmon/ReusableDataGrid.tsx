
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
  type GridValidRowModel,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";

export interface ReusableDataGridProps<
  T extends GridValidRowModel = GridValidRowModel,
> {
  rows: T[];
  columns: GridColDef<T>[];
  loading?: boolean;
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  getRowId?: (row: T) => string | number;
  pageSizeOptions?: number[];
  height?: number | string;
}

export default function ReusableDataGrid<
  T extends GridValidRowModel = GridValidRowModel,
>({
  rows,
  columns,
  loading = false,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  getRowId,
  pageSizeOptions = [10, 20, 50, 100],
  height = 600,
}: ReusableDataGridProps<T>) {
  return (
    <Box sx={{ width: "100%", height }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        rowCount={rowCount}
        getRowId={getRowId}
        pagination
        paginationMode="server"
        sortingMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        pageSizeOptions={pageSizeOptions}
        disableRowSelectionOnClick
        showToolbar
        slotProps={{
          loadingOverlay: {
            variant: "linear-progress",
            noRowsVariant: "skeleton",
          },
        }}
      />
    </Box>
  );
}
