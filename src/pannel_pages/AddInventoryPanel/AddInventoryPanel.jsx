import { useState, useEffect, useContext } from "react";
import { X } from "lucide-react";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import NewAuthContext from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import Input from "../../components/Input/Input";
import Button from "../../components/button/Button";
import "./AddInventoryPanel.css";

const AddInventoryPanel = ({ onClose, selectedItem, isEditMode }) => {
  // Individual useState for each input field
  const [itemName, setItemName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [minStockAlert, setMinStockAlert] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useContext(NewAuthContext);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && selectedItem) {
      setItemName(selectedItem.name || "");
      setSku(selectedItem.sku || selectedItem.code || "");
      setCategory(selectedItem.category || "");
      setSubcategory(selectedItem.subcategory || "");
      setSupplier(selectedItem.supplierName || selectedItem.supplier || "");
      setQuantity(selectedItem.quantity?.toString() || "");
      setUnit(selectedItem.unit || "");
      setPricePerUnit(
        selectedItem.price?.toString() ||
          selectedItem.pricePerUnit?.toString() ||
          ""
      );
      setMinStockAlert(
        selectedItem.reorderPoint?.toString() ||
          selectedItem.minStock?.toString() ||
          ""
      );
      setColor(selectedItem.color || "");
      setDescription(selectedItem.description || "");
    } else {
      // Reset form for new item
      setItemName("");
      setSku("");
      setCategory("");
      setSubcategory("");
      setSupplier("");
      setQuantity("");
      setUnit("");
      setPricePerUnit("");
      setMinStockAlert("");
      setColor("");
      setDescription("");
    }
  }, [isEditMode, selectedItem]);

  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!itemName.trim()) {
      newErrors.itemName = "Item name is required";
    }

    if (!sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (!category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!supplier.trim()) {
      newErrors.supplier = "Supplier is required";
    }

    if (!quantity.trim()) {
      newErrors.quantity = "Quantity is required";
    } else if (isNaN(quantity) || parseFloat(quantity) < 0) {
      newErrors.quantity = "Quantity must be a valid number";
    }

    if (!unit.trim()) {
      newErrors.unit = "Unit is required";
    }

    if (!pricePerUnit.trim()) {
      newErrors.pricePerUnit = "Price per unit is required";
    } else if (isNaN(pricePerUnit) || parseFloat(pricePerUnit) < 0) {
      newErrors.pricePerUnit = "Price must be a valid number";
    }

    if (
      minStockAlert &&
      (isNaN(minStockAlert) || parseFloat(minStockAlert) < 0)
    ) {
      newErrors.minStockAlert = "Min stock alert must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateStatus = (qty, reorderPoint) => {
    const quantityNum = parseFloat(qty) || 0;
    const reorderNum = parseFloat(reorderPoint) || 0;

    if (quantityNum <= 0) {
      return "Out of Stock";
    } else if (quantityNum <= reorderNum) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user?.email) {
      setErrors({ submit: "You must be logged in to manage inventory" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const quantityNum = parseFloat(quantity) || 0;
      const priceNum = parseFloat(pricePerUnit) || 0;
      const reorderPointNum = parseFloat(minStockAlert) || 0;

      const inventoryData = {
        name: itemName.trim(),
        sku: sku.trim(),
        category: category,
        subcategory: subcategory.trim() || "",
        supplierName: supplier.trim(),
        quantity: quantityNum,
        unit: unit,
        price: priceNum,
        reorderPoint: reorderPointNum,
        status: calculateStatus(quantity, minStockAlert),
        color: color.trim() || "",
        description: description.trim() || "",
        userEmail: getEffectiveUserEmail(user),
        tailorId: "", // Keep for backward compatibility
        updatedAt: new Date(),
      };

      if (isEditMode && selectedItem?.id) {
        // Update existing item
        await updateDoc(
          doc(db, "fashiontally_inventory", selectedItem.id),
          inventoryData
        );
        console.log("Inventory item updated successfully");
      } else {
        // Add new item
        inventoryData.createdAt = new Date();
        await addDoc(collection(db, "fashiontally_inventory"), inventoryData);
        console.log("Inventory item added successfully");
      }

      // Reset form and close
      setItemName("");
      setSku("");
      setCategory("");
      setSubcategory("");
      setSupplier("");
      setQuantity("");
      setUnit("");
      setPricePerUnit("");
      setMinStockAlert("");
      setColor("");
      setDescription("");

      onClose();
    } catch (error) {
      console.error("Error saving inventory item:", error);
      setErrors({ submit: "Failed to save inventory item. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add_inv_panel">
      {/* Header */}
      <div className="add_inv_header">
        <button className="add_inv_close_btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="add_inv_title">
          {isEditMode ? "Edit Inventory Item" : "Add Inventory Item"}
        </h2>
      </div>

      {/* Form */}
      <form className="add_inv_form" onSubmit={handleSubmit}>
        {/* Item Name */}
        <div className="add_inv_form_group">
          <Input
            label="Item Name"
            type="text"
            placeholder="e.g., Ankara Print Fabric"
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
              clearError("itemName");
            }}
            error={errors.itemName}
            required
            variant="rounded"
            disabled={isSubmitting}
          />
        </div>

        {/* SKU */}
        <div className="add_inv_form_group">
          <Input
            label="SKU (Stock Keeping Unit)"
            type="text"
            placeholder="e.g., ANK001"
            value={sku}
            onChange={(e) => {
              setSku(e.target.value);
              clearError("sku");
            }}
            error={errors.sku}
            required
            variant="rounded"
            disabled={isSubmitting}
          />
        </div>

        {/* Category */}
        <div className="add_inv_form_group">
          <Input
            label="Category"
            type="text"
            placeholder="e.g., Fabric, Notions, Threads, Accessories"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              clearError("category");
            }}
            error={errors.category}
            required
            variant="rounded"
            disabled={isSubmitting}
          />
        </div>

        {/* Subcategory */}
        <div className="add_inv_form_group">
          <Input
            label="Subcategory (Optional)"
            type="text"
            placeholder="e.g., Cotton, Silk, Polyester"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            variant="rounded"
            disabled={isSubmitting}
          />
        </div>

        {/* Supplier */}
        <div className="add_inv_form_group">
          <Input
            label="Supplier"
            type="text"
            placeholder="e.g., Lagos Textiles Ltd"
            value={supplier}
            onChange={(e) => {
              setSupplier(e.target.value);
              clearError("supplier");
            }}
            error={errors.supplier}
            required
            variant="rounded"
            disabled={isSubmitting}
          />
        </div>

        {/* Quantity and Unit Row */}
        <div className="add_inv_form_row">
          <div className="add_inv_form_group add_inv_form_group_half">
            <Input
              label="Quantity"
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                clearError("quantity");
              }}
              error={errors.quantity}
              required
              variant="rounded"
              disabled={isSubmitting}
            />
          </div>
          <div className="add_inv_form_group add_inv_form_group_half">
            <Input
              label="Unit"
              type="select"
              placeholder="Select unit"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                clearError("unit");
              }}
              error={errors.unit}
              required
              variant="rounded"
              disabled={isSubmitting}
              options={[
                { value: "", label: "Select unit" },
                { value: "yards", label: "Yards" },
                { value: "meters", label: "Meters" },
                { value: "pieces", label: "Pieces" },
                { value: "rolls", label: "Rolls" },
                { value: "spools", label: "Spools" },
                { value: "sets", label: "Sets" },
              ]}
            />
          </div>
        </div>

        {/* Price per Unit and Min Stock Alert Row */}
        <div className="add_inv_form_row">
          <div className="add_inv_form_group add_inv_form_group_half">
            <Input
              label="Price per Unit (₦)"
              type="number"
              placeholder="0"
              step="0.01"
              value={pricePerUnit}
              onChange={(e) => {
                setPricePerUnit(e.target.value);
                clearError("pricePerUnit");
              }}
              error={errors.pricePerUnit}
              required
              variant="rounded"
              disabled={isSubmitting}
            />
          </div>
          <div className="add_inv_form_group add_inv_form_group_half">
            <Input
              label="Reorder Point"
              type="number"
              placeholder="0"
              value={minStockAlert}
              onChange={(e) => {
                setMinStockAlert(e.target.value);
                clearError("minStockAlert");
              }}
              error={errors.minStockAlert}
              variant="rounded"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Color */}
        <div className="add_inv_form_group">
          <Input
            label="Color (Optional)"
            type="text"
            placeholder="e.g., Red, Blue, Multi-color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            variant="rounded"
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div className="add_inv_form_group">
          <Input
            label="Description"
            type="textarea"
            placeholder="Add notes about this item..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="rounded"
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="add_inv_error">
            <p>{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : isEditMode ? "Update Item" : "Add Item"}
        </Button>
      </form>
    </div>
  );
};

export default AddInventoryPanel;
