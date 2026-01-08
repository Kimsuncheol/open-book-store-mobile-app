import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export type SubscriptionStatus = 'free' | 'subscribed' | 'cancelled';
export type SubscriptionPlan = 'monthly' | 'annual';

export interface SubscriptionData {
  status: SubscriptionStatus;
  plan?: SubscriptionPlan;
  startDate?: Date;
  endDate?: Date;
  paymentId?: string;
}

export interface Subscription {
  userId: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  startDate: Date;
  endDate: Date;
  paymentId: string;
  amount: number;
  createdAt: Date;
}

/**
 * Update user's subscription status in Firestore
 */
export const updateSubscriptionStatus = async (
  userId: string,
  status: SubscriptionStatus,
  plan: SubscriptionPlan,
  startDate?: Date,
  endDate?: Date,
  paymentId?: string
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const updates: any = {
    subscriptionStatus: status,
    subscriptionPlan: plan,
  };

  if (startDate) {
    updates.subscriptionStartDate = startDate.toISOString();
  }
  if (endDate) {
    updates.subscriptionEndDate = endDate.toISOString();
  }

  await updateDoc(userRef, updates);

  // If subscribing, also create a subscription record for audit trail
  if (status === 'subscribed' && startDate && endDate && paymentId) {
    const amount = plan === 'annual' ? 99000 : 9900;
    const subscriptionRef = doc(db, 'subscriptions', `${userId}_${Date.now()}`);
    await setDoc(subscriptionRef, {
      userId,
      status,
      plan,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      paymentId,
      amount,
      createdAt: new Date().toISOString(),
    });
  }
};

/**
 * Get user's current subscription status
 */
export const getSubscriptionStatus = async (
  userId: string
): Promise<SubscriptionData> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      status: (data.subscriptionStatus as SubscriptionStatus) || 'free',
      plan: (data.subscriptionPlan as SubscriptionPlan) || 'monthly',
      startDate: data.subscriptionStartDate ? new Date(data.subscriptionStartDate) : undefined,
      endDate: data.subscriptionEndDate ? new Date(data.subscriptionEndDate) : undefined,
    };
  }

  return { status: 'free' };
};

/**
 * Cancel user's subscription
 * Sets status to 'cancelled' but keeps end date so user retains access until expiration
 */
export const cancelSubscription = async (userId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    subscriptionStatus: 'cancelled',
    // Keep startDate and endDate so user can access until expiration
  });
};

/**
 * Check if user has active subscription
 */
export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
  const subscriptionData = await getSubscriptionStatus(userId);
  
  // Both subscribed and cancelled users have access until end date
  if (subscriptionData.status !== 'subscribed' && subscriptionData.status !== 'cancelled') {
    return false;
  }

  // Check if subscription has expired
  if (subscriptionData.endDate) {
    return subscriptionData.endDate > new Date();
  }

  return true;
};
