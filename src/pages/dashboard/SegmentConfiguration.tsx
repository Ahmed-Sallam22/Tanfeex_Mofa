import { useState } from "react";
import { Plus } from "lucide-react";
import {
  SharedTable,
  type TableColumn,
  type TableRow as SharedTableRow,
} from "@/shared/SharedTable";
import {
  useGetSegmentTypesQuery,
  useDeleteSegmentTypeMutation,
  useToggleSegmentRequiredMutation,
  useToggleSegmentHierarchyMutation,
  type SegmentType,
} from "@/api/segmentConfiguration.api";
import toast from "react-hot-toast";

type ViewMode = "list" | "card";

export default function SegmentConfiguration() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  // Fetch segment types data from API
  const { data: segmentData, isLoading } = useGetSegmentTypesQuery();

  // Delete segment mutation
  const [deleteSegmentType] = useDeleteSegmentTypeMutation();

  // Toggle mutations
  const [toggleRequired] = useToggleSegmentRequiredMutation();
  const [toggleHierarchy] = useToggleSegmentHierarchyMutation();

  const segments = segmentData?.data || [];

  const handleAddSegment = () => {
    console.log("Add segment clicked");
    // TODO: Implement add segment modal
  };

  const handleEditSegment = (segment: SegmentType) => {
    console.log("Edit segment:", segment);
    // TODO: Implement edit segment modal
  };

  const handleDeleteSegmentClick = async (segment: SegmentType) => {
    try {
      await deleteSegmentType(segment.segment_id).unwrap();
      toast.success("Segment type deleted successfully");
    } catch (error) {
      console.error("Failed to delete segment type:", error);
      toast.error("Failed to delete segment type");
    }
  };

  const handleToggleRequired = async (segment: SegmentType) => {
    try {
      await toggleRequired({
        id: segment.segment_id,
        is_required: !segment.segment_type_is_required,
      }).unwrap();
      toast.success("Required status updated successfully");
    } catch (error) {
      console.error("Failed to toggle required:", error);
      toast.error("Failed to update required status");
    }
  };

  const handleToggleHierarchy = async (segment: SegmentType) => {
    try {
      await toggleHierarchy({
        id: segment.segment_id,
        has_hierarchy: !segment.segment_type_has_hierarchy,
      }).unwrap();
      toast.success("Hierarchy status updated successfully");
    } catch (error) {
      console.error("Failed to toggle hierarchy:", error);
      toast.error("Failed to update hierarchy status");
    }
  };

  // Define columns for SharedTable
  const columns: TableColumn[] = [
    {
      id: "segment_name",
      header: "Segment Name",
      render: (_, row) => {
        const segment = row as unknown as SegmentType;
        return (
          <span className="text-sm text-gray-900 font-medium">
            {segment.segment_name}
          </span>
        );
      },
    },
    {
      id: "segment_type",
      header: "Segment Type",
      render: (_, row) => {
        const segment = row as unknown as SegmentType;
        return (
          <span className="text-sm text-gray-500">
            {segment.segment_type || "N/A"}
          </span>
        );
      },
    },
    {
      id: "segment_type_oracle_number",
      header: "Oracle Segment #",
      render: (_, row) => {
        const segment = row as unknown as SegmentType;
        return (
          <span className="text-sm text-gray-500">
            {segment.segment_type_oracle_number}
          </span>
        );
      },
    },
    {
      id: "segment_type_is_required",
      header: "Required",
      render: (_, row) => {
        const segment = row as unknown as SegmentType;
        return (
          <button
            type="button"
            onClick={() => handleToggleRequired(segment)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4E8476] focus:ring-offset-2"
            style={{
              backgroundColor: segment.segment_type_is_required
                ? "#4E8476"
                : "#e5e7eb",
            }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                segment.segment_type_is_required
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        );
      },
    },
    {
      id: "segment_type_has_hierarchy",
      header: "Has Hierarchy",
      render: (_, row) => {
        const segment = row as unknown as SegmentType;
        return (
          <button
            type="button"
            onClick={() => handleToggleHierarchy(segment)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4E8476] focus:ring-offset-2"
            style={{
              backgroundColor: segment.segment_type_has_hierarchy
                ? "#4E8476"
                : "#e5e7eb",
            }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                segment.segment_type_has_hierarchy
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        );
      },
    },
    {
      id: "segment_type_display_order",
      header: "Display Order",
      render: (_, row) => {
        const segment = row as unknown as SegmentType;
        return (
          <span className="text-sm text-gray-900">
            {segment.segment_type_display_order}
          </span>
        );
      },
    },
    {
      id: "segment_type_status",
      header: "Status",
      render: (_, row) => {
        const segment = row as unknown as SegmentType;
        const isActive = segment.segment_type_status === "Active";
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {segment.segment_type_status}
          </span>
        );
      },
    },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E8476]"></div>
        <span className="ml-2 text-gray-600">Loading segments...</span>
      </div>
    );
  }



  return (
    <div className="p-2 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-gray-900">Segment Configuration</h1>
        <button
          onClick={handleAddSegment}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4E8476] hover:bg-[#3d6b5f] text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          Add Segment
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-xl p-6">
        {/* Card Header with View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-gray-900">Segment Configuration</h2>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-[#4E8476] shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="List View"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 4.16602H2.50792"
                  stroke="currentColor"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.5 10H2.50792"
                  stroke="currentColor"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.5 15.834H2.50792"
                  stroke="currentColor"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.66797 4.16602H17.5013"
                  stroke="currentColor"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.66797 10H17.5013"
                  stroke="currentColor"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.66797 15.834H17.5013"
                  stroke="currentColor"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "card"
                  ? "bg-white text-[#4E8476] shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Card View"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.99744 2H2.99957C2.44752 2 2 2.44772 2 3V8C2 8.55228 2.44752 9 2.99957 9H7.99744C8.54949 9 8.99702 8.55228 8.99702 8V3C8.99702 2.44772 8.54949 2 7.99744 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M16.9935 2H11.9957C11.4436 2 10.9961 2.44772 10.9961 3V8C10.9961 8.55228 11.4436 9 11.9957 9H16.9935C17.5456 9 17.9931 8.55228 17.9931 8V3C17.9931 2.44772 17.5456 2 16.9935 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M7.99744 11H2.99957C2.44752 11 2 11.4477 2 12V17C2 17.5523 2.44752 18 2.99957 18H7.99744C8.54949 18 8.99702 17.5523 8.99702 17V12C8.99702 11.4477 8.54949 11 7.99744 11Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M16.9935 11H11.9957C11.4436 11 10.9961 11.4477 10.9961 12V17C10.9961 17.5523 11.4436 18 11.9957 18H16.9935C17.5456 18 17.9931 17.5523 17.9931 17V12C17.9931 11.4477 17.5456 11 16.9935 11Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segments.map((segment) => (
              <div
                key={segment.segment_id}
                className="bg-white rounded-3xl shadow-[0_10px_35px_rgba(15,55,80,0.08)] border border-gray-100 p-6 transition-all duration-300 hover:shadow-[0_18px_45px_rgba(15,55,80,0.12)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {segment.segment_name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {segment.segment_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[#4E8476]">
                    <button
                      type="button"
                      onClick={() => handleEditSegment(segment)}
                      className="rounded-full hover:bg-[#4E8476]/10 transition-colors p-1"
                      title="Edit"
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_79_19294)">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M17.8384 9.74767C19.0575 8.52861 21.034 8.52861 22.253 9.74767C23.4721 10.9667 23.4721 12.9432 22.253 14.1623L15.9295 20.4858C15.5682 20.8471 15.3555 21.0598 15.119 21.2444C14.8401 21.4619 14.5384 21.6484 14.2191 21.8005C13.9482 21.9296 13.6629 22.0247 13.1781 22.1863L10.9574 22.9265L10.4227 23.1048C9.98896 23.2493 9.5108 23.1364 9.18753 22.8132C8.86426 22.4899 8.75139 22.0117 8.89596 21.578L9.81444 18.8226C9.976 18.3378 10.0711 18.0525 10.2002 17.7816C10.3523 17.4624 10.5388 17.1606 10.7563 16.8818C10.9409 16.6452 11.1536 16.4325 11.5149 16.0712L17.8384 9.74767ZM10.9343 21.8801L12.8287 21.2487C13.3561 21.0729 13.5802 20.9972 13.7889 20.8978C14.0426 20.7769 14.2823 20.6287 14.5039 20.4559C14.6862 20.3137 14.8541 20.147 15.2472 19.7539L20.2935 14.7076C19.7677 14.5222 19.0904 14.1785 18.4563 13.5444C17.8222 12.9103 17.4785 12.233 17.2931 11.7072L12.2468 16.7535C11.8537 17.1466 11.687 17.3145 11.5449 17.4968C11.372 17.7184 11.2238 17.9581 11.1029 18.2118C11.0035 18.4205 10.9279 18.6446 10.752 19.172L10.1206 21.0664L10.9343 21.8801ZM18.1042 10.8961C18.127 11.0127 18.1656 11.1713 18.2299 11.3566C18.3746 11.7739 18.6481 12.322 19.1634 12.8373C19.6787 13.3526 20.2268 13.6261 20.6441 13.7708C20.8294 13.8351 20.988 13.8737 21.1046 13.8965L21.5459 13.4552C22.3745 12.6267 22.3745 11.2833 21.5459 10.4548C20.7174 9.62624 19.3741 9.62624 18.5455 10.4548L18.1042 10.8961Z"
                            fill="#757575"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_79_19294">
                            <rect
                              width="16"
                              height="16"
                              fill="white"
                              transform="translate(8 8)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSegmentClick(segment)}
                      className="rounded-full hover:bg-red-50 transition-colors p-1"
                      title="Delete"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.1133 6.66671C10.3878 5.88991 11.1287 5.33337 11.9995 5.33337C12.8703 5.33337 13.6111 5.88991 13.8857 6.66671"
                          stroke="#757575"
                          strokeLinecap="round"
                        />
                        <path
                          d="M17.6674 8H6.33398"
                          stroke="#757575"
                          strokeLinecap="round"
                        />
                        <path
                          d="M16.5545 9.66663L16.2478 14.266C16.1298 16.036 16.0708 16.9209 15.4942 17.4605C14.9175 18 14.0306 18 12.2567 18H11.7411C9.96726 18 9.08033 18 8.50365 17.4605C7.92698 16.9209 7.86798 16.036 7.74999 14.266L7.44336 9.66663"
                          stroke="#757575"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10.334 11.3334L10.6673 14.6667"
                          stroke="#757575"
                          strokeLinecap="round"
                        />
                        <path
                          d="M13.6673 11.3334L13.334 14.6667"
                          stroke="#757575"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => handleToggleRequired(segment)}
                    className="inline-flex items-center gap-2 rounded-2xl py-2 text-sm font-semibold text-[#4E8476]"
                  >
                    <span
                      className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                        segment.segment_type_is_required
                          ? "bg-[#4E8476] border-[#4E8476]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {segment.segment_type_is_required && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 13 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 4.5L4.5 8L12 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    Required
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleHierarchy(segment)}
                    className="inline-flex items-center gap-2 rounded-2xl py-2 text-sm font-semibold text-[#4E8476]"
                  >
                    <span
                      className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                        segment.segment_type_has_hierarchy
                          ? "bg-[#4E8476] border-[#4E8476]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {segment.segment_type_has_hierarchy && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 13 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 4.5L4.5 8L12 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    Has Hierarchy
                  </button>
                </div>

                <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
                  {segment.description || "No description provided"}
                </p>

                <div className="mt-3 flex items-center justify-between border-gray-100 pt-4">
                  <span
                    className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
                      segment.segment_type_status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {segment.segment_type_status}
                  </span>
                  <div className="text-xs text-gray-500">
                    <div>Total Segments: {segment.total_segments}</div>
                    <div>Order: {segment.segment_type_display_order}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <SharedTable
            columns={columns}
            data={segments as unknown as SharedTableRow[]}
            showFooter={false}
            maxHeight="600px"
            showActions={true}
            onDelete={(row) => {
              const segment = row as unknown as SegmentType;
              handleDeleteSegmentClick(segment);
            }}
            onEdit={(row) => {
              const segment = row as unknown as SegmentType;
              handleEditSegment(segment);
            }}
            showPagination={false}
          />
        )}
      </div>
    </div>
  );
}
