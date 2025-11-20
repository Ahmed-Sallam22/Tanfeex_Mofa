/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { SharedTable } from "@/shared/SharedTable";
import type { TableColumn, TableRow } from "@/shared/SharedTable";
import SearchBar from "@/shared/SearchBar";
import SharedModal from "@/shared/SharedModal";
import { SharedSelect } from "@/shared/SharedSelect";
import type { SelectOption } from "@/shared/SharedSelect";
import { toast } from "react-hot-toast";

// Sample data for users
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  type UserListItem,
} from "@/api/user.api";
import { useGetLevelsQuery, type LevelItem } from "@/api/level.api";

const toApiRole = (uiRole: string) =>
  (uiRole || "").toLowerCase() === "admin" ? "admin" : "user";

const fromApiRole = (apiRole: string) =>
  (apiRole || "").toLowerCase() === "admin" ? "Admin" : "User";
// Role options
const roleOptions: SelectOption[] = [
  { value: "Admin", label: "Admin" },
  { value: "User", label: "User" },
];

// User level options
const userLevelOptions: SelectOption[] = [
  { value: "Level 1", label: "Level 1 - Super Admin" },
  { value: "Level 2", label: "Level 2 - Manager" },
  { value: "Level 3", label: "Level 3 - Employee" },
  { value: "Level 4", label: "Level 4 - Viewer" },
];

