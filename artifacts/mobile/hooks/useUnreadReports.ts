import { useEffect, useRef, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { subscribeToAllReports } from "../services/reports";
import { OverchargingReport } from "../types";

const STORAGE_KEY = "admin_last_viewed_reports";

export function useUnreadReports() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastViewed, setLastViewed] = useState<Date | null>(null);
  const lastViewedRef = useRef<Date | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) {
        const d = new Date(val);
        lastViewedRef.current = d;
        setLastViewed(d);
      }
    });
  }, []);

  useEffect(() => {
    const unsub = subscribeToAllReports((reports: OverchargingReport[]) => {
      const lv = lastViewedRef.current;
      const pending = reports.filter((r) => r.status === "Pending");
      if (!lv) {
        setUnreadCount(pending.length);
      } else {
        const newOnes = pending.filter((r) => r.createdAt > lv);
        setUnreadCount(newOnes.length);
      }
    });
    return unsub;
  }, [lastViewed]);

  const markAllRead = useCallback(() => {
    const now = new Date();
    lastViewedRef.current = now;
    setLastViewed(now);
    setUnreadCount(0);
    AsyncStorage.setItem(STORAGE_KEY, now.toISOString());
  }, []);

  return { unreadCount, markAllRead };
}
