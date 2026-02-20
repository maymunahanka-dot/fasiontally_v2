import { useState, useEffect, useContext } from "react";
import { X, Plus, Calendar } from "lucide-react";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import NewAuthContext from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import Button from "../../components/button/Button";
import Input from "../../components/Input/Input";
import "./CreateInvoicePanel.css";

const CreateInvoicePanel = ({ onClose, selectedInvoice, isEditMode }) => {
  // Form state
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [status, setStatus] = useState("Unpaid");
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(7);
  const [items, setItems] = useState([
    {
      id: Date.now(),
      itemType: "Service",
      category: "Labor",
      description: "",
      quantity: 1,
      price: 0,
      inventoryItemId: "",
      inventoryItemName: "",
    },
  ]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  const { user } = useContext(NewAuthContext);

  // Load clients and inventory when component mounts
  useEffect(() => {
    if (user?.email) {
      loadClients();
      loadInventoryItems();
    }
  }, [user?.email]);

  // Populate form when editing or when client data is provided
  useEffect(() => {
    if (isEditMode && selectedInvoice) {
      // Edit mode - populate all invoice data
      setClientName(selectedInvoice.clientName || "");
      setEmail(selectedInvoice.clientEmail || "");
      setPhone(selectedInvoice.clientPhone || "");
      setAddress(selectedInvoice.clientAddress || "");
      setInvoiceDate(
        selectedInvoice.createdDate
          ? selectedInvoice.createdDate.toISOString().split("T")[0]
          : ""
      );
      setDueDate(
        selectedInvoice.dueDate
          ? selectedInvoice.dueDate.toISOString().split("T")[0]
          : ""
      );
      setNotes(selectedInvoice.notes || "");
      setPaymentMethod(selectedInvoice.paymentMethod || "Cash");
      setStatus(selectedInvoice.status || "Unpaid");
      setDiscount(selectedInvoice.discount || 0);
      setTaxRate(selectedInvoice.taxRate || 7);
      setItems(
        selectedInvoice.items?.map((item, index) => ({
          ...item,
          id: item.id || Date.now() + index,
        })) || [
          {
            id: Date.now(),
            itemType: "Service",
            category: "Labor",
            description: "",
            quantity: 1,
            price: 0,
            inventoryItemId: "",
            inventoryItemName: "",
          },
        ]
      );
    } else if (!isEditMode && selectedInvoice) {
      // New invoice with pre-filled client data
      setClientName(selectedInvoice.clientName || "");
      setEmail(selectedInvoice.clientEmail || "");
      setPhone(selectedInvoice.clientPhone || "");
      setAddress(selectedInvoice.clientAddress || "");

      // Set default dates for new invoice
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setInvoiceDate(today);
      setDueDate(nextWeek);
    } else {
      // Reset form for completely new invoice
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setInvoiceDate(today);
      setDueDate(nextWeek);
    }
  }, [isEditMode, selectedInvoice]);

  const loadClients = async () => {
    try {
      console.log(
        "🔄 CreateInvoicePanel: Loading clients for user:",
        user?.email
      );
      // Get effective email (main admin's email for team members)
      const effectiveEmail = getEffectiveUserEmail(user);
      console.log(
        "📧 CreateInvoicePanel: Using effective email:",
        effectiveEmail
      );

      const q = query(
        collection(db, "fashiontally_clients"),
        where("userEmail", "==", effectiveEmail),
        orderBy("name", "asc")
      );
      const snapshot = await getDocs(q);
      const clientsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(
        "✅ CreateInvoicePanel: Loaded clients:",
        clientsData.length,
        clientsData
      );
      setClients(clientsData);
    } catch (error) {
      console.error("❌ CreateInvoicePanel: Error loading clients:", error);
    }
  };

  const loadInventoryItems = async () => {
    try {
      // Get effective email (main admin's email for team members)
      const effectiveEmail = getEffectiveUserEmail(user);

      const q = query(
        collection(db, "fashiontally_inventory"),
        where("userEmail", "==", effectiveEmail)
      );
      const snapshot = await getDocs(q);
      const inventoryData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInventoryItems(inventoryData);
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
  };

  // Generate auto-incrementing invoice number
  const generateInvoiceNumber = async () => {
    try {
      // Get effective email (main admin's email for team members)
      const effectiveEmail = getEffectiveUserEmail(user);

      const q = query(
        collection(db, "fashiontally_invoices"),
        where("userEmail", "==", effectiveEmail),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return "INV-2024-001";
      }

      const lastInvoice = snapshot.docs[0].data();
      const lastNumber = lastInvoice.invoiceNumber;

      // Extract number from format INV-YYYY-NNN
      const match = lastNumber.match(/INV-(\d{4})-(\d{3})/);
      if (match) {
        const year = new Date().getFullYear();
        const lastYear = parseInt(match[1]);
        const lastSeq = parseInt(match[2]);

        if (year === lastYear) {
          // Same year, increment sequence
          const newSeq = (lastSeq + 1).toString().padStart(3, "0");
          return `INV-${year}-${newSeq}`;
        } else {
          // New year, reset sequence
          return `INV-${year}-001`;
        }
      }

      // Fallback if format doesn't match
      return `INV-${new Date().getFullYear()}-001`;
    } catch (error) {
      console.error("Error generating invoice number:", error);
      return `INV-${new Date().getFullYear()}-001`;
    }
  };

  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleClientSelection = (clientId) => {
    const selectedClient = clients.find((c) => c.id === clientId);
    if (selectedClient) {
      setSelectedClientId(clientId);
      setClientName(selectedClient.name);
      setEmail(selectedClient.email);
      setPhone(selectedClient.phone);
      setAddress(selectedClient.address || "");
    }
  };

  const handleInventoryItemSelection = (inventoryItemId, itemIndex) => {
    const selectedItem = inventoryItems.find(
      (item) => item.id === inventoryItemId
    );
    if (selectedItem) {
      const updatedItems = items.map((item, i) =>
        i === itemIndex
          ? {
              ...item,
              inventoryItemId: inventoryItemId,
              inventoryItemName: selectedItem.name,
              description: selectedItem.name,
              price: selectedItem.price || 0,
              category: selectedItem.category,
              // Reset quantity to 1 when selecting new item
              quantity: 1,
            }
          : item
      );
      setItems(updatedItems);
    }
  };

  const getInventoryItemStock = (inventoryItemId) => {
    const item = inventoryItems.find((item) => item.id === inventoryItemId);
    return item ? item.quantity : 0;
  };

  const addItem = () => {
    setItems([
      {
        id: Date.now() + Math.random(),
        itemType: "Service",
        category: "Labor",
        description: "",
        quantity: 1,
        price: 0,
        inventoryItemId: "",
        inventoryItemName: "",
      },
      ...items,
    ]);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTaxAmount = () => {
    const discountedSubtotal = calculateSubtotal() - calculateDiscountAmount();
    return (discountedSubtotal * taxRate) / 100;
  };

  const calculateTotal = () => {
    return (
      calculateSubtotal() - calculateDiscountAmount() + calculateTaxAmount()
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!dueDate.trim()) {
      newErrors.dueDate = "Due date is required";
    }

    if (items.some((item) => !item.description.trim())) {
      newErrors.items = "All items must have a description";
    }

    // Validate inventory availability for items
    for (const item of items) {
      if (item.itemType === "Item" && item.inventoryItemId) {
        const availableStock = getInventoryItemStock(item.inventoryItemId);
        if (item.quantity > availableStock) {
          newErrors.items = `Insufficient stock for ${item.inventoryItemName}. Available: ${availableStock}, Required: ${item.quantity}`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user?.email) {
      setErrors({ submit: "You must be logged in to create invoices" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const subtotal = calculateSubtotal();
      const discountAmount = calculateDiscountAmount();
      const taxAmount = calculateTaxAmount();
      const total = calculateTotal();

      const invoiceData = {
        invoiceNumber: isEditMode
          ? selectedInvoice.invoiceNumber
          : await generateInvoiceNumber(),
        clientName: clientName.trim(),
        clientEmail: email.trim(),
        clientPhone: phone.trim(),
        clientAddress: address.trim(),
        status,
        paymentMethod,
        createdDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: new Date(dueDate),
        items: items.map((item) => ({
          itemType: item.itemType,
          category: item.category,
          description: item.description.trim(),
          quantity: item.quantity,
          price: item.price,
          inventoryItemId: item.inventoryItemId || null,
          inventoryItemName: item.inventoryItemName || null,
        })),
        discount,
        taxRate,
        subtotal,
        discountAmount,
        taxAmount,
        amount: total,
        notes: notes.trim(),
        userEmail: getEffectiveUserEmail(user),
        createdAt: selectedInvoice?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      let invoiceId;

      if (isEditMode && selectedInvoice?.id) {
        // Update existing invoice
        await updateDoc(
          doc(db, "fashiontally_invoices", selectedInvoice.id),
          invoiceData
        );
        invoiceId = selectedInvoice.id;
        console.log("Invoice updated successfully");
      } else {
        // Create new invoice
        const docRef = await addDoc(
          collection(db, "fashiontally_invoices"),
          invoiceData
        );
        invoiceId = docRef.id;
        console.log("Invoice created successfully");

        // Update inventory for items (only for new invoices)
        for (const item of items) {
          if (item.itemType === "Item" && item.inventoryItemId) {
            const inventoryRef = doc(
              db,
              "fashiontally_inventory",
              item.inventoryItemId
            );
            const currentItem = inventoryItems.find(
              (inv) => inv.id === item.inventoryItemId
            );

            if (currentItem) {
              const newQuantity = currentItem.quantity - item.quantity;
              const newStatus =
                newQuantity <= 0
                  ? "Out of Stock"
                  : newQuantity <= 3
                  ? "Low Stock"
                  : "In Stock";

              await updateDoc(inventoryRef, {
                quantity: newQuantity,
                status: newStatus,
                lastUsedInInvoice: {
                  invoiceId: invoiceId,
                  invoiceNumber: invoiceData.invoiceNumber,
                  quantityUsed: item.quantity,
                  date: new Date(),
                },
                updatedAt: new Date(),
              });
            }
          }
        }
      }

      // Reset form and close
      setClientName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setInvoiceDate("");
      setDueDate("");
      setNotes("");
      setItems([
        {
          id: Date.now(),
          itemType: "Service",
          category: "Labor",
          description: "",
          quantity: 1,
          price: 0,
          inventoryItemId: "",
          inventoryItemName: "",
        },
      ]);
      setDiscount(0);
      setTaxRate(7);
      setStatus("Unpaid");
      setPaymentMethod("Cash");

      onClose();
    } catch (error) {
      console.error("Error saving invoice:", error);
      setErrors({ submit: "Failed to save invoice. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="create_invoice_panel">
      {/* Header */}
      <div className="create_invoice_header">
        <button className="create_invoice_close_btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="create_invoice_title">
          {isEditMode ? "Edit Invoice" : "Create Invoice"}
        </h2>
      </div>

      {/* Form */}
      <form className="create_invoice_form" onSubmit={handleSubmit}>
        {/* Client Details Section */}
        <div className="create_invoice_section">
          <h3 className="create_invoice_section_title">Client Details</h3>

          <div className="create_invoice_form_group">
            <Input
              label="Select Existing Client"
              type="select"
              placeholder="Choose a client or enter manually"
              value={selectedClientId}
              onChange={(e) => handleClientSelection(e.target.value)}
              variant="rounded"
              options={[
                { value: "", label: "Choose a client or enter manually" },
                ...clients.map((client) => ({
                  value: client.id,
                  label: `${client.name} - ${client.phone}`,
                })),
              ]}
            />
          </div>

          <div className="create_invoice_form_group">
            <Input
              label="Client Name *"
              type="text"
              placeholder="Client Name"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                clearError("clientName");
              }}
              error={errors.clientName}
              required
              variant="rounded"
            />
          </div>

          <div className="create_invoice_form_group">
            <Input
              label="Email Address *"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError("email");
              }}
              error={errors.email}
              required
              variant="rounded"
            />
          </div>

          <div className="create_invoice_form_group">
            <Input
              label="Phone Number"
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              variant="rounded"
            />
          </div>

          <div className="create_invoice_form_group">
            <Input
              label="Address"
              type="textarea"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              variant="rounded"
              rows={3}
            />
          </div>
        </div>

        {/* Date Section */}
        <div className="create_invoice_date_section">
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label="Invoice Date"
              type="date"
              placeholder="DD/MM/YYYY"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              variant="rounded"
            />
          </div>
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label="Due Date *"
              type="date"
              placeholder="DD/MM/YYYY"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                clearError("dueDate");
              }}
              error={errors.dueDate}
              required
              variant="rounded"
            />
          </div>
        </div>

        {/* Payment & Status Section */}
        <div className="create_invoice_date_section">
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label="Payment Method"
              type="select"
              placeholder="Select payment method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              variant="rounded"
              options={[
                { value: "Cash", label: "Cash" },
                { value: "Bank Transfer", label: "Bank Transfer" },
                { value: "Credit Card", label: "Credit Card" },
                { value: "Mobile Money", label: "Mobile Money" },
                { value: "Cheque", label: "Cheque" },
              ]}
            />
          </div>
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label="Status"
              type="select"
              placeholder="Select status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              variant="rounded"
              options={[
                { value: "Unpaid", label: "Unpaid" },
                { value: "Paid", label: "Paid" },
                { value: "Partially Paid", label: "Partially Paid" },
              ]}
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="create_invoice_section">
          <div className="create_invoice_items_header">
            <h3 className="create_invoice_section_title">Items</h3>
            <button
              type="button"
              className="create_invoice_add_item_btn"
              onClick={addItem}
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className="create_invoice_item">
              {/* Item Type Selection */}
              <div className="create_invoice_form_group">
                <Input
                  label="Item Type"
                  type="select"
                  placeholder="Select item type"
                  value={item.itemType}
                  onChange={(e) => {
                    const newItemType = e.target.value;
                    const updatedItems = items.map((currentItem, i) => {
                      if (i === index) {
                        if (newItemType === "Service") {
                          return {
                            ...currentItem,
                            itemType: newItemType,
                            category: "Labor",
                            inventoryItemId: "",
                            inventoryItemName: "",
                            description: "",
                            price: 0,
                          };
                        } else {
                          return {
                            ...currentItem,
                            itemType: newItemType,
                            category: "Item",
                            inventoryItemId: "",
                            inventoryItemName: "",
                            description: "",
                            price: 0,
                            quantity: 1,
                          };
                        }
                      }
                      return currentItem;
                    });
                    setItems(updatedItems);
                  }}
                  variant="rounded"
                  options={[
                    { value: "Service", label: "Service" },
                    { value: "Item", label: "Inventory Item" },
                  ]}
                />
              </div>

              {/* Service Type or Inventory Item Selection */}
              {item.itemType === "Service" ? (
                <div className="create_invoice_form_group">
                  <Input
                    label="Service Type"
                    type="select"
                    placeholder="Select service type"
                    value={item.category}
                    onChange={(e) =>
                      updateItem(index, "category", e.target.value)
                    }
                    variant="rounded"
                    options={[
                      { value: "Labor", label: "Labor" },
                      { value: "Design Work", label: "Design Work" },
                      { value: "Alterations", label: "Alterations" },
                    ]}
                  />
                </div>
              ) : (
                <div className="create_invoice_form_group">
                  <Input
                    label="Select Inventory Item"
                    type="select"
                    placeholder="Choose inventory item"
                    value={item.inventoryItemId}
                    onChange={(e) =>
                      handleInventoryItemSelection(e.target.value, index)
                    }
                    variant="rounded"
                    options={[
                      { value: "", label: "Choose inventory item" },
                      ...inventoryItems.map((invItem) => ({
                        value: invItem.id,
                        label: `${invItem.name} - ${invItem.category} - ${invItem.sku} (Stock: ${invItem.quantity})`,
                      })),
                    ]}
                  />
                  {/* Stock Information Display */}
                  {item.inventoryItemId && (
                    <div className="create_invoice_stock_info">
                      <p className="create_invoice_stock_text">
                        📦 Available Stock:{" "}
                        {getInventoryItemStock(item.inventoryItemId)} units
                        {item.inventoryItemName &&
                          ` - ${item.inventoryItemName}`}
                      </p>
                      {getInventoryItemStock(item.inventoryItemId) <= 3 && (
                        <p className="create_invoice_stock_warning">
                          ⚠️ Low stock warning!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="create_invoice_form_group">
                <Input
                  label="Description"
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  variant="rounded"
                />
              </div>

              <div className="create_invoice_item_row">
                <div className="create_invoice_form_group create_invoice_form_group_third">
                  <Input
                    label="Quantity"
                    type="number"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 1
                      )
                    }
                    variant="rounded"
                    min="1"
                    max={
                      item.itemType === "Item" && item.inventoryItemId
                        ? getInventoryItemStock(item.inventoryItemId)
                        : undefined
                    }
                  />
                  {item.itemType === "Item" && item.inventoryItemId && (
                    <p className="create_invoice_quantity_helper">
                      Max available:{" "}
                      {getInventoryItemStock(item.inventoryItemId)}
                    </p>
                  )}
                </div>
                <div className="create_invoice_form_group create_invoice_form_group_third">
                  <Input
                    label="Price"
                    type="number"
                    placeholder="₦0"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    variant="rounded"
                    min="0"
                  />
                </div>
                <div className="create_invoice_form_group create_invoice_form_group_third">
                  <label className="create_invoice_item_total_label">
                    Total
                  </label>
                  <div className="create_invoice_item_total">
                    {formatCurrency(item.quantity * item.price)}
                  </div>
                </div>
              </div>

              {items.length > 1 && (
                <button
                  type="button"
                  className="create_invoice_remove_item_btn"
                  onClick={() => removeItem(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {errors.items && (
            <span className="create_invoice_error_message">{errors.items}</span>
          )}
        </div>

        {/* Discount & Tax Section */}
        <div className="create_invoice_date_section">
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label="Discount (%)"
              type="number"
              placeholder="0"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              variant="rounded"
              min="0"
              max="100"
            />
          </div>
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label="Tax Rate (%)"
              type="number"
              placeholder="7"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              variant="rounded"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Notes Section */}
        <div className="create_invoice_section">
          <div className="create_invoice_form_group">
            <Input
              label="Notes (Optional)"
              type="textarea"
              placeholder="Add payment terms, delivery notes, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="rounded"
              rows={4}
            />
          </div>
        </div>

        {/* Summary Section */}
        <div className="create_invoice_summary">
          <div className="create_invoice_summary_row">
            <span className="create_invoice_summary_label">Subtotal</span>
            <span className="create_invoice_summary_value">
              {formatCurrency(calculateSubtotal())}
            </span>
          </div>
          {discount > 0 && (
            <div className="create_invoice_summary_row">
              <span className="create_invoice_summary_label">
                Discount ({discount}%)
              </span>
              <span className="create_invoice_summary_value">
                -{formatCurrency(calculateDiscountAmount())}
              </span>
            </div>
          )}
          <div className="create_invoice_summary_row">
            <span className="create_invoice_summary_label">
              Tax ({taxRate}%)
            </span>
            <span className="create_invoice_summary_value">
              {formatCurrency(calculateTaxAmount())}
            </span>
          </div>
          <div className="create_invoice_summary_row create_invoice_summary_total">
            <span className="create_invoice_summary_label">Total</span>
            <span className="create_invoice_summary_value create_invoice_total_amount">
              {formatCurrency(calculateTotal())}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="create_invoice_error">
            <p>{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          className="create_invoice_submit_btn"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update Invoice"
            : "Create Invoice"}
        </Button>
      </form>
    </div>
  );
};

export default CreateInvoicePanel;
