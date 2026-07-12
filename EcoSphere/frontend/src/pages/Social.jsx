import React, { useEffect, useState } from "react";
import client from "../api/client";

export default function Social() {
  const [activities, setActivities] = useState([]);
  const [mine, setMine] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    department: "",
    location: "",
    scheduledDate: "",
    pointsPerParticipation: 10,
    evidenceRequired: false,
    status: "Planned",
  });

  async function loadAll() {
    try {
      const [activitiesRes, mineRes, trainingsRes] = await Promise.all([
        client.get("/csr/activities"),
        client.get("/csr/participations/mine"),
        client.get("/social/trainings"),
      ]);

      setActivities(activitiesRes.data.data || []);
      setMine(mineRes.data.data || []);
      setTrainings(trainingsRes.data.data || []);
    } catch (error) {
      console.error("Error loading social data:", error);
    }
  }

  async function loadMasterData() {
    try {
      const [departmentsRes, categoriesRes] = await Promise.all([
        client.get("/master-data/departments"),
        client.get("/master-data/categories"),
      ]);

      setDepartments(departmentsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error("Error loading master data:", error);
    }
  }

  useEffect(() => {
    loadAll();
    loadMasterData();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function createActivity(e) {
    e.preventDefault();
    setMessage("");

    if (!form.title || !form.category || !form.scheduledDate) {
      setMessage("Please fill Title, Category and Scheduled Date.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        pointsPerParticipation: Number(form.pointsPerParticipation),
      };

      if (!payload.department) {
        delete payload.department;
      }

      await client.post("/csr/activities", payload);

      setMessage("CSR activity created successfully!");

      setForm({
        title: "",
        description: "",
        category: "",
        department: "",
        location: "",
        scheduledDate: "",
        pointsPerParticipation: 10,
        evidenceRequired: false,
        status: "Planned",
      });

      setShowForm(false);
      await loadAll();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message || "Failed to create CSR activity."
      );
    } finally {
      setLoading(false);
    }
  }

  async function join(activityId) {
    try {
      setMessage("");

      await client.post(`/csr/activities/${activityId}/join`);

      setMessage("You joined the CSR activity successfully!");
      await loadAll();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message || "Failed to join activity."
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Social</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
        >
          {showForm ? "Cancel" : "+ Create CSR Activity"}
        </button>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-lg font-semibold mb-4">
            Create New CSR Activity
          </h2>

          <form onSubmit={createActivity} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Activity Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g. Tree Plantation Drive"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Category *
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Department
                </label>

                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">All departments</option>

                  {departments.map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Scheduled Date *
                </label>

                <input
                  type="date"
                  name="scheduledDate"
                  value={form.scheduledDate}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g. Mathura Campus"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Points per Participation
                </label>

                <input
                  type="number"
                  name="pointsPerParticipation"
                  value={form.pointsPerParticipation}
                  onChange={handleChange}
                  min="0"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Describe the CSR activity..."
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="evidenceRequired"
                checked={form.evidenceRequired}
                onChange={handleChange}
              />

              <span className="text-sm">
                Require proof/evidence from participants
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Activity"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">CSR activities</p>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Title</th>
              <th className="py-2">Department</th>
              <th className="py-2">Scheduled date</th>
              <th className="py-2">Points</th>
              <th className="py-2">Status</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="py-6 text-center text-gray-500"
                >
                  No CSR activities available yet.
                </td>
              </tr>
            ) : (
              activities.map((a) => (
                <tr key={a._id} className="border-b last:border-0">
                  <td className="py-3">{a.title}</td>

                  <td className="py-3">
                    {a.department?.name || "All"}
                  </td>

                  <td className="py-3">
                    {new Date(a.scheduledDate).toLocaleDateString()}
                  </td>

                  <td className="py-3">
                    {a.pointsPerParticipation}
                  </td>

                  <td className="py-3">{a.status}</td>

                  <td className="py-3">
                    <button
                      onClick={() => join(a._id)}
                      className="text-green-700 text-xs border border-green-700 rounded px-3 py-1 hover:bg-green-50"
                    >
                      Join
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">
          My participations
        </p>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Activity</th>
              <th className="py-2">Approval</th>
              <th className="py-2">Points earned</th>
            </tr>
          </thead>

          <tbody>
            {mine.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="py-6 text-center text-gray-500"
                >
                  You haven't joined any CSR activities yet.
                </td>
              </tr>
            ) : (
              mine.map((m) => (
                <tr key={m._id} className="border-b last:border-0">
                  <td className="py-3">
                    {m.activity?.title}
                  </td>

                  <td className="py-3">
                    {m.approvalStatus}
                  </td>

                  <td className="py-3">
                    {m.pointsEarned}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">
          Training completion
        </p>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Employee</th>
              <th className="py-2">Training</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {trainings.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="py-6 text-center text-gray-500"
                >
                  No training records available.
                </td>
              </tr>
            ) : (
              trainings.map((t) => (
                <tr key={t._id} className="border-b last:border-0">
                  <td className="py-3">
                    {t.employee?.name}
                  </td>

                  <td className="py-3">
                    {t.trainingName}
                  </td>

                  <td className="py-3">
                    {t.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}