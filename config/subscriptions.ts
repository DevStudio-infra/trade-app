import { PlansRow, SubscriptionPlan } from "types";
import { env } from "@/env.mjs";

export const pricingData: SubscriptionPlan[] = [
  {
    title: "Free",
    description: "Perfect for getting started with AI trading analysis",
    benefits: [
      "6 credits per month",
      "Basic chart pattern recognition",
      "Real-time market analysis",
      "Email support (48h response)",
      "Basic trading insights",
    ],
    limitations: [
      "Limited to basic patterns",
      "Standard response time",
      "No historical analysis",
      "Basic AI model only",
      "No discount on credit purchases",
    ],
    prices: {
      monthly: 0,
      yearly: 0,
    },
    stripeIds: {
      monthly: null,
      yearly: null,
    },
  },
  {
    title: "Pro",
    description: "Advanced analysis for serious traders",
    benefits: [
      "100 credits per month",
      "20% discount on credit purchases",
      "Advanced pattern recognition",
      "Real-time & historical analysis",
      "Priority support (24h response)",
      "Custom chart annotations",
      "Faster response time",
      "Advanced AI trading insights",
      "Export detailed reports",
      "Advanced AI models",
    ],
    limitations: [],
    prices: {
      monthly: 15,
      yearly: 144,
    },
    stripeIds: {
      monthly: env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
      yearly: env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
    },
  },
];

export const plansColumns = ["free", "pro"] as const;

export const comparePlans: PlansRow[] = [
  {
    feature: "Monthly Credits",
    free: "6",
    pro: "100",
    tooltip:
      "Credits are used for AI analysis requests. Each chart analysis consumes one credit",
  },
  {
    feature: "Credit Purchase Discount",
    free: "None",
    pro: "20% off",
    tooltip: "Pro users get a 20% discount on all additional credit purchases",
  },
  {
    feature: "Response Time",
    free: "Standard (48h)",
    pro: "Priority (24h)",
    tooltip: "Time to receive support responses and AI analysis results",
  },
  {
    feature: "Pattern Recognition",
    free: "Basic",
    pro: "Advanced",
    tooltip:
      "Pro includes advanced algorithms for more accurate pattern detection and market analysis",
  },
  {
    feature: "Real-time Analysis",
    free: true,
    pro: true,
    tooltip: "Analyze current market conditions and trading patterns",
  },
  {
    feature: "Historical Analysis",
    free: false,
    pro: true,
    tooltip:
      "Access and analyze historical trading data for better pattern recognition",
  },
  {
    feature: "AI Model",
    free: "Basic",
    pro: "Advanced",
    tooltip:
      "Pro users get access to our most sophisticated AI models for trading analysis",
  },
  {
    feature: "Custom Annotations",
    free: false,
    pro: true,
    tooltip: "Add, save, and manage custom annotations on your trading charts",
  },
  {
    feature: "Export Reports",
    free: false,
    pro: true,
    tooltip:
      "Generate and download detailed analysis reports in multiple formats",
  },
  {
    feature: "Trading Insights",
    free: "Basic",
    pro: "Advanced",
    tooltip:
      "Get AI-powered insights about market trends and trading opportunities",
  },
];
