import { SubscriptionGate } from "./SubscriptionGate/SubscriptionGate";
import { useSubscription } from "../hooks/use-subscription";

export function SubscriptionDemo() {
  const subscription = useSubscription();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Subscription System Demo</h1>

      {/* Display current subscription status */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <h3>Current Subscription Status:</h3>
        <p>
          <strong>Plan:</strong> {subscription.planType}
        </p>
        <p>
          <strong>Subscribed:</strong>{" "}
          {subscription.isSubscribed ? "Yes" : "No"}
        </p>
        <p>
          <strong>Trial Active:</strong>{" "}
          {subscription.isTrialActive ? "Yes" : "No"}
        </p>
        <p>
          <strong>Loading:</strong> {subscription.loading ? "Yes" : "No"}
        </p>
        {subscription.subscriptionEndDate && (
          <p>
            <strong>End Date:</strong>{" "}
            {new Date(subscription.subscriptionEndDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Example 1: CRM Tools Feature */}
      <div style={{ marginBottom: "32px" }}>
        <h3>CRM Tools (Default Feature)</h3>
        <SubscriptionGate requiredFeature="CRM Tools">
          <div
            style={{
              background: "#d4edda",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #c3e6cb",
            }}
          >
            <h4>🎉 CRM Tools Unlocked!</h4>
            <p>You have access to advanced CRM features including:</p>
            <ul>
              <li>Customer relationship management</li>
              <li>Lead tracking</li>
              <li>Communication history</li>
              <li>Sales pipeline</li>
            </ul>
          </div>
        </SubscriptionGate>
      </div>

      {/* Example 2: Inventory Management */}
      <div style={{ marginBottom: "32px" }}>
        <h3>Inventory Management</h3>
        <SubscriptionGate requiredFeature="Inventory Tool">
          <div
            style={{
              background: "#d1ecf1",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #bee5eb",
            }}
          >
            <h4>📦 Inventory Management Unlocked!</h4>
            <p>You can now manage your inventory with features like:</p>
            <ul>
              <li>Stock tracking</li>
              <li>Low stock alerts</li>
              <li>Product categorization</li>
              <li>Supplier management</li>
            </ul>
          </div>
        </SubscriptionGate>
      </div>

      {/* Example 3: Professional Feature */}
      <div style={{ marginBottom: "32px" }}>
        <h3>Priority Support (Professional Plan)</h3>
        <SubscriptionGate requiredFeature="Priority Support">
          <div
            style={{
              background: "#fff3cd",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #ffeaa7",
            }}
          >
            <h4>⭐ Priority Support Unlocked!</h4>
            <p>As a Professional plan member, you get:</p>
            <ul>
              <li>24/7 priority support</li>
              <li>Dedicated account manager</li>
              <li>Phone support</li>
              <li>Priority bug fixes</li>
            </ul>
          </div>
        </SubscriptionGate>
      </div>

      {/* Feature Access Testing */}
      <div style={{ marginBottom: "32px" }}>
        <h3>Feature Access Testing</h3>
        <div
          style={{
            background: "#f8f9fa",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <p>
            <strong>Client Management:</strong>{" "}
            {subscription.checkFeature("Client Management")
              ? "✅ Available"
              : "❌ Not Available"}
          </p>
          <p>
            <strong>Inventory Tool:</strong>{" "}
            {subscription.checkFeature("Inventory Tool")
              ? "✅ Available"
              : "❌ Not Available"}
          </p>
          <p>
            <strong>Priority Support:</strong>{" "}
            {subscription.checkFeature("Priority Support")
              ? "✅ Available"
              : "❌ Not Available"}
          </p>
          <p>
            <strong>White Label:</strong>{" "}
            {subscription.checkFeature("White Label")
              ? "✅ Available"
              : "❌ Not Available"}
          </p>
        </div>
      </div>
    </div>
  );
}