function UserChip({ name }: { name: string }) {
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[#EEEEEE]  px-2 py-1 shadow-sm ring-1 ring-black/5">
      <span className="grid place-items-center h-6 w-6 rounded-full bg-[white] text-[#4E8476] text-xs font-bold">
        {initial}
      </span>
      <span className="text-sm text-gray-700">{name}</span>
    </div>
  );
}
export default function Users() {
  const [activeTab, setActiveTab] = useState<
    "users" | "userLevels" | "assignment"
  >("users");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { data: serverLevels } = useGetLevelsQuery();

  const userLevelsData: TableRow[] = useMemo(() => {
    const list = serverLevels ?? [];
    return list.map((lvl: LevelItem) => ({
      id: lvl.id,
      name: lvl.name,
      description: lvl.description,
      order: lvl.level_order,
    }));
  }, [serverLevels]);
  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [isUserLevelModalOpen, setIsUserLevelModalOpen] =
    useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<TableRow | null>(null);
  const [editingUserLevel] = useState<TableRow | null>(null);

  const { data: serverUsers, isLoading } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const usersData: TableRow[] = useMemo(() => {
    const list = serverUsers ?? [];
    return list.map((u: UserListItem) => ({
      id: u.id,
      username: u.username,
      role: u.role === "admin" ? "Admin" : "User",
      userLevel: u.user_level || "-",
      isActive: u.can_transfer_budget, // or any active flag you want
    }));
  }, [serverUsers]);
  const userOptions: SelectOption[] = useMemo(
    () =>
      (serverUsers ?? []).map((u) => ({
        value: u.username,
        label: u.username,
      })),
    [serverUsers]
  );

  // Form states for user
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    role: "",
  });

  // Form states for user level
  const [userLevelForm, setUserLevelForm] = useState({
    name: "",
    description: "",
    order: "",
  });

  // Assignment form states
  const [assignmentForm, setAssignmentForm] = useState({
    selectedUser: "",
    selectedLevel: "",
  });

  // Filter data based on search query
  const filteredUsersData = usersData.filter(
    (user) =>
      user.username
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.role?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userLevel
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredUserLevelsData = userLevelsData.filter(
    (level) =>
      level.name
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      level.description
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Icons

  // Users table columns
  const usersColumns: TableColumn[] = [
    {
      id: "username",
      header: "Username",
      accessor: "username",
    },
    {
      id: "role",
      header: "Role",
      accessor: "role",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-lg text-xs font-medium ${
            value === "Admin"
              ? "bg-purple-100 text-purple-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {String(value)}
        </span>
      ),
    },
    {
      id: "userLevel",
      header: "User Level",
      accessor: "userLevel",
    },
    {
      id: "isActive",
      header: "Active",
      accessor: "isActive",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-lg text-xs font-medium ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  // User levels table columns
  const userLevelsColumns: TableColumn[] = [
    {
      id: "name",
      header: "Name",
      accessor: "name",
    },
    {
      id: "description",
      header: "Description",
      accessor: "description",
    },
    {
      id: "order",
      header: "Order",
      accessor: "order",
    },
  ];

  // Handlers
  const handleTabChange = (tab: "users" | "userLevels" | "assignment") => {
    setActiveTab(tab);
    setSearchQuery("");
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleSearchSubmit = (text: string) => {
    console.log("Search submitted:", text);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ username: "", password: "", role: "user" });
    setIsUserModalOpen(true);
  };
  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await updateUser({
          pk: Number(editingUser.id),
          data: {
            username: userForm.username,
            role: toApiRole(userForm.role), // ensure lowercase for API
          },
        }).unwrap();
        toast.success("User updated");
      } else {
        await createUser({
          username: userForm.username,
          password: userForm.password,
          role: toApiRole(userForm.role), // ensure lowercase for API
        }).unwrap();
        toast.success("User created");
      }
      setIsUserModalOpen(false);
    } catch (e: any) {
      toast.error(e?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (row: TableRow) => {
    setEditingUser(row);
    setUserForm({
      username: String(row.username ?? ""),
      password: "", // do not prefill; backend usually ignores on update
      role: toApiRole(String(row.role ?? "user")), // store api format in form
    });
    setIsUserModalOpen(true);
  };
  const handleDelete = async (row: TableRow) => {
    try {
      await deleteUser({ pk: Number(row.id) }).unwrap();
      toast.success("User deleted");
    } catch (e: any) {
      toast.error(e?.data?.message || "Delete failed");
    }
  };
  // const handleEditUser = (user: TableRow) => {
  //   setEditingUser(user);
  //   setUserForm({
  //     username: String(user.username),
  //     password: '',
  //     role: String(user.role)
  //   });
  //   setIsUserModalOpen(true);
  // };

  // const handleDeleteUser = (user: TableRow) => {
  //   if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
  //     console.log("Deleting user:", user);
  //     // Add delete logic here
  //   }
  // };

  // const handleAddUserLevel = () => {
  //   setEditingUserLevel(null);
  //   setUserLevelForm({ name: '', description: '', order: '' });
  //   setIsUserLevelModalOpen(true);
  // };

  // const handleEditUserLevel = (level: TableRow) => {
  //   setEditingUserLevel(level);
  //   setUserLevelForm({
  //     name: String(level.name),
  //     description: String(level.description),
  //     order: String(level.order)
  //   });
  //   setIsUserLevelModalOpen(true);
  // };

  // const handleDeleteUserLevel = (level: TableRow) => {
  //   if (confirm(`Are you sure you want to delete level "${level.name}"?`)) {
  //     console.log("Deleting user level:", level);
  //     // Add delete logic here
  //   }
  // };

  const handleSaveUserLevel = () => {
    console.log(
      editingUserLevel ? "Updating user level:" : "Creating user level:",
      userLevelForm
    );
    setIsUserLevelModalOpen(false);
    // Add save logic here
  };

  const handleAssignLevel = () => {
    console.log("Assigning level:", assignmentForm);
    setAssignmentForm({ selectedUser: "", selectedLevel: "" });
    // Add assignment logic here
  };

  const getPageTitle = () => {
    return "User Management";
  };

  const shouldShowAddButton = () => {
    return activeTab === "users";
  };
  // map لاسم العرض من الليست الجاهزة
  const usernameToLabel = new Map(userOptions.map((o) => [o.value, o.label]));

  // جهّز توزيع المستخدمين حسب المستوى بترتيب الـ order
  const groupedUsersByLevel = userLevelsData
    .slice()
    .sort((a, b) => Number(a.order) - Number(b.order))
    .map((level) => {
      const members = usersData
        .filter((u) => u.userLevel === level.name)
        .map(
          (u) => usernameToLabel.get(String(u.username)) ?? String(u.username)
        );
      return {
        levelName: String(level.name),
        order: Number(level.order),
        members,
        count: members.length,
      };
    });

  return (
    <div>
      {/* Header with title and add button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-wide">{getPageTitle()}</h1>
        {shouldShowAddButton() && (
          <button
            onClick={handleAddUser}
            className="flex items-center cursor-pointer  gap-1 text-sm  bg-[#4E8476] text-white px-2 py-1.5 rounded-md hover:bg-[#4E8476] transition"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 12.998H13V17.998C13 18.2633 12.8946 18.5176 12.7071 18.7052C12.5196 18.8927 12.2652 18.998 12 18.998C11.7348 18.998 11.4804 18.8927 11.2929 18.7052C11.1054 18.5176 11 18.2633 11 17.998V12.998H6C5.73478 12.998 5.48043 12.8927 5.29289 12.7052C5.10536 12.5176 5 12.2633 5 11.998C5 11.7328 5.10536 11.4785 5.29289 11.2909C5.48043 11.1034 5.73478 10.998 6 10.998H11V5.99805C11 5.73283 11.1054 5.47848 11.2929 5.29094C11.4804 5.1034 11.7348 4.99805 12 4.99805C12.2652 4.99805 12.5196 5.1034 12.7071 5.29094C12.8946 5.47848 13 5.73283 13 5.99805V10.998H18C18.2652 10.998 18.5196 11.1034 18.7071 11.2909C18.8946 11.4785 19 11.7328 19 11.998C19 12.2633 18.8946 12.5176 18.7071 12.7052C18.5196 12.8927 18.2652 12.998 18 12.998Z"
                fill="white"
              />
            </svg>
            Add User
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange("users")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => handleTabChange("userLevels")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "userLevels"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              User Levels
            </button>
            <button
              onClick={() => handleTabChange("assignment")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "assignment"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Assignment
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab !== "assignment" && (
        <>
          {/* Search Bar */}
          <div className="p-4 bg-white rounded-2xl mb-6">
            <SearchBar
              placeholder={
                activeTab === "users"
                  ? "Search users..."
                  : "Search user levels..."
              }
              value={searchQuery}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              dir="ltr"
              debounce={250}
            />
          </div>

          {/* Table */}
          <div>
            {isLoading || isDeleting ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading transfers...</span>
              </div>
            ) : (
              <SharedTable
                title={activeTab === "users" ? "Users" : "User Levels"}
                columns={
                  activeTab === "users" ? usersColumns : userLevelsColumns
                }
                data={
                  activeTab === "users"
                    ? filteredUsersData
                    : filteredUserLevelsData
                }
                maxHeight="600px"
                className="shadow-lg"
                showPagination={false}
                showActions={activeTab === "users" ? true : false}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showFooter={false}
                filterLabel={
                  activeTab === "userLevels" ? "Add User Level" : undefined
                }
              />
            )}
          </div>
        </>
      )}

      {/* Assignment Tab Content */}
      {activeTab === "assignment" && (
        <div className="flex gap-6">
          {/* Assign User Level */}
          <div className="w-1/2 p-6 bg-white rounded-2xl shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Assign User Level
              </h2>
              <p className="text-sm text-gray-600">
                Assign a new level to a user
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <SharedSelect
                  title="Select User"
                  options={userOptions}
                  value={assignmentForm.selectedUser}
                  onChange={(value) =>
                    setAssignmentForm((prev) => ({
                      ...prev,
                      selectedUser: String(value),
                    }))
                  }
                  placeholder="Choose a user"
                  required
                />
              </div>

              <div>
                <SharedSelect
                  title="Select Level"
                  options={userLevelOptions}
                  value={assignmentForm.selectedLevel}
                  onChange={(value) =>
                    setAssignmentForm((prev) => ({
                      ...prev,
                      selectedLevel: String(value),
                    }))
                  }
                  placeholder="Choose a level"
                  required
                />
              </div>

              <button
                onClick={handleAssignLevel}
                disabled={
                  !assignmentForm.selectedUser || !assignmentForm.selectedLevel
                }
                className="w-full px-4 py-2 bg-[#4E8476] text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Assign
              </button>
            </div>
          </div>

          {/* Users by Level */}
          {/* Users by Level (New Design) */}
          <div className="w-1/2 p-6 bg-white rounded-2xl shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Users by Level
              </h2>
              <p className="text-sm text-gray-600">
                User distribution across levels
              </p>
            </div>

            <div className="space-y-4 max-h-[520px] overflow-y-auto custom-scrollbar pr-2">
              {groupedUsersByLevel.map((group, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl bg-[#F6F6F6] p-4"
                >
                  {/* count badge on the left */}
                  <div className="flex justify-between items-center mb-3">
                    <div className=" flex flex-col items-start justify-between">
                      <h3 className="text-[14px] font-bold text-[#276EF1]">
                        Planning and Budgeting Department{" "}
                      </h3>
                      <span className="text-xs text-gray-500">
                        Order {group.order}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-white shadow ring-1 ring-black/5">
                      <span className="text-[15px] font-semibold">
                        {group.count}
                      </span>
                      <span className="text-[8px] tracking-wide text-gray-500">
                        USERS
                      </span>
                    </div>
                  </div>

                  {/* header row */}

                  {/* chips */}
                  <div className=" flex flex-wrap gap-2">
                    {group.members.length > 0 ? (
                      group.members.map((name, i) => (
                        <UserChip key={i} name={name} />
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">
                        No users in this level
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      <SharedModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? "Edit User" : "Add User"}
        size="md"
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#282828] mb-2">
              Username
            </label>
            <input
              type="text"
              value={userForm.username}
              onChange={(e) =>
                setUserForm((prev) => ({ ...prev, username: e.target.value }))
              }
              className="w-full px-3 py-2 border border-[#E2E2E2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter username"
            />
          </div>

          {!editingUser && (
            <div>
              <label className="block text-xs  font-semibold  text-[#282828] mb-2">
                Password
              </label>
              <input
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full px-3 py-2 border border-[#E2E2E2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
          )}

          <div>
            <SharedSelect
              title="Role"
              options={roleOptions} // has Admin/User labels
              value={fromApiRole(userForm.role)} // show nice label
              onChange={(value) =>
                setUserForm((prev) => ({
                  ...prev,
                  role: toApiRole(String(value)),
                }))
              }
              placeholder="Select role"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveUser}
              disabled={
                isCreating ||
                isUpdating ||
                !userForm.username.trim() ||
                !userForm.role.trim() ||
                (!editingUser && !userForm.password.trim())
              }
              className="px-4 py-2 text-sm font-medium text-white bg-[#4E8476] border border-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              {(isCreating || isUpdating) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {!isCreating && !isUpdating && (
                <span>{editingUser ? "Update User" : "Add User"}</span>
              )}
            </button>
          </div>
        </div>
      </SharedModal>

      {/* User Level Modal */}
      <SharedModal
        isOpen={isUserLevelModalOpen}
        onClose={() => setIsUserLevelModalOpen(false)}
        title={editingUserLevel ? "Edit User Level" : "Add User Level"}
        size="md"
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#282828] mb-2">
              Name *
            </label>
            <input
              type="text"
              value={userLevelForm.name}
              onChange={(e) =>
                setUserLevelForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-3 border border-[#E2E2E2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter level name"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#282828] mb-2">
              Description *
            </label>
            <textarea
              value={userLevelForm.description}
              onChange={(e) =>
                setUserLevelForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-3 border border-[#E2E2E2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter level description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#282828] mb-2">
              Order *
            </label>
            <input
              type="number"
              value={userLevelForm.order}
              onChange={(e) =>
                setUserLevelForm((prev) => ({ ...prev, order: e.target.value }))
              }
              className="w-full px-3 py-3 border border-[#E2E2E2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter order number"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setIsUserLevelModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveUserLevel}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4E8476] border border-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingUserLevel ? "Update Level" : "Add Level"}
            </button>
          </div>
        </div>
      </SharedModal>
    </div>
  );
}
