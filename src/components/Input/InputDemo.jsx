import React, { useState } from "react";
import Input from "./Input";

const InputDemo = () => {
  const [formData, setFormData] = useState({
    text: "",
    email: "",
    password: "",
    number: "",
    textarea: "",
    select: "",
    checkbox: false,
    switch: false,
    date: "",
    time: "",
    datetime: "",
    image: null,
  });

  const [errors, setErrors] = useState({});

  const selectOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox"
        ? e.target.checked
        : e.target.type === "file"
        ? e.target.files[0]
        : e.target.value;
    setFormData({ ...formData, [field]: value });
  };

  const toggleError = (field) => {
    setErrors((prev) => ({
      ...prev,
      [field]: prev[field] ? "" : "This is an error message",
    }));
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "2rem" }}>
      <h1>Input Component Demo</h1>

      <div style={{ display: "grid", gap: "2rem" }}>
        <div>
          <h3>Text Input</h3>
          <Input
            type="text"
            label="Text Input"
            value={formData.text}
            onChange={handleChange("text")}
            placeholder="Enter some text"
            active={!!formData.text}
            error={errors.text}
          />
          <button onClick={() => toggleError("text")}>Toggle Error</button>
        </div>

        <div>
          <h3>Email Input</h3>
          <Input
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange("email")}
            placeholder="Enter your email"
            required
            active={!!formData.email}
            error={errors.email}
          />
          <button onClick={() => toggleError("email")}>Toggle Error</button>
        </div>

        <div>
          <h3>Password Input with Toggle</h3>
          <Input
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange("password")}
            placeholder="Enter password"
            active={!!formData.password}
            error={errors.password}
            showPasswordToggle={true}
          />
          <button onClick={() => toggleError("password")}>Toggle Error</button>
          <p>Try clicking the eye icon to show/hide password</p>
        </div>

        <div>
          <h3>Password without Toggle</h3>
          <Input
            type="password"
            label="Password (No Toggle)"
            value={formData.password}
            onChange={handleChange("password")}
            placeholder="Enter password"
            active={!!formData.password}
            showPasswordToggle={false}
          />
          <p>This password field has the toggle disabled</p>
        </div>

        <div>
          <h3>Number Input (Max: 100)</h3>
          <Input
            type="number"
            label="Number"
            value={formData.number}
            onChange={handleChange("number")}
            placeholder="Enter a number"
            maxNumber={100}
            active={!!formData.number}
            error={errors.number}
          />
          <button onClick={() => toggleError("number")}>Toggle Error</button>
        </div>

        <div>
          <h3>Textarea</h3>
          <Input
            type="textarea"
            label="Message"
            value={formData.textarea}
            onChange={handleChange("textarea")}
            placeholder="Enter your message"
            active={!!formData.textarea}
            error={errors.textarea}
          />
          <button onClick={() => toggleError("textarea")}>Toggle Error</button>
        </div>

        <div>
          <h3>Select Dropdown</h3>
          <Input
            type="select"
            label="Choose Option"
            value={formData.select}
            onChange={handleChange("select")}
            options={selectOptions}
            placeholder="Select an option"
            active={!!formData.select}
            error={errors.select}
          />
          <button onClick={() => toggleError("select")}>Toggle Error</button>
        </div>

        <div>
          <h3>Checkbox</h3>
          <Input
            type="checkbox"
            label="I agree to the terms and conditions"
            checked={formData.checkbox}
            onChange={handleChange("checkbox")}
            active={formData.checkbox}
            error={errors.checkbox}
          />
          <button onClick={() => toggleError("checkbox")}>Toggle Error</button>
        </div>

        <div>
          <h3>Switch</h3>
          <Input
            type="switch"
            label="Enable notifications"
            checked={formData.switch}
            onChange={handleChange("switch")}
            active={formData.switch}
            error={errors.switch}
          />
          <button onClick={() => toggleError("switch")}>Toggle Error</button>
        </div>

        <div>
          <h3>Date Input</h3>
          <Input
            type="date"
            label="Select Date"
            value={formData.date}
            onChange={handleChange("date")}
            active={!!formData.date}
            error={errors.date}
          />
          <button onClick={() => toggleError("date")}>Toggle Error</button>
        </div>

        <div>
          <h3>Time Input</h3>
          <Input
            type="time"
            label="Select Time"
            value={formData.time}
            onChange={handleChange("time")}
            active={!!formData.time}
            error={errors.time}
          />
          <button onClick={() => toggleError("time")}>Toggle Error</button>
        </div>

        <div>
          <h3>DateTime Input</h3>
          <Input
            type="datetime-local"
            label="Select Date & Time"
            value={formData.datetime}
            onChange={handleChange("datetime")}
            active={!!formData.datetime}
            error={errors.datetime}
          />
          <button onClick={() => toggleError("datetime")}>Toggle Error</button>
        </div>

        <div>
          <h3>Image Upload (Drag & Drop)</h3>
          <Input
            type="image"
            label="Upload Image"
            onChange={handleChange("image")}
            accept="image/*"
            active={!!formData.image}
            error={errors.image}
          />
          <button onClick={() => toggleError("image")}>Toggle Error</button>
          {formData.image && <p>Selected: {formData.image.name}</p>}
        </div>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h3>Form Data:</h3>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default InputDemo;
