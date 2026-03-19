import React from "react";
import {
  Fragment,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import {
  ArrowDownIcon,
  ArrowUpIcon,
} from "@heroicons/react/16/solid";
import DragDrop from "./DragDrop";

/* ================= TABLE SKELETON ================= */
const TableSkeleton = ({ rows = 10 }) => {
  const isDark = useSelector(
    (state) => state.theme.mode === "dark"
  );

  return (
    <div
      className={`rounded-xl border overflow-hidden
        ${isDark
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"}
      `}
    >
      {/* HEADER */}
      <div
        className={`h-12 animate-pulse
          ${isDark ? "bg-gray-700" : "bg-gray-200"}
        `}
      />

      {/* ROWS */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`h-14 border-t animate-pulse
            ${isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-100 border-gray-200"}
          `}
        />
      ))}
    </div>
  );
};

/* ================= MAIN TABLE ================= */
const Table = ({
  className = "",
  paginationClassName = "",
  data = [],
  theme = "table",
  ListHtml = () => null,
  rowClass = "",
  sortOrder,
  columns = [],
  topHead = [],
  count = 10,
  total = 0,
  page = 1,
  result = () => {},
  nodata = "Data Not Found",
  isCount = true,
  isPagination = true,
  draggable = false,
  setArray = () => {},
  isLoading = false,
}) => {
  const dragRef = useRef({ start: -1, enter: -1 });
  const [pageSize, setPageSize] = useState(count);

  const isDark = useSelector(
    (state) => state.theme.mode === "dark"
  );

  useEffect(() => {
    setPageSize(count);
  }, [count]);

  /* ---------------- HANDLERS ---------------- */
  const handlePageSizeChange = (e) => {
    const val = Number(e.target.value);
    setPageSize(val);
    result({ event: "count", value: val });
  };

  const handlePaginate = (p) => {
    result({ event: "page", value: p });
  };

  const handleRowClick = (row) => {
    result({ event: "row", row });
  };

  const handleSort = (col) => {
    if (col.sort) {
      result({ event: "sort", value: col.key });
    }
  };

  const pageOptions = useMemo(() => {
    const preferredOptions = [10, 20, 50, 100, 1000];
    const validOptions = preferredOptions.filter((option) => option <= Math.max(total, count, 10));

    if (!validOptions.length) {
      return [10];
    }

    if (!validOptions.includes(count)) {
      validOptions.push(count);
    }

    return [...new Set(validOptions)].sort((left, right) => left - right);
  }, [count, total]);

  /* ================= LOADING ================= */
  if (isLoading) {
    return <TableSkeleton rows={count} />;
  }

  /* ================= NO DATA ================= */
  if (!total || data.length === 0) {
    return (
      <div
        className={`p-6 text-center text-sm rounded-xl border
          ${isDark
            ? "bg-gray-800 border-gray-700 text-gray-400"
            : "bg-white border-gray-200 text-gray-500"}
        `}
      >
        {nodata}
      </div>
    );
  }

  return (
    <>
      {/* ================= TABLE VIEW ================= */}
      {theme === "table" && (
        <div
          className={`relative overflow-x-auto rounded-xl border
            ${isDark
              ? "bg-gray-800 border-gray-700 text-gray-200"
              : "bg-white border-gray-200 text-gray-700"}
            ${className}
          `}
        >
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead
              className={`capitalize
                ${isDark
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-50 text-gray-700"}
              `}
            >
              {topHead.length > 0 && (
                <tr>
                  {topHead.map((h, i) => (
                    <th
                      key={i}
                      colSpan={h.colSpan}
                      className="px-3 py-3 text-center sm:px-6"
                    >
                      {h.name}
                    </th>
                  ))}
                </tr>
              )}

              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col)}
                    className={`px-3 py-3 font-medium select-none sm:px-6
                      ${col.sort ? "cursor-pointer" : ""}
                    `}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.name}
                      {col.sort &&
                        (sortOrder === "asc" ? (
                          <ArrowDownIcon className="h-4 w-4 opacity-70" />
                        ) : (
                          <ArrowUpIcon className="h-4 w-4 opacity-70" />
                        ))}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {draggable
                ? data.map((row, i) => (
                    <DragDrop
                      key={row.id}
                      itemKey={row.id}
                      index={i}
                      array={data}
                      setArray={setArray}
                      dragRef={dragRef}
                      element="tr"
                      onClick={() => handleRowClick(row)}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-3 py-4 border-b align-top sm:px-6
                            ${isDark
                              ? "border-gray-700"
                              : "border-gray-200"}
                          `}
                        >
                          {col.render(row) ?? "--"}
                        </td>
                      ))}
                    </DragDrop>
                  ))
                : data.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => handleRowClick(row)}
                      className={`cursor-pointer transition
                        ${isDark
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-50"}
                      `}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-3 py-4 border-b align-top sm:px-6
                            ${isDark
                              ? "border-gray-700"
                              : "border-gray-200"}
                          `}
                        >
                          {col.render(row) ?? "--"}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= LIST VIEW ================= */}
      {theme === "list" && (
        <div className={`${rowClass} ${className}`}>
          {data.map((row) => (
            <Fragment key={row.id}>
              <ListHtml row={row} />
            </Fragment>
          ))}
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      {isPagination && total > pageSize && (
        <div
          className={`mt-4 flex flex-col gap-3 px-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-4
            ${isDark ? "text-gray-300" : "text-gray-700"}
            ${paginationClassName}
          `}
        >
          {isCount && (
            <label className="flex items-center gap-2 text-xs font-medium">
              <span className="whitespace-nowrap">Rows per page</span>
              <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className={`px-2 py-1 rounded border
                ${isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-300"}
              `}
              >
                {pageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => handlePaginate(page - 1)}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Prev
            </button>

            <span>
              Page <b>{page}</b> of{" "}
              <b>{Math.ceil(total / pageSize)}</b>
            </span>

            <button
              disabled={page >= Math.ceil(total / pageSize)}
              onClick={() => handlePaginate(page + 1)}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Table);
