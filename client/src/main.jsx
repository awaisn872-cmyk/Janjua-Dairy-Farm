import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  Users,
  Milk,
  Sun,
  Wallet,
  Plus,
  Search,
  Trash2,
  Menu,
  X,
  Droplets,
  Phone,
  MapPin,
} from "lucide-react";
import "./styles.css";

/* =========================================================
   API
========================================================= */

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

/* =========================================================
   HELPERS
========================================================= */

const today = () => new Date().toISOString().slice(0, 10);

const money = (n) =>
  "Rs. " + Number(n || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  });

const getId = (item) => item?._id || item?.id;

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed with status ${response.status}`
    );
  }

  return data;
};

/* =========================================================
   APP
========================================================= */

function App() {
  const [data, setData] = useState({
    customers: [],
    milk: [],
    water: [],
    payments: [],
  });

  const [page, setPage] = useState("dashboard");
  const [mobile, setMobile] = useState(false);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const nav = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["customers", "Customers", Users],
    ["milk", "Milk Record", Milk],
    ["water", "Solar Water", Sun],
    ["payments", "Payments", Wallet],
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [customers, milk, water, payments] = await Promise.all([
        apiRequest("/customers"),
        apiRequest("/milk"),
        apiRequest("/water"),
        apiRequest("/payments"),
      ]);

      setData({
        customers: Array.isArray(customers) ? customers : [],
        milk: Array.isArray(milk) ? milk : [],
        water: Array.isArray(water) ? water : [],
        payments: Array.isArray(payments) ? payments : [],
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const go = (p) => {
    setPage(p);
    setMobile(false);
    setSelected(null);
  };

  const refresh = async () => {
    await loadData();
  };

  return (
    <div className="app">
      <aside className={mobile ? "open" : ""}>
        <div className="brand">
          <div className="logo">🐄</div>

          <div>
            <b>Janjua</b>
            <span>Dairy Farm</span>
          </div>

          <button className="close" onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>

        <nav>
          {nav.map(([p, l, I]) => (
            <button
              className={page === p ? "active" : ""}
              onClick={() => go(p)}
              key={p}
            >
              <I size={19} />
              {l}
            </button>
          ))}
        </nav>

        <div className="sideBottom">
          <small>Management System</small>
          <strong>Janjua Dairy Farm</strong>
        </div>
      </aside>

      <main>
        <header>
          <button className="hamb" onClick={() => setMobile(true)}>
            <Menu />
          </button>

          <div>
            <h1>
              {selected
                ? selected.name
                : nav.find((x) => x[0] === page)?.[1] || "Dashboard"}
            </h1>

            <p>Milk & Solar Water Management</p>
          </div>

          <div className="date">
            {new Date().toLocaleDateString("en-PK", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </header>

        {error && (
          <div className="panel" style={{ marginBottom: 16 }}>
            <strong>Backend Error</strong>
            <p style={{ marginBottom: 0 }}>{error}</p>

            <button
              className="primary"
              style={{ marginTop: 12 }}
              onClick={refresh}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <section>
            <div className="panel">
              <h3>Loading Janjua Dairy Farm...</h3>
              <p>Connecting to your database.</p>
            </div>
          </section>
        ) : (
          <>
            {page === "dashboard" && (
              <Dashboard data={data} go={go} />
            )}

            {page === "customers" && !selected && (
              <Customers
                data={data}
                setData={setData}
                open={setSelected}
                refresh={refresh}
              />
            )}

            {page === "customers" && selected && (
              <Ledger
                customer={selected}
                data={data}
                setData={setData}
                back={() => setSelected(null)}
                refresh={refresh}
              />
            )}

            {page === "milk" && (
              <MilkPage
                data={data}
                setData={setData}
                refresh={refresh}
              />
            )}

            {page === "water" && (
              <WaterPage
                data={data}
                setData={setData}
                refresh={refresh}
              />
            )}

            {page === "payments" && (
              <Payments
                data={data}
                setData={setData}
                refresh={refresh}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Stats({ data }) {
  const milkSales = data.milk.reduce(
    (a, x) => a + Number(x.total || 0),
    0
  );

  const waterSales = data.water.reduce(
    (a, x) => a + Number(x.total || 0),
    0
  );

  const paid = data.payments.reduce(
    (a, x) => a + Number(x.amount || 0),
    0
  );

  const sales = milkSales + waterSales;

  return (
    <div className="stats">
      <Card
        icon={<Users />}
        label="Customers"
        value={data.customers.length}
        cls="green"
      />

      <Card
        icon={<Milk />}
        label="Milk Sales"
        value={money(milkSales)}
        cls="cream"
      />

      <Card
        icon={<Sun />}
        label="Water Revenue"
        value={money(waterSales)}
        cls="yellow"
      />

      <Card
        icon={<Wallet />}
        label="Total Baqaya"
        value={money(sales - paid)}
        cls="red"
      />
    </div>
  );
}

function Card({ icon, label, value, cls }) {
  return (
    <div className={"card " + cls}>
      <div className="cardIcon">{icon}</div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Dashboard({ data, go }) {
  const milk = data.milk.reduce(
    (a, x) => a + Number(x.liters || 0),
    0
  );

  const hours = data.water.reduce(
    (a, x) => a + Number(x.hours || 0),
    0
  );

  return (
    <section>
      <Stats data={data} />

      <div className="grid2">
        <div className="panel hero">
          <div>
            <span className="eyebrow">TODAY'S OVERVIEW</span>

            <h2>Farm records, all in one place.</h2>

            <p>
              Track milk deliveries, solar-powered water hours,
              payments and outstanding balances without paperwork.
            </p>

            <div className="quick">
              <button onClick={() => go("milk")}>
                <Plus /> Add Milk
              </button>

              <button onClick={() => go("water")}>
                <Plus /> Add Water
              </button>

              <button onClick={() => go("payments")}>
                <Wallet /> Payment
              </button>
            </div>
          </div>

          <div className="cow">🐄</div>
        </div>

        <div className="panel">
          <h3>Today's Activity</h3>

          <div className="mini">
            <div>
              <Milk />
              <b>{milk} L</b>
              <span>Milk recorded</span>
            </div>

            <div>
              <Droplets />
              <b>{hours} hrs</b>
              <span>Water supplied</span>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panelHead">
          <h3>Customers with Baqaya</h3>

          <button
            className="textBtn"
            onClick={() => go("customers")}
          >
            View all →
          </button>
        </div>

        <BalanceTable data={data} limit={5} />
      </div>
    </section>
  );
}

function BalanceTable({ data, limit }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Milk</th>
            <th>Water</th>
            <th>Paid</th>
            <th>Baqaya</th>
          </tr>
        </thead>

        <tbody>
          {data.customers
            .map((c) => {
              const customerId = getId(c);

              const m = data.milk
                .filter((x) => getId(x.customer) === customerId)
                .reduce(
                  (a, x) => a + Number(x.total || 0),
                  0
                );

              const w = data.water
                .filter((x) => getId(x.customer) === customerId)
                .reduce(
                  (a, x) => a + Number(x.total || 0),
                  0
                );

              const p = data.payments
                .filter((x) => getId(x.customer) === customerId)
                .reduce(
                  (a, x) => a + Number(x.amount || 0),
                  0
                );

              const b = m + w - p;

              return b > 0 ? (
                <tr key={customerId}>
                  <td>
                    <b>{c.name}</b>
                    <small>{c.phone}</small>
                  </td>

                  <td>{money(m)}</td>
                  <td>{money(w)}</td>
                  <td>{money(p)}</td>

                  <td>
                    <span className="badge danger">
                      {money(b)}
                    </span>
                  </td>
                </tr>
              ) : null;
            })
            .filter(Boolean)
            .slice(0, limit || 999)}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   CUSTOMERS
========================================================= */

function Customers({ data, setData, open, refresh }) {
  const [q, setQ] = useState("");
  const [form, setForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState({
    name: "",
    phone: "",
    address: "",
    milkRate: 220,
    waterRate: 100,
    paymentCycle: "30-days",
    notes: "",
  });

  const list = data.customers.filter((c) =>
    (c.name + " " + c.phone)
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  const save = async () => {
    if (!f.name.trim()) {
      alert("Customer name is required");
      return;
    }

    try {
      setSaving(true);

      await apiRequest("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: f.name.trim(),
          phone: f.phone.trim(),
          address: f.address.trim(),
          milkRate: Number(f.milkRate),
          waterRate: Number(f.waterRate),
          paymentCycle: f.paymentCycle,
          notes: f.notes || "",
        }),
      });

      await refresh();

      setF({
        name: "",
        phone: "",
        address: "",
        milkRate: 220,
        waterRate: 100,
        paymentCycle: "30-days",
        notes: "",
      });

      setForm(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="toolbar">
        <div className="search">
          <Search />

          <input
            placeholder="Search customer..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <button
          className="primary"
          onClick={() => setForm(true)}
        >
          <Plus /> Add Customer
        </button>
      </div>

      {form && (
        <Form
          title="New Customer"
          onClose={() => setForm(false)}
          onSave={save}
          saveText={saving ? "Saving..." : "Save Customer"}
          disabled={saving}
        >
          <Field
            label="Customer Name"
            value={f.name}
            onChange={(v) => setF({ ...f, name: v })}
          />

          <Field
            label="Phone"
            value={f.phone}
            onChange={(v) => setF({ ...f, phone: v })}
          />

          <Field
            label="Address"
            value={f.address}
            onChange={(v) => setF({ ...f, address: v })}
          />

          <div className="two">
            <Field
              label="Milk Rate / L"
              type="number"
              value={f.milkRate}
              onChange={(v) =>
                setF({ ...f, milkRate: v })
              }
            />

            <Field
              label="Water Rate / Hour"
              type="number"
              value={f.waterRate}
              onChange={(v) =>
                setF({ ...f, waterRate: v })
              }
            />
          </div>

          <label>
            Payment Cycle

            <select
              value={f.paymentCycle}
              onChange={(e) =>
                setF({
                  ...f,
                  paymentCycle: e.target.value,
                })
              }
            >
              <option value="daily">Daily</option>
              <option value="15-days">15 Days</option>
              <option value="30-days">30 Days</option>
            </select>
          </label>

          <Field
            label="Notes"
            value={f.notes}
            onChange={(v) => setF({ ...f, notes: v })}
          />
        </Form>
      )}

      {list.length === 0 ? (
        <div className="panel">
          <h3>No customers found</h3>
          <p>Add your first customer to get started.</p>
        </div>
      ) : (
        <div className="customerGrid">
          {list.map((c) => (
            <CustomerCard
              key={getId(c)}
              c={c}
              data={data}
              open={open}
              setData={setData}
              refresh={refresh}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CustomerCard({
  c,
  data,
  open,
  refresh,
}) {
  const customerId = getId(c);

  const bill =
    data.milk
      .filter(
        (x) => getId(x.customer) === customerId
      )
      .reduce(
        (a, x) => a + Number(x.total || 0),
        0
      ) +
    data.water
      .filter(
        (x) => getId(x.customer) === customerId
      )
      .reduce(
        (a, x) => a + Number(x.total || 0),
        0
      );

  const paid = data.payments
    .filter(
      (x) => getId(x.customer) === customerId
    )
    .reduce(
      (a, x) => a + Number(x.amount || 0),
      0
    );

  const balance = bill - paid;

  const deleteCustomer = async () => {
    if (!confirm("Delete customer and all records?")) {
      return;
    }

    try {
      await apiRequest(`/customers/${customerId}`, {
        method: "DELETE",
      });

      await refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="customerCard">
      <div className="avatar">
        {c.name?.[0]?.toUpperCase() || "C"}
      </div>

      <div className="customerMain">
        <h3>{c.name}</h3>

        <p>
          <Phone size={14} />
          {c.phone || "No phone"}
        </p>

        <p>
          <MapPin size={14} />
          {c.address || "No address"}
        </p>
      </div>

      <div className="customerBalance">
        <small>BAQAYA</small>

        <b
          className={
            balance > 0 ? "redText" : "greenText"
          }
        >
          {money(Math.max(0, balance))}
        </b>
      </div>

      <div className="cardActions">
        <button onClick={() => open(c)}>
          View Ledger
        </button>

        <button
          className="iconBtn"
          title="Delete"
          onClick={deleteCustomer}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   LEDGER
========================================================= */

function Ledger({
  customer: c,
  data,
  back,
}) {
  const customerId = getId(c);

  const milk = data.milk.filter(
    (x) => getId(x.customer) === customerId
  );

  const water = data.water.filter(
    (x) => getId(x.customer) === customerId
  );

  const pay = data.payments.filter(
    (x) => getId(x.customer) === customerId
  );

  const m = milk.reduce(
    (a, x) => a + Number(x.total || 0),
    0
  );

  const w = water.reduce(
    (a, x) => a + Number(x.total || 0),
    0
  );

  const p = pay.reduce(
    (a, x) => a + Number(x.amount || 0),
    0
  );

  return (
    <section>
      <button className="back" onClick={back}>
        ← Customers
      </button>

      <div className="ledgerTop">
        <div className="profile">
          <div className="avatar big">
            {c.name?.[0]?.toUpperCase() || "C"}
          </div>

          <div>
            <h2>{c.name}</h2>

            <p>
              {c.phone || "No phone"} ·{" "}
              {c.paymentCycle === "daily"
                ? "Daily"
                : c.paymentCycle === "15-days"
                ? "15 Days"
                : "30 Days"}
            </p>
          </div>
        </div>

        <div className="balanceBox">
          <span>Current Baqaya</span>
          <strong>{money(m + w - p)}</strong>
        </div>
      </div>

      <div className="stats miniStats">
        <Card
          icon={<Milk />}
          label="Milk Bill"
          value={money(m)}
          cls="cream"
        />

        <Card
          icon={<Sun />}
          label="Water Bill"
          value={money(w)}
          cls="yellow"
        />

        <Card
          icon={<Wallet />}
          label="Total Paid"
          value={money(p)}
          cls="green"
        />
      </div>

      <div className="panel">
        <h3>Complete Ledger</h3>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Details</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {[
                ...milk.map((x) => ({
                  date: x.date,
                  type: "Milk",
                  details: `${x.liters} L × ${money(
                    x.rate
                  )}`,
                  amount: Number(x.total || 0),
                })),

                ...water.map((x) => ({
                  date: x.date,
                  type: "Solar Water",
                  details: `${x.hours} hours × ${money(
                    x.rate
                  )}`,
                  amount: Number(x.total || 0),
                })),

                ...pay.map((x) => ({
                  date: x.date,
                  type: "Payment",
                  details: `${x.method}`,
                  amount: -Number(x.amount || 0),
                })),
              ]
                .sort(
                  (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
                )
                .map((x, i) => (
                  <tr key={i}>
                    <td>
                      {String(x.date).slice(0, 10)}
                    </td>

                    <td>
                      <span className="badge">
                        {x.type}
                      </span>
                    </td>

                    <td>{x.details}</td>

                    <td
                      className={
                        x.amount < 0
                          ? "greenText"
                          : ""
                      }
                    >
                      {money(Math.abs(x.amount))}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MILK
========================================================= */

function MilkPage({ data, refresh }) {
  const [f, setF] = useState({
    customer: data.customers[0]?._id || "",
    date: today(),
    liters: "",
    rate: data.customers[0]?.milkRate || 220,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!f.customer && data.customers.length) {
      const c = data.customers[0];

      setF((prev) => ({
        ...prev,
        customer: c._id,
        rate: c.milkRate || 220,
      }));
    }
  }, [data.customers]);

  const save = async () => {
    if (!f.customer || !f.liters) {
      alert("Customer and liters are required");
      return;
    }

    try {
      setSaving(true);

      await apiRequest("/milk", {
        method: "POST",
        body: JSON.stringify({
          customer: f.customer,
          date: f.date,
          liters: Number(f.liters),
          rate: Number(f.rate),
        }),
      });

      await refresh();

      setF((prev) => ({
        ...prev,
        liters: "",
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="grid2">
        <Form
          title="Add Milk Entry"
          onSave={save}
          saveText={
            saving ? "Saving..." : "Save Milk Entry"
          }
          disabled={saving || !data.customers.length}
        >
          {!data.customers.length ? (
            <p>
              Please add a customer first.
            </p>
          ) : (
            <>
              <SelectCustomer
                data={data}
                f={f}
                setF={setF}
                rateKey="milkRate"
              />

              <Field
                label="Date"
                type="date"
                value={f.date}
                onChange={(v) =>
                  setF({ ...f, date: v })
                }
              />

              <div className="two">
                <Field
                  label="Milk (Liters)"
                  type="number"
                  value={f.liters}
                  onChange={(v) =>
                    setF({ ...f, liters: v })
                  }
                />

                <Field
                  label="Rate / Liter"
                  type="number"
                  value={f.rate}
                  onChange={(v) =>
                    setF({ ...f, rate: v })
                  }
                />
              </div>

              {f.liters && (
                <div className="calc">
                  {money(
                    Number(f.liters) *
                      Number(f.rate)
                  )}
                </div>
              )}
            </>
          )}
        </Form>

        <Recent
          title="Recent Milk Entries"
          rows={data.milk}
          data={data}
          type="milk"
          refresh={refresh}
        />
      </div>
    </section>
  );
}

/* =========================================================
   WATER
========================================================= */

function WaterPage({ data, refresh }) {
  const [f, setF] = useState({
    customer: data.customers[0]?._id || "",
    date: today(),
    hours: "",
    rate: data.customers[0]?.waterRate || 100,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!f.customer && data.customers.length) {
      const c = data.customers[0];

      setF((prev) => ({
        ...prev,
        customer: c._id,
        rate: c.waterRate || 100,
      }));
    }
  }, [data.customers]);

  const save = async () => {
    if (!f.customer || !f.hours) {
      alert("Customer and water hours are required");
      return;
    }

    try {
      setSaving(true);

      await apiRequest("/water", {
        method: "POST",
        body: JSON.stringify({
          customer: f.customer,
          date: f.date,
          hours: Number(f.hours),
          rate: Number(f.rate),
        }),
      });

      await refresh();

      setF((prev) => ({
        ...prev,
        hours: "",
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="grid2">
        <Form
          title="Add Solar Water Entry"
          onSave={save}
          saveText={
            saving ? "Saving..." : "Save Water Entry"
          }
          disabled={saving || !data.customers.length}
        >
          {!data.customers.length ? (
            <p>Please add a customer first.</p>
          ) : (
            <>
              <SelectCustomer
                data={data}
                f={f}
                setF={setF}
                rateKey="waterRate"
              />

              <Field
                label="Date"
                type="date"
                value={f.date}
                onChange={(v) =>
                  setF({ ...f, date: v })
                }
              />

              <div className="two">
                <Field
                  label="Water Hours"
                  type="number"
                  value={f.hours}
                  onChange={(v) =>
                    setF({ ...f, hours: v })
                  }
                />

                <Field
                  label="Rate / Hour"
                  type="number"
                  value={f.rate}
                  onChange={(v) =>
                    setF({ ...f, rate: v })
                  }
                />
              </div>

              {f.hours && (
                <div className="calc waterCalc">
                  {money(
                    Number(f.hours) *
                      Number(f.rate)
                  )}
                </div>
              )}
            </>
          )}
        </Form>

        <Recent
          title="Recent Solar Water Entries"
          rows={data.water}
          data={data}
          type="water"
          refresh={refresh}
        />
      </div>
    </section>
  );
}

/* =========================================================
   CUSTOMER SELECT
========================================================= */

function SelectCustomer({
  data,
  f,
  setF,
  rateKey,
}) {
  return (
    <label>
      Customer

      <select
        value={f.customer}
        onChange={(e) => {
          const c = data.customers.find(
            (x) => x._id === e.target.value
          );

          setF({
            ...f,
            customer: e.target.value,
            rate: c?.[rateKey] || 0,
          });
        }}
      >
        {data.customers.map((c) => (
          <option
            key={c._id}
            value={c._id}
          >
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}

/* =========================================================
   RECENT ENTRIES
========================================================= */

function Recent({
  title,
  rows,
  data,
  type,
  refresh,
}) {
  const deleteEntry = async (id) => {
    if (!confirm("Delete this entry?")) return;

    try {
      await apiRequest(`/${type}/${id}`, {
        method: "DELETE",
      });

      await refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const sortedRows = [...rows]
    .sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    )
    .slice(0, 20);

  return (
    <div className="panel">
      <h3>{title}</h3>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Details</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((x) => {
              const customer =
                typeof x.customer === "object"
                  ? x.customer
                  : data.customers.find(
                      (c) =>
                        c._id === x.customer
                    );

              return (
                <tr key={x._id}>
                  <td>
                    {String(x.date).slice(0, 10)}
                  </td>

                  <td>
                    {customer?.name || "—"}
                  </td>

                  <td>
                    {type === "milk"
                      ? `${x.liters} L × ${money(
                          x.rate
                        )}`
                      : `${x.hours} hours × ${money(
                          x.rate
                        )}`}
                  </td>

                  <td>
                    <b>{money(x.total)}</b>
                  </td>

                  <td>
                    <button
                      className="iconBtn"
                      onClick={() =>
                        deleteEntry(x._id)
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {!sortedRows.length && (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   PAYMENTS
========================================================= */

function Payments({ data, refresh }) {
  const [f, setF] = useState({
    customer: data.customers[0]?._id || "",
    date: today(),
    amount: "",
    type: "general",
    method: "cash",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!f.customer && data.customers.length) {
      setF((prev) => ({
        ...prev,
        customer: data.customers[0]._id,
      }));
    }
  }, [data.customers]);

  const save = async () => {
    if (!f.customer || !f.amount) {
      alert("Customer and amount are required");
      return;
    }

    try {
      setSaving(true);

      await apiRequest("/payments", {
        method: "POST",
        body: JSON.stringify({
          customer: f.customer,
          date: f.date,
          amount: Number(f.amount),
          type: f.type,
          method: f.method,
        }),
      });

      await refresh();

      setF((prev) => ({
        ...prev,
        amount: "",
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deletePayment = async (id) => {
    if (!confirm("Delete this payment?")) return;

    try {
      await apiRequest(`/payments/${id}`, {
        method: "DELETE",
      });

      await refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section>
      <div className="grid2">
        <Form
          title="Record Payment"
          onSave={save}
          saveText={
            saving ? "Saving..." : "Save Payment"
          }
          disabled={saving || !data.customers.length}
        >
          {!data.customers.length ? (
            <p>Please add a customer first.</p>
          ) : (
            <>
              <SelectCustomer
                data={data}
                f={f}
                setF={setF}
              />

              <Field
                label="Date"
                type="date"
                value={f.date}
                onChange={(v) =>
                  setF({ ...f, date: v })
                }
              />

              <Field
                label="Amount (PKR)"
                type="number"
                value={f.amount}
                onChange={(v) =>
                  setF({ ...f, amount: v })
                }
              />

              <div className="two">
                <label>
                  For

                  <select
                    value={f.type}
                    onChange={(e) =>
                      setF({
                        ...f,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="general">
                      general
                    </option>
                    <option value="milk">
                      milk
                    </option>
                    <option value="water">
                      water
                    </option>
                  </select>
                </label>

                <label>
                  Method

                  <select
                    value={f.method}
                    onChange={(e) =>
                      setF({
                        ...f,
                        method: e.target.value,
                      })
                    }
                  >
                    <option value="cash">
                      cash
                    </option>
                    <option value="bank">
                      bank
                    </option>
                    <option value="other">
                      other
                    </option>
                  </select>
                </label>
              </div>
            </>
          )}
        </Form>

        <div className="panel">
          <h3>Payment History</h3>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {[...data.payments]
                  .sort(
                    (a, b) =>
                      new Date(b.date) -
                      new Date(a.date)
                  )
                  .slice(0, 30)
                  .map((x) => {
                    const customer =
                      typeof x.customer ===
                      "object"
                        ? x.customer
                        : data.customers.find(
                            (c) =>
                              c._id === x.customer
                          );

                    return (
                      <tr key={x._id}>
                        <td>
                          {String(
                            x.date
                          ).slice(0, 10)}
                        </td>

                        <td>
                          {customer?.name ||
                            "—"}
                        </td>

                        <td>{x.type}</td>

                        <td>{x.method}</td>

                        <td className="greenText">
                          <b>
                            {money(x.amount)}
                          </b>
                        </td>

                        <td>
                          <button
                            className="iconBtn"
                            onClick={() =>
                              deletePayment(
                                x._id
                              )
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                {!data.payments.length && (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                      }}
                    >
                      No payments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FORM COMPONENTS
========================================================= */

function Field({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <label>
      {label}

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </label>
  );
}

function Form({
  title,
  children,
  onSave,
  onClose,
  saveText = "Save",
  disabled = false,
}) {
  return (
    <div className="panel formPanel">
      <div className="panelHead">
        <h3>{title}</h3>

        {onClose && (
          <button
            className="iconBtn"
            onClick={onClose}
          >
            <X />
          </button>
        )}
      </div>

      <div className="form">
        {children}

        <button
          className="primary full"
          onClick={onSave}
          disabled={disabled}
          style={
            disabled
              ? {
                  opacity: 0.6,
                  cursor: "not-allowed",
                }
              : undefined
          }
        >
          <Plus /> {saveText}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   RENDER
========================================================= */

createRoot(document.getElementById("root")).render(
  <App />
);