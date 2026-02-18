import React, { useState } from "react";
import Button from "./Button";

const ButtonDemo = () => {
  const [loading, setLoading] = useState({});
  const [active, setActive] = useState({});

  const toggleLoading = (key) => {
    setLoading((prev) => ({ ...prev, [key]: !prev[key] }));
    // Auto stop loading after 3 seconds
    if (!loading[key]) {
      setTimeout(() => {
        setLoading((prev) => ({ ...prev, [key]: false }));
      }, 3000);
    }
  };

  const toggleActive = (key) => {
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "2rem" }}>
      <h1>Button Component Demo</h1>

      <div style={{ display: "grid", gap: "3rem" }}>
        {/* Button Variants */}
        <section>
          <h2>Button Variants</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        {/* Button Sizes */}
        <section>
          <h2>Button Sizes</h2>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Button size="small">Small</Button>
            <Button size="medium">Medium</Button>
            <Button size="large">Large</Button>
            <Button size="extra-large">Extra Large</Button>
          </div>
        </section>

        {/* Button States */}
        <section>
          <h2>Button States</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Button>Normal</Button>
            <Button
              active={active.state1}
              onClick={() => toggleActive("state1")}
            >
              {active.state1 ? "Active" : "Click for Active"}
            </Button>
            <Button
              loading={loading.state1}
              onClick={() => toggleLoading("state1")}
            >
              {loading.state1 ? "Loading..." : "Click for Loading"}
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        {/* Buttons with Icons */}
        <section>
          <h2>Buttons with Icons</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Button icon="plus">Add Item</Button>
            <Button icon="download" variant="success">
              Download
            </Button>
            <Button icon="edit" variant="outline">
              Edit
            </Button>
            <Button icon="delete" variant="danger">
              Delete
            </Button>
            <Button icon="search" iconPosition="right">
              Search
            </Button>
            <Button icon="check" variant="success" iconPosition="right">
              Complete
            </Button>
          </div>
        </section>

        {/* Icon Only Buttons */}
        <section>
          <h2>Icon Only Buttons</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Button icon="plus" variant="primary" />
            <Button icon="edit" variant="outline" />
            <Button icon="delete" variant="danger" />
            <Button icon="search" variant="ghost" />
          </div>
        </section>

        {/* Loading States */}
        <section>
          <h2>Loading States</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Button
              loading={loading.load1}
              onClick={() => toggleLoading("load1")}
              variant="primary"
            >
              Primary Loading
            </Button>
            <Button
              loading={loading.load2}
              onClick={() => toggleLoading("load2")}
              variant="success"
              icon="check"
            >
              Success Loading
            </Button>
            <Button
              loading={loading.load3}
              onClick={() => toggleLoading("load3")}
              variant="outline"
            >
              Outline Loading
            </Button>
          </div>
        </section>

        {/* Full Width Buttons */}
        <section>
          <h2>Full Width Buttons</h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            <Button fullWidth variant="primary">
              Full Width Primary
            </Button>
            <Button fullWidth variant="outline" icon="arrow">
              Full Width with Icon
            </Button>
            <Button
              fullWidth
              variant="success"
              loading={loading.fullWidth}
              onClick={() => toggleLoading("fullWidth")}
            >
              Full Width Loading
            </Button>
          </div>
        </section>

        {/* Interactive Examples */}
        <section>
          <h2>Interactive Examples</h2>
          <div style={{ display: "grid", gap: "2rem" }}>
            <div>
              <h3>Form Buttons</h3>
              <div style={{ display: "flex", gap: "1rem" }}>
                <Button type="submit" variant="primary">
                  Submit
                </Button>
                <Button type="reset" variant="secondary">
                  Reset
                </Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </div>

            <div>
              <h3>Action Buttons</h3>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Button
                  variant="success"
                  icon="plus"
                  onClick={() => alert("Create new item")}
                >
                  Create New
                </Button>
                <Button
                  variant="info"
                  icon="upload"
                  loading={loading.upload}
                  onClick={() => toggleLoading("upload")}
                >
                  Upload File
                </Button>
                <Button
                  variant="warning"
                  icon="edit"
                  active={active.edit}
                  onClick={() => toggleActive("edit")}
                >
                  {active.edit ? "Editing..." : "Edit Mode"}
                </Button>
                <Button
                  variant="danger"
                  icon="delete"
                  onClick={() => confirm("Are you sure you want to delete?")}
                >
                  Delete All
                </Button>
              </div>
            </div>

            <div>
              <h3>Floating Action Button Style</h3>
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <Button
                  className="btn-fab"
                  variant="primary"
                  icon="plus"
                  onClick={() => alert("FAB clicked!")}
                />
                <Button
                  className="btn-fab"
                  variant="success"
                  icon="check"
                  size="large"
                />
                <Button
                  className="btn-fab"
                  variant="danger"
                  icon="delete"
                  size="small"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Button Group Example */}
        <section>
          <h2>Button Groups</h2>
          <div className="btn-group">
            <Button variant="outline">Left</Button>
            <Button
              variant="outline"
              active={active.middle}
              onClick={() => toggleActive("middle")}
            >
              {active.middle ? "Active" : "Middle"}
            </Button>
            <Button variant="outline">Right</Button>
          </div>
        </section>
      </div>

      <div
        style={{
          marginTop: "3rem",
          padding: "1rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h3>Button States:</h3>
        <pre>{JSON.stringify({ loading, active }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ButtonDemo;
