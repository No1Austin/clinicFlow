import { useEffect, useState } from "react";
import API from "../services/api";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  LogOut,
  Search,
  Plus,
  Check,
  X,
  Trash2,
  Clock,
  Activity,
  ShieldCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function Dashboard({ setPage }) {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("dashboard");

  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    appointmentDate: "",
    reason: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const canManage = role === "admin" || role === "staff";
  const isAdmin = role === "admin";

  useEffect(() => {
    fetchAppointments();

    if (isAdmin) {
      fetchUsers();
    }
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || "Failed to fetch appointments");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || "Failed to fetch users");
    }
  };

  const createAppointment = async (e) => {
    e.preventDefault();

    if (!canManage) {
      alert("Patients cannot create appointments.");
      return;
    }

    try {
      await API.post("/appointments", formData);

      setFormData({
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        appointmentDate: "",
        reason: "",
      });

      fetchAppointments();
      setActivePage("appointments");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create appointment");
    }
  };

  const updateStatus = async (id, status) => {
    if (!canManage) return;

    try {
      await API.put(`/appointments/${id}`, { status });
      fetchAppointments();
    } catch {
      alert("Failed to update appointment");
    }
  };

  const deleteAppointment = async (id) => {
    if (!canManage) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch {
      alert("Failed to delete appointment");
    }
  };

  const updateUserRole = async (email, newRole) => {
    if (!isAdmin) return;

    try {
      await API.put("/users/role", {
        email,
        role: newRole,
      });

      fetchUsers();
      alert("User role updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update user role");
    }
  };

  const logout = () => {
    localStorage.clear();
    setPage("login");
  };

  const filtered = appointments.filter((a) =>
    a.patientName?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const pending = appointments.filter((a) => a.status === "pending").length;
  const confirmed = appointments.filter((a) => a.status === "confirmed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;

  const today = new Date().toDateString();

  const todayAppointments = appointments.filter(
    (a) => new Date(a.appointmentDate).toDateString() === today
  );

  const statusData = [
    { name: "Pending", value: pending },
    { name: "Confirmed", value: confirmed },
    { name: "Cancelled", value: cancelled },
  ];

  const weeklyData = getWeeklyData(appointments);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex">
      <aside className="w-72 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between">
        <div>
          <div className="mb-10">
            <h1 className="text-2xl font-extrabold text-white">
              Clinic<span className="text-cyan-400">Flow</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {canManage ? "Staff clinic dashboard" : "Patient portal"}
            </p>
          </div>

          <nav className="space-y-3">
            <NavItem
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              active={activePage === "dashboard"}
              onClick={() => setActivePage("dashboard")}
            />

            <NavItem
              icon={<CalendarDays size={20} />}
              label={canManage ? "Appointments" : "My Appointments"}
              active={activePage === "appointments"}
              onClick={() => setActivePage("appointments")}
            />

            {canManage && (
              <NavItem
                icon={<Plus size={20} />}
                label="Schedule Visit"
                active={activePage === "schedule"}
                onClick={() => setActivePage("schedule")}
              />
            )}

            {canManage && (
              <NavItem
                icon={<Users size={20} />}
                label="Patients"
                active={activePage === "patients"}
                onClick={() => setActivePage("patients")}
              />
            )}

            {isAdmin && (
              <NavItem
                icon={<ShieldCheck size={20} />}
                label="User Management"
                active={activePage === "users"}
                onClick={() => {
                  setActivePage("users");
                  fetchUsers();
                }}
              />
            )}
          </nav>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl py-3 font-semibold transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-extrabold">
              {activePage === "dashboard" && "Dashboard"}
              {activePage === "appointments" &&
                (canManage ? "Appointments" : "My Appointments")}
              {activePage === "schedule" && "Schedule Visit"}
              {activePage === "patients" && "Patients"}
              {activePage === "users" && "User Management"}
            </h2>
            <p className="text-slate-400 mt-1">
              Welcome back, {user?.name || "Clinic User"} · {role || "user"}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3 w-80">
            <Search size={18} className="text-slate-400" />
            <input
              className="bg-transparent outline-none text-sm w-full text-slate-100 placeholder:text-slate-500"
              placeholder={
                activePage === "users"
                  ? "Search users..."
                  : "Search patient..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {activePage === "dashboard" && (
          <>
            <section className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 rounded-3xl p-8 mb-8 shadow-2xl">
              <h3 className="text-3xl font-extrabold">
                {canManage
                  ? "Schedule, track, and manage patient visits seamlessly."
                  : "View and track your clinic appointments easily."}
              </h3>
              <p className="text-blue-100 mt-3 max-w-2xl">
                {canManage
                  ? "ClinicFlow helps small clinics reduce missed appointments, manage patient schedules, and track appointment status in one clean dashboard."
                  : "Your patient portal shows your upcoming visits, appointment status, and clinic reminders."}
              </p>

              {canManage && (
                <button
                  onClick={() => setActivePage("schedule")}
                  className="mt-6 bg-white text-blue-700 px-5 py-3 rounded-2xl font-bold hover:bg-blue-50 transition"
                >
                  Create Appointment
                </button>
              )}
            </section>

            <section className="grid grid-cols-4 gap-5 mb-8">
              <Stat
                icon={<CalendarDays />}
                label={canManage ? "Total Visits" : "My Visits"}
                value={appointments.length}
              />
              <Stat icon={<Clock />} label="Pending" value={pending} />
              <Stat icon={<Check />} label="Confirmed" value={confirmed} />
              <Stat icon={<X />} label="Cancelled" value={cancelled} />
            </section>

            <section className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-xl font-bold mb-5">Appointment Status</h3>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill="#facc15" />
                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-center gap-4 text-sm text-slate-400">
                  <span>🟡 Pending</span>
                  <span>🟢 Confirmed</span>
                  <span>🔴 Cancelled</span>
                </div>
              </div>

              <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-xl font-bold mb-5">Weekly Visits</h3>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <XAxis dataKey="day" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="visits"
                        fill="#22d3ee"
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-xl font-bold mb-5">
                  {canManage ? "Recent Appointments" : "My Recent Appointments"}
                </h3>

                <AppointmentList
                  appointments={filtered.slice(0, 5)}
                  updateStatus={updateStatus}
                  deleteAppointment={deleteAppointment}
                  canManage={canManage}
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-xl font-bold mb-4">Today’s Appointments</h3>

                {todayAppointments.length === 0 ? (
                  <p className="text-slate-400">No appointments today.</p>
                ) : (
                  <div className="space-y-4">
                    {todayAppointments.map((a) => (
                      <div
                        key={a._id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4"
                      >
                        <p className="font-bold">{a.patientName}</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(a.appointmentDate).toLocaleTimeString()}
                        </p>
                        <StatusBadge status={a.status} />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  <MiniInfo label="Reminder status" value="Email enabled" />
                  <MiniInfo label="System status" value="Online" />
                </div>
              </div>
            </section>
          </>
        )}

        {activePage === "schedule" && canManage && (
          <section className="grid grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7">
              <h3 className="text-2xl font-bold mb-2">Create Appointment</h3>
              <p className="text-slate-400 mb-6">
                Add a new patient visit and send an appointment confirmation.
              </p>

              <form onSubmit={createAppointment} className="space-y-4">
                <input
                  name="patientName"
                  placeholder="Patient name"
                  value={formData.patientName}
                  onChange={(e) =>
                    setFormData({ ...formData, patientName: e.target.value })
                  }
                  required
                  className="Input"
                />

                <input
                  name="patientEmail"
                  type="email"
                  placeholder="Patient email"
                  value={formData.patientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, patientEmail: e.target.value })
                  }
                  required
                  className="Input"
                />

                <input
                  name="patientPhone"
                  placeholder="Patient phone"
                  value={formData.patientPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, patientPhone: e.target.value })
                  }
                  className="Input"
                />

                <input
                  type="datetime-local"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointmentDate: e.target.value,
                    })
                  }
                  required
                  className="Input"
                />

                <textarea
                  name="reason"
                  placeholder="Reason for visit"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="Input min-h-28"
                />

                <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-extrabold py-4 rounded-2xl transition">
                  Schedule Appointment
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7">
              <h3 className="text-2xl font-bold mb-6">Scheduling Preview</h3>

              <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 p-6">
                <Activity className="text-cyan-400 mb-5" size={38} />
                <h4 className="text-xl font-bold">Smart Visit Management</h4>
                <p className="text-slate-400 mt-3">
                  Once created, appointments appear in the dashboard where staff
                  can confirm, cancel, track, or remove patient visits.
                </p>
              </div>

              <div className="mt-6 bg-slate-950 border border-slate-800 rounded-3xl p-6">
                <h4 className="font-bold mb-3">What happens next?</h4>
                <ul className="text-slate-400 text-sm space-y-3">
                  <li>• Appointment is saved to the database</li>
                  <li>• Patient receives an email confirmation</li>
                  <li>• Staff can confirm or cancel the visit</li>
                  <li>• Dashboard statistics update automatically</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {activePage === "appointments" && (
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">
                  {canManage ? "All Appointments" : "My Appointments"}
                </h3>
                <p className="text-slate-400">
                  {canManage
                    ? "Confirm, cancel, delete, and track patient visits."
                    : "View your upcoming clinic visits and appointment status."}
                </p>
              </div>

              {canManage && (
                <button
                  onClick={() => setActivePage("schedule")}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-5 py-3 rounded-2xl font-bold transition"
                >
                  New Appointment
                </button>
              )}
            </div>

            <AppointmentList
              appointments={filtered}
              updateStatus={updateStatus}
              deleteAppointment={deleteAppointment}
              canManage={canManage}
            />
          </section>
        )}

        {activePage === "patients" && canManage && (
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-7">
            <h3 className="text-2xl font-bold mb-5">Patients</h3>

            {appointments.length === 0 ? (
              <p className="text-slate-400">No patient records yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-5">
                {appointments.map((a) => (
                  <div
                    key={a._id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-5"
                  >
                    <h4 className="font-bold">{a.patientName}</h4>
                    <p className="text-slate-400 text-sm">{a.patientEmail}</p>
                    <p className="text-slate-500 text-sm">
                      {a.patientPhone || "No phone provided"}
                    </p>
                    <div className="mt-3">
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activePage === "users" && isAdmin && (
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-7">
            <div className="mb-6">
              <h3 className="text-2xl font-bold">User Management</h3>
              <p className="text-slate-400">
                View all users and update their access level.
              </p>
            </div>

            {filteredUsers.length === 0 ? (
              <p className="text-slate-400">No users found.</p>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-lg">{u.name}</h4>
                      <p className="text-slate-400 text-sm">{u.email}</p>
                      <p className="text-slate-500 text-sm">
                        Current role: {u.role}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <RoleBadge role={u.role} />

                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.email, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 outline-none"
                      >
                        <option value="patient">Patient</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition ${
        active
          ? "bg-cyan-500 text-slate-950"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <div className="text-cyan-400 mb-4">{icon}</div>
      <p className="text-slate-400 text-sm">{label}</p>
      <h3 className="text-3xl font-extrabold mt-2">{value}</h3>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
        status === "confirmed"
          ? "bg-green-500/20 text-green-400"
          : status === "cancelled"
          ? "bg-red-500/20 text-red-400"
          : "bg-yellow-500/20 text-yellow-400"
      }`}
    >
      {status || "pending"}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
        role === "admin"
          ? "bg-purple-500/20 text-purple-400"
          : role === "staff"
          ? "bg-cyan-500/20 text-cyan-400"
          : "bg-slate-500/20 text-slate-400"
      }`}
    >
      {role}
    </span>
  );
}

function AppointmentList({
  appointments,
  updateStatus,
  deleteAppointment,
  canManage,
}) {
  if (appointments.length === 0) {
    return <p className="text-slate-400">No appointments found.</p>;
  }

  return (
    <div className="space-y-4">
      {appointments.map((a) => (
        <div
          key={a._id}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-lg">{a.patientName}</h4>
            <p className="text-slate-400 text-sm">{a.patientEmail}</p>
            <p className="text-slate-500 text-sm">
              {new Date(a.appointmentDate).toLocaleString()}
            </p>

            {a.reason && (
              <p className="text-slate-400 text-sm mt-2">{a.reason}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={a.status} />

            {canManage && (
              <>
                <button
                  onClick={() => updateStatus(a._id, "confirmed")}
                  className="p-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition"
                  title="Confirm appointment"
                >
                  <Check size={17} />
                </button>

                <button
                  onClick={() => updateStatus(a._id, "cancelled")}
                  className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500 hover:text-white transition"
                  title="Cancel appointment"
                >
                  <X size={17} />
                </button>

                <button
                  onClick={() => deleteAppointment(a._id)}
                  className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition"
                  title="Delete appointment"
                >
                  <Trash2 size={17} />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
      <p className="text-slate-500 text-sm">{label}</p>
      <p className="font-bold mt-1">{value}</p>
    </div>
  );
}

function getWeeklyData(appointments) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const data = days.map((day) => ({
    day,
    visits: 0,
  }));

  appointments.forEach((appointment) => {
    const dayIndex = new Date(appointment.appointmentDate).getDay();
    data[dayIndex].visits += 1;
  });

  return data;
}