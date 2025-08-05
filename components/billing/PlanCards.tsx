"use client";

import { Text, Button } from "@shopify/polaris";
import { useMemo, useEffect } from "react";

export default function PlanCard({
  type,
  price,
  features,
  activePlan,
  onSubscribe,
  onCancel,
  isLoading,
  subscriptionId,
  planExpiresOn,
  trialEndsOn,
  billingStatus,
  disabled,
}: {
  type: "Free" | "Premium";
  price?: string;
  features: string[];
  activePlan: string;
  onSubscribe?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  subscriptionId?: string | null;
  planExpiresOn?: Date | string | null;
  trialEndsOn?: Date | string | null;
  billingStatus?: string;
  disabled?: boolean;
}) {
  const isPremium = type === "Premium";
  const today = new Date();

  const expiryDate = planExpiresOn ? new Date(planExpiresOn) : null;
  const trialEndDate = trialEndsOn ? new Date(trialEndsOn) : null;

  const isTrialValid = trialEndDate instanceof Date && !isNaN(trialEndDate.getTime());
  const isPlanValid = expiryDate instanceof Date && !isNaN(expiryDate.getTime());

  const isInTrial = isTrialValid && today < trialEndDate;

  // 🔒 STRICT: block premium if trial ended or billing is cancelled
  const normalizedPlan = activePlan?.toLowerCase().replace(" plan", "").trim();
  const isCancelled = billingStatus === "cancelled" || normalizedPlan === "scheduled cancel";
  const hasPremiumAccess =
    isInTrial ||
    (normalizedPlan === "premium" &&
      !isCancelled &&
      isPlanValid &&
      today < expiryDate);

  const isSubscribed = ["premium", "pending", "scheduled cancel"].includes(normalizedPlan);

  useEffect(() => {
    console.log("🧠 PlanCard Debug:");
    console.log("👉 activePlan:", activePlan);
    console.log("👉 billingStatus:", billingStatus);
    console.log("👉 subscriptionId:", subscriptionId);
    console.log("👉 trialEndsOn:", trialEndDate?.toISOString());
    console.log("👉 planExpiresOn:", expiryDate?.toISOString());
    console.log("👉 isInTrial:", isInTrial);
    console.log("👉 hasPremiumAccess:", hasPremiumAccess);
  }, [activePlan, billingStatus, trialEndsOn, planExpiresOn, isInTrial, hasPremiumAccess]);

  const shouldHighlight = useMemo(() => {
    return (isPremium && hasPremiumAccess) || (!isPremium && !hasPremiumAccess);
  }, [isPremium, hasPremiumAccess]);

  const renderButton = () => {
    if (isPremium) {
      if (isSubscribed && subscriptionId) {
        if (isCancelled && isInTrial) {
          return (
            <div
              style={{
                width: "100%",
                padding: "4px 16px",
                textAlign: "center",
                backgroundColor: "#171516",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                color: "#f7fAf5",
                cursor: "not-allowed",
                border: "1px solid #10b981",
              }}
            >
              Trial active until {trialEndDate?.toLocaleDateString()}
            </div>
          );
        }

        if (isCancelled && !isInTrial) {
          return (
            <Button fullWidth size="medium" variant="primary" disabled>
              Plan expired
            </Button>
          );
        }

        if (isInTrial) {
          return (
            <Button
              fullWidth
              size="medium"
              variant="primary"
              tone="critical"
              onClick={() => onCancel?.()}
              disabled={isLoading}
              loading={isLoading}
            >
              Cancel Trial
            </Button>
          );
        }

        return (
          <Button
            fullWidth
            size="medium"
            variant="tertiary"
            tone="critical"
            onClick={() => onCancel?.()}
            disabled={isLoading}
            loading={isLoading}
          >
            Cancel Subscription
          </Button>
        );
      }

      if (hasPremiumAccess) {
        return (
          <Button fullWidth size="medium" variant="primary" disabled>
            {isInTrial
              ? `Trial active until ${trialEndDate?.toLocaleDateString() ?? "Unknown"}`
              : `Plan active until ${expiryDate?.toLocaleDateString() ?? "Unknown"}`}
          </Button>
        );
      }

      return (
        <Button
          fullWidth
          size="medium"
          variant="primary"
          onClick={() => onSubscribe?.()}
          disabled={isLoading}
          loading={isLoading}
        >
          Start Free with 7 Day Trial
        </Button>
      );
    }

    // Free plan fallback
    const label = hasPremiumAccess
      ? "Using All Features"
      : "You're on Free Plan";

    return (
      <div
        style={{
          width: "100%",
          padding: "4px 16px",
          textAlign: "center",
          backgroundColor: "#171516",
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "13px",
          color: "#F7FAF5",
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.2px",
          cursor: "not-allowed",
        }}
      >
        {label}
      </div>
    );
  };

  return (
    <div
      style={{
        flex: "1 1 300px",
        maxWidth: "380px",
        minWidth: "280px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          flex: 1,
          borderRadius: "12px",
          backgroundColor: shouldHighlight ? "#c9f3e1" : "#ffffff",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: shouldHighlight ? "0 0 0 2px #008060" : "0 0 0 1px #ccc",
        }}
      >
        <div>
          <Text variant="headingMd" as="h3">
            {type === "Free" ? "Beginner" : "Advanced"}
          </Text>
          <Text variant="headingLg" as="h2" fontWeight="bold">
            {price || "Free"}
            {price && (
              <Text as="span" variant="bodySm">
                {" "}
                / month
              </Text>
            )}
          </Text>

          <div style={{ marginTop: "16px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "center", backgroundColor: "black" }}>
              {renderButton()}
            </div>
          </div>

          <ul
            style={{
              paddingLeft: "5px",
              listStyleType: "none",
              fontWeight: 300,
              marginTop: "8px",
              lineHeight: "1.6em",
            }}
          >
            {features.map((feature, i) => (
              <li key={i}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
