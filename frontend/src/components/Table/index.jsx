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

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const visiblePages = useMemo(() => {
    const pages = [];
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages, page + 1);

    if (start > 1) {
      pages.push(1);
    }

    if (start > 2) {
      pages.push("ellipsis-start");
    }

    for (let current = start; current <= end; current += 1) {
      pages.push(current);
    }

    if (end < totalPages - 1) {
      pages.push("ellipsis-end");
    }

    if (end < totalPages) {
      pages.push(totalPages);
    }

    return pages;
  }, [page, totalPages]);

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
          className={`mt-5 flex flex-col gap-4 rounded-[1.5rem] border px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-5
            ${isDark ? "text-gray-300" : "text-gray-700"}
            ${isDark ? "border-slate-700 bg-slate-900/50" : "border-slate-200 bg-slate-50/80"}
            ${paginationClassName}
          `}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {isCount && (
              <label className="flex items-center gap-3 text-xs font-semibold">
                <span className="whitespace-nowrap opacity-70">Rows per page</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold outline-none transition
                    ${isDark
                      ? "border-slate-700 bg-slate-800 text-slate-100"
                      : "border-slate-200 bg-white text-slate-700"}
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

            <div className="text-xs font-semibold opacity-70">
              Showing{" "}
              <span className="font-black opacity-100">
                {(page - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-black opacity-100">
                {Math.min(page * pageSize, total)}
              </span>{" "}
              of{" "}
              <span className="font-black opacity-100">{total}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              disabled={page === 1}
              onClick={() => handlePaginate(page - 1)}
              className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-40 ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Prev
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {visiblePages.map((item) => {
                if (typeof item !== "number") {
                  return (
                    <span
                      key={item}
                      className={`px-1 text-xs font-black ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      ...
                    </span>
                  );
                }

                const isActive = item === page;
                return (
                  <button
                    key={item}
                    onClick={() => handlePaginate(item)}
                    className={`min-w-10 rounded-xl px-3 py-2 text-xs font-black transition ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                        : isDark
                          ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                          : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => handlePaginate(page + 1)}
              className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-40 ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
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
